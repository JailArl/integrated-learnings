import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminApiToken = process.env.ADMIN_API_TOKEN || process.env.VITE_ADMIN_PASSWORD || null;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
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

function toIso(seconds) {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

async function fetchStatuses(subscriptionIds) {
  const entries = await Promise.all(subscriptionIds.map(async (subscriptionId) => {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      return [
        subscriptionId,
        {
          ok: true,
          status: sub.status,
          cancel_at_period_end: !!sub.cancel_at_period_end,
          current_period_end: toIso(sub.current_period_end),
        },
      ];
    } catch (error) {
      return [subscriptionId, { ok: false, error: error?.message || 'Failed to fetch subscription status.' }];
    }
  }));

  return Object.fromEntries(entries);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!stripe || !admin) return json(res, 500, { error: 'Stripe admin controls are not configured.' });

  const allowed = await verifyAdminToken(req);
  if (!allowed) return json(res, 401, { error: 'Unauthorized admin request.' });

  try {
    const body = await readJsonBody(req);
    const action = typeof body.action === 'string' ? body.action : '';

    if (action === 'status') {
      const rawIds = Array.isArray(body.subscriptionIds) ? body.subscriptionIds : [];
      const subscriptionIds = rawIds.filter((id) => typeof id === 'string' && id.trim()).map((id) => id.trim());
      if (subscriptionIds.length === 0) return json(res, 200, { statuses: {} });
      const statuses = await fetchStatuses(subscriptionIds);
      return json(res, 200, { statuses });
    }

    const subscriptionId = typeof body.subscriptionId === 'string' ? body.subscriptionId.trim() : '';
    if (!subscriptionId) return json(res, 400, { error: 'subscriptionId is required.' });

    if (action === 'cancel_at_period_end') {
      const updated = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
      return json(res, 200, {
        ok: true,
        subscriptionId,
        status: updated.status,
        cancel_at_period_end: !!updated.cancel_at_period_end,
        current_period_end: toIso(updated.current_period_end),
      });
    }

    if (action === 'resume_auto_renew') {
      const updated = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
      return json(res, 200, {
        ok: true,
        subscriptionId,
        status: updated.status,
        cancel_at_period_end: !!updated.cancel_at_period_end,
        current_period_end: toIso(updated.current_period_end),
      });
    }

    if (action === 'cancel_now') {
      const cancelled = await stripe.subscriptions.cancel(subscriptionId);
      const customerId = typeof cancelled.customer === 'string' ? cancelled.customer : cancelled.customer?.id;
      const nowIso = new Date().toISOString();

      const { data: membership } = await admin
        .from('sq_memberships')
        .select('id')
        .eq('stripe_subscription_id', subscriptionId)
        .maybeSingle();

      if (membership?.id) {
        await admin
          .from('sq_memberships')
          .update({
            plan_type: 'free',
            status: 'premium_cancelled',
            stripe_customer_id: customerId || null,
            stripe_subscription_id: subscriptionId,
            current_period_end: toIso(cancelled.current_period_end),
            updated_at: nowIso,
          })
          .eq('id', membership.id);
      }

      return json(res, 200, {
        ok: true,
        subscriptionId,
        status: cancelled.status,
        cancel_at_period_end: !!cancelled.cancel_at_period_end,
        current_period_end: toIso(cancelled.current_period_end),
      });
    }

    return json(res, 400, { error: 'Unsupported action.' });
  } catch (error) {
    console.error('admin-subscriptions error:', error);
    return json(res, 500, { error: error?.message || 'Could not complete admin billing action.' });
  }
}
