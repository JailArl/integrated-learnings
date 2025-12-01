
import { RoadmapTopic, ServiceBlock, PricingTier } from './types';

export const ROADMAP_TOPICS: Record<string, RoadmapTopic> = {
  primary: {
    id: 'primary',
    title: 'Primary Years & P4 Streaming',
    description: 'The foundation years. Understanding Subject-Based Banding (SBB) at Primary 4.',
    sections: [
      {
        title: 'P4 Subject-Based Banding',
        content: [
          'At the end of P4, students are recommended specific subject combinations based on exam results.',
          'Standard Subjects: For students demonstrating strong grasp of content.',
          'Foundation Subjects: A reduced curriculum to focus on basics. Taking Foundation subjects impacts the maximum possible AL score in PSLE.',
          'The Goal: Match the difficulty to the child’s ability to build confidence.'
        ],
        type: 'info'
      },
      {
        title: 'The P5 Jump',
        content: [
          'P5 is often considered the hardest year in Primary School.',
          'Introduction of full examination formats and new topics (e.g., volume/rate in Math).',
          'Marks typically drop by 10-15% compared to P4.'
        ],
        type: 'warning'
      }
    ]
  },
  psle: {
    id: 'psle',
    title: 'PSLE & DSA-Sec',
    description: 'The first national exam. Critical timelines for P6 students.',
    sections: [
      {
        title: 'Critical P6 Timeline',
        content: [
          'March Holidays: Ideal for intensive weak-subject repair.',
          'May/June: Mid-Year Exams (if applicable) & DSA Application phase.',
          'June Holidays: "The Golden Month". Intensive revision, past year papers, and oral prep.',
          'August: PSLE Oral Examinations (Mid-Aug).',
          'September: Listening Comprehension (Mid-Sept) & Written Exams (Late Sept/Early Oct).'
        ],
        type: 'warning'
      },
      {
        title: 'Direct School Admission (DSA-Sec)',
        content: [
          'Allows students to secure a Sec 1 spot before PSLE results.',
          'Talent Areas: Sports, Performing Arts, Leadership, Academic (Math/Science).',
          'Selection: Based on P4-P6 portfolio and interviews.',
          'Commitment: Must stick to the assigned school for the full duration.'
        ],
        type: 'info'
      },
      {
        title: 'AL Scoring System',
        content: [
          'Score range: AL1 (Best) to AL8.',
          'Total Score: Sum of 4 subjects.',
          'G3 (Express): AL 4 - 20.',
          'G2 (N(A)): AL 21 - 25.'
        ],
        type: 'text'
      }
    ]
  },
  secondary: {
    id: 'secondary',
    title: 'Lower Secondary (FSBB) & N-Levels',
    description: 'Full Subject-Based Banding (G1/G2/G3) and the N-Level Pathways (Sec 5 vs PFP vs DPP).',
    sections: [
      {
        title: 'G1, G2, G3 Bands',
        content: [
          'G3: Express Standard (O-Level pace)',
          'G2: N(A) Standard (N-Level pace)',
          'G1: N(T) Standard',
          'Students can take subjects at different levels (e.g., G3 English, G2 Math).'
        ],
        type: 'list'
      },
      {
        title: 'Sec 2 Streaming',
        content: [
          'Determines Upper Sec Subject Combinations.',
          'Critical for eligibility for Pure Sciences and A-Math.',
          'Poor choices here limit Post-Secondary options (e.g., Engineering requires Physics).'
        ],
        type: 'warning'
      },
      {
        title: 'N-Level Pathways (Sec 4 G2)',
        content: [
          'Sec 5N: Take O-Levels after N-Levels (Requires N-Level Grade 1-5).',
          'PFP (Polytechnic Foundation Programme): Skip O-Levels, do 1 year foundation at Poly (Requires N-Level ELMAB3 ≤ 12).',
          'DPP (Direct Entry Scheme to Poly): 2 years Higher Nitec -> Guaranteed Poly place (Requires good N-Level results).'
        ],
        type: 'info'
      }
    ]
  },
  olevel: {
    id: 'olevel',
    title: 'O-Levels, Bonus Points & DSA-JC',
    description: 'The high-stakes exam for JC/Poly admission. The Mid-Year MT Exam and L1R5 strategies.',
    sections: [
      {
        title: 'The O-Level Marathon (Key Dates)',
        content: [
          'June (Early): G3 Mother Tongue (Written Paper 1 & 2). This is the real exam. A good grade here allows students to drop MT and focus on other subjects.',
          'July: Mother Tongue Listening Comprehension.',
          'August: Prelim Exams (School-based). Crucial for DSA-JC.',
          'October/November: Main Written Papers for all other subjects.',
          'Strategy: March Holidays and June Holidays are the critical "Intensive Revision" blocks.'
        ],
        type: 'warning'
      },
      {
        title: 'Grading & L1R5',
        content: [
          'L1R5 (for JC): English + 5 Relevant Subjects.',
          'ELR2B2 (for Poly): English + 2 Relevant + 2 Best.',
          'Raw Score vs Net Score: Admission is based on Net Score.'
        ],
        type: 'text'
      },
      {
        title: 'Bonus Points (The Game Changer)',
        content: [
          'CCA (LEAPS 2.0): Excellent = -2 points, Good = -1 point.',
          'Higher Mother Tongue (HMT): Pass = -2 points (for JC admission only).',
          'School Affiliation: -2 points for affiliated JCs.',
          'Third Language: Can be used as a relevant subject (R5/R2).'
        ],
        type: 'list'
      },
      {
        title: 'DSA-JC',
        content: [
          'Secures a JC spot before O-Levels.',
          'Based on CCA excellence or specific academic strengths (Research/Olympiad).',
          'Crucial for students with strong talents but borderline L1R5.'
        ],
        type: 'info'
      }
    ]
  },
  coursework: {
    id: 'coursework',
    title: 'O-Level Coursework',
    description: 'D&T, Art, and FCE Major Projects. This is NOT Lower Sec work.',
    sections: [
      {
        title: 'High Weightage',
        content: [
          'For O-Level D&T and Art, coursework can account for 60-70% of the final grade.',
          'This is a marathon, not a sprint. It requires consistent documentation over months.',
          'Many students fail to secure an A1 because they rush the "Process Journal".'
        ],
        type: 'warning'
      },
      {
        title: 'Our Support',
        content: [
          'We provide studio time and critique sessions.',
          'Guidance on ideation, sketching rigor, and artifact fabrication.',
          'FCE: Planning and execution of the practical exam.'
        ],
        type: 'list'
      }
    ]
  },
  postsec: {
    id: 'postsec',
    title: 'Post-Secondary Routes',
    description: 'The roads to University: JC, Poly, and ITE Progression.',
    sections: [
      {
        title: 'The Junior College (JC) Route',
        content: [
          '2 Years -> A-Levels -> University.',
          'Academic and fast-paced. Best for those who want a direct path to local Unis.'
        ],
        type: 'text'
      },
      {
        title: 'The Polytechnic Route',
        content: [
          '3 Years -> Diploma -> University / Work.',
          'Practice-oriented. Top students (GPA > 3.8) have a good shot at Local Unis (NUS/NTU/SMU).',
          'Open to O-Level and ITE (Higher Nitec) graduates.'
        ],
        type: 'text'
      },
      {
        title: 'The ITE Progression Ladder',
        content: [
          'Nitec -> Higher Nitec (Min GPA 2.3) -> Polytechnic (Min GPA 2.0 - 3.0 depending on course).',
          'A longer path, but allows students to mature and build technical skills.',
          'Many ITE graduates successfully enter Poly and subsequently University.'
        ],
        type: 'info'
      }
    ]
  }
};

