import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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

async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token || !supabaseUrl || !supabaseAnonKey) return null;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user?.id) return null;
  return { user: data.user };
}

async function tryUpsert(payload) {
  const { error } = await admin.from('sq_memberships').upsert(payload, { onConflict: 'user_id' });
  return error;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!admin || !supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return json(res, 500, { error: 'Membership bootstrap service is not configured.' });
  }

  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.user?.id) {
      return json(res, 401, { error: 'Please sign in again before continuing.' });
    }

    const body = await readJsonBody(req);
    const requestedUserId = String(body?.userId || '').trim();
    const targetUserId = requestedUserId || auth.user.id;
    if (targetUserId !== auth.user.id) {
      return json(res, 403, { error: 'Cannot initialize profile for a different user.' });
    }

    const planType = body?.planType === 'premium' ? 'premium' : 'free';
    const status = planType === 'free' ? 'free' : 'premium_active';
    const profile = body?.profile || {};

    const fullPayload = {
      user_id: targetUserId,
      plan_type: planType,
      status,
      ...(profile.name ? { parent_name: String(profile.name) } : {}),
      ...(profile.email ? { parent_email: String(profile.email) } : {}),
      ...(profile.phone ? { parent_phone: String(profile.phone) } : {}),
      ...(profile.language ? { preferred_language: profile.language === 'zh' ? 'zh' : 'en' } : {}),
    };

    const withoutPhone = { ...fullPayload };
    delete withoutPhone.parent_phone;

    const withoutLanguage = { ...fullPayload };
    delete withoutLanguage.preferred_language;

    const withoutPhoneAndLanguage = { ...withoutPhone };
    delete withoutPhoneAndLanguage.preferred_language;

    const minimalPayload = {
      user_id: targetUserId,
      plan_type: planType,
      status,
    };

    const attempts = [fullPayload, withoutPhone, withoutLanguage, withoutPhoneAndLanguage, minimalPayload];
    const seen = new Set();
    let lastError = null;

    for (const payload of attempts) {
      const key = JSON.stringify(payload);
      if (seen.has(key)) continue;
      seen.add(key);

      const error = await tryUpsert(payload);
      if (!error) {
        return json(res, 200, { ok: true });
      }

      lastError = error;
      const msg = String(error.message || '').toLowerCase();
      const recoverable =
        msg.includes('uq_sq_memberships_parent_phone') ||
        (msg.includes('column') && msg.includes('does not exist')) ||
        msg.includes('schema cache') ||
        msg.includes('preferred_language');
      if (!recoverable) break;
    }

    return json(res, 500, { error: lastError?.message || 'Could not initialize membership profile.' });
  } catch (error) {
    return json(res, 500, { error: error?.message || 'Unexpected bootstrap membership error.' });
  }
}
