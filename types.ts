
export interface RoadmapSection {
  title: string;
  content: string[]; // Array of paragraphs or bullet points
  type?: 'text' | 'list' | 'warning' | 'info';
}

export interface RoadmapTopic {
  id: string;
  title: string;
  description: string;
  sections: RoadmapSection[];
}

export interface ServiceBlock {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
}

export interface PricingTier {
  category: string;
  rates: {
    level: string;
    pt: string;
    ft: string;
    moe: string;
  }[];
}

export enum UserRole {
  GUEST = 'GUEST',
  PARENT = 'PARENT',
  TUTOR = 'TUTOR',
  ADMIN = 'ADMIN'
}

// AI-Ready Data Structures
export interface StudentProfile {
  id?: string;
  parentName?: string;
  name: string;
  level: string;
  subjects: string[];
  weaknesses: string;
  characterTraits: string[];
  learningStyle: 'Visual' | 'Auditory' | 'Kinesthetic';
  status: 'active' | 'pending' | 'matched';
}

export interface TutorProfile {
  id?: string;
  name: string;
  qualification: string;
  experienceYears: number;
  subjects: string[];
  scenarioAnswers: Record<number, string>;
  isManaged: boolean;
  status: 'active' | 'pending' | 'verified';
  matchScore?: number; // For AI Matching usage
}

export interface TutorRequest {
  id: string;
  parentId: string;
  studentName: string;
  level: string;
  subject: string;
  urgency: string;
  budget: string;
  status: 'analyzing' | 'matching' | 'matched' | 'completed';
  date: string;
}

// Chatbot Types
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  actions?: { label: string; action: () => void }[];
}
