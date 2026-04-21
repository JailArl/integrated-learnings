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

function isMissingSchemaEntityError(message) {
  const msg = String(message || '').toLowerCase();
  const missingRelation = msg.includes('relation') && msg.includes('does not exist');
  const missingColumn = msg.includes('column') && msg.includes('does not exist');
  const schemaCacheTableMiss = msg.includes('could not find the table') && msg.includes('schema cache');
  const schemaCacheColumnMiss = msg.includes('could not find the') && msg.includes('column') && msg.includes('schema cache');
  return missingRelation || missingColumn || schemaCacheTableMiss || schemaCacheColumnMiss;
}

async function safeDelete(table, column, value) {
  const { error } = await admin.from(table).delete().eq(column, value);
  if (!error) return;

  const msg = String(error.message || '');
  if (isMissingSchemaEntityError(msg)) return;

  throw new Error(`Failed to delete from ${table}: ${msg}`);
}

async function safeDeleteIn(table, column, values) {
  if (!Array.isArray(values) || values.length === 0) return;

  const { error } = await admin.from(table).delete().in(column, values);
  if (!error) return;

  const msg = String(error.message || '');
  if (isMissingSchemaEntityError(msg)) return;

  throw new Error(`Failed to delete from ${table}: ${msg}`);
}

function uniqueNonEmpty(values) {
  return Array.from(new Set((values || []).map((v) => String(v || '').trim()).filter(Boolean)));
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

    // 1) Fetch parent phone + child IDs + child phones before any app-row deletion.
    const { data: membershipContact, error: membershipContactError } = await admin
      .from('sq_memberships')
      .select('parent_phone')
      .eq('user_id', auth.user.id)
      .maybeSingle();

    if (membershipContactError) {
      throw new Error(membershipContactError.message || 'Could not read parent phone before account deletion.');
    }

    const { data: children, error: childrenError } = await admin
      .from('sq_children')
      .select('id, whatsapp_number')
      .eq('parent_id', auth.user.id);

    if (childrenError) {
      throw new Error(childrenError.message || 'Could not read child records before account deletion.');
    }

    const childIds = uniqueNonEmpty((children || []).map((c) => c.id));
    const childPhones = uniqueNonEmpty((children || []).map((c) => c.whatsapp_number));
    const parentPhone = String(membershipContact?.parent_phone || '').trim();
    const allPhones = uniqueNonEmpty([parentPhone, ...childPhones]);

    // 2) Clear pending outbound queue rows for this parent/children phone set.
    if (allPhones.length > 0) {
      const { error: outboundQueueError } = await admin
        .from('sq_outbound_queue')
        .delete()
        .eq('status', 'pending')
        .in('to_phone', allPhones);

      if (outboundQueueError) {
        const msg = String(outboundQueueError.message || '');
        if (!isMissingSchemaEntityError(msg)) {
          throw new Error(outboundQueueError.message || 'Could not clear pending outbound queue rows.');
        }
      }
    }

    // 3) Delete child-linked rows first (explicitly, even where ON DELETE CASCADE exists).
    await safeDeleteIn('sq_monitored_subjects', 'child_id', childIds);
    await safeDeleteIn('sq_exam_targets', 'child_id', childIds);
    await safeDeleteIn('sq_study_settings', 'child_id', childIds);
    await safeDeleteIn('sq_weekly_plans', 'child_id', childIds);
    await safeDeleteIn('sq_checkins', 'child_id', childIds);
    await safeDeleteIn('sq_daily_tasks', 'child_id', childIds);
    await safeDeleteIn('sq_weekly_summaries', 'child_id', childIds);
    await safeDeleteIn('sq_exam_results', 'child_id', childIds);
    await safeDeleteIn('sq_weekly_targets', 'child_id', childIds);
    await safeDeleteIn('sq_parent_adjustments', 'child_id', childIds);
    await safeDeleteIn('sq_tutor_requests', 'child_id', childIds);
    await safeDeleteIn('sq_diagnostic_requests', 'child_id', childIds);
    await safeDeleteIn('sq_crash_course_interest', 'child_id', childIds);
    await safeDeleteIn('sq_holiday_programme_interest', 'child_id', childIds);
    await safeDeleteIn('sq_account_disputes', 'child_id', childIds);

    // 4) Delete parent-linked rows.
    await safeDelete('sq_tutor_requests', 'parent_id', auth.user.id);
    await safeDelete('sq_diagnostic_requests', 'parent_id', auth.user.id);
    await safeDelete('sq_crash_course_interest', 'parent_id', auth.user.id);
    await safeDelete('sq_holiday_programme_interest', 'parent_id', auth.user.id);
    await safeDelete('sq_account_disputes', 'parent_id', auth.user.id);
    await safeDelete('sq_parent_adjustments', 'parent_id', auth.user.id);

    // Phone-keyed cleanup audit result:
    // whatsapp_contacts / whatsapp_conversations are keyed by phone, not parent auth FK.
    // Remove rows matching this account's phones to avoid orphaned message history.
    await safeDeleteIn('whatsapp_conversations', 'contact_phone', allPhones);
    await safeDeleteIn('whatsapp_contacts', 'phone_number', allPhones);

    // 5) Delete sq_children.
    await safeDelete('sq_children', 'parent_id', auth.user.id);

    // 6) Delete sq_memberships.
    await safeDelete('sq_memberships', 'user_id', auth.user.id);

    // 7) Delete parent_profiles.
    await safeDelete('parent_profiles', 'id', auth.user.id);

    // 8) Hard-delete Supabase Auth user.
    const { error: authDeleteError } = await admin.auth.admin.deleteUser(auth.user.id);
    if (authDeleteError) {
      return json(res, 500, { error: authDeleteError.message || 'Could not delete authentication account.' });
    }

    return json(res, 200, { ok: true, deletedUserId: auth.user.id });
  } catch (error) {
    return json(res, 500, { error: error?.message || 'Unexpected delete account error.' });
  }
}
