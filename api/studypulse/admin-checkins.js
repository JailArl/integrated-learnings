import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const adminApiToken = process.env.ADMIN_API_TOKEN || process.env.VITE_ADMIN_PASSWORD || null;
const functionBaseUrl = (supabaseUrl || '').replace(/\/$/, '');

const admin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

async function verifyAdminToken(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return false;

  if (adminApiToken && token === adminApiToken) return true;
  if (!admin) return false;

  const { data: session, error: sessionError } = await admin
    .from('admin_sessions')
    .select('admin_id, expires_at')
    .eq('token', token)
    .single();

  if (sessionError || !session?.admin_id || !session?.expires_at) return false;
  if (new Date(session.expires_at).getTime() <= Date.now()) return false;

  const { data: adminUser, error: adminError } = await admin
    .from('admin_users')
    .select('is_active')
    .eq('id', session.admin_id)
    .single();

  if (adminError || !adminUser?.is_active) return false;
  return true;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!admin || !supabaseUrl || !serviceRoleKey) {
    return json(res, 500, { error: 'StudyPulse admin controls are not configured.' });
  }

  const allowed = await verifyAdminToken(req);
  if (!allowed) return json(res, 401, { error: 'Unauthorized admin request.' });

  try {
    const body = await readJsonBody(req);
    const action = typeof body.action === 'string' ? body.action : '';

    // ── Manual check-in trigger ──────────────────────────────────────────
    if (action === 'manual_send_checkin') {
      const childId = typeof body.childId === 'string' ? body.childId.trim() : '';
      if (!childId) return json(res, 400, { error: 'childId is required.' });

      const response = await fetch(`${functionBaseUrl}/functions/v1/studypulse-cron`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceRoleKey}`,
          apikey: serviceRoleKey,
        },
        body: JSON.stringify({
          action: 'manual_send_checkin',
          child_id: childId,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload?.success) {
        return json(res, 400, {
          ok: false,
          error: payload?.error || 'Manual check-in trigger failed.',
          details: payload,
        });
      }

      return json(res, 200, { ok: true, result: payload });
    }

    // ── Cron execution log (last N rows) ─────────────────────────────────
    if (action === 'cron_log') {
      const limit = Math.min(Number(body.limit) || 20, 100);
      const { data, error } = await admin
        .from('sq_cron_log')
        .select('*')
        .order('run_at', { ascending: false })
        .limit(limit);
      if (error) return json(res, 500, { ok: false, error: error.message });
      return json(res, 200, { ok: true, rows: data || [] });
    }

    // ── Failed outbound messages ──────────────────────────────────────────
    if (action === 'outbound_failed') {
      const limit = Math.min(Number(body.limit) || 50, 200);
      const { data, error } = await admin
        .from('sq_outbound_queue')
        .select('id, idempotency_key, to_phone, message_type, context_label, last_error, attempts, created_at')
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return json(res, 500, { ok: false, error: error.message });
      return json(res, 200, { ok: true, rows: data || [] });
    }

    // ── Recent outbound queue rows (pending/sent/failed/skipped) ────────────
    if (action === 'outbound_recent') {
      const limit = Math.min(Number(body.limit) || 100, 300);
      const statuses = Array.isArray(body.statuses)
        ? body.statuses.filter((s) => typeof s === 'string')
        : ['pending', 'sent', 'failed', 'skipped'];
      const { data, error } = await admin
        .from('sq_outbound_queue')
        .select('id, idempotency_key, to_phone, message_type, context_label, status, scheduled_for, sent_at, last_error, attempts, created_at')
        .in('status', statuses)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) return json(res, 500, { ok: false, error: error.message });
      return json(res, 200, { ok: true, rows: data || [] });
    }

    return json(res, 400, { error: 'Unsupported action.' });
  } catch (error) {
    return json(res, 500, { error: error?.message || 'Unexpected error.' });
  }
}
