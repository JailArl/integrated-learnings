import { supabase } from './supabase';

// ---------------------------------------------------------------------------
// Auto-matching service
// Scores how well a tutor bid fits a parent request based on:
//   1. Subject overlap        (35%)
//   2. Level match            (20%)
//   3. AI Interview score     (25%)
//   4. Personality fit        (20%)
// Returns a 0-100 compatibility score per bid + an explanation.
// ---------------------------------------------------------------------------

export interface MatchScore {
  tutorId: string;
  tutorName: string;
  score: number;           // 0-100 composite
  subjectScore: number;    // 0-100
  levelScore: number;      // 0-100
  interviewScore: number;  // 0-100
  personalityScore: number;// 0-100
  explanation: string;
}

interface TutorData {
  id: string;
  full_name: string;
  subjects: string[] | null;
  levels: string[] | null;
  ai_interview_score: number | null;
  questionnaire_answers: any;
}

interface RequestData {
  subjects: string[] | null;
  student_level: string | null;
}

// ---------- Public API ----------

/**
 * Score all bids for a given request. Returns sorted list (best first).
 */
export const scoreAllBids = async (
  requestId: string
): Promise<{ success: boolean; data?: MatchScore[]; error?: string }> => {
  try {
    // Fetch the request
    const { data: request, error: reqErr } = await supabase
      .from('parent_requests')
      .select('subjects, student_level')
      .eq('id', requestId)
      .single();

    if (reqErr || !request) {
      return { success: false, error: reqErr?.message || 'Request not found' };
    }

    // Fetch bids with tutor data
    const { data: bids, error: bidErr } = await supabase
      .from('tutor_bids')
      .select('tutor_id, tutor:tutor_profiles(id, full_name, subjects, teaching_subjects, levels, ai_interview_score, questionnaire_answers)')
      .eq('request_id', requestId);

    if (bidErr) {
      return { success: false, error: bidErr.message };
    }

    const scores: MatchScore[] = (bids || []).map((bid: any) => {
      const tutor: TutorData = {
        ...bid.tutor,
        subjects: bid.tutor.teaching_subjects?.length ? bid.tutor.teaching_subjects : bid.tutor.subjects,
      };
      return computeScore(tutor, request as RequestData);
    });

    scores.sort((a, b) => b.score - a.score);
    return { success: true, data: scores };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
};

// ---------- Scoring engine ----------

const WEIGHTS = {
  subject: 0.35,
  level: 0.20,
  interview: 0.25,
  personality: 0.20,
};

function computeScore(tutor: TutorData, request: RequestData): MatchScore {
  const subjectScore = calcSubjectOverlap(tutor.subjects, request.subjects);
  const levelScore = calcLevelMatch(tutor.levels, request.student_level);
  const interviewScore = calcInterviewScore(tutor.ai_interview_score);
  const personalityScore = calcPersonalityScore(tutor.questionnaire_answers);

  const composite = Math.round(
    subjectScore * WEIGHTS.subject +
    levelScore * WEIGHTS.level +
    interviewScore * WEIGHTS.interview +
    personalityScore * WEIGHTS.personality
  );

  const explanation = buildExplanation(
    tutor.full_name,
    { subjectScore, levelScore, interviewScore, personalityScore },
    tutor,
    request
  );

  return {
    tutorId: tutor.id,
    tutorName: tutor.full_name,
    score: composite,
    subjectScore,
    levelScore,
    interviewScore,
    personalityScore,
    explanation,
  };
}

// ---- Subject overlap (Jaccard-ish) ----
function calcSubjectOverlap(
  tutorSubjects: string[] | null,
  requestSubjects: string[] | null
): number {
  if (!tutorSubjects?.length || !requestSubjects?.length) return 0;
  const tSet = new Set(tutorSubjects.map((s) => s.toLowerCase()));
  const matched = requestSubjects.filter((s) => tSet.has(s.toLowerCase()));
  // Score = matched / requested
  return Math.round((matched.length / requestSubjects.length) * 100);
}

// ---- Level match ----
function calcLevelMatch(
  tutorLevels: string[] | null,
  studentLevel: string | null
): number {
  if (!tutorLevels?.length || !studentLevel) return 50; // neutral if unknown
  const normLevel = studentLevel.toLowerCase();
  // Full match
  if (tutorLevels.some((l) => l.toLowerCase() === normLevel)) return 100;
  // Partial: check if level keyword appears
  if (tutorLevels.some((l) => normLevel.includes(l.toLowerCase().split(' ')[0]))) return 70;
  return 20;
}

// ---- AI Interview ----
function calcInterviewScore(score: number | null): number {
  if (score == null) return 40; // no interview yet — neutral
  return Math.min(100, Math.round(score * 10)); // score is 1-10 → 10-100
}

// ---- Personality ----
function calcPersonalityScore(qa: any): number {
  if (!qa) return 40;
  const parsed = typeof qa === 'string' ? safeJsonParse(qa) : qa;
  if (!parsed) return 40;

  const traits = parsed.personality?.traitScores;
  if (!traits) return 40;

  // Average all trait scores (0-100 each)
  const values = Object.values(traits).filter((v): v is number => typeof v === 'number');
  if (values.length === 0) return 40;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

// ---- Explanation builder ----
function buildExplanation(
  name: string,
  scores: { subjectScore: number; levelScore: number; interviewScore: number; personalityScore: number },
  tutor: TutorData,
  request: RequestData
): string {
  const parts: string[] = [];
  if (scores.subjectScore >= 80) {
    parts.push(`Strong subject match (${request.subjects?.join(', ')})`);
  } else if (scores.subjectScore >= 50) {
    parts.push('Partial subject overlap');
  } else if (scores.subjectScore < 30) {
    parts.push('Low subject overlap');
  }

  if (scores.levelScore >= 80) {
    parts.push(`teaches ${request.student_level}`);
  }

  if (scores.interviewScore >= 70) {
    parts.push('strong interview performance');
  }

  if (scores.personalityScore >= 70) {
    parts.push('well-rounded personality profile');
  }

  if (parts.length === 0) return `${name} — limited match data available.`;
  return `${name} — ${parts.join('; ')}.`;
}

// ---- Helpers ----
function safeJsonParse(str: string): any {
  try { return JSON.parse(str); } catch { return null; }
}
