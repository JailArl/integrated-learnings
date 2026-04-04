import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

/**
 * WhatsApp Webhook — receives inbound messages + delivery status from Twilio.
 *
 * Flow:
 *  1. Kid taps check-in button  →  Twilio POSTs here
 *  2. We parse the reply, create/update sq_checkins
 *  3. Run lightweight anti-cheat (fast-reply detection)
 *  4. Send confirmation / follow-up back via send-whatsapp
 */

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Helper: call our own send-whatsapp function
async function sendReply(to: string, templateName: string, variables?: Record<string, string>) {
  const url = `${supabaseUrl}/functions/v1/send-whatsapp`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ to, template_name: templateName, variables }),
  });
}

async function sendRaw(to: string, message: string) {
  const url = `${supabaseUrl}/functions/v1/send-whatsapp`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ to, raw_message: message }),
  });
}

// Map kid's text replies to a check-in status
function parseCheckinStatus(body: string): { status: string; subject?: string } | null {
  const lower = body.trim().toLowerCase();

  // Direct status words
  if (["yes", "done", "did extra", "extra"].includes(lower)) {
    return { status: lower === "did extra" || lower === "extra" ? "did_extra" : "yes" };
  }
  if (["partially", "half", "a bit", "some"].includes(lower)) {
    return { status: "partially" };
  }
  if (["no", "nope", "didn't", "didnt", "skip", "skipped"].includes(lower)) {
    return { status: "no" };
  }

  // Subject replies (after "what subject?" follow-up)
  const subjects = ["math", "science", "chinese", "english", "malay", "tamil", "history", "geography", "literature"];
  for (const s of subjects) {
    if (lower.includes(s)) {
      return { status: "subject_reply", subject: s.charAt(0).toUpperCase() + s.slice(1) };
    }
  }

  // CONFIRM / ADJUST from parent
  if (lower === "confirm") return { status: "parent_confirm" };
  if (lower === "adjust") return { status: "parent_adjust" };

  return null;
}

// Determine level group from child's level string
function getLevelGroup(level: string): string {
  const l = level.toUpperCase();
  if (/^P[1-3]$/.test(l)) return "primary_lower";
  if (/^P[4-6]$/.test(l)) return "primary_upper";
  if (/^SEC[1-3]$/i.test(l)) return "secondary_lower";
  return "secondary_upper_jc";
}

