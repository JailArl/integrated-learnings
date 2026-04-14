import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const admin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

function send(res, status, text) {
  res.statusCode = status;
  res.end(text);
}

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function toIso(seconds) {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

function addDaysIso(days) {
  if (!days) return null;
  const next = new Date();
  next.setDate(next.getDate() + Number(days));
  return next.toISOString();
}

async function findUserIdByStripeIds(customerId, subscriptionId) {
  if (!admin) return null;

  if (subscriptionId) {
    const { data } = await admin
      .from('sq_memberships')
      .select('user_id')
      .eq('stripe_subscription_id', subscriptionId)
      .maybeSingle();
    if (data?.user_id) return data.user_id;
  }

  if (customerId) {
    const { data } = await admin
      .from('sq_memberships')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (data?.user_id) return data.user_id;
  }

  return null;
}

async function upsertMembership(userId, fields) {
  if (!admin || !userId) return;
  const { error } = await admin.from('sq_memberships').upsert({
    user_id: userId,
    ...fields,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) console.error('stripe webhook membership upsert failed:', error);
}

async function handleCheckoutCompleted(session) {
  const userId = session.client_reference_id || session.metadata?.supabase_user_id;
  if (!userId) return;

  let currentPeriodEnd = null;
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (subscriptionId && stripe) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    currentPeriodEnd = toIso(subscription.current_period_end);
  } else {
    const durationDays = Number(session.metadata?.duration_days || 0);
    currentPeriodEnd = addDaysIso(durationDays || 30);
  }

  await upsertMembership(userId, {
    plan_type: 'premium',
    status: 'premium_active',
    stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
    stripe_subscription_id: subscriptionId || null,
    current_period_end: currentPeriodEnd,
  });
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  const userId = subscription.metadata?.supabase_user_id || await findUserIdByStripeIds(customerId, subscription.id);
  if (!userId) return;

  const statusMap = {
    active: { plan_type: 'premium', status: 'premium_active' },
    trialing: { plan_type: 'premium', status: 'premium_active' },
    past_due: { plan_type: 'premium', status: 'premium_past_due' },
    unpaid: { plan_type: 'premium', status: 'premium_past_due' },
    canceled: { plan_type: 'free', status: 'premium_cancelled' },
    incomplete: { plan_type: 'free', status: 'premium_past_due' },
    incomplete_expired: { plan_type: 'free', status: 'premium_cancelled' },
  };

  const mapped = statusMap[subscription.status] || { plan_type: 'free', status: 'premium_cancelled' };

  await upsertMembership(userId, {
    ...mapped,
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscription.id || null,
    current_period_end: toIso(subscription.current_period_end),
  });
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id;
  const userId = subscription.metadata?.supabase_user_id || await findUserIdByStripeIds(customerId, subscription.id);
  if (!userId) return;

  await upsertMembership(userId, {
    plan_type: 'free',
    status: 'premium_cancelled',
    stripe_customer_id: customerId || null,
    stripe_subscription_id: subscription.id || null,
    current_period_end: toIso(subscription.current_period_end),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, 'Method not allowed');
  if (!stripe || !webhookSecret || !admin) return send(res, 500, 'Stripe webhook is not configured');

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        break;
    }

    return send(res, 200, 'ok');
  } catch (error) {
    console.error('stripe webhook error:', error);
    return send(res, 400, 'Webhook error');
  }
}
