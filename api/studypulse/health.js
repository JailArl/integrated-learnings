/**
 * api/studypulse/health.js
 *
 * System health endpoint for StudyPulse operator monitoring.
 * Returns a JSON object indicating whether key subsystems are operational.
 *
 * Authentication: Bearer <CRON_SECRET> or Bearer <SUPABASE_SERVICE_ROLE_KEY>
 *
 * Response shape:
 * {
 *   schedule_rows: number,            // 0 → 'degraded'
 *   last_cron_run_at: string | null,  // ISO timestamp of last sq_cron_log entry
 *   minutes_since_last_run: number | null,
 *   pending_queue_count: number,
 *   failed_queue_count: number,
 *   children_with_no_checkin_this_week: number,
 *   status: 'ok' | 'degraded' | 'error'
 * }
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const cronSecret = process.env.CRON_SECRET || null;

const sb = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (!sb) {
    return json(res, 500, { error: 'Supabase credentials are not configured.', status: 'error' });
  }

  // Auth: accept CRON_SECRET or service-role key
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const isValid =
    (cronSecret && token === cronSecret) ||
    (serviceRoleKey && token === serviceRoleKey);
  if (!isValid) {
    return json(res, 401, { error: 'Unauthorized.' });
  }

  const degradedReasons = [];
  const result = {
    schedule_rows: 0,
    last_cron_run_at: null,
    minutes_since_last_run: null,
    pending_queue_count: 0,
    failed_queue_count: 0,
    children_with_no_checkin_this_week: 0,
    status: 'ok',
  };

  try {
    // ── 1. sq_checkin_schedule row count ──
    const { count: scheduleCount, error: scheduleErr } = await sb
      .from('sq_checkin_schedule')
      .select('id', { count: 'exact', head: true });
    if (!scheduleErr) {
      result.schedule_rows = scheduleCount ?? 0;
      if (result.schedule_rows === 0) degradedReasons.push('MISSING_SCHEDULE');
    }

    // ── 2. Last cron run time (from sq_cron_log) ──
    const { data: lastRun, error: logErr } = await sb
      .from('sq_cron_log')
      .select('run_at')
      .eq('job_type', 'cron_run')
      .order('run_at', { ascending: false })
      .limit(1)
      .single();
    if (!logErr && lastRun?.run_at) {
      result.last_cron_run_at = lastRun.run_at;
      result.minutes_since_last_run = Math.floor(
        (Date.now() - new Date(lastRun.run_at).getTime()) / 60000
      );
      if (result.minutes_since_last_run > 30) degradedReasons.push('CRON_NOT_RUNNING');
    } else {
      degradedReasons.push('CRON_NEVER_RAN');
    }

    // ── 3. Outbound queue counts ──
    const [{ count: pendingCount }, { count: failedCount }] = await Promise.all([
      sb.from('sq_outbound_queue').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('sq_outbound_queue').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
    ]);
    result.pending_queue_count = pendingCount ?? 0;
    result.failed_queue_count = failedCount ?? 0;
    if (result.failed_queue_count > 0) degradedReasons.push('FAILED_MESSAGES');

    // ── 4. Children with no check-in this week ──
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    const weekStartStr = monday.toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    const { data: children } = await sb
      .from('sq_children')
      .select('id')
      .not('whatsapp_number', 'is', null);
    if (children && children.length > 0) {
      const childIds = children.map((c) => c.id);
      const { data: checkedInIds } = await sb
        .from('sq_checkins')
        .select('child_id')
        .in('child_id', childIds)
        .gte('checkin_date', weekStartStr)
        .lte('checkin_date', todayStr)
        .neq('status', 'pending');
      const checkedInSet = new Set((checkedInIds || []).map((r) => r.child_id));
      result.children_with_no_checkin_this_week = childIds.filter(
        (id) => !checkedInSet.has(id)
      ).length;
    }

    result.status = degradedReasons.length > 0 ? 'degraded' : 'ok';
    if (degradedReasons.length > 0) {
      result.degraded_reasons = degradedReasons;
    }
    return json(res, 200, result);
  } catch (err) {
    return json(res, 500, {
      ...result,
      status: 'error',
      error: err?.message || 'Unexpected error in health check.',
    });
  }
}
