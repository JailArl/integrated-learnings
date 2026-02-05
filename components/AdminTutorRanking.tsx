import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { 
  calculateTutorRanking, 
  getTutorForRanking, 
  calculateAllTutorRankings 
} from '../services/aiRanking';
import { 
  Trophy, 
  Medal, 
  Award, 
  TrendingUp, 
  RefreshCw, 
  Eye, 
  Loader,
  AlertCircle,
  CheckCircle,
  Star
} from 'lucide-react';

interface RankedTutor {
  id: string;
  name: string;
  subjects: string[];
  experienceYears: number;
  rankingScore: number;
  aiRankingAssessment: any;
  aiInterviewScore: number;
  approvedCertificates: number;
  responseTimeAvg: number;
  completionRate: number;
  rankingUpdatedAt: string;
}

export const AdminTutorRanking: React.FC = () => {
  const [rankedTutors, setRankedTutors] = useState<RankedTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recalculating, setRecalculating] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<RankedTutor | null>(null);
  const [sortBy, setSortBy] = useState<'ranking' | 'interview' | 'recent'>('ranking');

  useEffect(() => {
    loadRankedTutors();
  }, []);

  const loadRankedTutors = async () => {
    if (!supabase) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    try {
      const { data: tutors, error: fetchError } = await supabase
        .from('tutor_profiles')
        .select(`
          id,
          name,
          subjects,
          experience_years,
          ranking_score,
          ai_ranking_assessment,
          ai_interview_score,
          response_time_avg,
          completion_rate,
          ranking_updated_at
        `)
        .eq('ai_interview_status', 'completed')
        .not('ranking_score', 'is', null)
        .order('ranking_score', { ascending: false });

      if (fetchError) throw fetchError;

      // Get certificate counts for each tutor
      const tutorsWithCerts = await Promise.all(
        (tutors || []).map(async (tutor) => {
          const { data: certs } = await supabase
            .from('tutor_certificates')
            .select('id')
            .eq('tutor_id', tutor.id)
            .eq('verification_status', 'approved');

          return {
            id: tutor.id,
            name: tutor.name,
            subjects: tutor.subjects,
            experienceYears: tutor.experience_years || 0,
            rankingScore: tutor.ranking_score,
            aiRankingAssessment: tutor.ai_ranking_assessment,
            aiInterviewScore: tutor.ai_interview_score,
            responseTimeAvg: tutor.response_time_avg,
            completionRate: tutor.completion_rate,
            rankingUpdatedAt: tutor.ranking_updated_at,
            approvedCertificates: certs?.length || 0,
          };
        })
      );

      setRankedTutors(tutorsWithCerts);
    } catch (err: any) {
      console.error('Error loading ranked tutors:', err);
      setError(err.message || 'Failed to load rankings');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateAll = async () => {
    if (
      !confirm(
        'This will recalculate rankings for all tutors who have completed interviews. This may take a few minutes. Continue?'
      )
    ) {
      return;
    }

    setRecalculating(true);
    setError('');

    try {
      const result = await calculateAllTutorRankings();
      
      if (result.success) {
        alert(
          `Ranking calculation complete!\n\nProcessed: ${result.processed}\nFailed: ${result.failed}${
            result.errors.length > 0 ? '\n\nErrors:\n' + result.errors.join('\n') : ''
          }`
        );
        await loadRankedTutors();
      } else {
        setError('Failed to calculate rankings: ' + result.errors.join(', '));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to recalculate rankings');
    } finally {
      setRecalculating(false);
    }
  };

  const handleRecalculateSingle = async (tutorId: string) => {
    setRecalculating(true);
    setError('');

    try {
      const tutorData = await getTutorForRanking(tutorId);
      if (!tutorData) {
        throw new Error('Failed to fetch tutor data');
      }

      const result = await calculateTutorRanking(tutorData);
      
      if (result.success) {
        alert(`Ranking updated successfully!\n\nNew Score: ${result.data?.rankingScore}/100`);
        await loadRankedTutors();
      } else {
        setError(result.error || 'Failed to calculate ranking');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to recalculate ranking');
    } finally {
      setRecalculating(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="text-yellow-500" size={24} />;
    if (rank === 2) return <Medal className="text-gray-400" size={24} />;
    if (rank === 3) return <Medal className="text-amber-600" size={24} />;
    return <Award className="text-blue-500" size={20} />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const sortedTutors = [...rankedTutors].sort((a, b) => {
    if (sortBy === 'interview') {
      return (b.aiInterviewScore || 0) - (a.aiInterviewScore || 0);
    }
    if (sortBy === 'recent') {
      return new Date(b.rankingUpdatedAt).getTime() - new Date(a.rankingUpdatedAt).getTime();
    }
    return (b.rankingScore || 0) - (a.rankingScore || 0);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600" size={32} />
        <span className="ml-3 text-gray-600">Loading rankings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Rankings</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-blue-600" size={32} />
            Tutor Rankings
          </h2>
          <p className="text-gray-600 mt-1">
            AI-powered tutor quality assessment and leaderboard
          </p>
        </div>
        <button
          onClick={handleRecalculateAll}
          disabled={recalculating}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={recalculating ? 'animate-spin' : ''} size={18} />
          {recalculating ? 'Recalculating...' : 'Recalculate All'}
        </button>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2">
        <button
          onClick={() => setSortBy('ranking')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            sortBy === 'ranking'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          By Ranking Score
        </button>
        <button
          onClick={() => setSortBy('interview')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            sortBy === 'interview'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          By Interview Score
        </button>
        <button
          onClick={() => setSortBy('recent')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            sortBy === 'recent'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Recently Updated
        </button>
      </div>

      {/* Rankings Table */}
      {sortedTutors.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
          <AlertCircle className="text-yellow-600 mx-auto mb-3" size={32} />
          <p className="text-gray-700">
            No ranked tutors yet. Tutors must complete their AI interview to be ranked.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Tutor
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Ranking Score
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Interview
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Certificates
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Response Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Completion
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedTutors.map((tutor, index) => {
                  const rank = index + 1;
                  const assessment = tutor.aiRankingAssessment
                    ? JSON.parse(tutor.aiRankingAssessment)
                    : null;

                  return (
                    <tr key={tutor.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRankIcon(rank)}
                          <span className="font-bold text-gray-700">#{rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{tutor.name}</p>
                          <p className="text-sm text-gray-500">
                            {tutor.subjects?.slice(0, 2).join(', ')}
                            {tutor.subjects?.length > 2 && ` +${tutor.subjects.length - 2}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {tutor.experienceYears} years experience
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-3 py-1 rounded-full font-bold ${getScoreColor(
                              tutor.rankingScore
                            )}`}
                          >
                            {tutor.rankingScore}/100
                          </div>
                          <span className="text-sm text-gray-500">
                            {getScoreLabel(tutor.rankingScore)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-500" size={16} />
                          <span className="font-semibold">{tutor.aiInterviewScore}/10</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="text-green-500" size={16} />
                          <span className="font-semibold">{tutor.approvedCertificates}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {tutor.responseTimeAvg < 60
                            ? `${tutor.responseTimeAvg}m`
                            : `${Math.round(tutor.responseTimeAvg / 60)}h`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-700">
                          {tutor.completionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedTutor(tutor)}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleRecalculateSingle(tutor.id)}
                            disabled={recalculating}
                            className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition disabled:opacity-50"
                            title="Recalculate Ranking"
                          >
                            <RefreshCw size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedTutor && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTutor(null)}
        >
          <div
            className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Ranking Details</h3>
              <button
                onClick={() => setSelectedTutor(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Tutor Info */}
              <div>
                <h4 className="font-semibold text-lg text-gray-900 mb-2">
                  {selectedTutor.name}
                </h4>
                <p className="text-gray-600">
                  Subjects: {selectedTutor.subjects?.join(', ') || 'None'}
                </p>
                <p className="text-gray-600">
                  Experience: {selectedTutor.experienceYears} years
                </p>
              </div>

              {/* Overall Score */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Overall Ranking Score</p>
                <div className="flex items-center gap-4">
                  <div className="text-5xl font-bold text-blue-600">
                    {selectedTutor.rankingScore}
                  </div>
                  <div className="text-2xl text-gray-400">/100</div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {getScoreLabel(selectedTutor.rankingScore)}
                </p>
              </div>

              {/* Breakdown */}
              {selectedTutor.aiRankingAssessment && (() => {
                const assessment = JSON.parse(selectedTutor.aiRankingAssessment);
                return (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <ScoreBreakdown
                        label="Interview Performance"
                        score={assessment.breakdown?.interviewScore || 0}
                        maxScore={40}
                      />
                      <ScoreBreakdown
                        label="Certificate Quality"
                        score={assessment.breakdown?.certificateScore || 0}
                        maxScore={30}
                      />
                      <ScoreBreakdown
                        label="Response Time"
                        score={assessment.breakdown?.responseTimeScore || 0}
                        maxScore={15}
                      />
                      <ScoreBreakdown
                        label="Completion Rate"
                        score={assessment.breakdown?.completionRateScore || 0}
                        maxScore={15}
                      />
                    </div>

                    {/* AI Assessment */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h5 className="font-semibold text-gray-900 mb-2">AI Assessment</h5>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {assessment.assessment}
                      </p>
                    </div>
                  </>
                );
              })()}

              {/* Last Updated */}
              <p className="text-xs text-gray-500">
                Last updated:{' '}
                {new Date(selectedTutor.rankingUpdatedAt).toLocaleDateString()} at{' '}
                {new Date(selectedTutor.rankingUpdatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for score breakdown
const ScoreBreakdown: React.FC<{
  label: string;
  score: number;
  maxScore: number;
}> = ({ label, score, maxScore }) => {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-gray-500">/ {maxScore}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default AdminTutorRanking;
