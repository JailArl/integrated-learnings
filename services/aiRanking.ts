import { supabase } from './supabase';

interface TutorRankingData {
  tutorId: string;
  tutorName: string;
  subjects: string[];
  experienceYears: number;
  qualification: string;
  
  // Interview data (40% weight)
  interviewScore: number; // Overall score from AI interview (1-10)
  interviewScores?: {
    patience: number;
    empathy: number;
    communication: number;
    professionalism: number;
    subjectMastery: number;
    teachingAbility: number;
  };
  
  // Certificate quality (30% weight)
  certificateCount: number;
  approvedCertificates: number;
  certificateTypes: string[]; // e.g., ["Teaching Degree", "TEFL Certificate"]
  
  // Response time (15% weight)
  responseTimeAvg: number; // Average time to respond in minutes
  
  // Completion rate (15% weight)
  completionRate: number; // Percentage (0-100)
}

interface RankingResult {
  success: boolean;
  data?: {
    rankingScore: number; // Final score (1-100)
    assessment: string; // AI reasoning
    breakdown: {
      interviewScore: number;
      certificateScore: number;
      responseTimeScore: number;
      completionRateScore: number;
    };
  };
  error?: string;
}

const SYSTEM_PROMPT = `You are an expert education recruiter evaluating tutors for a tutoring platform. Your task is to calculate a comprehensive ranking score based on the following criteria:

SCORING BREAKDOWN (Total: 100 points):
1. AI Interview Performance (40 points)
   - Overall interview score and individual metrics
   - Subject mastery and teaching ability
   - Personality traits (patience, empathy, communication, professionalism)

2. Certificate Quality (30 points)
   - Number and types of certifications
   - Relevance to teaching
   - Professional qualifications

3. Response Time (15 points)
   - How quickly tutor responds to new case opportunities
   - Faster response = higher score

4. Completion Rate (15 points)
   - Percentage of accepted cases completed successfully
   - Higher completion rate = better reliability

RESPONSE FORMAT:
You must respond with a JSON object in this exact format:
{
  "rankingScore": <number between 1-100>,
  "assessment": "<brief explanation of the ranking>",
  "breakdown": {
    "interviewScore": <points out of 40>,
    "certificateScore": <points out of 30>,
    "responseTimeScore": <points out of 15>,
    "completionRateScore": <points out of 15>
  }
}

Be fair but rigorous. A score of 80+ should be reserved for exceptional tutors.`;

