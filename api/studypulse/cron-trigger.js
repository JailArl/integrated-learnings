import {
  getBearerToken,
  getFunctionBaseUrl,
  getServiceRoleKey,
  getSupabaseUrl,
  json,
} from './_shared.js';

/**
 * api/studypulse/cron-trigger.js
 *
 * Manual-only fallback route for invoking the studypulse-cron Edge Function.
 *
 * IMPORTANT: This route is intentionally NOT listed in vercel.json "crons".
 * It is for ad-hoc debugging only. The sole active scheduler is the GitHub
 * Actions workflow at .github/workflows/studypulse-cron.yml.
 *
 * If you add a Vercel cron entry pointing here, disable the GitHub Actions
 * workflow first to prevent duplicate runs.
 *
 * Usage:
 *   POST /api/studypulse/cron-trigger
 *   Authorization: Bearer <CRON_SECRET>
 */

const supabaseUrl = getSupabaseUrl();
const serviceRoleKey = getServiceRoleKey();
const cronSecret = process.env.CRON_SECRET || null;
const functionBaseUrl = getFunctionBaseUrl();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return json(res, 500, { error: 'Supabase credentials are not configured.' });
  }

  // Require CRON_SECRET if configured; reject unauthenticated requests
  const token = getBearerToken(req);
  if (cronSecret && token !== cronSecret) {
    return json(res, 401, { error: 'Unauthorized. Provide a valid CRON_SECRET.' });
  }

  try {
    const response = await fetch(`${functionBaseUrl}/functions/v1/studypulse-cron`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({}),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return json(res, 502, {
        ok: false,
        error: 'studypulse-cron returned a non-2xx status.',
        http_status: response.status,
        details: payload,
      });
    }

    return json(res, 200, {
      ok: true,
      triggered_at: new Date().toISOString(),
      result: payload,
    });
  } catch (err) {
    return json(res, 500, {
      ok: false,
      error: err?.message || 'Unexpected error triggering cron.',
    });
  }
}
