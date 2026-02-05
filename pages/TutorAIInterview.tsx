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

      // Check if tutor is eligible for interview
      if (!profile.photo_url || profile.photo_verification_status !== 'approved') {
        setError('You must upload and get your photo approved before taking the interview.');
      }
    } catch (err: any) {
      console.error('Error loading tutor data:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const canTakeInterview =
    tutorProfile?.photo_verification_status === 'approved' &&
    tutorProfile?.has_approved_certificate !== false;

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

  if (error && !isFullyEligible) {
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
                <h2 className="text-lg font-bold text-green-900 mb-2">Interview Already Completed</h2>
                <p className="text-green-800">
                  You've already completed your character interview. Your response is being reviewed by our admin team.
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
          <h1 className="text-4xl font-bold text-primary mb-4">Character Interview</h1>
          <p className="text-gray-600 text-lg mb-4">
            This is the final step of your onboarding. We'll have a conversation about your teaching style, approach with students, and personal qualities as an educator.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-sm text-blue-800">
            <p className="font-semibold">What to expect:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>7-10 conversational questions about your teaching philosophy</li>
              <li>Questions explore your character, patience, and approach with students</li>
              <li>Takes about 10-15 minutes</li>
              <li>Your responses are reviewed by our admin team for final approval</li>
              <li>Once approved, you'll unlock access to browse and bid on cases</li>
            </ul>
          </div>
        </div>

        {/* Start Button or Interview */}
        {!interviewStarted ? (
          <div className="text-center">
            <button
              onClick={() => setInterviewStarted(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-bold text-lg transition shadow-lg hover:shadow-xl"
            >
              Start Interview
            </button>
          </div>
        ) : tutorId ? (
          <AIInterview 
            tutorId={tutorId}
            tutorProfile={tutorProfile}
            retakeCount={tutorProfile?.ai_interview_attempts || 0}
            onComplete={() => {
              setTimeout(() => navigate('/tutors'), 3000);
            }}
          />
        ) : null}
      </div>
    </Section>
  );
};

// Helper function to check eligibility
function isFullyEligible(): boolean {
  // This would come from tutorProfile in real implementation
  return true;
}

export default TutorAIInterview;
