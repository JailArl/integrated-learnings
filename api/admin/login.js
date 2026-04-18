import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const admin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

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

function safeCompareString(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8');
  const right = Buffer.from(String(b || ''), 'utf8');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

async function matchesPassword(stored, provided) {
  if (!stored || !provided) return false;

  // Backward compatibility: allow plaintext rows temporarily while migrating to bcrypt hashes.
  if (String(stored).startsWith('$2')) {
    try {
      return await bcrypt.compare(String(provided), String(stored));
    } catch {
      return false;
    }
  }

  return safeCompareString(String(stored), String(provided));
}

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });
  if (!admin) return json(res, 500, { error: 'Admin auth is not configured.' });

  try {
    const body = await readJsonBody(req);
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return json(res, 400, { success: false, error: 'Email and password are required.' });
    }

    const { data: adminRows, error: adminError } = await admin
      .from('admin_users')
      .select('id, email, password_hash, is_active')
      .ilike('email', email)
      .limit(20);

    if (adminError || !adminRows || adminRows.length === 0) {
      return json(res, 401, { success: false, error: 'Invalid credentials.' });
    }

    // Be resilient to legacy duplicate rows for the same email.
    const adminUser = adminRows.find((row) => row?.is_active) || adminRows[0];

    if (!adminUser.is_active) {
      return json(res, 403, { success: false, error: 'Admin account is disabled.' });
    }

    const validPassword = await matchesPassword(adminUser.password_hash, password);
    if (!validPassword) {
      return json(res, 401, { success: false, error: 'Invalid credentials.' });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

    const { error: sessionError } = await admin.from('admin_sessions').insert({
      admin_id: adminUser.id,
      token,
      expires_at: expiresAt,
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent'] || null,
    });

    if (sessionError) {
      return json(res, 500, { success: false, error: 'Failed to create admin session.' });
    }

    await admin
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    return json(res, 200, {
      success: true,
      token,
      expiresIn: SESSION_TTL_MS,
      expiresAt,
    });
  } catch (error) {
    return json(res, 500, { success: false, error: error?.message || 'Unexpected admin login error.' });
  }
}
