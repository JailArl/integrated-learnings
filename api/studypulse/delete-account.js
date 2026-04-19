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

async function safeDelete(table, column, value) {
  const { error } = await admin.from(table).delete().eq(column, value);
  if (!error) return;

  const msg = String(error.message || '');
  const missingTable = msg.includes('relation') && msg.includes('does not exist');
  if (missingTable) return;

  throw new Error(`Failed to delete from ${table}: ${msg}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!admin || !supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return json(res, 500, { error: 'Delete account service is not configured.' });
  }

  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.user?.id) {
      return json(res, 401, { error: 'Please sign in again before deleting account.' });
    }

    const body = await readJsonBody(req);
    if (body?.confirm !== true) {
      return json(res, 400, { error: 'confirm=true is required.' });
    }

    const { data: membership } = await admin
      .from('sq_memberships')
      .select('stripe_subscription_id, status')
      .eq('user_id', auth.user.id)
      .maybeSingle();

    if (membership?.stripe_subscription_id && membership?.status === 'premium_active') {
      return json(res, 409, {
        error: 'Please cancel membership from Billing first, then delete account.',
      });
    }

    await safeDelete('sq_children', 'parent_id', auth.user.id);
    await safeDelete('sq_memberships', 'user_id', auth.user.id);
    await safeDelete('parent_profiles', 'id', auth.user.id);

    const { error: authDeleteError } = await admin.auth.admin.deleteUser(auth.user.id);
    if (authDeleteError) {
      return json(res, 500, { error: authDeleteError.message || 'Could not delete authentication account.' });
    }

    return json(res, 200, { ok: true, deletedUserId: auth.user.id });
  } catch (error) {
    return json(res, 500, { error: error?.message || 'Unexpected delete account error.' });
  }
}
