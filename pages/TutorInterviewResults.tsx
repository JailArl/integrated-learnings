import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section } from '../components/Components';
import { supabase } from '../services/supabase';
import { AlertCircle, CheckCircle } from 'lucide-react';

export const TutorInterviewResults: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [retakeLoading, setRetakeLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const MAX_RETAKES = 2;
  const MAX_TOTAL_ATTEMPTS = 1 + MAX_RETAKES;

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
          .select('ai_interview_status, ai_interview_attempts')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        setStatus(profile?.ai_interview_status ?? null);

        const completedAttempts =
          profile?.ai_interview_attempts ?? (profile?.ai_interview_status === 'completed' ? 1 : 0);
        setAttempts(completedAttempts);
      } catch (err: any) {
        console.error('Failed to load interview results:', err);
        setError(err.message || 'Failed to load interview results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [navigate]);

  const retakesUsed = Math.max(attempts - 1, 0);
  const retakesRemaining = Math.max(MAX_RETAKES - retakesUsed, 0);

  const handleRetakeInterview = async () => {
    if (!supabase || retakesRemaining <= 0) return;

    setRetakeLoading(true);
    setError('');

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        navigate('/tutors/login');
        return;
      }

      const { data: latestProfile, error: latestProfileError } = await supabase
        .from('tutor_profiles')
        .select('ai_interview_status, ai_interview_attempts')
        .eq('id', authData.user.id)
        .single();

      if (latestProfileError) throw latestProfileError;

      const latestAttempts =
        latestProfile?.ai_interview_attempts ?? (latestProfile?.ai_interview_status === 'completed' ? 1 : 0);

      if (latestAttempts >= MAX_TOTAL_ATTEMPTS) {
        setError('You have reached the maximum of 2 questionnaire retakes. Please contact admin for assistance.');
        return;
      }

      const { error: updateError } = await supabase
        .from('tutor_profiles')
        .update({
          ai_interview_status: 'pending',
          ai_interview_transcript: null,
          ai_interview_score: null,
          ai_interview_assessment: null,
        })
        .eq('id', authData.user.id);

      if (updateError) throw updateError;

      navigate('/tutors/ai-interview');
    } catch (err: any) {
      console.error('Failed to start questionnaire retake:', err);
      setError(err.message || 'Failed to start questionnaire retake');
    } finally {
      setRetakeLoading(false);
    }
  };


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
                <h2 className="text-lg font-bold mb-2">Questionnaire Not Yet Submitted</h2>
                <p className="text-sm">
                  Complete your questionnaire to proceed. Your responses help us understand your teaching style better.
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
              <h1 className="text-3xl font-bold text-primary">Questionnaire Submitted</h1>
              <p className="text-slate-600">
                Thank you for completing the questionnaire. We've received your responses and will use them to match you with ideal student cases.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full">
                  Status: Submitted
                </span>
                <span className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full">
                  ETA: 24-48 hours
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-900">
              Our team will review your responses carefully. Once approved, you'll have access to browse and bid on student cases that match your profile and teaching style.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/tutors')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default TutorInterviewResults;
