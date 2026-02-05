import { supabase } from './supabase';

const OPENAI_API_KEY = (import.meta as any).env?.VITE_OPENAI_API_KEY as string | undefined;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InterviewScore {
  patience: number;
  empathy: number;
  communication: number;
  professionalism: number;
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

// System prompt for the AI interviewer
const SYSTEM_PROMPT = `You are an experienced education interviewer conducting a character and teaching style assessment for tutors.

Your role is to:
1. Ask 5-7 thoughtful questions to assess teaching philosophy, character, patience, and interpersonal skills
2. Be conversational and encouraging
3. After the tutor answers each question, provide very brief affirmations to keep the conversation flowing
4. After question 5, summarize what you've learned and ask one final follow-up if needed
5. After all questions are answered, provide a comprehensive character assessment

Questions to explore (in conversational order):
1. "Tell me about your teaching philosophy. What does effective tutoring look like to you?"
2. "Describe a time when you had a difficult student. How did you handle it?"
3. "What do you believe is the most important quality a tutor should have, and why?"
4. "How do you handle students who are struggling or losing confidence?"
5. "What brought you to tutoring? What motivates you in this field?"
6. "If a student didn't agree with your teaching method, how would you respond?"
7. "Tell me about a success story - a student who made significant progress with you."

After all questions, evaluate the tutor on:
- **Patience** (1-10): Shows understanding, tolerance for different learning paces
- **Empathy** (1-10): Demonstrates care for student wellbeing and struggles
- **Communication** (1-10): Clear, encouraging, listens well
- **Professionalism** (1-10): Ethics, reliability, dedication to role
- **Overall** (1-10): Overall suitability as a tutor

Keep your responses concise (2-3 sentences max) to maintain conversation flow. Be warm and encouraging.`;

export const sendInterviewMessage = async (
  tutorId: string,
  userMessage: string,
  conversationHistory: Message[]
): Promise<InterviewResponse> => {
  if (!OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OpenAI API key not configured',
    };
  }

  try {
    // Build conversation messages
    const messages: Message[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    // Call OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

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
  // The AI should include scoring in format like "Patience: 8/10"
  const scores: InterviewScore = {
    patience: parseScore(response, 'Patience'),
    empathy: parseScore(response, 'Empathy'),
    communication: parseScore(response, 'Communication'),
    professionalism: parseScore(response, 'Professionalism'),
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

    await supabase.from('tutor_profiles').update({
      ai_interview_status: 'completed',
      ai_interview_transcript: transcript,
      ai_interview_score: overallScore,
      ai_interview_assessment: finalAssessment,
    }).eq('id', tutorId);

    console.log('✅ Interview saved to database');
  } catch (error: any) {
    console.error('Error saving interview:', error);
  }
};

export const getInitialQuestion = (): string => {
  return "Welcome to your Integrated Learnings character interview! This is a conversation where we'll explore your teaching philosophy, approach with students, and personal qualities as an educator.\n\nLet's start with our first question:\n\n**Tell me about your teaching philosophy. What does effective tutoring look like to you?**";
};
