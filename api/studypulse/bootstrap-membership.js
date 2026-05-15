import { createClient } from '@supabase/supabase-js';
import {
  getBearerToken,
  getServiceRoleKey,
  getSupabaseAnonKey,
  getSupabaseUrl,
  json,
  readJsonBody,
} from '../../server/studypulse-shared.js';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();
const serviceRoleKey = getServiceRoleKey();

const admin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

async function getAuthenticatedUser(req) {
  const token = getBearerToken(req);
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