export const SERVICES: ServiceBlock[] = [
  {
    id: 'primary',
    title: 'Primary Tuition',
    description: 'English, Math, Science, Chinese. Mastery of concepts for PSLE.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop', // Child writing/studying
    link: '#contact'
  },
  {
    id: 'secondary',
    title: 'Secondary Tuition',
    description: 'Specialised tutors for G3, G2, and G1 streams.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=800&auto=format&fit=crop', // Student in library
    link: '#contact'
  },
  {
    id: 'coursework',
    title: 'O-Level Coursework',
    description: 'D&T, Art, FCE Guidance. High weightage project support.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop', // Art/Design supplies
    link: '/coursework'
  },
  {
    id: 'jc',
    title: 'JC / IB / IGCSE',
    description: 'Advanced consultation for high-stakes examinations.',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop', // Intensive study/books
    link: '#contact'
  },
  {
    id: 'extra',
    title: 'Extra Learnings',
    description: 'Financial Literacy, Coding, Sports. Building life skills.',
    image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=800&auto=format&fit=crop', // Coding/Tech
    link: '/extra'
  },
  {
    id: 'holiday',
    title: 'Holiday Programs',
    description: 'Head-start bootcamps and intensive revision weeks.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop', // Group study
    link: '/holiday'
  }
];

export const PRICING_DATA: PricingTier[] = [
  {
    category: 'Primary',
    rates: [
      { level: 'P1 - P4', pt: '$30 - $40', ft: '$40 - $50', moe: '$55 - $70' },
      { level: 'P5 - P6', pt: '$30 - $40', ft: '$45 - $55', moe: '$65 - $80' }
    ]
  },
  {
    category: 'Secondary',
    rates: [
      { level: 'Lower Sec (G3/G2)', pt: '$40 - $50', ft: '$50 - $65', moe: '$70 - $90' },
      { level: 'Upper Sec (G3/G2)', pt: '$45 - $60', ft: '$60 - $75', moe: '$80 - $100' }
    ]
  },
  {
    category: 'Tertiary / Specialised',
    rates: [
      { level: 'JC / IB', pt: '$60 - $80', ft: '$80 - $100', moe: '$100 - $120' },
      { level: 'O-Lvl Coursework', pt: '$45+', ft: '$70+', moe: '$90+' }
    ]
  },
];

