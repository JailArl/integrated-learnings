import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
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

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
}

async function lookupValidSession(token) {
  if (!token || !admin) return { valid: false, reason: 'missing_token' };

  const { data: session, error: sessionError } = await admin
    .from('admin_sessions')
    .select('id, admin_id, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (sessionError || !session?.id || !session?.admin_id || !session?.expires_at) {
    return { valid: false, reason: 'not_found' };
  }

  const expiresAtMs = new Date(session.expires_at).getTime();
  if (Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now()) {
    return { valid: false, reason: 'expired', sessionId: session.id };
  }

  const { data: adminUser, error: adminError } = await admin
    .from('admin_users')
    .select('id, is_active')
    .eq('id', session.admin_id)
    .maybeSingle();

  if (adminError || !adminUser?.id || !adminUser?.is_active) {
    return { valid: false, reason: 'inactive_admin', sessionId: session.id };
  }

  return {
    valid: true,
    adminId: adminUser.id,
    sessionId: session.id,
    expiresAt: session.expires_at,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!admin) {
    const missing = [];
    if (!supabaseUrl) missing.push('SUPABASE_URL');
    if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    return json(res, 500, {
      error: `Admin session service is not configured. Missing: ${missing.join(', ')}`,
    });
  }

  try {
    const token = extractBearerToken(req);
    const body = await readJsonBody(req);
    const action = typeof body.action === 'string' ? body.action.trim() : 'validate';

    if (action !== 'validate' && action !== 'logout') {
      return json(res, 400, { ok: false, error: 'Unsupported action.' });
    }

    if (!token) {
      return json(res, 200, { ok: true, valid: false, reason: 'missing_token' });
    }

    const session = await lookupValidSession(token);

    if (action === 'validate') {
      if (!session.valid && session.sessionId) {
        await admin.from('admin_sessions').delete().eq('id', session.sessionId);
      }
      return json(res, 200, {
        ok: true,
        valid: !!session.valid,
        reason: session.valid ? null : session.reason,
        adminId: session.valid ? session.adminId : null,
        expiresAt: session.valid ? session.expiresAt : null,
      });
    }

    // logout action
    if (session.sessionId) {
      await admin.from('admin_sessions').delete().eq('id', session.sessionId);
      return json(res, 200, { ok: true, loggedOut: true });
    }

    // No active session found still counts as logged out.
    return json(res, 200, { ok: true, loggedOut: true });
  } catch (error) {
    return json(res, 500, { ok: false, error: error?.message || 'Unexpected admin session error.' });
  }
}
