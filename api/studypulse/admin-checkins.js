import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const adminApiToken = process.env.ADMIN_API_TOKEN || process.env.VITE_ADMIN_PASSWORD || null;
const functionBaseUrl = (supabaseUrl || '').replace(/\/$/, '');

function normalizePhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return '';
  return digits.length > 8 ? digits.slice(-8) : digits;
}

function getSgToday() {
  const now = new Date();
  const sg = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  return sg.toISOString().split('T')[0];
}

function getWeekStart(todayStr) {
  const d = new Date(todayStr);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().split('T')[0];
}

function formatUnitLabel(quantity, rawUnit) {
  const unit = (rawUnit || 'task').trim().toLowerCase();
  const singularMap = {
    questions: 'question',
    chapters: 'chapter',
    pages: 'page',
    worksheets: 'worksheet',
    minutes: 'minute',
    papers: 'paper',
    topics: 'topic',
    exercises: 'exercise',
    sums: 'sum',
    passages: 'passage',
    compositions: 'composition',
    practices: 'practice',
  };
  if (quantity === 1) {
    if (singularMap[unit]) return singularMap[unit];
    return unit.endsWith('s') ? unit.slice(0, -1) : unit;
  }
  if (singularMap[unit]) return unit;
  return unit.endsWith('s') ? unit : `${unit}s`;
}

async function sendRawWhatsappNow(to, message, serviceRoleKey) {
  const response = await fetch(`${functionBaseUrl}/functions/v1/send-whatsapp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceRoleKey}`,
      apikey: serviceRoleKey,
    },
    body: JSON.stringify({
      to,
      raw_message: message,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error || payload?.message || `WhatsApp send failed (${response.status})`);
  }
}

async function manualSendCheckinFallback(admin, childId, serviceRoleKey) {
  const today = getSgToday();
  const { data: child } = await admin
    .from('sq_children')
    .select('id, name, level, whatsapp_number, parent_id')
    .eq('id', childId)
    .single();
  if (!child) return { ok: false, error: 'Child not found' };
  if (!child.whatsapp_number) return { ok: false, error: 'Child has no WhatsApp number' };

  const { data: parentPhones } = await admin
    .from('sq_memberships')
    .select('parent_phone')
    .not('parent_phone', 'is', null);
  const parentPhoneSet = new Set((parentPhones || []).map((p) => normalizePhone(p.parent_phone)).filter(Boolean));
  if (parentPhoneSet.has(normalizePhone(child.whatsapp_number))) {
    return { ok: false, error: 'Child phone matches parent phone; blocked by guardrail' };
  }

  const weekStart = getWeekStart(today);
  const { data: targets } = await admin
    .from('sq_weekly_targets')
    .select('subject_name, daily_quantity, target_unit')
    .eq('child_id', child.id)
    .eq('week_start', weekStart);
  const hasTargets = !!(targets && targets.length > 0);
  const todayTarget = hasTargets ? targets[0] : null;

  const { data: existing } = await admin
    .from('sq_checkins')
    .select('id, prompt_sent_at')
    .eq('child_id', child.id)
    .eq('checkin_date', today)
    .limit(1);

  let checkinId = null;
  if (existing && existing.length > 0) {
    checkinId = existing[0].id;
  } else {
    const insertPayload = {
      child_id: child.id,
      checkin_date: today,
      status: 'pending',
      prompt_sent_at: null,
      ...(todayTarget
        ? {
            target_quantity: todayTarget.daily_quantity,
            target_unit: todayTarget.target_unit,
            subject_reported: todayTarget.subject_name,
          }
        : {}),
    };
    const { data: inserted, error: insertError } = await admin
      .from('sq_checkins')
      .insert(insertPayload)
      .select('id')
      .single();
    if (insertError || !inserted) {
      return { ok: false, error: insertError?.message || 'Could not create check-in row' };
    }
    checkinId = inserted.id;
  }

  let message;
  if (hasTargets) {
    const targetLine = targets
      .map((t) => `• ${t.subject_name}: *${t.daily_quantity} ${formatUnitLabel(t.daily_quantity, t.target_unit)}*`)
      .join('\n');
    message = `Hey ${child.name}! 📚 Study check-in time!\n\nToday's targets:\n${targetLine}\n\nHave you finished them?\n\nReply: *yes* / *partial* / *no*`;
  } else {
    message = `Hey ${child.name}! 📚 Study check-in time!\n\nHave you finished your study target for today?\n\nReply: *yes* / *partial* / *no*`;
  }

  await sendRawWhatsappNow(child.whatsapp_number, message, serviceRoleKey);
  await admin
    .from('sq_checkins')
    .update({
      status: 'pending',
      prompt_sent_at: new Date().toISOString(),
    })
    .eq('id', checkinId);

  return {
    ok: true,
    child_id: child.id,
    child_name: child.name,
    sent_to: child.whatsapp_number,
    checkin_id: checkinId,
  };
}

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
        // Fallback path: keep cron protection intact, but allow secure manual-send
        // through this server route after admin auth has already passed.
        if (payload?.error === 'Unauthorized manual trigger') {
          const fallback = await manualSendCheckinFallback(admin, childId, serviceRoleKey);
          if (fallback?.ok) {
            return json(res, 200, { ok: true, result: { success: true, manual: true, via: 'admin_fallback', ...fallback } });
          }
          return json(res, 400, {
            ok: false,
            error: fallback?.error || 'Manual check-in fallback failed.',
            details: fallback,
          });
        }
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
