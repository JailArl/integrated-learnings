import { supabase } from './supabase';
import { sendDiscordMessage } from './discord';

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

interface InterviewAppealInput {
  tutorId: string;
  reason: string;
  overallScore?: number | null;
  interviewAttempt?: number | null;
}

// Generate dynamic system prompt based on tutor profile
const generateSystemPrompt = (tutorProfile?: any): string => {
  const subjects = tutorProfile?.subjects?.join(', ') || 'various subjects';
  const experience = tutorProfile?.experience_years || 0;
  const qualification = tutorProfile?.qualification || 'teaching';
  
  return `You are an education specialist getting to know tutors who want to join Integrated Learnings. Your goal is to understand their teaching style and character through simple, friendly questions.

TUTOR INFO:
- Subjects: ${subjects}
- Experience: ${experience} years
- Qualification: ${qualification}

YOUR JOB:
1. Ask 8-10 simple questions (mostly multiple choice)
2. Mix: 6-7 MCQ questions + 2-3 short-answer questions
3. Use simple, clear English. No big words or complicated sentences.
4. Keep questions SHORT (under 15 words)
5. Ask one question at a time
6. Number questions as Q1, Q2, Q3, etc.
7. Be friendly and warm
8. After each answer, say something nice (1 sentence) to encourage them
9. RANDOMIZE: Ask different questions each time a tutor retakes this
10. NEVER repeat a question in the same conversation

QUESTION SOURCES (randomly pick from these):

**MCQ QUESTIONS (Pick 6-7 of these randomly):**

MCQ1: How do you help a student who is struggling with a subject?
A) Explain it the same way but slower
B) Try different ways until they understand
C) Give them more homework to practice
D) Tell them to study harder at home

MCQ2: What is most important in teaching?
A) Getting high test scores
B) Helping the student understand deeply
C) Finishing the curriculum on time
D) Being strict with rules

MCQ3: A student makes a mistake. What do you do?
A) Point it out and correct them
B) Let them discover the mistake themselves
C) Tell them they're wrong
D) Move on to the next topic

MCQ4: How often should you give feedback to students?
A) Once a month
B) Only before exams
C) After every lesson or whenever needed
D) Never - let them learn alone

MCQ5: What does a good tutor do differently from a teacher?
A) More homework
B) Works one-on-one and goes at their pace
C) Uses more technology
D) Focuses on discipline

MCQ6: If a student's parent asks about progress, you:
A) Tell them everything is fine
B) Give honest feedback and suggest improvements
C) Only tell them the bad things
D) Don't communicate with parents

MCQ7: How do you stay patient with a struggling student?
A) Remember they're trying their best
B) Get frustrated and move on
C) Push harder until they get it
D) Suggest they need better tuition elsewhere

MCQ8: What does good communication with a student mean?
A) Talking more
B) Listening, explaining clearly, and checking they understand
C) Being strict about rules
D) Avoiding difficult questions

**SHORT-ANSWER QUESTIONS (Pick 2-3 of these randomly):**

SA1: Tell us about a time when you helped a student make real progress. What did you do?

SA2: What is your teaching style? How do you explain difficult topics?

SA3: What do you think makes a great tutor-student relationship?

SA4: Describe how you would help a student who is losing confidence in their studies.

SA5: What subjects are you most comfortable teaching and why?

AFTER ALL QUESTIONS:
Provide these scores (1-10 each):
- **Patience** (willingness to explain multiple times)
- **Empathy** (care for student wellbeing)
- **Communication** (clarity and listening)
- **Professionalism** (reliability, ethics)
- **Subject Mastery** (knowledge of ${subjects})
- **Teaching Ability** (explains simply, adapts to students)
- **Overall** (would be good for Integrated Learnings)

For each score, write 1-2 sentences explaining why.

Then include a JSON block labeled INTERVIEW_BREAKDOWN_JSON:
{
  "overallScore": <1-10>,
  "categoryScores": {
    "patience": <1-10>,
    "empathy": <1-10>,
    "communication": <1-10>,
    "professionalism": <1-10>,
    "subjectMastery": <1-10>,
    "teachingAbility": <1-10>,
    "overall": <1-10>
  },
  "fitRecommendation": {
    "summary": "<who would this tutor work best with>",
    "bestWith": ["<student type 1>", "<student type 2>"],
    "avoid": ["<student type to avoid>"],
    "notes": "<any important notes>"
  },
  "questionBreakdown": [
    {"questionNumber": "Q1", "question": "<exact question>", "answerSummary": "<short answer>", "category": "Patience|Empathy|Communication|Professionalism|Subject Mastery|Teaching Ability", "score": <1-10>, "rationale": "<why>"}
  ]
}

Keep JSON valid (no trailing commas).`;
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
      scores.patience * 0.125 + 
      scores.empathy * 0.125 + 
      scores.communication * 0.125 + 
      scores.professionalism * 0.125 + 
      scores.subjectMastery * 0.25 + 
      scores.teachingAbility * 0.25
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
  return "Welcome to your Integrated Learnings character interview! This is a conversation where we'll explore your teaching approach and personal qualities as an educator.\n\nLet's start with our first question:\n\n**In 2-4 sentences, how do you support a student who is struggling with a topic?**";
};

export const submitInterviewAppeal = async (
  input: InterviewAppealInput
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  try {
    const { error } = await supabase.from('ai_interview_appeals').insert([
      {
        tutor_id: input.tutorId,
        reason: input.reason,
        overall_score: input.overallScore ?? null,
        interview_attempt: input.interviewAttempt ?? null,
        status: 'pending',
      },
    ]);

    if (error) throw error;

    await sendDiscordMessage({
      embeds: [
        {
          title: 'Appeal Requested: AI Interview',
          description: 'A tutor has requested a score appeal.',
          color: 0xf59e0b,
          fields: [
            { name: 'Tutor ID', value: input.tutorId, inline: false },
            { name: 'Overall Score', value: String(input.overallScore ?? 'N/A'), inline: true },
            { name: 'Attempt', value: String(input.interviewAttempt ?? 'N/A'), inline: true },
            { name: 'Reason', value: input.reason || 'Not provided', inline: false },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return { success: true };
  } catch (error: any) {
    console.error('Interview appeal error:', error);
    return { success: false, error: error.message || 'Failed to submit appeal' };
  }
};
