import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section } from '../components/Components';
import { supabase } from '../services/supabase';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const TutorInterviewResults: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const loadResults = async () => {
      if (!supabase) {
        setError('Supabase not configured');
        setLoading(false);
        return;
      }

      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          navigate('/tutors/login');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('tutor_profiles')
          .select('ai_interview_status')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        setStatus(profile?.ai_interview_status ?? null);
      } catch (err: any) {
        console.error('Failed to load interview results:', err);
        setError(err.message || 'Failed to load interview results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [navigate]);


  if (loading) {
    return (
      <Section className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 text-lg">Loading interview results...</p>
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        </div>
      </Section>
    );
  }

  if (status !== 'completed') {
    return (
      <Section className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-6 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle size={24} />
              <div>
                <h2 className="text-lg font-bold mb-2">Interview Results Not Available</h2>
                <p className="text-sm">
                  Complete your character interview to unlock your score breakdown.
                </p>
                <button
                  onClick={() => navigate('/tutors')}
                  className="mt-4 inline-block bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Interview Submitted</h1>
              <p className="text-slate-600">
                Thank you for completing the interview. Our admin team will review your responses and follow up with next steps.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full">
                  Status: Under Review
                </span>
                <span className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full">
                  ETA: 24-48 hours
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-900">
              You will be notified once your interview is reviewed (usually within 24-48 hours). We will also reach out if we need any clarification.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/tutors')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => navigate('/tutors/ai-interview')}
              className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-semibold"
            >
              Review Interview Flow
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default TutorInterviewResults;
