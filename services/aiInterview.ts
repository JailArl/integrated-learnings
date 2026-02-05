import { supabase } from './supabase';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewScore {
  patience: number;
  empathy: number;
  communication: number;
  professionalism: number;
  subjectMastery: number;
  teachingAbility: number;
  overall: number;
}

interface InterviewResponse {
  success: boolean;
  data?: {
    message: string;
    conversationOver: boolean;
    scores?: InterviewScore;
  };
  error?: string;
}

// Generate dynamic system prompt based on tutor profile
const generateSystemPrompt = (tutorProfile?: any): string => {
  const subjects = tutorProfile?.subjects?.join(', ') || 'various subjects';
  const experience = tutorProfile?.experience_years || 0;
  const qualification = tutorProfile?.qualification || 'teaching';
  
  return `You are an expert education interviewer conducting a comprehensive assessment for tutors joining Integrated Learnings platform.

TUTOR CONTEXT:
- Subjects: ${subjects}
- Experience: ${experience} years
- Qualification: ${qualification}

YOUR ROLE:
1. Ask 7-10 personalized questions assessing BOTH teaching strengths AND personality traits
2. Generate questions dynamically based on their subject expertise and experience level
3. Be conversational, warm, and encouraging
4. Provide brief affirmations (1-2 sentences) after each answer to maintain flow
5. After sufficient questions, provide comprehensive evaluation

ASSESSMENT AREAS:

**Teaching Strengths (50%):**
- Subject knowledge depth in ${subjects}
- Lesson planning & curriculum understanding
- Ability to explain complex concepts simply
- Adaptability to different learning styles
- Problem-solving approach for academic challenges

**Personality Traits (50%):**
- Patience with struggling students
- Empathy & emotional intelligence
- Communication clarity & listening skills
- Professionalism & reliability
- Passion for teaching & student success

QUESTION GENERATION STRATEGY:
- Q1-2: Teaching philosophy & subject-specific approach
- Q3-4: Practical scenarios (difficult students, learning struggles)
- Q5-6: Personal qualities & motivation
- Q7-8: Strengths demonstration & success stories
- Q9-10: Follow-ups based on responses (adaptive questioning)

FINAL EVALUATION FORMAT:
After all questions, provide detailed scores:
- **Patience** (1-10): Tolerance, understanding of different learning paces
- **Empathy** (1-10): Care for student wellbeing, emotional awareness
- **Communication** (1-10): Clarity, encouragement, active listening
- **Professionalism** (1-10): Ethics, dedication, reliability
- **Subject Mastery** (1-10): Depth of knowledge in ${subjects}
- **Teaching Ability** (1-10): Explanation skills, lesson planning, adaptability
- **Overall** (1-10): Holistic assessment of tutor suitability

Include 2-3 sentence reasoning for each score. Be warm but honest in evaluation.`;
};

const SYSTEM_PROMPT = generateSystemPrompt();

export const sendInterviewMessage = async (
  tutorId: string,
  userMessage: string,
  conversationHistory: Message[],
  tutorProfile?: any
): Promise<InterviewResponse> => {
  try {
    // Build conversation messages
    const messages: Message[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // Generate dynamic system prompt based on tutor profile
    const systemPrompt = generateSystemPrompt(tutorProfile);

    // Call Supabase Edge Function
    const response = await supabase.functions.invoke('interview-message', {
      body: { systemPrompt, messages },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to get AI response');
    }

    const data = response.data;

    if (!data.success) {
      throw new Error(data.error || 'Failed to process interview response');
    }

    const assistantMessage = data.message;

    // Check if interview is complete (look for final assessment)
    const conversationOver =
      assistantMessage.includes('Overall score') ||
      assistantMessage.includes('Final assessment') ||
      assistantMessage.includes('assessment complete') ||
      messages.length > 14; // ~7 questions + responses

    // Extract scores if interview is over
    let scores: InterviewScore | undefined;
    if (conversationOver) {
      scores = extractScoresFromResponse(assistantMessage);
      // Save interview to database
      await saveInterviewToDatabase(tutorId, messages, assistantMessage, scores);
    }

    return {
      success: true,
      data: {
        message: assistantMessage,
        conversationOver,
        scores,
      },
    };
  } catch (error: any) {
    console.error('AI Interview error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process interview response',
    };
  }
};

const extractScoresFromResponse = (response: string): InterviewScore => {
  // Parse scores from the AI response
  const scores: InterviewScore = {
    patience: parseScore(response, 'Patience'),
    empathy: parseScore(response, 'Empathy'),
    communication: parseScore(response, 'Communication'),
    professionalism: parseScore(response, 'Professionalism'),
    subjectMastery: parseScore(response, 'Subject Mastery'),
    teachingAbility: parseScore(response, 'Teaching Ability'),
    overall: parseScore(response, 'Overall'),
  };

  return scores;
};

const parseScore = (text: string, category: string): number => {
  const regex = new RegExp(`${category}[:\\s]+(\\d+)`, 'i');
  const match = text.match(regex);
  return match ? parseInt(match[1]) : 5; // Default to 5 if not found
};

const saveInterviewToDatabase = async (
  tutorId: string,
  messages: Message[],
  finalAssessment: string,
  scores: InterviewScore
): Promise<void> => {
  if (!supabase) return;

  try {
    const transcript = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');
    const overallScore = Math.round(
      (scores.patience + scores.empathy + scores.communication + scores.professionalism) / 4
    );

    // Get current attempt count
    const { data: tutorData } = await supabase
      .from('tutor_profiles')
      .select('ai_interview_attempts')
      .eq('id', tutorId)
      .single();

    const currentAttempts = tutorData?.ai_interview_attempts || 0;

    await supabase.from('tutor_profiles').update({
      ai_interview_status: 'completed',
      ai_interview_transcript: transcript,
      ai_interview_score: overallScore,
      ai_interview_assessment: finalAssessment,
      ai_interview_attempts: currentAttempts + 1,
    }).eq('id', tutorId);

    console.log('✅ Interview saved to database');
  } catch (error: any) {
    console.error('Error saving interview:', error);
  }
};

export const getInitialQuestion = (): string => {
  return "Welcome to your Integrated Learnings character interview! This is a conversation where we'll explore your teaching philosophy, approach with students, and personal qualities as an educator.\n\nLet's start with our first question:\n\n**Tell me about your teaching philosophy. What does effective tutoring look like to you?**";
};
