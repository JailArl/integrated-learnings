
import React, { useState, useEffect } from 'react';
import { Section, Button, Card } from '../components/Components';
import { StudentProfile, TutorProfile } from '../types';
import { TUTOR_CONTRACT_TEXT, TUTOR_SCENARIO_QUESTIONS, POLICY_CONTENT } from '../constants';
import { Link } from 'react-router-dom';
import { Lock, CreditCard, Calendar, BookOpen, Cpu, Shield, AlertCircle, User, MapPin, DollarSign, Clock, Briefcase, FileCheck, Landmark, CheckCircle2, Wallet, QrCode, FileText, Download, Filter, Edit2, PlusCircle, X, Search, File, Receipt } from 'lucide-react';

// --- HELPER FOR SUBJECTS ---
const getSubjectsForLevel = (level: string) => {
  if (!level) return [];
  
  // Logic to categorize level
  const isPriLower = ['Primary 1', 'Primary 2'].includes(level);
  const isPriUpper = ['Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'].includes(level);
  const isSecLower = ['Secondary 1', 'Secondary 2'].includes(level);
  const isSecUpper = ['Secondary 3', 'Secondary 4', 'Secondary 5'].includes(level);
  const isJC = ['JC 1', 'JC 2', 'Millennia Institute'].includes(level);

  if (isPriLower) {
    return [
      'English', 'Mathematics', 
      'Chinese', 'Malay', 'Tamil'
    ];
  }
  
  if (isPriUpper) {
    return [
      'English', 'Mathematics', 'Science', 
      'Chinese', 'Higher Chinese', 'Malay', 'Higher Malay', 'Tamil', 'Higher Tamil'
    ];
  }

  if (isSecLower) {
    return [
      'English', 'Mathematics', 'Science', 
      'Chinese', 'Higher Chinese', 'Malay', 'Higher Malay', 'Tamil', 'Higher Tamil',
      'History', 'Geography', 'Literature'
    ];
  }

  if (isSecUpper) {
    return [
      'English', 
      'Elementary Math (E-Math)', 'Additional Math (A-Math)',
      'Pure Physics', 'Pure Chemistry', 'Pure Biology',
      'Combined Science (Phy/Chem)', 'Combined Science (Bio/Chem)', 'Combined Science (Phy/Bio)',
      'Pure Geography', 'Pure History', 'Pure Literature',
      'Social Studies', // Standalone option
      'Elective Geography', 'Elective History', 'Elective Literature',
      'Combined Humanities (SS + Geog)', 'Combined Humanities (SS + Hist)', 'Combined Humanities (SS + Lit)',
      'Chinese', 'Higher Chinese', 'Malay', 'Higher Malay', 'Tamil', 'Higher Tamil',
      'Principle of Accounts (POA)'
    ];
  }

  if (isJC) {
    return [
      'General Paper (GP)',
      'H1 Mathematics', 'H2 Mathematics', 'H3 Mathematics',
      'H1 Physics', 'H2 Physics',
      'H1 Chemistry', 'H2 Chemistry',
      'H1 Biology', 'H2 Biology',
      'H1 Economics', 'H2 Economics',
      'H1 Geography', 'H2 Geography',
      'H1 History', 'H2 History',
      'H1 Literature', 'H2 Literature',
      'Knowledge & Inquiry (KI)',
      'China Studies'
    ];
  }
  
  return [];
};

// --- AUTH COMPONENTS ---

const LoginScreen: React.FC<{ 
  onLogin: () => void; 
  onSwitchToSignup: () => void; 
  title: string;
}> = ({ onLogin, onSwitchToSignup, title }) => (
  <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
    <div className="text-center mb-8">
      <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="text-secondary" />
      </div>
      <h2 className="text-2xl font-bold text-primary">{title}</h2>
      <p className="text-slate-500 text-sm mt-1">Welcome back to Integrated Learnings</p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-bold mb-1 text-slate-700">Email Address</label>
        <input type="email" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition" placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-bold mb-1 text-slate-700">Password</label>
        <input type="password" className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition" placeholder="••••••••" />
      </div>
      <div className="text-right">
        <button className="text-xs text-secondary hover:underline">Forgot Password?</button>
      </div>
      <Button onClick={onLogin} className="w-full py-3 shadow-lg">Sign In</Button>
    </div>

    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
      <p className="text-sm text-slate-600 mb-4">Don't have an account yet?</p>
      <Button onClick={onSwitchToSignup} variant="outline" className="w-full py-2 text-sm">Create New Account</Button>
    </div>
  </div>
);

