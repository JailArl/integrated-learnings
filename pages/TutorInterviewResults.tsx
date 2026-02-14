import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Section } from '../components/Components';
import { supabase } from '../services/supabase';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface InterviewScores {
  patience: number;
  empathy: number;
  communication: number;
  professionalism: number;
  subjectMastery: number;
  teachingAbility: number;
  overall: number;
}

const parseScore = (text: string, category: string): number => {
  const regex = new RegExp(`${category}[:\\s]+(\\d+)`, 'i');
  const match = text.match(regex);
  return match ? parseInt(match[1], 10) : 0;
};

const parseScoresFromAssessment = (assessment: string | null): InterviewScores | null => {
  if (!assessment) return null;
  return {
    patience: parseScore(assessment, 'Patience'),
    empathy: parseScore(assessment, 'Empathy'),
    communication: parseScore(assessment, 'Communication'),
    professionalism: parseScore(assessment, 'Professionalism'),
    subjectMastery: parseScore(assessment, 'Subject Mastery'),
    teachingAbility: parseScore(assessment, 'Teaching Ability'),
    overall: parseScore(assessment, 'Overall'),
  };
};

const ScoreCard: React.FC<{ label: string; score: number; highlight?: boolean }> = ({
  label,
  score,
  highlight,
}) => {
  const scoreColor =
    score >= 8 ? 'text-green-700 bg-green-50 border-green-200' :
    score >= 6 ? 'text-blue-700 bg-blue-50 border-blue-200' :
    score >= 4 ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-red-700 bg-red-50 border-red-200';

  return (
    <div className={`rounded-xl border p-4 text-center ${scoreColor} ${highlight ? 'md:col-span-2' : ''}`}>
      <p className="text-xs uppercase tracking-wide font-semibold">{label}</p>
      <p className="text-2xl font-bold mt-2">{score || 'N/A'}</p>
      <p className="text-xs mt-1">out of 10</p>
    </div>
  );
};

export const TutorInterviewResults: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessment, setAssessment] = useState<string | null>(null);
  const [overallScore, setOverallScore] = useState<number | null>(null);
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
          .select('ai_interview_status, ai_interview_assessment, ai_interview_score')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        setStatus(profile?.ai_interview_status ?? null);
        setAssessment(profile?.ai_interview_assessment ?? null);
        setOverallScore(profile?.ai_interview_score ?? null);
      } catch (err: any) {
        console.error('Failed to load interview results:', err);
        setError(err.message || 'Failed to load interview results');
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [navigate]);

  const scores = useMemo(() => parseScoresFromAssessment(assessment), [assessment]);

  const strengths = useMemo(() => {
    if (!scores) return [];
    const entries = [
      { label: 'Patience', value: scores.patience },
      { label: 'Empathy', value: scores.empathy },
      { label: 'Communication', value: scores.communication },
      { label: 'Professionalism', value: scores.professionalism },
      { label: 'Subject Mastery', value: scores.subjectMastery },
      { label: 'Teaching Ability', value: scores.teachingAbility },
    ].filter((entry) => entry.value > 0);

    return entries.sort((a, b) => b.value - a.value).slice(0, 2);
  }, [scores]);

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
              <h1 className="text-3xl font-bold text-primary">Interview Score Breakdown</h1>
              <p className="text-slate-600">
                Review your strengths and areas to keep improving as a mentor.
              </p>
            </div>
          </div>

          {overallScore !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-900">
                <strong>Overall Interview Score:</strong> {overallScore}/100
              </p>
            </div>
          )}

          {scores ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <ScoreCard label="Patience" score={scores.patience} />
              <ScoreCard label="Empathy" score={scores.empathy} />
              <ScoreCard label="Communication" score={scores.communication} />
              <ScoreCard label="Professionalism" score={scores.professionalism} />
              <ScoreCard label="Subject Mastery" score={scores.subjectMastery} />
              <ScoreCard label="Teaching Ability" score={scores.teachingAbility} />
              <ScoreCard label="Overall" score={scores.overall} highlight />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm mb-6">
              We could not parse your score breakdown. Your interview is still saved for admin review.
            </div>
          )}

          {strengths.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-900 font-semibold">Top strengths</p>
              <p className="text-sm text-emerald-800 mt-1">
                {strengths.map((item) => `${item.label} (${item.value}/10)`).join(' • ')}
              </p>
            </div>
          )}

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
