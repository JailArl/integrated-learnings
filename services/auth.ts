import { supabase } from './supabase';
import { notifyTutorSignup } from './discord';

type AuthResult = { success: boolean; error?: string; user?: any; needsEmailVerification?: boolean };

const getEmailRedirectUrl = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  return `${window.location.origin}/tutors/login`;
};

const formatAuthError = (message?: string): string => {
  if (!message) return 'Unknown error';
  const lower = message.toLowerCase();

  if (lower.includes('user already registered')) {
    return 'An account with this email already exists. Please log in instead.';
  }
  if (lower.includes('password')) {
    return 'Password must be at least 6 characters.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }

  return message;
};

const ensureParentProfile = async (
  userId: string,
  email: string,
  fullName?: string,
  phone?: string
): Promise<{ success: boolean; error?: string }> => {
  // Check if profile already exists
  const { data: existing } = await supabase!
    .from('parent_profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (existing) {
    return { success: true };
  }

  const { error } = await supabase!
    .from('parent_profiles')
    .insert([
      {
        id: userId,
        email,
        full_name: fullName || '',
        phone: phone || null,
      },
    ]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

const ensureTutorProfile = async (
  userId: string,
  email: string,
  data: {
    fullName?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    experienceYears?: number;
    photoUrl?: string | null;
  }
): Promise<{ success: boolean; error?: string }> => {
  // Check if profile already exists — never overwrite status fields on login
  const { data: existing } = await supabase!
    .from('tutor_profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (existing) {
    // Profile exists — only update basic contact info if provided during signup
    return { success: true };
  }

  // First time: create profile with initial status
  const { error } = await supabase!
    .from('tutor_profiles')
    .insert([
      {
        id: userId,
        full_name: data.fullName || '',
        email,
        phone: data.phone || null,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender || null,
        experience_years: typeof data.experienceYears === 'number' ? data.experienceYears : null,
        photo_url: data.photoUrl || null,
        verification_status: 'pending',
        onboarding_status: data.photoUrl ? 'photo_uploaded' : 'pending',
        photo_verification_status: data.photoUrl ? 'pending' : 'missing',
      },
    ]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Sign up a tutor (simplified - detailed info collected later)
export const signUpTutor = async (
  email: string,
  password: string,
  data: {
    fullName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    experienceYears?: number;
  }
): Promise<AuthResult> => {
  if (!supabase) {
    const msg = 'Supabase not configured';
    console.error('❌', msg);
    return { success: false, error: msg };
  }

  try {
    console.log('📝 Starting tutor signup for:', email);
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getEmailRedirectUrl(),
        data: {
          role: 'tutor',
          full_name: data.fullName,
          phone: data.phone,
          date_of_birth: data.dateOfBirth,
          gender: data.gender,
        },
      },
    });

    if (authError) {
      console.error('❌ Auth error:', authError);
      throw authError;
    }
    if (!authData.user) {
      console.error('❌ No user returned from auth signup');
      throw new Error('User creation failed');
    }
    
    console.log('✅ Auth user created:', authData.user.id);

    const hasSession = !!authData.session;
    if (hasSession) {
      const ensureResult = await ensureTutorProfile(authData.user.id, email, {
        fullName: data.fullName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        experienceYears: data.experienceYears,
      });

      if (!ensureResult.success) {
        console.error('❌ Profile upsert error:', ensureResult.error);
        throw new Error(ensureResult.error || 'Failed to save tutor profile');
      }
      console.log('✅ Tutor profile created successfully');
    } else {
      console.log('ℹ️ Email confirmation required before profile can be created.');
    }
    
    // Send Discord notification
    await notifyTutorSignup({
      fullName: data.fullName,
      email,
      phone: data.phone || 'Not provided',
    });
    
    return { success: true, user: authData.user, needsEmailVerification: !hasSession };
  } catch (error: any) {
    console.error('❌ Tutor signup error:', error.message || error);
    return { success: false, error: formatAuthError(error.message || 'Unknown error') };
  }
};

// Sign in (for both parents and tutors)
export const signIn = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; user?: any; role?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Sign in failed');

    // Get role from user metadata
    const role = data.user.user_metadata?.role || null;

    if (role === 'parent') {
      const profileResult = await ensureParentProfile(
        data.user.id,
        data.user.email || email,
        data.user.user_metadata?.full_name,
        data.user.user_metadata?.phone
      );
      if (!profileResult.success) {
        throw new Error(profileResult.error || 'Unable to initialize parent profile');
      }
    }

    if (role === 'tutor') {
      const profileResult = await ensureTutorProfile(data.user.id, data.user.email || email, {
        fullName: data.user.user_metadata?.full_name,
        phone: data.user.user_metadata?.phone,
        dateOfBirth: data.user.user_metadata?.date_of_birth,
        gender: data.user.user_metadata?.gender,
      });
      if (!profileResult.success) {
        throw new Error(profileResult.error || 'Unable to initialize tutor profile');
      }
    }

    return { success: true, user: data.user, role };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: formatAuthError(error.message) };
  }
};

// Sign out
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
};

// Get current user
export const getCurrentUser = async (): Promise<{
  user: any | null;
  role: string | null;
}> => {
  if (!supabase) {
    return { user: null, role: null };
  }

  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    const role = user?.user_metadata?.role || null;
    return { user, role };
  } catch (error) {
    console.error('Get current user error:', error);
    return { user: null, role: null };
  }
};