export const TUTOR_SCENARIO_QUESTIONS = [
  {
    id: 1,
    question: "A Sec 2 student is consistently not handing in homework, claiming they 'forgot'. Their grades are slipping. What is your first course of action?",
    options: [
      "Strictly reprimand them and threaten to call their parents immediately.",
      "Ignore the homework and focus only on the lesson time.",
      "Investigate the root cause (difficulty vs laziness) and implement a small, manageable tracking system.",
      "Give them double homework the next week as punishment."
    ]
  },
  {
    id: 2,
    question: "You notice a P5 student becomes visibly anxious and shuts down when they make a mistake in Math. How do you handle this?",
    options: [
      "Tell them not to cry and that exams are harder than this.",
      "Switch to an easier topic immediately to avoid the conflict.",
      "Pause the lesson, normalize making mistakes as part of learning, and walk through the error without judgement.",
      "Call the parent to ask if the child has emotional issues."
    ]
  }
];

export const TUTOR_CONTRACT_TEXT = `
TUTOR AGREEMENT & CODE OF CONDUCT

1. ENGAGEMENT MODEL (See Policies Page for details)
Integrated Learnings operates on two models: Referral and Managed.
- Referral: One-time agency fee.
- Managed: Monthly billing via Agency.

2. PROFESSIONAL CONDUCT
Tutors are expected to maintain the highest standards of professionalism.
- Punctuality: Arrive 5 minutes before scheduled time.
- Preparation: Lesson plans must be prepared in advance.
- Attire: Smart casual.

3. NON-SOLICITATION
Tutors shall not solicit Agency clients for private arrangements outside of the Agency agreement.

4. REPORTING
- Managed tutors must submit a Weekly Learning Log via the dashboard.
- Progress Reports are due monthly.

5. TERMINATION
Agency reserves the right to terminate this agreement immediately for misconduct.
`;

export const PRIVACY_POLICY_TEXT = `
1. COLLECTION OF DATA
We collect personal data (Name, Contact Number, Academic Grade, Learning Needs) solely for the purpose of matching students with suitable tutors.

2. USE OF DATA
- To assess suitability for tuition services.
- To communicate with you regarding your request.
- We do not sell your data to third-party marketing firms.

3. SECURITY
All data is stored securely and is only accessible by authorized administrative staff and the assigned tutor (limited access).
`;

export const POLICY_CONTENT = {
  parents: {
    cancellation: [
      "We understand that emergencies happen. However, consistency is key to your child's progress.",
      "24-Hour Notice: Cancellations must be made at least 24 hours in advance. Less than 24 hours notice will be considered a billable lesson.",
      "Medical Certificates: Fees may be waived for last-minute cancellations upon production of a valid MC (Managed Plan only).",
      "Termination: We require 2 weeks' notice for termination of tuition services."
    ],
    payments: [
      "Minimum Commitment: We require a minimum commitment of 4 lessons to ensure the tutor has sufficient time to make an impact.",
      "First Month: The first 2 weeks of fees (Agency Fee) are payable directly to Integrated Learnings to confirm the start date.",
      "Subsequent Payments: For Referral tutors, pay the tutor directly from Week 3 onwards. For Managed tutors, continue paying the Agency monthly.",
      "Methods: PayNow (UEN) or Bank Transfer."
    ],
    materials: [
      "Digital Resources: The agency provides a proprietary digital library (Cheat Sheets, Summaries) at no extra cost.",
      "Physical Materials: Tutors may recommend assessment books. These are billed 'at-cost' (reimbursement).",
      "Approval Process: Tutors must seek parental approval via WhatsApp before purchasing any physical materials.",
      "Printing: Minimal printing is expected to be borne by the tutor/student. Heavy printing should be discussed."
    ]
  },
  tutors: {
    referral: [
      "Commission: 50% of the first month's tuition fees (First 2 weeks of lessons).",
      "Payment Flow: The client pays the Agency directly for the first 2 weeks. From the 3rd week onwards, you collect fees directly from the client.",
      "Relationship: You are an independent contractor. You manage your own schedule and client relationship after the initial match.",
      "Risk: No payment protection from Agency after the commission period."
    ],
    managed: [
      "Commission: Agency takes a fixed percentage (20-30%) of the hourly rate for the duration of the assignment.",
      "Payment Flow: Agency collects all fees from the client. You receive a monthly payout from the Agency by the 7th of the following month.",
      "Benefits: Income stability, lesson cancellation protection (you are paid if client cancels <24h), and administrative support.",
      "Requirements: Must submit weekly lesson logs and monthly progress reports."
    ]
  }
};
