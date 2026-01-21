/**
 * Form Handler Service
 * Manages form submissions from parents and tutors
 * Integrates with backend API for data persistence
 */

export interface ParentFormData {
  id?: string;
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childAge: number;
  level: string;
  subjects: string[];
  currentGrades?: string;
  mainConcerns: string;
  learningStyle: string;
  preferredTiming: string;
  preferredFormat: 'zoom' | 'inPerson' | 'either';
  assignmentType: 'quick' | 'rightFit' | 'premium';
  submittedAt?: string;
  status?: 'pending' | 'approved' | 'matched' | 'cancelled';
}

export interface TutorFormData {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  experienceYears: number;
  subjects: string[];
  levels: string[];
  teachingPhilosophy: string;
  availability: string;
  preferredFormat: 'zoom' | 'inPerson' | 'either';
  certificationFile?: File;
  submittedAt?: string;
  status?: 'pending' | 'verified' | 'active' | 'rejected';
}

export interface FormSubmission {
  id: string;
  type: 'parent' | 'tutor';
  data: ParentFormData | TutorFormData;
  submittedAt: string;
  status: string;
  notes?: string;
}

import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Submit parent form data
 */
export const submitParentForm = async (data: ParentFormData): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    const payload = { ...data, submittedAt: new Date().toISOString(), status: data.status || 'pending' };

    // Use Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const { data: inserted, error } = await supabase
        .from('parent_submissions')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return { success: true, id: inserted.id };
    }

    // Fallback to local Express API
    const response = await fetch('/api/forms/parent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to submit form');
    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('Parent form submission error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Submit tutor form data
 */
export const submitTutorForm = async (data: TutorFormData): Promise<{ success: boolean; id?: string; error?: string }> => {
  try {
    // If Supabase is configured, insert directly (store file name only for now)
    if (isSupabaseConfigured && supabase) {
      const payload = {
        ...data,
        certificationFile: data.certificationFile ? (data.certificationFile as File).name : undefined,
        submittedAt: new Date().toISOString(),
        status: data.status || 'pending',
      };
      const { data: inserted, error } = await supabase
        .from('tutor_submissions')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return { success: true, id: inserted.id };
    }

    // Fallback to local Express API with multipart
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'subjects' || key === 'levels') {
        formData.append(key, JSON.stringify(value));
      } else if (key !== 'certificationFile') {
        formData.append(key, String(value));
      }
    });
    if (data.certificationFile) {
      formData.append('certificationFile', data.certificationFile);
    }
    formData.append('submittedAt', new Date().toISOString());

    const response = await fetch('/api/forms/tutor', { method: 'POST', body: formData });
    if (!response.ok) throw new Error('Failed to submit form');
    const result = await response.json();
    return { success: true, id: result.id };
  } catch (error: any) {
    console.error('Tutor form submission error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get all submissions (admin only)
 */
export const getSubmissions = async (adminToken: string): Promise<FormSubmission[]> => {
  try {
    // If Supabase configured, aggregate parent + tutor submissions
    if (isSupabaseConfigured && supabase) {
      const [parentsRes, tutorsRes] = await Promise.all([
        supabase.from('parent_submissions').select('*'),
        supabase.from('tutor_submissions').select('*'),
      ]);
      const parents = (parentsRes.data || []).map((p: any) => ({
        id: p.id,
        type: 'parent' as const,
        data: p,
        submittedAt: p.submittedAt || p.submitted_at || new Date().toISOString(),
        status: p.status || 'pending',
      }));
      const tutors = (tutorsRes.data || []).map((t: any) => ({
        id: t.id,
        type: 'tutor' as const,
        data: t,
        submittedAt: t.submittedAt || t.submitted_at || new Date().toISOString(),
        status: t.status || 'pending',
      }));
      return [...parents, ...tutors];
    }

    // Fallback: backend API
    const response = await fetch('/api/forms/all', {
      headers: { 'Authorization': `Bearer ${adminToken}` },
    });
    if (!response.ok) throw new Error('Failed to fetch submissions');
    return await response.json();
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }
};

/**
 * Update submission status (admin only)
 */
export const updateSubmissionStatus = async (
  submissionId: string,
  status: string,
  adminToken: string
): Promise<boolean> => {
  try {
    if (isSupabaseConfigured && supabase) {
      // Try updating both tables; one should match
      const updates = await Promise.all([
        supabase.from('parent_submissions').update({ status }).eq('id', submissionId),
        supabase.from('tutor_submissions').update({ status }).eq('id', submissionId),
      ]);
      const success = updates.some(u => !u.error && (u.data || u.count));
      return !!success;
    }

    const response = await fetch(`/api/forms/${submissionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating submission:', error);
    return false;
  }
};