// --- PARENT FLOW COMPONENTS ---

const ParentSignupWizard: React.FC<{ 
  onComplete: (profile: StudentProfile) => void;
  onSwitchToLogin: () => void;
}> = ({ onComplete, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<StudentProfile>>({
    characterTraits: []
  });

  const handleTraitToggle = (trait: string) => {
    const current = formData.characterTraits || [];
    if (current.includes(trait)) {
      setFormData({ ...formData, characterTraits: current.filter(t => t !== trait) });
    } else {
      setFormData({ ...formData, characterTraits: [...current, trait] });
    }
  };

  const nextStep = () => setStep(step + 1);

  // Demo Profile
  const demoProfile: StudentProfile = {
      name: "Demo Student",
      level: "Secondary 3",
      subjects: ["English", "A-Math"],
      weaknesses: "Algebra & Time Management",
      characterTraits: ["Visual Learner", "Anxious"],
      learningStyle: "Visual",
      status: "active"
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 relative">
      <div className="absolute top-4 right-4">
         <button onClick={() => onComplete(demoProfile)} className="text-xs font-bold text-slate-400 hover:text-secondary underline bg-slate-50 px-2 py-1 rounded">
             Skip (Preview Mode)
         </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center text-sm font-bold text-slate-400 mb-2">
          <span className={step >= 1 ? "text-secondary" : ""}>1. Basics</span>
          <span className={step >= 2 ? "text-secondary" : ""}>2. Academic Profile</span>
          <span className={step >= 3 ? "text-secondary" : ""}>3. Character</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-primary mb-6">Create Parent Account</h2>

      {step === 1 && (
        <div className="space-y-4">
          <div><label className="block text-sm font-bold mb-1">Parent Name</label><input className="w-full border p-2 rounded" placeholder="Your Name" /></div>
          <div><label className="block text-sm font-bold mb-1">Email</label><input className="w-full border p-2 rounded" placeholder="Email Address" /></div>
          <div><label className="block text-sm font-bold mb-1">Password</label><input type="password" className="w-full border p-2 rounded" placeholder="Password" /></div>
          <Button onClick={nextStep} className="w-full mt-4">Next: Student Profile</Button>
          
          <div className="text-center pt-4 mt-4 border-t border-slate-100">
             <p className="text-sm text-slate-600">Already registered? <button onClick={onSwitchToLogin} className="text-secondary font-bold hover:underline">Sign In here</button></p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Tell us about the student</h3>
          <div>
            <label className="block text-sm font-bold mb-1">Student Name</label>
            <input 
              className="w-full border p-2 rounded" 
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Level</label>
            <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, level: e.target.value})}>
              <option>Select Level</option>
              <option>Primary 1-3</option>
              <option>Primary 4-6</option>
              <option>Secondary 1-2</option>
              <option>Secondary 3-4 (O-Level)</option>
              <option>Junior College</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Main Academic Weaknesses</label>
            <textarea 
              className="w-full border p-2 rounded h-24" 
              placeholder="E.g. struggles with Math algebra, loses focus during Science open-ended questions..."
              onChange={e => setFormData({...formData, weaknesses: e.target.value})}
            />
          </div>
          <Button onClick={nextStep} className="w-full mt-4">Next: Character Analysis</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-bold text-secondary text-sm mb-2 uppercase">AI Matching Data</h3>
            <p className="text-sm text-slate-600">We use this to match your child with a tutor who fits their personality.</p>
          </div>
          
          <div>
            <label className="block text-sm font-bold mb-3">Character Traits (Select all that apply)</label>
            <div className="grid grid-cols-2 gap-3">
              {['Shy / Introverted', 'Easily Distracted', 'Competitive', 'Need constant motivation', 'Independent Learner', 'Anxious during exams'].map(trait => (
                <button 
                  key={trait}
                  onClick={() => handleTraitToggle(trait)}
                  className={`p-3 text-sm rounded border text-left transition ${formData.characterTraits?.includes(trait) ? 'bg-secondary text-white border-secondary' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Learning Style</label>
            <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, learningStyle: e.target.value as any})}>
              <option>Not sure</option>
              <option value="Visual">Visual (Likes diagrams, charts)</option>
              <option value="Auditory">Auditory (Learns by listening/discussing)</option>
              <option value="Kinesthetic">Kinesthetic (Learn by doing)</option>
            </select>
          </div>

          <Button onClick={() => onComplete(formData as StudentProfile)} className="w-full mt-4">Complete Registration</Button>
        </div>
      )}
    </div>
  );
};

const TutorSignupWizard: React.FC<{
  onComplete: (profile: TutorProfile) => void;
  onSwitchToLogin: () => void;
}> = ({ onComplete, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<TutorProfile>>({
    scenarioAnswers: {},
    isManaged: false // default
  });

  const nextStep = () => setStep(step + 1);

  // Demo Profile
  const demoProfile: TutorProfile = {
      name: "Demo Tutor",
      qualification: "NIE Trained",
      experienceYears: 4,
      subjects: ["Math", "Science"],
      scenarioAnswers: {1: "B", 2: "C"},
      isManaged: true,
      status: "pending"
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 relative">
       {/* Preview Button */}
       <div className="absolute top-4 right-4">
         <button onClick={() => onComplete(demoProfile)} className="text-xs font-bold text-slate-400 hover:text-secondary underline bg-slate-50 px-2 py-1 rounded">
             Skip (Preview Mode)
         </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center text-sm font-bold text-slate-400 mb-2">
          <span className={step >= 1 ? "text-secondary" : ""}>1. Profile</span>
          <span className={step >= 2 ? "text-secondary" : ""}>2. Scenarios</span>
          <span className={step >= 3 ? "text-secondary" : ""}>3. Contract</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-primary mb-6">Tutor Application</h2>

      {step === 1 && (
        <div className="space-y-4">
          <div><label className="block text-sm font-bold mb-1">Full Name</label><input className="w-full border p-2 rounded" placeholder="As per NRIC" onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="block text-sm font-bold mb-1">Highest Qualification</label><input className="w-full border p-2 rounded" placeholder="e.g. Bachelor of Science (NUS)" onChange={e => setFormData({...formData, qualification: e.target.value})} /></div>
          <div><label className="block text-sm font-bold mb-1">Years of Experience</label><input type="number" className="w-full border p-2 rounded" placeholder="0" onChange={e => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})} /></div>
          
          <div className="pt-4 border-t border-slate-100 mt-4">
             <p className="text-sm text-slate-600 mb-2">Already have an account? <button onClick={onSwitchToLogin} className="text-secondary font-bold hover:underline">Login here</button></p>
          </div>
          <Button onClick={nextStep} className="w-full mt-4">Next: Teaching Scenarios</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <p className="text-slate-500 text-sm">We assess how you handle common student issues.</p>
          {TUTOR_SCENARIO_QUESTIONS.map((q) => (
            <div key={q.id} className="border border-slate-200 p-4 rounded-lg">
              <p className="font-bold text-slate-800 mb-3 text-sm">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label key={i} className="flex items-start gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded">
                    <input type="radio" name={`q-${q.id}`} className="mt-1" />
                    <span className="text-sm text-slate-600">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={nextStep} className="w-full mt-4">Next: Engagement Model</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
           <h3 className="font-bold text-lg">Select Partnership Model</h3>
           <div className="grid md:grid-cols-2 gap-4">
              <div 
                onClick={() => setFormData({...formData, isManaged: false})}
                className={`p-4 border rounded-lg cursor-pointer transition ${formData.isManaged === false ? 'border-secondary bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'}`}
              >
                 <h4 className="font-bold text-primary mb-1">Referral Partner</h4>
                 <p className="text-xs text-slate-500 mb-2">Best for freelancers.</p>
                 <ul className="text-xs list-disc list-inside text-slate-600 space-y-1">
                    <li>Pay Agency 50% of 1st Month</li>
                    <li>You collect fees directly after</li>
                    <li>No income protection</li>
                 </ul>
              </div>
              <div 
                onClick={() => setFormData({...formData, isManaged: true})}
                className={`p-4 border rounded-lg cursor-pointer transition ${formData.isManaged === true ? 'border-secondary bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200 hover:border-blue-300'}`}
              >
                 <h4 className="font-bold text-primary mb-1">Managed Tutor</h4>
                 <p className="text-xs text-slate-500 mb-2">Best for stability.</p>
                 <ul className="text-xs list-disc list-inside text-slate-600 space-y-1">
                    <li>Agency handles all billing</li>
                    <li>Monthly Payouts</li>
                    <li>Paid for late cancellations</li>
                 </ul>
              </div>
           </div>
           
           <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded h-24 overflow-y-auto border border-slate-200">
              <pre className="whitespace-pre-wrap font-sans">{TUTOR_CONTRACT_TEXT}</pre>
           </div>
           
           <label className="flex items-center gap-2">
              <input type="checkbox" />
              <span className="text-sm font-bold text-slate-700">I agree to the Terms & Code of Conduct</span>
           </label>

           <Button onClick={() => onComplete({...formData, status: 'pending'} as TutorProfile)} className="w-full mt-4">Submit Application</Button>
        </div>
      )}
    </div>
  );
};

export const ParentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Demo Profile
  const demoProfile: StudentProfile = {
      name: "Demo Student",
      level: "Secondary 3",
      subjects: ["English", "A-Math"],
      weaknesses: "Algebra",
      characterTraits: ["Visual"],
      learningStyle: "Visual",
      status: "active"
  };

  if (!profile) {
    return (
      <Section className="min-h-[80vh] flex items-center justify-center">
        {authMode === 'login' ? (
          <LoginScreen 
            title="Parent / Student Login" 
            onLogin={() => setProfile(demoProfile)} 
            onSwitchToSignup={() => setAuthMode('signup')} 
          />
        ) : (
          <ParentSignupWizard 
            onComplete={setProfile} 
            onSwitchToLogin={() => setAuthMode('login')} 
          />
        )}
      </Section>
    );
  }

  return (
    <Section>
       <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Parent Dashboard</h1>
          <div className="text-right">
             <p className="font-bold text-primary">{profile.name}</p>
             <p className="text-xs text-slate-500">{profile.level}</p>
          </div>
       </div>
       
       <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
             {/* Request Widget */}
             <Card title="My Tuition Requests">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                   <div className="bg-white inline-block p-4 rounded-full shadow-sm mb-4">
                      <Search className="text-secondary" size={24} />
                   </div>
                   <h3 className="font-bold text-lg text-slate-800">No Active Requests</h3>
                   <p className="text-slate-600 mb-6 max-w-sm mx-auto">Ready to find the perfect match for {profile.name}? Based on their profile, we recommend a <strong>{profile.learningStyle}</strong> style tutor.</p>
                   <Button>Create New Request</Button>
                </div>
             </Card>
             
             {/* Learning Profile Summary */}
             <Card title="Student Profile Analysis">
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-blue-50 p-4 rounded border border-blue-100">
                      <h4 className="font-bold text-blue-900 text-sm uppercase mb-1">Learning Style</h4>
                      <p className="text-lg font-bold text-blue-700">{profile.learningStyle}</p>
                   </div>
                   <div className="bg-purple-50 p-4 rounded border border-purple-100">
                      <h4 className="font-bold text-purple-900 text-sm uppercase mb-1">Key Weakness</h4>
                      <p className="text-lg font-bold text-purple-700 truncate">{profile.weaknesses}</p>
                   </div>
                </div>
             </Card>
          </div>
          
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                   <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg font-bold text-sm text-slate-700 flex items-center">
                      <FileCheck size={16} className="mr-2" /> View Invoices
                   </button>
                   <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg font-bold text-sm text-slate-700 flex items-center">
                      <Calendar size={16} className="mr-2" /> Schedule
                   </button>
                   <Link to="/contact" className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg font-bold text-sm text-slate-700 flex items-center">
                      <AlertCircle size={16} className="mr-2" /> Support
                   </Link>
                   <button onClick={() => setProfile(null)} className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg font-bold text-sm flex items-center mt-4 border-t border-slate-100">
                      Log Out
                   </button>
                </div>
             </div>
          </div>
       </div>
    </Section>
  );
};

export const TutorDashboard: React.FC = () => {
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState('overview');
  const [jobFilter, setJobFilter] = useState('All');
  const [showLogModal, setShowLogModal] = useState(false); // Lesson Log Modal State

  // Demo Profile
  const demoProfile: TutorProfile = {
      name: "Demo Tutor",
      qualification: "NUS Math Degree",
      experienceYears: 5,
      subjects: ["Math", "A-Math"],
      scenarioAnswers: {},
      isManaged: true,
      status: "active"
  };

  if (!profile) {
    return (
      <Section className="min-h-[80vh] flex items-center justify-center">
        {authMode === 'login' ? (
          <LoginScreen 
            title="Tutor Login" 
            onLogin={() => setProfile(demoProfile)} 
            onSwitchToSignup={() => setAuthMode('signup')} 
          />
        ) : (
          <TutorSignupWizard 
            onComplete={setProfile} 
            onSwitchToLogin={() => setAuthMode('login')} 
          />
        )}
      </Section>
    );
  }

  // --- PENDING VERIFICATION STATE ---
  if (profile.status === 'pending') {
     return (
        <Section className="min-h-[70vh] flex flex-col items-center justify-center text-center">
           <div className="bg-amber-100 p-6 rounded-full mb-6">
              <Clock size={48} className="text-amber-600" />
           </div>
           <h2 className="text-3xl font-bold text-slate-800 mb-2">Profile Under Review</h2>
           <p className="text-slate-600 max-w-lg mb-8">
              Thank you for applying, <strong>{profile.name}</strong>. Our admin team is currently verifying your qualifications. 
              This process typically takes 24-48 hours. You will be notified via WhatsApp once approved.
           </p>
           <Button onClick={() => setProfile(null)} variant="outline">Back to Home</Button>
        </Section>
     );
  }

  return (
    <Section>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Tutor Portal</h1>
        <div className="text-right">
          <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded text-white ${profile.isManaged ? 'bg-secondary' : 'bg-emerald-600'}`}>
            {profile.isManaged ? 'Managed Tutor' : 'Referral Partner'}
          </span>
          <p className="font-bold text-primary mt-1">{profile.name}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center ${activeTab === 'overview' ? 'bg-secondary text-white' : 'bg-white text-slate-600'}`}>
              <Briefcase size={16} className="mr-2" /> Overview
            </button>
            <button onClick={() => setActiveTab('students')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center ${activeTab === 'students' ? 'bg-secondary text-white' : 'bg-white text-slate-600'}`}>
              <User size={16} className="mr-2" /> My Students
            </button>
            <button onClick={() => setActiveTab('jobs')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center ${activeTab === 'jobs' ? 'bg-secondary text-white' : 'bg-white text-slate-600'}`}>
              <MapPin size={16} className="mr-2" /> Job Board
            </button>
            <button onClick={() => setActiveTab('engagement')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center ${activeTab === 'engagement' ? 'bg-secondary text-white' : 'bg-white text-slate-600'}`}>
              <FileCheck size={16} className="mr-2" /> My Engagement
            </button>
            <button onClick={() => setActiveTab('resources')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center ${activeTab === 'resources' ? 'bg-secondary text-white' : 'bg-white text-slate-600'}`}>
              <Download size={16} className="mr-2" /> Materials & Toolkit
            </button>
            <button onClick={() => setProfile(null)} className="w-full text-left px-4 py-3 rounded-lg font-bold text-red-500 hover:bg-red-50 mt-8">Sign Out</button>
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Earnings Widget */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                     <div className="flex items-center text-slate-500 text-sm mb-1">
                        <DollarSign size={14} className="mr-1" /> {profile.isManaged ? 'Pending Payout' : 'Agency Fees Owed'}
                     </div>
                     <p className="text-2xl font-bold text-primary">$0.00</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                     <div className="flex items-center text-slate-500 text-sm mb-1">
                        <User size={14} className="mr-1" /> Active Students
                     </div>
                     <p className="text-2xl font-bold text-primary">1</p>
                  </div>
              </div>

              <Card title="Your Profile Analysis">
                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-bold text-secondary uppercase mb-2">AI Teaching Profile</h4>
                  <p className="text-slate-700 leading-relaxed">
                    Based on your scenario responses, you exhibit a <strong>Process-Oriented</strong> and <strong>Empathetic</strong> teaching style. 
                    We are currently prioritizing matching you with students who have flagged "Exam Anxiety" or "Low Confidence" in their profiles.
                  </p>
                </div>
              </Card>
            </div>
          )}
          
          {activeTab === 'students' && (
            <Card title="My Active Students">
              <div className="space-y-4">
                {/* Mock Active Student */}
                <div className="flex justify-between items-start border p-4 rounded-lg bg-white border-slate-200 hover:shadow-sm transition">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-secondary font-bold text-sm">JD</div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">John Doe</h4>
                      <p className="text-sm text-secondary font-bold">Sec 3 A-Math</p>
                      <div className="text-xs text-slate-500 space-y-1 mt-2">
                        <p className="flex items-center"><Clock size={12} className="mr-1"/> Fridays, 5:00 PM</p>
                        <p className="flex items-center"><MapPin size={12} className="mr-1"/> Tampines St 32</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                         {profile.isManaged && (
                           <Button onClick={() => setShowLogModal(true)} className="py-1 px-3 text-xs h-auto bg-green-600 hover:bg-green-700 shadow-none"><PlusCircle size={12} className="mr-1"/> Log Lesson</Button>
                         )}
                         <Button variant="outline" className="py-1 px-3 text-xs h-auto">View Progress</Button>
                      </div>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">Active</span>
                </div>
                
                <p className="text-slate-400 text-xs text-center pt-4 italic">Showing 1 active student.</p>
              </div>
            </Card>
          )}
          
          {/* LESSON LOG MODAL */}
          {showLogModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                  <button onClick={() => setShowLogModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                     <X size={20} />
                  </button>
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center"><FileText className="mr-2 text-secondary"/> Log Lesson</h3>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold mb-1">Student</label>
                        <input className="w-full bg-slate-100 border-0 p-2 rounded text-slate-500" value="John Doe - Sec 3 A-Math" disabled />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-bold mb-1">Date</label>
                           <input type="date" className="w-full border p-2 rounded" />
                        </div>
                        <div>
                           <label className="block text-sm font-bold mb-1">Duration</label>
                           <select className="w-full border p-2 rounded">
                              <option>1.5 Hours</option>
                              <option>2 Hours</option>
                           </select>
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-bold mb-1">Topics Covered</label>
                        <input className="w-full border p-2 rounded" placeholder="e.g. Quadratic Inequalities" />
                     </div>
                     <div>
                        <label className="block text-sm font-bold mb-1">Student Focus (1-5)</label>
                        <div className="flex gap-2">
                           {[1,2,3,4,5].map(n => <button key={n} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-secondary hover:text-white font-bold transition">{n}</button>)}
                        </div>
                     </div>
                     <Button onClick={() => { setShowLogModal(false); alert("Lesson Logged Successfully! Earnings updated."); }} className="w-full mt-4">Submit Log</Button>
                  </div>
               </div>
            </div>
          )}
          
          {activeTab === 'resources' && (
             <Card title="Materials & Toolkit">
                {profile.isManaged ? (
                    <div className="bg-amber-50 p-4 rounded mb-6 border border-amber-100 text-sm text-amber-900">
                       <strong>Managed Policy:</strong> Digital materials below are free to use. 
                       If you need to purchase physical assessment books for a student, you must obtain <strong>parental approval via WhatsApp</strong> first to claim reimbursement.
                    </div>
                ) : (
                    <div className="bg-blue-50 p-4 rounded mb-6 border border-blue-100 text-sm text-blue-900">
                       <strong>Referral Partner Benefit:</strong> You have full access to our Digital Question Bank below. 
                       For physical materials, please arrange payment/reimbursement <strong>directly with the parent</strong> as per your private arrangement.
                    </div>
                )}

                <div className="space-y-6">
                   <div>
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center"><Search size={16} className="mr-2"/> Agency Question Bank</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                         {['P5 Science: Keywords List', 'Sec 3 A-Math: Trigonometry Drill', 'O-Level English: Editing Practice', 'Lower Sec Science: Lab Safety Notes'].map((file, i) => (
                            <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-200">
                               <span className="text-sm font-semibold text-slate-700">{file}</span>
                               <Button variant="outline" className="px-2 py-1 text-[10px] h-auto"><Download size={10} className="mr-1"/> PDF</Button>
                            </div>
                         ))}
                      </div>
                   </div>

                   <hr className="border-slate-100"/>

                   <div>
                      <h4 className="font-bold text-slate-700 mb-3 flex items-center"><FileText size={16} className="mr-2"/> Admin Templates</h4>
                      <div className="space-y-2">
                         {profile.isManaged ? (
                             <>
                                 <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded">
                                    <span className="text-sm text-slate-600">Lesson Plan Template (Weekly)</span>
                                    <span className="text-xs text-slate-400">PDF</span>
                                 </div>
                                 <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded">
                                    <span className="text-sm text-slate-600">Monthly Progress Report</span>
                                    <span className="text-xs text-slate-400">PDF</span>
                                 </div>
                             </>
                         ) : (
                             <>
                                 <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded">
                                    <span className="text-sm text-slate-600">Private Invoice Template (For Parents)</span>
                                    <span className="text-xs text-slate-400 flex items-center"><Receipt size={10} className="mr-1"/> EXCEL</span>
                                 </div>
                                 <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded">
                                    <span className="text-sm text-slate-600">Lesson Schedule Tracker</span>
                                    <span className="text-xs text-slate-400">PDF</span>
                                 </div>
                             </>
                         )}
                      </div>
                   </div>
                </div>
             </Card>
          )}

          {activeTab === 'engagement' && (
             <Card title={profile.isManaged ? "Managed Plan: Payroll Hub" : "Referral Plan: Commission Status"}>
                {profile.isManaged ? (
                  // MANAGED VIEW
                  <div className="space-y-6">
                     <div className="bg-blue-50 border-l-4 border-secondary p-4 rounded-r">
                        <div className="flex items-start">
                           <Landmark className="text-secondary mr-3 mt-1" />
                           <div>
                              <h4 className="font-bold text-secondary">Managed Status: Active</h4>
                              <p className="text-sm text-slate-600">You are an active partner. Integrated Learnings handles all billing. You receive monthly payouts.</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200 p-4 rounded-lg">
                           <h5 className="font-bold text-slate-700 mb-2 flex items-center"><Calendar size={14} className="mr-2"/> Next Payout</h5>
                           <p className="text-2xl font-bold text-primary">7th {new Date().toLocaleString('default', { month: 'short' })}</p>
                           <p className="text-xs text-slate-400">Covers lessons from previous month</p>
                        </div>
                        <div className="bg-white border border-slate-200 p-4 rounded-lg">
                           <h5 className="font-bold text-slate-700 mb-2 flex items-center"><Shield size={14} className="mr-2"/> Protection</h5>
                           <p className="font-bold text-green-600 flex items-center"><CheckCircle2 size={16} className="mr-1"/> Active</p>
                           <p className="text-xs text-slate-400">Late cancellation fees covered by Agency</p>
                        </div>
                     </div>
                  </div>
                ) : (
                  // REFERRAL VIEW
                  <div className="space-y-6">
                     <div className="bg-emerald-50 border-l-4 border-emerald-600 p-4 rounded-r">
                        <div className="flex items-start">
                           <User className="text-emerald-700 mr-3 mt-1" />
                           <div>
                              <h4 className="font-bold text-emerald-800">Referral Status: Independent</h4>
                              <p className="text-sm text-slate-600">You collect your own fees starting from Week 3 of any new assignment.</p>
                           </div>
                        </div>
                     </div>

                     <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-sm text-slate-600">Commission Timeline (New Assignment)</div>
                        <div className="p-4 flex items-center justify-between text-center relative">
                           {/* Line */}
                           <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10"></div>
                           
                           <div className="bg-white p-2">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs mx-auto mb-1">W1</div>
                              <p className="text-[10px] font-bold text-slate-400">Agency</p>
                           </div>
                           <div className="bg-white p-2">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs mx-auto mb-1">W2</div>
                              <p className="text-[10px] font-bold text-slate-400">Agency</p>
                           </div>
                           <div className="bg-white p-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs mx-auto mb-1 border-2 border-emerald-500">W3</div>
                              <p className="text-[10px] font-bold text-emerald-600">YOU Start</p>
                           </div>
                           <div className="bg-white p-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs mx-auto mb-1">W4</div>
                              <p className="text-[10px] font-bold text-emerald-600">YOU</p>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
             </Card>
          )}

          {activeTab === 'jobs' && (
             <Card title="Job Board">
               {/* Filter */}
               <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                  <Filter size={16} className="text-slate-400" />
                  {['All', 'East', 'West', 'North', 'Central', 'Online'].map(r => (
                     <button 
                        key={r}
                        onClick={() => setJobFilter(r)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${jobFilter === r ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                     >
                        {r}
                     </button>
                  ))}
               </div>

               <div className="space-y-4">
                 {/* Mock Jobs to make platform look active */}
                 {[
                   { level: "Sec 4 G3 (Express)", subject: "Pure Chemistry", loc: "Tampines (East)", region: "East", rate: "$60/hr", status: "Urgent" },
                   { level: "P6 Standard", subject: "Mathematics", loc: "Bishan (Central)", region: "Central", rate: "$50/hr", status: "New" },
                   { level: "JC 1", subject: "H2 Economics", loc: "Online / Zoom", region: "Online", rate: "$75/hr", status: "Open" },
                   { level: "Sec 2 G2 (NA)", subject: "English", loc: "Jurong West", region: "West", rate: "$45/hr", status: "Open" },
                   { level: "P4 Standard", subject: "Science", loc: "Yishun (North)", region: "North", rate: "$40/hr", status: "New" },
                 ].filter(j => jobFilter === 'All' || j.region === jobFilter).map((job, i) => (
                   <div key={i} className="flex justify-between items-center border border-slate-100 p-4 rounded-lg hover:shadow-md transition bg-white">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${job.status === 'Urgent' ? 'bg-red-500' : 'bg-green-500'}`}>{job.status}</span>
                           <h4 className="font-bold text-slate-800">{job.level} - {job.subject}</h4>
                        </div>
                        <div className="flex items-center text-slate-500 text-xs space-x-3">
                           <span className="flex items-center"><MapPin size={12} className="mr-1" /> {job.loc}</span>
                           <span className="flex items-center"><DollarSign size={12} className="mr-1" /> {job.rate}</span>
                        </div>
                      </div>
                      <Button className="py-2 px-4 text-xs" onClick={() => alert("Application Submitted! Agency will contact you.")}>Apply</Button>
                   </div>
                 ))}
                 
                 {/* Empty State for Filter */}
                 {[
                   { level: "Sec 4 G3 (Express)", subject: "Pure Chemistry", loc: "Tampines (East)", region: "East", rate: "$60/hr", status: "Urgent" },
                   { level: "P6 Standard", subject: "Mathematics", loc: "Bishan (Central)", region: "Central", rate: "$50/hr", status: "New" },
                   { level: "JC 1", subject: "H2 Economics", loc: "Online / Zoom", region: "Online", rate: "$75/hr", status: "Open" },
                   { level: "Sec 2 G2 (NA)", subject: "English", loc: "Jurong West", region: "West", rate: "$45/hr", status: "Open" },
                   { level: "P4 Standard", subject: "Science", loc: "Yishun (North)", region: "North", rate: "$40/hr", status: "New" },
                 ].filter(j => jobFilter === 'All' || j.region === jobFilter).length === 0 && (
                    <div className="text-center py-8 text-slate-400 italic">No jobs found in this region.</div>
                 )}
               </div>
               <p className="text-xs text-slate-400 mt-4 text-center">New jobs are posted daily at 10am.</p>
             </Card>
          )}
        </div>
      </div>
    </Section>
  );
};
