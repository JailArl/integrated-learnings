import { supabase } from './supabase';
import { notifyParentInquiry } from './discord';

export interface ParentSubmissionData {
  parent_name: string;
  student_name: string;
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
          student_name: data.student_name,
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

    // Send Discord notification (non-blocking)
    notifyParentInquiry({
      parentName: data.parent_name,
      email: data.email,
      phone: data.contact_number,
      studentLevel: data.student_level,
      subjects: data.subjects,
    });

    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('Parent submission error:', error);
    return { success: false, error: error.message || 'Failed to submit inquiry' };
  }
};