export const calculateTutorRanking = async (
  tutorData: TutorRankingData
): Promise<RankingResult> => {
  const apiKey = (import.meta as any).env?.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      error: 'OpenAI API key not configured',
    };
  }

  try {
    // Prepare the tutor data for AI evaluation
    const promptContent = `
TUTOR PROFILE:
Name: ${tutorData.tutorName}
Subjects: ${tutorData.subjects.join(', ')}
Experience: ${tutorData.experienceYears} years
Qualification: ${tutorData.qualification}

AI INTERVIEW RESULTS (40 points max):
- Overall Score: ${tutorData.interviewScore}/10
${tutorData.interviewScores ? `
- Subject Mastery: ${tutorData.interviewScores.subjectMastery}/10
- Teaching Ability: ${tutorData.interviewScores.teachingAbility}/10
- Communication: ${tutorData.interviewScores.communication}/10
- Patience: ${tutorData.interviewScores.patience}/10
- Empathy: ${tutorData.interviewScores.empathy}/10
- Professionalism: ${tutorData.interviewScores.professionalism}/10
` : ''}

CERTIFICATES (30 points max):
- Total Certificates: ${tutorData.certificateCount}
- Approved Certificates: ${tutorData.approvedCertificates}
- Types: ${tutorData.certificateTypes.join(', ') || 'None'}

RESPONSE TIME (15 points max):
- Average Response Time: ${tutorData.responseTimeAvg} minutes
(Excellent: <30 mins, Good: 30-120 mins, Average: 2-24 hours, Poor: >24 hours)

COMPLETION RATE (15 points max):
- Completion Rate: ${tutorData.completionRate}%
(Excellent: 90%+, Good: 70-89%, Average: 50-69%, Poor: <50%)

Calculate the ranking score and provide your assessment.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: promptContent },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse the JSON response
    const ranking = JSON.parse(aiResponse);

    // Validate the response structure
    if (
      typeof ranking.rankingScore !== 'number' ||
      typeof ranking.assessment !== 'string' ||
      !ranking.breakdown
    ) {
      throw new Error('Invalid ranking response format');
    }

    // Save ranking to database
    await saveTutorRanking(
      tutorData.tutorId,
      ranking.rankingScore,
      ranking.assessment,
      ranking.breakdown
    );

    return {
      success: true,
      data: ranking,
    };
  } catch (error: any) {
    console.error('Error calculating ranking:', error);
    return {
      success: false,
      error: error.message || 'Failed to calculate ranking',
    };
  }
};

const saveTutorRanking = async (
  tutorId: string,
  rankingScore: number,
  assessment: string,
  breakdown: any
): Promise<void> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { error } = await supabase
    .from('tutor_profiles')
    .update({
      ranking_score: rankingScore,
      ai_ranking_assessment: JSON.stringify({ assessment, breakdown }),
      ranking_updated_at: new Date().toISOString(),
    })
    .eq('id', tutorId);

  if (error) {
    throw new Error(`Failed to save ranking: ${error.message}`);
  }
};

// Get tutor data for ranking calculation
export const getTutorForRanking = async (tutorId: string): Promise<TutorRankingData | null> => {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Get tutor profile
    const { data: profile, error: profileError } = await supabase
      .from('tutor_profiles')
      .select('*')
      .eq('id', tutorId)
      .single();

    if (profileError) throw profileError;

    // Get certificates
    const { data: certificates, error: certError } = await supabase
      .from('tutor_certificates')
      .select('*')
      .eq('tutor_id', tutorId);

    if (certError) throw certError;

    // Parse interview scores if available
    let interviewScores;
    if (profile.ai_interview_transcript) {
      try {
        const transcript = JSON.parse(profile.ai_interview_transcript);
        interviewScores = transcript.scores;
      } catch (e) {
        console.error('Error parsing interview scores:', e);
      }
    }

    const approvedCerts = certificates?.filter(
      (cert) => cert.verification_status === 'approved'
    ) || [];

    const tutorData: TutorRankingData = {
      tutorId: profile.id,
      tutorName: profile.name || 'Unknown',
      subjects: profile.subjects || [],
      experienceYears: profile.experience_years || 0,
      qualification: profile.qualification || 'None',
      interviewScore: profile.ai_interview_score || 0,
      interviewScores,
      certificateCount: certificates?.length || 0,
      approvedCertificates: approvedCerts.length,
      certificateTypes: approvedCerts.map((cert) => cert.file_name || 'Certificate'),
      responseTimeAvg: profile.response_time_avg || 0,
      completionRate: profile.completion_rate || 0,
    };

    return tutorData;
  } catch (error: any) {
    console.error('Error fetching tutor for ranking:', error);
    return null;
  }
};

// Calculate rankings for all tutors
export const calculateAllTutorRankings = async (): Promise<{
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}> => {
  if (!supabase) {
    return { success: false, processed: 0, failed: 0, errors: ['Supabase not configured'] };
  }

  try {
    // Get all tutors who have completed interviews
    const { data: tutors, error } = await supabase
      .from('tutor_profiles')
      .select('id')
      .eq('ai_interview_status', 'completed');

    if (error) throw error;

    let processed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const tutor of tutors || []) {
      const tutorData = await getTutorForRanking(tutor.id);
      if (!tutorData) {
        failed++;
        errors.push(`Failed to fetch data for tutor ${tutor.id}`);
        continue;
      }

      const result = await calculateTutorRanking(tutorData);
      if (result.success) {
        processed++;
      } else {
        failed++;
        errors.push(`Failed to rank tutor ${tutor.id}: ${result.error}`);
      }

      // Add a small delay to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return {
      success: true,
      processed,
      failed,
      errors,
    };
  } catch (error: any) {
    console.error('Error calculating all rankings:', error);
    return {
      success: false,
      processed: 0,
      failed: 0,
      errors: [error.message || 'Unknown error'],
    };
  }
};
