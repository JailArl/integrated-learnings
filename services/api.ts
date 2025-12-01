
import { StudentProfile, TutorProfile, TutorRequest } from '../types';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
// 1. Set USE_MOCK_DATA to false when you are ready to connect Supabase.
// 2. Fill in your Supabase URL and Key below.
const CONFIG = {
  USE_MOCK_DATA: true, 
  SUPABASE_URL: "https://your-project.supabase.co",
  SUPABASE_KEY: "your-anon-key"
};

// --- REAL BACKEND CLIENT ---
// Only initialize if we are NOT using mock data, to prevent crashes in preview envs without Supabase headers
let supabase: any = null;
try {
  // Check if we have valid keys (not placeholders) before attempting connection
  const hasKeys = CONFIG.SUPABASE_URL !== "https://your-project.supabase.co" && CONFIG.SUPABASE_KEY !== "your-anon-key";
  
  if (!CONFIG.USE_MOCK_DATA && hasKeys) {
    supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
  }
} catch (e) {
  console.warn("Supabase client failed to initialize (Mock Mode active)", e);
}

// --- MOCK DATABASE (In-Memory Fallback) ---
let MOCK_STUDENTS: StudentProfile[] = [
  { id: 's1', name: 'Alice Tan', level: 'Primary 5', subjects: ['Math', 'Science'], weaknesses: 'Problem Sums', characterTraits: ['Shy'], learningStyle: 'Visual', status: 'active' },
  { id: 's2', name: 'Bryan Lim', level: 'Secondary 3', subjects: ['A-Math'], weaknesses: 'Algebra', characterTraits: ['Distracted'], learningStyle: 'Kinesthetic', status: 'matched' },
];

let MOCK_TUTORS: TutorProfile[] = [
  { id: 't1', name: 'Mr. Chong', qualification: 'NIE Trained', experienceYears: 8, subjects: ['Math', 'A-Math'], scenarioAnswers: {}, isManaged: true, status: 'verified', matchScore: 98 },
  { id: 't2', name: 'Sarah Lee', qualification: 'NUS Undergrad', experienceYears: 2, subjects: ['English', 'Science'], scenarioAnswers: {}, isManaged: false, status: 'active', matchScore: 85 },
];

let MOCK_REQUESTS: TutorRequest[] = [
  { id: 'r1', parentId: 'p1', studentName: 'Alice Tan', level: 'Primary 5', subject: 'Math', urgency: 'Standard', budget: '$40-50', status: 'matching', date: '2023-10-25' },
  { id: 'r2', parentId: 'p2', studentName: 'Kenji', level: 'Sec 4', subject: 'Pure Chem', urgency: 'Urgent', budget: '$60-70', status: 'analyzing', date: '2023-10-26' },
];

// --- API SERVICE LAYER ---
export const api = {
  // Admin / Data Management
  admin: {
    checkConnection: async () => {
      // Returns true if running on real DB, false if Mock
      if (CONFIG.USE_MOCK_DATA || !supabase) return false;
      return true;
    },
    getAllStudents: async () => {
      if (!CONFIG.USE_MOCK_DATA && supabase) {
        const { data } = await supabase.from('students').select('*');
        return data as StudentProfile[] || [];
      }
      await new Promise(r => setTimeout(r, 500)); 
      return MOCK_STUDENTS;
    },
    getAllTutors: async () => {
      if (!CONFIG.USE_MOCK_DATA && supabase) {
        const { data } = await supabase.from('tutors').select('*');
        return data as TutorProfile[] || [];
      }
      await new Promise(r => setTimeout(r, 500));
      return MOCK_TUTORS;
    },
    getAllRequests: async () => {
      if (!CONFIG.USE_MOCK_DATA && supabase) {
        const { data } = await supabase.from('requests').select('*');
        return data as TutorRequest[] || [];
      }
      await new Promise(r => setTimeout(r, 500));
      return MOCK_REQUESTS;
    },
    verifyTutor: async (id: string) => {
      if (!CONFIG.USE_MOCK_DATA && supabase) {
        await supabase.from('tutors').update({ status: 'verified' }).eq('id', id);
        return true;
      }
      MOCK_TUTORS = MOCK_TUTORS.map(t => t.id === id ? { ...t, status: 'verified' } : t);
      return true;
    }
  },

  // AI Matching Simulation / Real Call
  ai: {
    runMatch: async (requestId: string) => {
      console.log(`[Backend] Running AI Match algorithm for Request ${requestId}...`);
      
      if (!CONFIG.USE_MOCK_DATA && supabase) {
        // REAL AI CALL using Supabase Edge Functions
        try {
           const { data, error } = await supabase.functions.invoke('match-tutor', {
             body: { requestId }
           });
           if (error) throw error;
           return data; 
        } catch (e) {
           console.error("AI Match Failed", e);
           return { recommendedTutors: [], matchReason: "Error connecting to AI" };
        }
      }

      // SIMULATION
      await new Promise(r => setTimeout(r, 1500));
      return {
        recommendedTutors: [MOCK_TUTORS[0]],
        matchReason: "Strong correlation between Student's 'Visual' learning style and Tutor's scenario response indicating diagram-based teaching."
      };
    }
  },

  // Auth / User
  auth: {
    loginParent: async (email: string) => {
      return { name: "Demo Parent", role: "PARENT" };
    },
    loginTutor: async (email: string) => {
      return { name: "Demo Tutor", role: "TUTOR" };
    },
    loginAdmin: async (password: string) => {
      // Hardcoded for MVP Security. 
      // In production, verify against Database Hash.
      if (password === 'admin123') return true;
      return false;
    }
  }
};
