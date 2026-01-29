import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: 'parent' | 'tutor';
}

// Sign up a parent
export const signUpParent = async (
  email: string,
  password: string,
  fullName: string,
  phone?: string
): Promise<{ success: boolean; error?: string; user?: any }> => {
  if (!supabase) {
    const msg = 'Supabase not configured';
    console.error('❌', msg);
    return { success: false, error: msg };
  }

  try {
    console.log('📝 Starting parent signup with:', { email, fullName, phone });
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'parent',
          full_name: fullName,
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

    // Create parent profile
    const { error: profileError } = await supabase
      .from('parent_profiles')
      .insert([
        {
          id: authData.user.id,
          full_name: fullName,
          email: email,
          phone: phone || null,
        },
      ]);

    if (profileError) {
      console.error('❌ Profile insert error:', profileError);
      throw profileError;
    }
    
    console.log('✅ Parent profile created successfully');
    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('❌ Parent signup error:', error.message || error);
    return { success: false, error: error.message || 'Unknown error' };
  }
};

// Sign up a tutor (simplified - detailed info collected later)
export const signUpTutor = async (
  email: string,
  password: string,
  data: {
    fullName: string;
    phone?: string;
  }
): Promise<{ success: boolean; error?: string; user?: any }> => {
  if (!supabase) {
    const msg = 'Supabase not configured';
    console.error('❌', msg);
    return { success: false, error: msg };
  }

  try {
    console.log('📝 Starting tutor signup with:', { email, fullName: data.fullName, phone: data.phone });
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'tutor',
          full_name: data.fullName,
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

    // Create tutor profile with basic info only
    // Detailed info (qualification, subjects, levels, experience, etc.) collected later
    const { error: profileError } = await supabase
      .from('tutor_profiles')
      .insert([
        {
          id: authData.user.id,
          full_name: data.fullName,
          email: email,
          phone: data.phone || null,
          verification_status: 'pending',
        },
      ]);

    if (profileError) {
      console.error('❌ Profile insert error:', profileError);
      throw profileError;
    }
    
    console.log('✅ Tutor profile created successfully');
    return { success: true, user: authData.user };
  } catch (error: any) {
    console.error('❌ Tutor signup error:', error.message || error);
    return { success: false, error: error.message || 'Unknown error' };
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

    return { success: true, user: data.user, role };
  } catch (error: any) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
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

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { user } = await getCurrentUser();
  return !!user;
};
