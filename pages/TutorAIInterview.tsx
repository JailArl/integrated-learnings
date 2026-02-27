import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIInterview } from '../components/AIInterview';
import { Section } from '../components/Components';
import { supabase } from '../services/supabase';
import { Lock, AlertCircle } from 'lucide-react';

export const TutorAIInterview: React.FC = () => {
  const navigate = useNavigate();
  const [tutorId, setTutorId] = useState<string | null>(null);
  const [tutorProfile, setTutorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interviewStarted, setInterviewStarted] = useState(false);

  useEffect(() => {
    loadTutorData();
  }, []);

  const loadTutorData = async () => {
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

      setTutorId(authData.user.id);

      const { data: profile, error: profileError } = await supabase
        .from('tutor_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;
      setTutorProfile(profile);

    } catch (err: any) {
      console.error('Error loading tutor data:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex gap-4">
              <AlertCircle className="text-yellow-400" size={24} />
              <div>
                <h2 className="text-lg font-bold text-yellow-900 mb-2">Not Yet Eligible</h2>
                <p className="text-yellow-800">{error}</p>
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

  if (tutorProfile?.ai_interview_status === 'completed') {
    return (
      <Section className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-lg">
            <div className="flex gap-4">
              <div>
                <h2 className="text-lg font-bold text-green-900 mb-2">Questionnaire Already Submitted</h2>
                <p className="text-green-800">
                  You've already completed your tutor questionnaire. Your response is being reviewed by our admin team.
                </p>
                <button
                  onClick={() => navigate('/tutors')}
                  className="mt-4 inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
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
      <div className="max-w-4xl mx-auto">
        {/* Header Info */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">Tutor Questionnaire</h1>
          <p className="text-gray-600 text-lg mb-4">
            This is the final step of your onboarding. You'll answer guided questions about your teaching style, approach with students, and personal qualities as an educator.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm text-blue-800">
            <p className="font-semibold">What to expect:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>8-10 quick multiple-choice and short-answer questions</li>
              <li>Questions are randomized (different questions each time if you retake)</li>
              <li>We use this to understand your teaching style better</li>
              <li>Simple, straightforward language - no complicated questions</li>
              <li>Takes about 10-15 minutes</li>
              <li>Your responses help us match you with ideal student cases</li>
              <li>Results are used internally by our team for matching</li>
            </ul>
          </div>
        </div>

        {/* Start Button or Questionnaire */}
        {!interviewStarted ? (
          <div className="text-center">
            <button
              onClick={() => setInterviewStarted(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
            >
              Start Questionnaire
            </button>
          </div>
        ) : tutorId ? (
          <AIInterview 
            tutorId={tutorId}
            tutorProfile={tutorProfile}
            retakeCount={tutorProfile?.ai_interview_attempts || 0}
            onComplete={() => {
              setTimeout(() => navigate('/tutors/interview-results'), 5000);
            }}
          />
        ) : null}
      </div>
    </Section>
  );
};

export default TutorAIInterview;
