import { supabase } from './supabase';

export interface ParentSubmissionData {
  parent_name: string;
  contact_number: string;
  email: string;
  student_level: string;
  subjects: string[];
  preferred_mode: string;
  location: string;
  budget_range: string;
  current_challenge: string;
  goals: string;
  preferred_contact_timing: string;
  additional_notes: string;
}

export const submitParentInquiry = async (
  data: ParentSubmissionData
): Promise<{ success: boolean; error?: string; id?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured. Please check your environment variables.' };
  }

  try {
    const { data: result, error } = await supabase
      .from('parent_submissions')
      .insert([
        {
          parent_name: data.parent_name,
          contact_number: data.contact_number,
          email: data.email,
          student_level: data.student_level,
          subjects: data.subjects,
          preferred_mode: data.preferred_mode,
          location: data.location || null,
          budget_range: data.budget_range || null,
          current_challenge: data.current_challenge || null,
          goals: data.goals || null,
          preferred_contact_timing: data.preferred_contact_timing || null,
          additional_notes: data.additional_notes || null,
          status: 'new',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('Parent submission error:', error);
    return { success: false, error: error.message || 'Failed to submit inquiry' };
  }
};

export const getParentSubmissions = async (filters?: {
  status?: string;
  student_level?: string;
  subject?: string;
}): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    let query = supabase
      .from('parent_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.student_level && filters.student_level !== 'all') {
      query = query.eq('student_level', filters.student_level);
    }
    if (filters?.subject && filters.subject !== 'all') {
      query = query.contains('subjects', [filters.subject]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error('Fetch parent submissions error:', error);
    return { success: false, error: error.message };
  }
};

export const updateParentSubmissionStatus = async (
  id: string,
  status: string
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase
      .from('parent_submissions')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Update submission status error:', error);
    return { success: false, error: error.message };
  }
};
