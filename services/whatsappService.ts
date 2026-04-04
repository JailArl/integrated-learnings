import { supabase } from './supabase';

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;

// ═══════════════════════════════════════════
// WHATSAPP SERVICE — calls Supabase Edge Functions
// ═══════════════════════════════════════════

async function callEdgeFunction(
  fnName: string,
  body: Record<string, unknown>,
): Promise<{ success: boolean; error?: string; data?: Record<string, unknown> }> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { success: false, error: 'Supabase not configured' };
  }

  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const token = session?.access_token || SUPABASE_ANON_KEY;

  const resp = await fetch(`${SUPABASE_URL}/functions/v1/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await resp.json();
  if (!resp.ok) {
    return { success: false, error: data?.error || `Edge function error ${resp.status}` };
  }
  return { success: true, data };
}

// ── SEND FUNCTIONS ──

/** Send a WhatsApp message using a template */
export async function sendTemplate(
  to: string,
  templateName: string,
  variables?: Record<string, string>,
) {
  return callEdgeFunction('send-whatsapp', {
    to,
    template_name: templateName,
    variables,
  });
}

/** Send a raw WhatsApp message */
export async function sendRawMessage(to: string, message: string) {
  return callEdgeFunction('send-whatsapp', {
    to,
    raw_message: message,
  });
}

/** Trigger the cron job manually (admin only) */
export async function triggerCron() {
  return callEdgeFunction('studypulse-cron', {});
}

// ── TEST FUNCTION ──

/** Send a test check-in prompt to a child's WhatsApp */
export async function sendTestCheckin(childWhatsApp: string, childName: string) {
  return sendRawMessage(
    childWhatsApp,
    `Hey ${childName}! 📚 This is a TEST check-in.\n\nReply: *yes* or *no*`,
  );
}

// ── CONVERSATION LOG ──

/** Fetch recent WhatsApp conversations (admin) */
export async function getConversations(phone?: string, limit = 50) {
  if (!supabase) return [];
  let q = supabase
    .from('whatsapp_conversations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (phone) {
    q = q.eq('contact_phone', phone);
  }

  const { data } = await q;
  return data || [];
}

/** Fetch WhatsApp contacts (admin) */
export async function getContacts() {
  if (!supabase) return [];
  const { data } = await supabase
    .from('whatsapp_contacts')
    .select('*')
    .order('last_message_at', { ascending: false });
  return data || [];
}