serve(async (req) => {
  // Twilio sends form-urlencoded POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await req.formData();
    const from = formData.get("From")?.toString() || "";        // whatsapp:+65XXXXXXXX
    const body = formData.get("Body")?.toString() || "";
    const messageSid = formData.get("MessageSid")?.toString() || "";
    const messageStatus = formData.get("MessageStatus")?.toString(); // delivery status callback

    const phone = from.replace("whatsapp:", "");

    const sb = createClient(supabaseUrl, supabaseKey);

    // ── STATUS CALLBACK (delivery receipts) ──
    if (messageStatus && !body) {
      // Update conversation log with delivery status
      if (messageSid) {
        await sb
          .from("whatsapp_conversations")
          .update({ message_type: messageStatus }) // sent/delivered/read/failed
          .eq("twilio_sid", messageSid);
      }
      // Return empty TwiML (Twilio expects XML response)
      return new Response("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // ── LOG INBOUND MESSAGE ──
    const { error: logError } = await sb.from("whatsapp_conversations").insert({
      contact_phone: phone,
      direction: "inbound",
      message_text: body,
      content: body,
      message_type: "reply",
      twilio_sid: messageSid,
    });

    if (logError) {
      console.error("Failed to log inbound message:", JSON.stringify(logError));
    }

    // ── FIND CHILD BY WHATSAPP NUMBER ──
    const { data: child } = await sb
      .from("sq_children")
      .select("id, name, parent_id, level")
      .eq("whatsapp_number", phone)
      .single();

    if (!child) {
      // Also check if it's a parent phone (for CONFIRM/ADJUST)
      const { data: membership } = await sb
        .from("sq_memberships")
        .select("user_id, parent_name")
        .eq("parent_phone", phone)
        .single();

      if (membership) {
        const parsed = parseCheckinStatus(body);
        if (parsed?.status === "parent_confirm" || parsed?.status === "parent_adjust") {
          await handleParentReply(sb, membership, parsed.status, phone);
        }
      }

      return new Response("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // ── PARSE REPLY ──
    const parsed = parseCheckinStatus(body);
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (!parsed) {
      // Unrecognised — send a gentle prompt
      await sendRaw(
        phone,
        "Hey! Just reply with: yes / no / partially / done / did extra 😊",
      );
      return new Response("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // ── SUBJECT REPLY (follow-up to "what subject?") ──
    if (parsed.status === "subject_reply" && parsed.subject) {
      // Update the most recent checkin for today with the subject
      const { data: recentCheckin } = await sb
        .from("sq_checkins")
        .select("id")
        .eq("child_id", child.id)
        .eq("checkin_date", today)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (recentCheckin) {
        await sb
          .from("sq_checkins")
          .update({
            subject_reported: parsed.subject,
            reply_received_at: now.toISOString(),
          })
          .eq("id", recentCheckin.id);
      }

      await sendRaw(phone, `Got it — ${parsed.subject}! Keep it up 💪`);
      return new Response("<Response></Response>", {
        headers: { "Content-Type": "text/xml" },
      });
    }

    // ── CHECK-IN STATUS REPLY ──
    // Find if a prompt was sent today (to calculate response time)
    const { data: existingCheckin } = await sb
      .from("sq_checkins")
      .select("id, prompt_sent_at")
      .eq("child_id", child.id)
      .eq("checkin_date", today)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let responseSeconds: number | null = null;
    if (existingCheckin?.prompt_sent_at) {
      const sentAt = new Date(existingCheckin.prompt_sent_at).getTime();
      responseSeconds = Math.round((now.getTime() - sentAt) / 1000);
    }

    const checkinData: Record<string, unknown> = {
      child_id: child.id,
      checkin_date: today,
      status: parsed.status === "did_extra" ? "yes" : parsed.status,
      reply_received_at: now.toISOString(),
      response_seconds: responseSeconds,
    };

    if (existingCheckin) {
      // Update existing (prompt was sent earlier)
      await sb.from("sq_checkins").update(checkinData).eq("id", existingCheckin.id);
    } else {
      // Insert new (kid replied without a prompt — still valid)
      checkinData.prompt_sent_at = null;
      await sb.from("sq_checkins").insert(checkinData);
    }

    // ── ANTI-CHEAT: fast reply detection ──
    if (responseSeconds !== null && responseSeconds < 10) {
      // Suspiciously fast — ask follow-up
      await sendReply(phone, "sp_verify_quick_reply");
    } else if (parsed.status === "yes" || parsed.status === "did_extra") {
      // Ask what subject they studied
      await sendReply(phone, "sp_verify_what_subject");
    } else if (parsed.status === "no") {
      // Honesty reward
      await sendReply(phone, "sp_brave_checkin", { child_name: child.name });
    } else {
      // partially — simple acknowledgment
      await sendRaw(phone, `Thanks for checking in, ${child.name}! Every bit counts 📚`);
    }

    // ── STREAK CALCULATION ──
    await updateStreak(sb, child.id);

    // ── NOTIFY PARENT ──
    const { data: membership } = await sb
      .from("sq_memberships")
      .select("parent_phone, parent_name, plan_type")
      .eq("user_id", child.parent_id)
      .single();

    if (membership?.parent_phone) {
      const statusMap: Record<string, string> = {
        yes: "sp_checkin_yes_free",
        did_extra: "sp_checkin_did_extra",
        partially: "sp_checkin_partially",
        no: "sp_checkin_no",
      };
      const tpl = statusMap[parsed.status] || "sp_checkin_done";

      // Get current streak for the message
      const { data: streakData } = await sb
        .from("sq_weekly_summaries")
        .select("checkins_completed")
        .eq("child_id", child.id)
        .order("week_start", { ascending: false })
        .limit(1)
        .single();

      const streakMsg = streakData
        ? `Current streak: ${streakData.checkins_completed} days`
        : "";

      await sendReply(membership.parent_phone, tpl, {
        child_name: child.name,
        streak_msg: streakMsg,
        parent_name: membership.parent_name || "Parent",
        status: parsed.status,
      });
    }

    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }
});

// ── HELPERS ──

async function updateStreak(
  sb: ReturnType<typeof createClient>,
  childId: string,
) {
  // Count consecutive days with a check-in (status != 'pending')
  const { data: checkins } = await sb
    .from("sq_checkins")
    .select("checkin_date, status")
    .eq("child_id", childId)
    .neq("status", "pending")
    .order("checkin_date", { ascending: false })
    .limit(60);

  if (!checkins || checkins.length === 0) return;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < checkins.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedDate = expected.toISOString().split("T")[0];

    if (checkins[i].checkin_date === expectedDate) {
      streak++;
    } else {
      break;
    }
  }

  // Check for milestone notifications
  const milestones: Record<number, string> = {
    3: "sp_streak_3",
    7: "sp_streak_7",
    14: "sp_streak_14",
    30: "sp_streak_30",
  };

  if (milestones[streak]) {
    const { data: child } = await sb
      .from("sq_children")
      .select("name, parent_id")
      .eq("id", childId)
      .single();

    if (child) {
      const { data: membership } = await sb
        .from("sq_memberships")
        .select("parent_phone")
        .eq("user_id", child.parent_id)
        .single();

      if (membership?.parent_phone) {
        const url = `${supabaseUrl}/functions/v1/send-whatsapp`;
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            to: membership.parent_phone,
            template_name: milestones[streak],
            variables: { child_name: child.name },
          }),
        });
      }
    }
  }
}

async function handleParentReply(
  sb: ReturnType<typeof createClient>,
  membership: { user_id: string; parent_name: string | null },
  action: string,
  phone: string,
) {
  // Find the parent's children
  const { data: children } = await sb
    .from("sq_children")
    .select("id, name")
    .eq("parent_id", membership.user_id);

  if (!children || children.length === 0) return;

  const today = new Date().toISOString().split("T")[0];

  if (action === "parent_confirm") {
    // Mark today's checkin as parent_confirmed
    for (const child of children) {
      await sb
        .from("sq_checkins")
        .update({ parent_confirmed: true })
        .eq("child_id", child.id)
        .eq("checkin_date", today);
    }
    await sendRaw(phone, "Thanks for confirming! ✅");
  } else if (action === "parent_adjust") {
    // Mark as needing adjustment — parent can adjust on dashboard
    for (const child of children) {
      await sb
        .from("sq_checkins")
        .update({ parent_adjusted: true })
        .eq("child_id", child.id)
        .eq("checkin_date", today);

      await sb.from("sq_parent_adjustments").insert({
        child_id: child.id,
        checkin_date: today,
        original_status: "unknown",
        adjusted_status: "pending_adjustment",
        parent_id: membership.user_id,
      });
    }
    await sendReply(phone, "sp_parent_adjusted", {
      child_name: children.map((c) => c.name).join(" & "),
    });
  }
}
