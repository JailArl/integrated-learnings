import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePriceId = process.env.STRIPE_PRICE_ID_MONTHLY || 'price_1TM2leDko1OhK4VFqEK751aM';
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

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
  if (!stripePriceId) return json(res, 500, { error: 'Stripe price is not configured yet.' });

  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth) return json(res, 401, { error: 'Please sign in again before upgrading.' });

    const body = await readJsonBody(req);
    const origin = typeof body.origin === 'string' && /^https?:\/\//.test(body.origin)
      ? body.origin
      : `https://${req.headers.host}`;

    const { data: membership } = await auth.client
      .from('sq_memberships')
      .select('stripe_customer_id, stripe_subscription_id, status')
      .eq('user_id', auth.user.id)
      .single();

    if (membership?.status === 'premium_active' && membership?.stripe_subscription_id) {
      return json(res, 409, { error: 'Your premium subscription is already active.' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: stripePriceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/studypulse/app?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/studypulse/app?billing=cancel`,
      client_reference_id: auth.user.id,
      customer: membership?.stripe_customer_id || undefined,
      customer_email: membership?.stripe_customer_id ? undefined : (auth.user.email || undefined),
      metadata: {
        supabase_user_id: auth.user.id,
        plan_type: 'premium',
      },
      subscription_data: {
        metadata: {
          supabase_user_id: auth.user.id,
          plan_type: 'premium',
        },
      },
    });

    return json(res, 200, { url: session.url });
  } catch (error) {
    console.error('create-checkout-session error:', error);
    return json(res, 500, { error: 'Could not start secure checkout.' });
  }
}
