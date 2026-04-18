interface AdminLoginResponse {
  success: boolean;
  token?: string;
  error?: string;
  expiresIn?: number;
}

interface AdminSessionValidationResponse {
  ok: boolean;
  valid: boolean;
  reason?: string | null;
  adminId?: string | null;
  expiresAt?: string | null;
}

async function postAdminApi<T>(path: string, body: Record<string, unknown>, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || 'Admin API request failed.');
  }

  return payload as T;
}

/**
 * Admin Login - Returns JWT-like token stored in database
 * 
 * Admin accounts are managed directly in Supabase (admin_users table).
 * The env-based fallback is for initial setup only.
 * For production, all admin accounts should be created and managed in
 * the Supabase admin_users table with proper password hashing via 
 * Supabase Edge Functions or server-side logic.
 */
export const adminLogin = async (
  email: string,
  password: string
): Promise<AdminLoginResponse> => {
  try {
    const payload = await postAdminApi<AdminLoginResponse>('/api/admin/login', {
      email,
      password,
    });
    return payload;
  } catch (error: any) {
    console.error('Admin login error:', error);
    return { success: false, error: error?.message || 'Login failed.' };
  }
};

/**
 * Logout - invalidate session
 */
export const adminLogout = async (token: string): Promise<boolean> => {
  try {
    await postAdminApi('/api/admin/session', { action: 'logout' }, token);
    return true;
  } catch (error: any) {
    console.error('Logout error:', error);
    return false;
  }
};

export const validateAdminSession = async (token: string): Promise<boolean> => {
  if (!token) return false;
  try {
    const payload = await postAdminApi<AdminSessionValidationResponse>('/api/admin/session', { action: 'validate' }, token);
    return !!payload?.ok && !!payload?.valid;
  } catch (error) {
    console.error('Admin session validation failed:', error);
    return false;
  }
};
