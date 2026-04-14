import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePriceIdMonthly = process.env.STRIPE_PRICE_ID_MONTHLY || 'price_1TM2leDko1OhK4VFqEK751aM';
const stripePriceIdPass1m = process.env.STRIPE_PRICE_ID_PASS_1M;
const stripePriceIdPack2m = process.env.STRIPE_PRICE_ID_PACK_2M;
const stripePriceIdPack4m = process.env.STRIPE_PRICE_ID_PACK_4M;
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const PLAN_CONFIG = {
  monthly_flex: { mode: 'subscription', priceId: stripePriceIdMonthly, label: 'Monthly Flex', durationDays: null },
  pass_1m: { mode: 'payment', priceId: stripePriceIdPass1m, label: '1-Month Pass', durationDays: 30 },
  pack_2m: { mode: 'payment', priceId: stripePriceIdPack2m, label: '2-Month Sprint', durationDays: 60 },
  pack_4m: { mode: 'payment', priceId: stripePriceIdPack4m, label: '4-Month Season', durationDays: 120 },
};

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token || !supabaseUrl || !supabaseAnonKey) return null;

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  return { user: data.user, client };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!stripe) return json(res, 500, { error: 'Stripe is not configured yet.' });

  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return json(res, 401, { error: 'Please sign in again before upgrading.' });

    const body = await readJsonBody(req);
    const origin = typeof body.origin === 'string' && /^https?:\/\//.test(body.origin)
      ? body.origin
      : `https://${req.headers.host}`;
    const requestedPlan = typeof body.plan === 'string' ? body.plan : 'monthly_flex';
    const selectedPlan = PLAN_CONFIG[requestedPlan] || PLAN_CONFIG.monthly_flex;

    if (!selectedPlan?.priceId) {
      return json(res, 500, { error: `${selectedPlan.label} is not configured in Stripe yet.` });
    }

    const { data: membership } = await auth.client
      .from('sq_memberships')
      .select('stripe_customer_id, stripe_subscription_id, status, current_period_end')
      .eq('user_id', auth.user.id)
      .single();

    const hasActivePeriod = membership?.current_period_end && new Date(membership.current_period_end).getTime() > Date.now();
    if (membership?.status === 'premium_active' && (membership?.stripe_subscription_id || hasActivePeriod)) {
      return json(res, 409, { error: 'Your premium access is already active.' });
    }

    const metadata = {
      supabase_user_id: auth.user.id,
      plan_type: 'premium',
      plan_code: requestedPlan,
      plan_label: selectedPlan.label,
      ...(selectedPlan.durationDays ? { duration_days: String(selectedPlan.durationDays) } : {}),
    };

    const commonConfig = {
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/studypulse/app?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/studypulse/app?billing=cancel`,
      client_reference_id: auth.user.id,
      customer: membership?.stripe_customer_id || undefined,
      customer_email: membership?.stripe_customer_id ? undefined : (auth.user.email || undefined),
      metadata,
    };

    const session = selectedPlan.mode === 'subscription'
      ? await stripe.checkout.sessions.create({
          ...commonConfig,
          mode: 'subscription',
          subscription_data: { metadata },
        })
      : await stripe.checkout.sessions.create({
          ...commonConfig,
          mode: 'payment',
          payment_intent_data: { metadata },
        });

    return json(res, 200, { url: session.url });
  } catch (error) {
    console.error('create-checkout-session error:', error);
    return json(res, 500, { error: 'Could not start secure checkout.' });
  }
}
