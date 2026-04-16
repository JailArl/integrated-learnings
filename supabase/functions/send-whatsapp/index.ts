import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Twilio sends WhatsApp via their REST API (no SDK needed in Deno)
async function sendTwilioWhatsApp(
  to: string,
  body: string,
): Promise<{ success: boolean; sid?: string; error?: string }> {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromRaw = Deno.env.get("TWILIO_WHATSAPP_FROM"); // e.g. "whatsapp:+14155238886" or just "+14155238886"

  if (!accountSid || !authToken || !fromRaw) {
    return { success: false, error: `Twilio credentials not configured. SID: ${!!accountSid}, Token: ${!!authToken}, From: ${fromRaw || 'missing'}` };
  }

  // Ensure `from` has whatsapp: prefix
  const from = fromRaw.startsWith("whatsapp:") ? fromRaw : `whatsapp:${fromRaw}`;

  // Ensure `to` is in whatsapp: format
  const toFormatted = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams({
    To: toFormatted,
    From: from,
    Body: body,
  });

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
    },
    body: params.toString(),
  });

  const data = await resp.json();

  if (!resp.ok) {
    return {
      success: false,
      error: data?.message || `Twilio error ${resp.status}`,
      debug: { to: toFormatted, from, code: data?.code, moreInfo: data?.more_info },
    } as { success: boolean; error: string; sid?: string; debug?: unknown };
  }

  return { success: true, sid: data.sid };
}

// Personalise a template by replacing {variable} placeholders
function personalise(
  template: string,
  vars: Record<string, string>,
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

async function logOutboundMessage(
  to: string,
  messageBody: string,
  messageType: string,
  twilioSid?: string,
  metadata?: Record<string, unknown>,
) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseKey) return;

  try {
    const sb = createClient(supabaseUrl, supabaseKey);
    await sb.from("whatsapp_conversations").insert({
      contact_phone: to.replace("whatsapp:", ""),
      direction: "outbound",
      message_text: messageBody,
      content: messageBody,
      message_type: messageType,
      twilio_sid: twilioSid,
      ...(metadata ? { metadata } : {}),
    });
  } catch {
    // Non-critical — logging should never block message handling.
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const {
      to,
      template_name,
      variables,
      raw_message,
    }: {
      to: string;
      template_name?: string;
      variables?: Record<string, string>;
      raw_message?: string;
    } = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing 'to' phone number" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let messageBody: string;

    if (raw_message) {
      // Send a raw message directly (for testing / one-off sends)
      messageBody = raw_message;
    } else if (template_name) {
      // Look up template from DB
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const sb = createClient(supabaseUrl, supabaseKey);

      const { data: tpl, error } = await sb
        .from("whatsapp_message_templates")
        .select("message_text")
        .eq("template_name", template_name)
        .single();

      // Fallback: if _zh template not found, try base template
      let finalTpl = tpl;
      if ((error || !tpl) && template_name.endsWith("_zh")) {
        const baseName = template_name.replace(/_zh$/, "");
        const { data: baseTpl } = await sb
          .from("whatsapp_message_templates")
          .select("message_text")
          .eq("template_name", baseName)
          .single();
        finalTpl = baseTpl;
      }

      if (!finalTpl) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Template '${template_name}' not found`,
          }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      messageBody = variables
        ? personalise(finalTpl.message_text, variables)
        : finalTpl.message_text;
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Provide 'template_name' or 'raw_message'",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Send via Twilio
    const result = await sendTwilioWhatsApp(to, messageBody);

    if (!result.success) {
      await logOutboundMessage(to, messageBody, "failed", undefined, {
        error: result.error || "Unknown Twilio error",
      });
      return new Response(JSON.stringify(result), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await logOutboundMessage(
      to,
      messageBody,
      template_name ? "template" : "manual",
      result.sid,
    );

    return new Response(
      JSON.stringify({ success: true, sid: result.sid }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
