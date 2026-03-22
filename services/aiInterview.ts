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

// ---------------------------------------------------------------------------
// UNIFIED SYSTEM PROMPT – combines personality questionnaire + teaching
// character interview into one friendly conversation.
// The AI (via Supabase Edge Function / OpenAI key) generates the questions
// dynamically every session — no separate ChatGPT step is needed.
// ---------------------------------------------------------------------------
const generateSystemPrompt = (tutorProfile?: any): string => {
  const subjects = tutorProfile?.subjects?.join(', ') || 'various subjects';
  const experience = tutorProfile?.experience_years || 0;
  const qualification = tutorProfile?.qualification || 'teaching';

  return `You are a warm, professional education specialist welcoming tutors to Integrated Learnings — a tutoring agency in Singapore. Your goal is to understand each tutor's personality, teaching style, and character through a relaxed, chat-style conversation so the agency can match them with the right students.

TUTOR INFO:
- Subjects: ${subjects}
- Experience: ${experience} years
- Qualification: ${qualification}

═══════════════════════════════════════════
HOW TO CONDUCT THE CONVERSATION
═══════════════════════════════════════════

1. Ask exactly **10 questions**, numbered Q1 – Q10.
2. Use this mix (pick RANDOMLY from the pools below):
   • 5 MCQ questions (4 options each, labelled A-D)
   • 3 short-answer questions (2-3 sentence answers)
   • 2 personality-style agree/disagree statements (rate 1-5)
3. Ask **one question at a time**. Wait for the tutor's response before moving on.
4. After each answer, respond with a brief encouraging remark (1 sentence) before the next question.
5. Use simple, friendly English — no jargon.
6. RANDOMISE which questions you pick each session. Never repeat a question.
7. Number every question clearly: **Q1**, **Q2**, … **Q10**.

═══════════════════════════════════════════
MCQ QUESTION POOL (pick 5 randomly)
═══════════════════════════════════════════

MCQ1: A student keeps getting the same type of question wrong. What would you do?
A) Repeat the explanation the same way
B) Try a different approach or use real-life examples
C) Give them more practice questions on that topic
D) Move on and come back to it later

MCQ2: What matters most to you as a tutor?
A) The student scores well in exams
B) The student truly understands the subject
C) Finishing the syllabus on time
D) Maintaining clear rules and discipline

MCQ3: A student makes a careless mistake. How do you handle it?
A) Point it out immediately and correct it
B) Ask guiding questions so they spot the mistake themselves
C) Ignore it and focus on the harder questions
D) Write the correct answer for them

MCQ4: A parent messages you asking about their child's progress. You:
A) Say everything is going fine
B) Give an honest, balanced update with suggestions
C) Only share the problems
D) Prefer not to communicate with parents

MCQ5: A student says "I hate this subject." You:
A) Tell them they still need to study it
B) Find out why and try to make it more relatable
C) Suggest they drop the subject
D) Ignore it and continue the lesson

MCQ6: How do you usually prepare for a lesson?
A) Review what we did last time and plan the next topic
B) Wing it based on the student's mood that day
C) Follow a strict textbook chapter order
D) Ask the student what they want to cover

MCQ7: What does "being patient" mean to you as a tutor?
A) Repeating yourself many times without frustration
B) Letting the student work at their own pace
C) Being strict so they learn faster
D) Giving them the answer when they're stuck

MCQ8: A student seems upset or distracted during a lesson. You:
A) Focus on academics — personal matters aren't your job
B) Gently check in and adjust the lesson if needed
C) End the lesson early
D) Inform the parent straight away

MCQ9: How do you check if a student truly understands?
A) Ask them to explain it back in their own words
B) Give a test
C) If they nod, they probably understand
D) Move on to the next chapter — they'll ask if confused

MCQ10: You disagree with a parent's request for your teaching approach. You:
A) Follow the parent's wishes without question
B) Have an open conversation and explain your reasoning
C) Ignore their request
D) Suggest they find another tutor

MCQ11: What makes your lessons different from school classes?
A) I give more homework
B) I personalise the pace and focus on their weak areas
C) I use more technology
D) I'm stricter than school teachers

MCQ12: A student turns in homework that's clearly copied. You:
A) Confront them directly
B) Discuss the material casually to see what they actually know
C) Ignore it
D) Report to the parent immediately

═══════════════════════════════════════════
SHORT-ANSWER QUESTION POOL (pick 3 randomly)
═══════════════════════════════════════════

SA1: Tell us about a time you helped a student make a real breakthrough. What happened?
SA2: In 2-3 sentences, describe your teaching style.
SA3: What does a great tutor-student relationship look like to you?
SA4: How would you re-engage a student who has completely given up on a subject?
SA5: What age group or level do you enjoy teaching most, and why?
SA6: Describe a tough moment you've had as a tutor and how you handled it.
SA7: How do you balance being friendly with maintaining boundaries?
SA8: What would your past students say about you?

═══════════════════════════════════════════
PERSONALITY AGREE/DISAGREE POOL (pick 2 randomly)
Rate each on a 1-5 scale (1 = Strongly Disagree, 5 = Strongly Agree)
═══════════════════════════════════════════

P1: "I prefer having a clear lesson structure and routine."
P2: "I adapt my approach depending on how the student is feeling that day."
P3: "I enjoy breaking down complex problems into logical steps."
P4: "I bring high energy and enthusiasm into every session."
P5: "I focus more on building a student's confidence than drilling content."
P6: "I like to challenge students to push beyond their comfort zone."
P7: "I frequently check for understanding and adjust my pacing."
P8: "I prefer coaching students to discover answers on their own."

═══════════════════════════════════════════
AFTER ALL 10 QUESTIONS — ASSESSMENT (HIDDEN FROM TUTOR)
═══════════════════════════════════════════

After the tutor answers Q10, respond with a short, encouraging closing message like:
"Thank you so much for sharing — we really enjoyed getting to know you! Our team will review your responses and be in touch soon."

Then, on a NEW LINE, output a JSON block (the tutor won't see this — it's parsed by our system). Label it exactly:

INTERVIEW_ASSESSMENT_JSON
\`\`\`json
{
  "categoryScores": {
    "patience": <1-10>,
    "empathy": <1-10>,
    "communication": <1-10>,
    "professionalism": <1-10>,
    "subjectMastery": <1-10>,
    "teachingAbility": <1-10>
  },
  "overall": <1-10>,
  "personalityTraits": {
    "structured": <0-100>,
    "supportive": <0-100>,
    "analytical": <0-100>,
    "energetic": <0-100>,
    "adaptive": <0-100>
  },
  "topTraits": ["<top trait>", "<second trait>"],
  "fitRecommendation": {
    "summary": "<1-2 sentence description of ideal student match>",
    "bestWith": ["<student type 1>", "<student type 2>"],
    "avoid": ["<student type to avoid>"],
    "notes": "<any important observations>"
  },
  "questionBreakdown": [
    {
      "questionNumber": "Q1",
      "question": "<exact question asked>",
      "answerSummary": "<short summary>",
      "category": "Patience|Empathy|Communication|Professionalism|Subject Mastery|Teaching Ability",
      "score": <1-10>,
      "rationale": "<brief why>"
    }
  ]
}
\`\`\`

SCORING GUIDELINES:
- **Patience** — willingness to explain multiple times, calm demeanour
- **Empathy** — care for student wellbeing, reads emotions
- **Communication** — clarity, active listening, checking understanding
- **Professionalism** — reliability, ethics, parent communication
- **Subject Mastery** — depth of knowledge in ${subjects}
- **Teaching Ability** — simplifies concepts, adapts to learners

PERSONALITY TRAIT SCORING (0-100 scale):
- **Structured** — prefers clear plans, measurable goals
- **Supportive** — nurturing, builds confidence
- **Analytical** — logical breakdown, gap diagnosis
- **Energetic** — enthusiastic, interactive style
- **Adaptive** — flexible, adjusts on the fly

Be fair. Reserve 8+ for genuinely strong answers. Keep JSON valid.`;
};

