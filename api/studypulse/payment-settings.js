import { createClient } from '@supabase/supabase-js';
import { getServiceRoleKey, getSupabaseUrl, json } from '../../server/studypulse-shared.js';

const supabaseUrl = getSupabaseUrl();
const serviceRoleKey = getServiceRoleKey();
const envDefaultEnabled = String(process.env.STUDYPULSE_PAYMENTS_ENABLED || process.env.VITE_STUDYPULSE_PAYMENTS_ENABLED || '').toLowerCase() === 'true';
const flagKey = 'studypulse_payments';

const admin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (!admin) {
    return json(res, 200, { ok: true, enabled: envDefaultEnabled, source: 'env' });
  }

  try {
    const { data, error } = await admin
      .from('sq_runtime_flags')
      .select('value_json, updated_at, updated_by')
      .eq('key', flagKey)
      .maybeSingle();

    if (error) {
      return json(res, 200, { ok: true, enabled: envDefaultEnabled, source: 'env', warning: error.message || 'Could not read runtime flag.' });
    }

    return json(res, 200, {
      ok: true,
      enabled: Boolean(data?.value_json?.enabled),
      source: data ? 'db' : 'env',
      updated_at: data?.updated_at || null,
      updated_by: data?.updated_by || null,
    });
  } catch (error) {
    return json(res, 200, {
      ok: true,
      enabled: envDefaultEnabled,
      source: 'env',
      warning: error?.message || 'Could not read runtime flag.',
    });
  }
}
