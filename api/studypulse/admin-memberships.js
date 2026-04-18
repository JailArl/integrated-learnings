import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminApiToken = process.env.ADMIN_API_TOKEN || process.env.VITE_ADMIN_PASSWORD || null;

const admin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

const ALLOWED_REQUEST_TABLES = new Set([
  'sq_tutor_requests',
  'sq_diagnostic_requests',
  'sq_crash_course_interest',
  'sq_holiday_programme_interest',
  'sq_account_disputes',
]);

const ALLOWED_REQUEST_STATUSES = new Set(['pending', 'contacted']);

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
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

function buildMembershipPayload(targetPlan, currentPeriodEnd) {
  const nowIso = new Date().toISOString();
  if (targetPlan === 'premium') {
    const currentPeriodEndIso = currentPeriodEnd && !Number.isNaN(new Date(currentPeriodEnd).getTime())
      ? currentPeriodEnd
      : null;
    const defaultPremiumEndIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    return {
      plan_type: 'premium',
      status: 'premium_active',
      current_period_end: currentPeriodEndIso || defaultPremiumEndIso,
      updated_at: nowIso,
    };
  }

  return {
    plan_type: 'free',
    status: 'free',
    current_period_end: null,
    updated_at: nowIso,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!admin) return json(res, 500, { error: 'StudyPulse admin controls are not configured.' });

  const allowed = await verifyAdminToken(req);
  if (!allowed) return json(res, 401, { error: 'Unauthorized admin request.' });

  try {
    const body = await readJsonBody(req);
    const action = typeof body.action === 'string' ? body.action.trim() : '';

    if (action === 'set_membership_plan') {
      const membershipId = typeof body.membershipId === 'string' ? body.membershipId.trim() : '';
      const targetPlan = body.targetPlan === 'premium' ? 'premium' : body.targetPlan === 'free' ? 'free' : '';
      const currentPeriodEnd = typeof body.currentPeriodEnd === 'string' ? body.currentPeriodEnd : null;

      if (!membershipId) return json(res, 400, { error: 'membershipId is required.' });
      if (!targetPlan) return json(res, 400, { error: 'targetPlan must be premium or free.' });

      const payload = buildMembershipPayload(targetPlan, currentPeriodEnd);
      const { data, error } = await admin
        .from('sq_memberships')
        .update(payload)
        .eq('id', membershipId)
        .select('*')
        .single();

      if (error) return json(res, 400, { error: error.message || 'Could not update membership.' });

      return json(res, 200, {
        ok: true,
        membership: data,
      });
    }

    if (action === 'set_request_status') {
      const table = typeof body.table === 'string' ? body.table.trim() : '';
      const id = typeof body.id === 'string' ? body.id.trim() : '';
      const status = typeof body.status === 'string' ? body.status.trim() : '';

      if (!ALLOWED_REQUEST_TABLES.has(table)) {
        return json(res, 400, { error: 'Unsupported request table.' });
      }
      if (!id) return json(res, 400, { error: 'id is required.' });
      if (!ALLOWED_REQUEST_STATUSES.has(status)) {
        return json(res, 400, { error: 'Unsupported request status.' });
      }

      const { error } = await admin
        .from(table)
        .update({ status })
        .eq('id', id);

      if (error) return json(res, 400, { error: error.message || 'Could not update request status.' });

      return json(res, 200, {
        ok: true,
        table,
        id,
        status,
      });
    }

    return json(res, 400, { error: 'Unsupported action.' });
  } catch (error) {
    return json(res, 500, { error: error?.message || 'Unexpected error.' });
  }
}
