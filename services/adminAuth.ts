import { supabase } from './supabase';

// Generate UUID without external dependency
const generateToken = () => {
  return crypto.randomUUID();
};

interface AdminLoginResponse {
  success: boolean;
  token?: string;
  error?: string;
  expiresIn?: number;
}

interface AdminSession {
  id: string;
  admin_id: string;
  token: string;
  expires_at: string;
}

/**
 * Admin Login - Returns JWT-like token stored in database
 * In production, consider using Supabase JWT or a proper backend service
 */
export const adminLogin = async (
  email: string,
  password: string
): Promise<AdminLoginResponse> => {
  // Fallback hardcoded credentials for quick access
  // TODO: Replace with proper database user after setup
  const HARDCODED_ADMIN_EMAIL = 'admin@integrated-learnings.com';
  const HARDCODED_ADMIN_PASSWORD = 'IntegratedAdmin2024!';

  if (email === HARDCODED_ADMIN_EMAIL && password === HARDCODED_ADMIN_PASSWORD) {
    const token = generateToken();
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminId', 'hardcoded-admin');
    return {
      success: true,
      token,
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours
    };
  }

  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    // Query admin user
    const { data: admin, error: adminError } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, is_active')
      .eq('email', email)
      .single();

    if (adminError || !admin) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (!admin.is_active) {
      return { success: false, error: 'Admin account is disabled' };
    }

    // In production, use bcrypt or similar to verify password
    // For now, simple comparison (NOT SECURE - use bcrypt in production!)
    if (admin.password_hash !== password) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Generate session token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session
    const { error: sessionError } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: admin.id,
        token,
        expires_at: expiresAt.toISOString(),
        ip_address: null, // Would need to capture from request
        user_agent: navigator.userAgent,
      });

    if (sessionError) {
      return { success: false, error: 'Failed to create session' };
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', admin.id);

    return {
      success: true,
      token,
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    };
  } catch (error: any) {
    console.error('Admin login error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verify admin session token
 */
export const verifyAdminToken = async (token: string): Promise<boolean> => {
  if (!supabase) {
    return false;
  }

  try {
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select('id, expires_at')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Token verification error:', error);
    return false;
  }
};

/**
 * Logout - invalidate session
 */
export const adminLogout = async (token: string): Promise<boolean> => {
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('admin_sessions')
      .delete()
      .eq('token', token);

    if (error) {
      console.error('Logout error:', error);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error('Logout error:', error);
    return false;
  }
};

/**
 * Get admin info from token
 */
export const getAdminFromToken = async (token: string) => {
  if (!supabase) {
    return null;
  }

  try {
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select(
        `
        admin_id,
        admin_users(id, email, full_name)
      `
      )
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return null;
    }

    return session;
  } catch (error: any) {
    console.error('Get admin error:', error);
    return null;
  }
};