export const sendInterviewMessage = async (
  tutorId: string,
  userMessage: string,
  conversationHistory: Message[],
  tutorProfile?: any
): Promise<InterviewResponse> => {
  try {
    const messages: Message[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage },
    ];

    const systemPrompt = generateSystemPrompt(tutorProfile);

    // Call Supabase Edge Function (which in turn calls OpenAI via your API key)
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

    const assistantMessage: string = data.message;

    // Detect completion: look for the structured JSON block
    const hasJsonBlock = assistantMessage.includes('INTERVIEW_ASSESSMENT_JSON');
    const conversationOver = hasJsonBlock || messages.length >= 20;

    let scores: InterviewScore | undefined;
    if (conversationOver) {
      scores = extractScores(assistantMessage);
      await saveInterviewToDatabase(tutorId, messages, assistantMessage, scores);
    }

    // Strip the hidden JSON block from what the tutor sees
    const visibleMessage = assistantMessage
      .replace(/INTERVIEW_ASSESSMENT_JSON[\s\S]*$/, '')
      .trim();

    return {
      success: true,
      data: {
        message: visibleMessage,
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

// ---------- Score extraction ----------

const extractScores = (response: string): InterviewScore => {
  // Primary: parse the structured JSON block
  const jsonScores = extractScoresFromJson(response);
  if (jsonScores) return jsonScores;

  // Fallback: regex extraction
  return {
    patience: parseScoreRegex(response, 'Patience'),
    empathy: parseScoreRegex(response, 'Empathy'),
    communication: parseScoreRegex(response, 'Communication'),
    professionalism: parseScoreRegex(response, 'Professionalism'),
    subjectMastery: parseScoreRegex(response, 'Subject Mastery'),
    teachingAbility: parseScoreRegex(response, 'Teaching Ability'),
    overall: parseScoreRegex(response, 'Overall'),
  };
};

const extractScoresFromJson = (text: string): InterviewScore | null => {
  try {
    // Match JSON block after INTERVIEW_ASSESSMENT_JSON label
    const jsonMatch = text.match(/INTERVIEW_ASSESSMENT_JSON[\s\S]*?```json\s*([\s\S]*?)```/);
    if (!jsonMatch) {
      // Try without code fences
      const altMatch = text.match(/INTERVIEW_ASSESSMENT_JSON\s*(\{[\s\S]*\})/);
      if (!altMatch) return null;
      const parsed = JSON.parse(altMatch[1]);
      return mapParsedScores(parsed);
    }
    const parsed = JSON.parse(jsonMatch[1]);
    return mapParsedScores(parsed);
  } catch {
    console.warn('Failed to parse INTERVIEW_ASSESSMENT_JSON, falling back to regex');
    return null;
  }
};

const mapParsedScores = (parsed: any): InterviewScore => {
  const cat = parsed.categoryScores || {};
  return {
    patience: clampScore(cat.patience),
    empathy: clampScore(cat.empathy),
    communication: clampScore(cat.communication),
    professionalism: clampScore(cat.professionalism),
    subjectMastery: clampScore(cat.subjectMastery),
    teachingAbility: clampScore(cat.teachingAbility),
    overall: clampScore(parsed.overall),
  };
};

const clampScore = (val: any): number => {
  const n = Number(val);
  if (Number.isNaN(n)) return 5;
  return Math.max(1, Math.min(10, Math.round(n)));
};

const parseScoreRegex = (text: string, category: string): number => {
  // Handle "Category: 8/10", "Category: **8**/10", "Category: 8"
  const patterns = [
    new RegExp(`${category}[:\\s]+\\**(\\d+)\\**(?:/10)?`, 'i'),
    new RegExp(`${category}[:\\s]+(\\d+)`, 'i'),
  ];
  for (const regex of patterns) {
    const match = text.match(regex);
    if (match) return clampScore(parseInt(match[1]));
  }
  return 5;
};

// ---------- Extract full assessment JSON for DB storage ----------

const extractFullAssessment = (text: string): any | null => {
  try {
    const jsonMatch = text.match(/INTERVIEW_ASSESSMENT_JSON[\s\S]*?```json\s*([\s\S]*?)```/);
    if (jsonMatch) return JSON.parse(jsonMatch[1]);
    const altMatch = text.match(/INTERVIEW_ASSESSMENT_JSON\s*(\{[\s\S]*\})/);
    if (altMatch) return JSON.parse(altMatch[1]);
  } catch { /* ignore */ }
  return null;
};

// ---------- Save to database ----------

const saveInterviewToDatabase = async (
  tutorId: string,
  messages: Message[],
  finalAssessment: string,
  scores: InterviewScore
): Promise<void> => {
  if (!supabase) return;

  try {
    const transcript = messages.map((m) => `${m.role}: ${m.content}`).join('\n\n');
    const weightedScore = Math.round(
      scores.patience * 0.125 +
      scores.empathy * 0.125 +
      scores.communication * 0.125 +
      scores.professionalism * 0.125 +
      scores.subjectMastery * 0.25 +
      scores.teachingAbility * 0.25
    );

    const { data: tutorData } = await supabase
      .from('tutor_profiles')
      .select('ai_interview_attempts')
      .eq('id', tutorId)
      .single();

    const currentAttempts = tutorData?.ai_interview_attempts || 0;

    // Extract the structured JSON to persist personality + fit data
    const assessmentJson = extractFullAssessment(finalAssessment);

    const updatePayload: Record<string, any> = {
      ai_interview_status: 'completed',
      ai_interview_transcript: transcript,
      ai_interview_score: weightedScore,
      ai_interview_assessment: finalAssessment,
      ai_interview_attempts: currentAttempts + 1,
      // Also mark the combined questionnaire as completed
      questionnaire_completed: true,
    };

    // Persist personality traits + fit recommendation inside questionnaire_answers
    if (assessmentJson) {
      updatePayload.questionnaire_answers = {
        version: 'unified_v2',
        personality: {
          traitScores: assessmentJson.personalityTraits || {},
          topTraits: assessmentJson.topTraits || [],
        },
        fitRecommendation: assessmentJson.fitRecommendation || null,
        categoryScores: assessmentJson.categoryScores || {},
        questionBreakdown: assessmentJson.questionBreakdown || [],
        completedAt: new Date().toISOString(),
      };
    }

    await supabase
      .from('tutor_profiles')
      .update(updatePayload)
      .eq('id', tutorId);

    console.log('✅ Unified interview + personality saved to database');
  } catch (error: any) {
    console.error('Error saving interview:', error);
  }
};

// ---------- Public helpers ----------

export const getInitialQuestion = (): string => {
  return `Hi there! Welcome to the Integrated Learnings getting-to-know-you chat. 🎓

This is a casual conversation — not an exam! We'd love to learn more about you as a person and as an educator so we can match you with students who'll really benefit from your style.

There are 10 short questions — a mix of multiple choice, short answers, and quick agree/disagree ratings. It usually takes about 10-12 minutes.

Ready? Let's go!

**Q1: In 2-3 sentences, tell us — what drew you to teaching or tutoring in the first place?**`;
};
