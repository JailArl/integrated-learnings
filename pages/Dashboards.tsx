
import React, { useState, useEffect } from 'react';
import { Section, Button, Card } from '../components/Components';
import { StudentProfile, TutorProfile } from '../types';
import { TUTOR_CONTRACT_TEXT, TUTOR_SCENARIO_QUESTIONS, POLICY_CONTENT } from '../constants';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, CreditCard, Calendar, BookOpen, Cpu, Shield, AlertCircle, User, MapPin, DollarSign, Clock, Briefcase, FileCheck, Landmark, CheckCircle2, Wallet, QrCode, FileText, Download, Filter, Edit2, PlusCircle, X, Search, File, Receipt, MessageSquare, Users } from 'lucide-react';
import { submitTutorForm } from '../services/formHandler';


// --- TOAST NOTIFICATION COMPONENT ---
const Toast: React.FC<{ message: string; type: 'success' | 'error'; visible: boolean }> = ({ message, type, visible }) => {
  if (!visible) return null;
  return (
    <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-bold text-sm shadow-lg z-50 animate-fade-in ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`}>
      {message}
    </div>
  );
};

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
  onLogin: (profile?: StudentProfile | TutorProfile) => void; 
  onSwitchToSignup: () => void; 
  title: string;
}> = ({ onLogin, onSwitchToSignup, title }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    
    // Check for admin login
    if (email.toLowerCase() === 'admin' && password === 'admin123') {
      navigate('/admin');
      return;
    }
    
    // Regular user login
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    
    onLogin();
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <div className="text-center mb-8">
        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <p className="text-slate-500 text-sm mt-1">Welcome back to Integrated Learnings</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-700">Email or Username</label>
          <input 
            type="text" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition" 
            placeholder="you@example.com or admin" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1 text-slate-700">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition" 
            placeholder="••••••••" 
          />
        </div>
        <div className="text-right">
          <button className="text-xs text-secondary hover:underline">Forgot Password?</button>
        </div>
        <Button onClick={handleLogin} className="w-full py-3 shadow-lg">Sign In</Button>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-sm text-slate-600 mb-4">Don't have an account yet?</p>
        <Button onClick={onSwitchToSignup} variant="outline" className="w-full py-2 text-sm">Create New Account</Button>
      </div>
    </div>
  );
};

// --- PARENT FLOW COMPONENTS ---

const ParentSignupWizard: React.FC<{ 
  onComplete: (profile: StudentProfile) => void;
  onSwitchToLogin: () => void;
}> = ({ onComplete, onSwitchToLogin }) => {
  const [parentName, setParentName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Demo Profile
  const demoProfile: StudentProfile = {
      parentName: "Sarah Tan",
      name: "Demo Student",
      level: "Secondary 3",
      subjects: ["English", "A-Math"],
      weaknesses: "Algebra & Time Management",
      characterTraits: ["Visual Learner", "Anxious"],
      learningStyle: "Visual",
      status: "active"
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!parentName || !email || !phone || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    // For demo purposes, just complete
    setTimeout(() => {
      setLoading(false);
      onComplete({ ...demoProfile, parentName });
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold text-primary mb-2">Create Parent Account</h2>
      <p className="text-slate-600 text-sm mb-6">Quick signup - child details collected later</p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">Full Name *</label>
          <input 
            type="text"
            value={parentName} 
            onChange={e => setParentName(e.target.value)} 
            className="w-full border p-2 rounded" 
            placeholder="Enter your full name" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold mb-1">Email Address *</label>
          <input 
            type="email"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full border p-2 rounded" 
            placeholder="your.email@example.com" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold mb-1">Phone Number *</label>
          <input 
            type="tel"
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            className="w-full border p-2 rounded" 
            placeholder="+65 XXXX XXXX" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold mb-1">Password *</label>
          <input 
            type="password"
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full border p-2 rounded" 
            placeholder="Minimum 6 characters" 
          />
          <p className="text-xs text-slate-500 mt-1">Must be at least 6 characters long</p>
        </div>
        
        <div>
          <label className="block text-sm font-bold mb-1">Confirm Password *</label>
          <input 
            type="password"
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            className="w-full border p-2 rounded" 
            placeholder="Re-enter your password" 
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
          <p className="text-xs text-blue-800">
            <strong>ℹ️ What's Next?</strong><br />
            After signup, you'll provide details about your child and tutoring needs. This helps us find the perfect match!
          </p>
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={loading} 
          className="w-full mt-4"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
        
        <div className="text-center pt-4 mt-4 border-t border-slate-100">
          <p className="text-sm text-slate-600">Already have an account? <button onClick={onSwitchToLogin} className="text-secondary font-bold hover:underline">Sign In here</button></p>
        </div>
      </div>
    </div>
  );
};

const TutorSignupWizard: React.FC<{
  onComplete: (profile: TutorProfile) => void;
  onSwitchToLogin: () => void;
}> = ({ onComplete, onSwitchToLogin }) => {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [preferredFormat, setPreferredFormat] = useState<'zoom' | 'inPerson' | 'either'>('either');
  const [toast, setToast] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });
  const [loading, setLoading] = useState(false);

  const nextStep = () => setStep(step + 1);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast({ ...toast, visible: false }), 3000);
  };

  const handleTutorSubmit = async () => {
    if (!fullName || !email || !phone || !qualification) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    setLoading(true);
    const result = await submitTutorForm({
      fullName,
      email,
      phone,
      qualification,
      experienceYears,
      subjects: subjects.length > 0 ? subjects : ['Mathematics'],
      levels: levels.length > 0 ? levels : ['Secondary 3'],
      teachingPhilosophy: 'Personalized learning approach',
      availability: 'Flexible',
      preferredFormat,
    });
    setLoading(false);
    if (result.success) {
      showToast('Application submitted! We will review and contact you within 48 hours.', 'success');
      setTimeout(() => {
        onComplete({ name: fullName, qualification, experienceYears, subjects, status: 'pending', isManaged: false, scenarioAnswers: {} });
      }, 2000);
    } else {
      showToast(result.error || 'Failed to submit application', 'error');
    }
  };

  // Demo Profile
  const demoProfile: TutorProfile = {
      name: "Demo Tutor",
      qualification: "NUS Math Degree",
      experienceYears: 5,
      subjects: ["Math", "A-Math"],
      scenarioAnswers: {1: "B", 2: "C"},
      isManaged: false,
      status: "pending"
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 relative">
       <Toast message={toast.message} type={toast.type} visible={toast.visible} />
       {/* Preview Button */}
       <div className="absolute top-4 right-4">
         <button onClick={() => onComplete(demoProfile)} className="text-xs font-bold text-slate-400 hover:text-secondary underline bg-slate-50 px-2 py-1 rounded">
             Skip (Preview Mode)
         </button>
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center text-sm font-bold text-slate-400 mb-2">
          <span className={step >= 1 ? "text-secondary" : ""}>1. Profile</span>
          <span className={step >= 2 ? "text-secondary" : ""}>2. Subjects</span>
          <span className={step >= 3 ? "text-secondary" : ""}>3. Agreement</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-primary mb-6">Tutor Application</h2>

      {step === 1 && (
        <div className="space-y-4">
          <div><label className="block text-sm font-bold mb-1">Full Name</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full border p-2 rounded" placeholder="As per NRIC" /></div>
          <div><label className="block text-sm font-bold mb-1">Email</label><input value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" placeholder="your@email.com" /></div>
          <div><label className="block text-sm font-bold mb-1">Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className="w-full border p-2 rounded" placeholder="+65 9xxx xxxx" type="tel" /></div>
          <div><label className="block text-sm font-bold mb-1">Highest Qualification</label><input value={qualification} onChange={e => setQualification(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g. Bachelor of Science (NUS)" /></div>
          <div><label className="block text-sm font-bold mb-1">Years of Experience</label><input type="number" value={experienceYears} onChange={e => setExperienceYears(parseInt(e.target.value) || 0)} className="w-full border p-2 rounded" placeholder="0" /></div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-900 text-sm mb-2">📄 Certificate Upload Later</h4>
            <p className="text-xs text-blue-800">You can upload your qualification certificates after account creation in your tutor dashboard. This helps us verify your credentials.</p>
          </div>
          
          <div className="pt-4 border-t border-slate-100 mt-4">
             <p className="text-sm text-slate-600 mb-2">Already have an account? <button onClick={onSwitchToLogin} className="text-secondary font-bold hover:underline">Login here</button></p>
          </div>
          <Button onClick={nextStep} className="w-full mt-4">Next: Teaching Scenarios</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-slate-500 text-sm mb-4">What subjects and levels do you teach?</p>
          <div>
            <label className="block text-sm font-bold mb-2">Subjects (comma-separated)</label>
            <input 
              value={subjects.join(', ')} 
              onChange={e => setSubjects(e.target.value.split(',').map(s => s.trim()))} 
              className="w-full border p-2 rounded" 
              placeholder="e.g. Mathematics, A-Math, Physics" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Levels (comma-separated)</label>
            <input 
              value={levels.join(', ')} 
              onChange={e => setLevels(e.target.value.split(',').map(s => s.trim()))} 
              className="w-full border p-2 rounded" 
              placeholder="e.g. Secondary 3, Secondary 4, JC" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Preferred Format</label>
            <select value={preferredFormat} onChange={e => setPreferredFormat(e.target.value as any)} className="w-full border p-2 rounded">
              <option value="zoom">Zoom (Online)</option>
              <option value="inPerson">In-Person</option>
              <option value="either">Either</option>
            </select>
          </div>
          <Button onClick={nextStep} className="w-full mt-4">Next: Agreement</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
           <h3 className="font-bold text-lg">Referral Partnership Agreement</h3>
           
           <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
             <p className="text-sm text-amber-900"><strong>Important:</strong> Please read the agreement carefully. By submitting, you accept all terms and commit to maintaining the highest standards of professionalism.</p>
           </div>
           
           <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded h-32 overflow-y-auto border border-slate-200">
              <pre className="whitespace-pre-wrap font-sans">{TUTOR_CONTRACT_TEXT}</pre>
           </div>
           
           <label className="flex items-center gap-2">
              <input type="checkbox" required />
              <span className="text-sm font-bold text-slate-700">I have read and agree to the Referral Partnership Agreement</span>
           </label>

           <div className="flex gap-3">
             <Button onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button>
             <Button onClick={handleTutorSubmit} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">{loading ? 'Submitting...' : 'Submit Application'}</Button>
           </div>
        </div>
      )}
    </div>
  );
};

export const ParentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Create a minimal profile for logged-in parent
  const createLoginProfile = (data?: StudentProfile) => {
    if (data) {
      setProfile(data);
    } else {
      // Minimal profile for login - no student data collected
      setProfile({
        parentName: 'Sarah Tan',
        name: 'Parent',
        level: '',
        subjects: [],
        weaknesses: '',
        characterTraits: [],
        learningStyle: 'Visual',
        status: 'active'
      });
    }
  };

  if (!profile) {
    return (
      <Section className="min-h-[80vh] flex items-center justify-center">
        {authMode === 'login' ? (
          <LoginScreen 
            title="Parent / Student Login" 
            onLogin={createLoginProfile} 
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
             <p className="font-bold text-primary">{profile.parentName || profile.name}</p>
          </div>
       </div>
       
       <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
             {/* Matched Tutor Widget */}
             <Card title="Your Matched Tutor">
                <div className="bg-gradient-to-br from-blue-50 to-white border border-green-200 rounded-lg p-6">
                   <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                         <div className="bg-gradient-to-br from-secondary to-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">ML</div>
                         <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800">Mr. Lee Wei Ming</h3>
                            <p className="text-sm text-secondary font-bold mb-1">Mathematics Specialist</p>
                            <p className="text-xs text-slate-600">⭐ 4.9/5.0 • 8 years experience</p>
                         </div>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">MATCHED</span>
                   </div>
                   <div className="bg-white rounded p-3 mb-4 border border-slate-100">
                      <div className="text-xs space-y-2">
                         <div className="flex items-center gap-2">
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">✓ VETTED</span>
                            <p><strong>Credentials Verified</strong></p>
                         </div>
                         <p><strong>Subjects:</strong> A-Math, E-Math</p>
                         <p><strong>Your Child's Level:</strong> Secondary 3</p>
                         <p><strong>Lesson Rate:</strong> $50/hour • One-to-One</p>
                         <p className="text-slate-600"><strong>Commitment:</strong> Sustained engagement for measurable improvement</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-secondary hover:bg-blue-800 text-white rounded-lg font-bold text-sm transition">💬 Message</button>
                      <button className="flex-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition">View Profile</button>
                   </div>
                </div>
             </Card>

             {/* Request Status Timeline */}
             <Card title="Your Matching Timeline">
                <div className="space-y-3">
                   <div className="flex gap-3">
                      <div className="bg-slate-100 text-slate-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                      <div>
                         <p className="font-bold text-slate-800">Tutor Match (Direct)</p>
                         <p className="text-xs text-slate-600">Jan 10, 2026 • Matched based on your student profile and learning needs</p>
                         <p className="text-xs text-slate-500 mt-1 italic">Diagnostic matching is included to improve fit. Optional live diagnostic sessions are available below.</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">✓</div>
                      <div>
                         <p className="font-bold text-slate-800">Tutor Profile Reviewed & Confirmed</p>
                         <p className="text-xs text-slate-600">Jan 12, 2026 • Credentials verified. Teaching approach matches your child's needs.</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold text-sm">→</div>
                      <div>
                         <p className="font-bold text-slate-800">First Lesson Scheduled</p>
                         <p className="text-xs text-slate-600">In progress: Tutor will confirm date/time. You'll receive details within 24 hours.</p>
                      </div>
                   </div>
                </div>
                
                 <div className="mt-6 pt-6 border-t border-slate-200">
                   <h4 className="font-bold text-slate-800 mb-3 text-sm">Optional Live Diagnostic Session</h4>
                   <p className="text-xs text-slate-600 mb-3">A deeper session to clarify learning needs before lessons begin.</p>
                   <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" className="text-xs h-auto py-2">Zoom Session (30 min)</Button>
                      <Button variant="outline" className="text-xs h-auto py-2">1-to-1 In-Person</Button>
                   </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                   <Button to="/pricing" variant="outline" className="w-full text-sm">+ Request Another Tutor</Button>
                </div>
             </Card>

             {/* Specialized Services */}
             <Card title="Specialized Services">
                <div className="grid md:grid-cols-2 gap-4">
                   <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:bg-amber-100/30" onClick={() => window.location.href = '#/coursework'}>
                      <h4 className="font-bold text-amber-900 mb-2">📐 O-Level Coursework Support</h4>
                      <p className="text-sm text-amber-800 mb-3">D&T, Art, FCE portfolio guidance. Tutors help with 70% coursework weightage, from concept to final submission.</p>
                      <button className="text-xs font-bold text-amber-700 hover:text-amber-900">Learn More →</button>
                   </div>
                   <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:bg-green-100/30" onClick={() => window.location.href = '#/holiday'}>
                      <h4 className="font-bold text-green-900 mb-2">⚡ Holiday Intensive Programs</h4>
                      <p className="text-sm text-green-800 mb-3">Focused learning during school breaks. Boost grades with 2-week or 4-week custom programs tailored to exam prep or skill building.</p>
                      <button className="text-xs font-bold text-green-700 hover:text-green-900">View Programs →</button>
                   </div>
                   <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:bg-purple-100/30" onClick={() => window.location.href = '#/specialized-request'}>
                      <h4 className="font-bold text-purple-900 mb-2">🎯 Custom Learning Plans</h4>
                      <p className="text-sm text-purple-800 mb-3">Exam preparation, enrichment subjects, or specialized skills. Tell us what you need—we'll find or create the right solution.</p>
                      <button className="text-xs font-bold text-purple-700 hover:text-purple-900">Request a Plan →</button>
                   </div>
                </div>
             </Card>
          </div>
          
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                   <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg font-bold text-sm text-slate-700 flex items-center">
                      <FileCheck size={16} className="mr-2" /> Month 1 Payment (Agency)
                   </button>
                   <button onClick={() => window.location.href = '#/calendar'} className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg font-bold text-sm text-slate-700 flex items-center">
                      <Calendar size={16} className="mr-2" /> Schedule Lesson
                   </button>
                   <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg font-bold text-sm text-slate-700 flex items-center">
                      <MessageSquare size={16} className="mr-2" /> Message Tutor
                   </button>
                   <button onClick={() => setProfile(null)} className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50 rounded-lg font-bold text-sm flex items-center mt-4 border-t border-slate-100">
                      Sign Out
                   </button>
                </div>
             </div>
             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 text-sm mb-2">💳 Payment Structure</h4>
                <p className="text-xs text-blue-800 mb-3"><strong>Month 1:</strong> Pay agency matching fee (50% of tuition). <strong>Month 2+:</strong> Pay tutor directly via PayNow/bank transfer.</p>
                <Button to="/contact" variant="outline" className="w-full text-xs h-auto py-2">Questions? Contact Us</Button>
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
  const [showUploadModal, setShowUploadModal] = useState(false); // Upload Modal State
  const [isVerified, setIsVerified] = useState(false); // Verification Status

  // Demo Profile
  const demoProfile: TutorProfile = {
      name: "Demo Tutor",
      qualification: "NUS Math Degree",
      experienceYears: 5,
      subjects: ["Math", "A-Math"],
      scenarioAnswers: {},
      status: "active",
      isManaged: false
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
     const [certFiles, setCertFiles] = useState<File[]>([]);

     const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
       const files = e.target.files;
       if (files) {
         setCertFiles(Array.from(files));
       }
     };

     return (
        <Section className="min-h-[70vh] flex flex-col items-center justify-center">
           <div className="max-w-2xl w-full">
              <div className="bg-amber-50 border border-amber-200 p-8 rounded-xl mb-8">
                 <div className="flex items-start gap-4">
                    <div className="bg-amber-100 p-4 rounded-full flex-shrink-0">
                       <Clock size={32} className="text-amber-600" />
                    </div>
                    <div className="text-left">
                       <h2 className="text-2xl font-bold text-slate-800 mb-2">Complete Your Tutor Profile</h2>
                       <p className="text-slate-600 mb-3">
                          Welcome, <strong>{profile.name}</strong>! Your tutor application has been received. To start receiving qualified student opportunities, please upload your teaching credentials.
                       </p>
                       <p className="text-sm text-slate-600 mb-3">
                          <strong>Why this matters:</strong> We verify all tutors to ensure parents can trust our community with their child's education. Your credentials help us match you with the right students.
                       </p>
                       <div className="text-xs text-amber-900 bg-amber-100 px-3 py-2 rounded inline-block">
                          ⏱️ Typical verification: <strong>24-48 hours</strong> • You'll be notified via WhatsApp
                       </div>
                    </div>
                 </div>
              </div>

              <Card title="📄 Upload Your Certificates">
                 <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-secondary hover:bg-secondary hover:bg-opacity-5 transition-all">
                       <FileText size={40} className="mx-auto text-slate-400 mb-3" />
                       <input 
                         type="file" 
                         multiple
                         accept=".pdf,.jpg,.jpeg,.png"
                         className="w-full opacity-0 absolute cursor-pointer"
                         onChange={handleCertUpload}
                         id="certUpload"
                       />
                       <label htmlFor="certUpload" className="cursor-pointer block">
                          <p className="font-bold text-slate-700">Click to select files or drag and drop</p>
                          <p className="text-xs text-slate-500 mt-1">PDF, JPG, or PNG (max 5MB each)</p>
                       </label>
                    </div>

                    {certFiles.length > 0 && (
                       <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-bold text-green-900 text-sm mb-2">✓ Files Selected:</h4>
                          <ul className="space-y-1 text-sm text-green-800">
                             {certFiles.map((file, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                   <CheckCircle2 size={14} />
                                   {file.name} ({(file.size / 1024).toFixed(0)} KB)
                                </li>
                             ))}
                          </ul>
                       </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <p className="text-sm text-slate-700 mb-2">
                          <strong>What to upload:</strong>
                       </p>
                       <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                          <li>Highest qualification certificate (Degree, Diploma, etc.)</li>
                          <li>Teaching qualification or relevant certifications</li>
                          <li>Any subject-specific qualifications</li>
                       </ul>
                    </div>

                    <div className="flex gap-3 mt-6">
                       <Button 
                         onClick={() => {
                           if (certFiles.length > 0) {
                             // Update profile status to 'active' after upload
                             setProfile({...profile, status: 'active'});
                           }
                         }}
                         disabled={certFiles.length === 0}
                         className="flex-1"
                       >
                         Submit Certificates
                       </Button>
                       <Button 
                         onClick={() => setProfile(null)}
                         variant="outline"
                         className="flex-1"
                       >
                         Back
                       </Button>
                    </div>
                 </div>
              </Card>

              <p className="text-center text-sm text-slate-500 mt-8">
                 Typical verification time: <strong>24-48 hours</strong>. You'll be notified via WhatsApp once approved.
              </p>
           </div>
        </Section>
     );
  }

  return (
    <Section>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Tutor Portal</h1>
        <div className="text-right">
          <p className="font-bold text-primary mt-1">{profile.name}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center ${activeTab === 'overview' ? 'bg-secondary text-white' : 'bg-white text-slate-600'}`}>
              <Briefcase size={16} className="mr-2" /> Overview
            </button>
            <button onClick={() => setActiveTab('jobs')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center ${activeTab === 'jobs' ? 'bg-secondary text-white' : 'bg-white text-slate-600'}`}>
              <Search size={16} className="mr-2" /> Job Board
            </button>
            <button onClick={() => setActiveTab('students')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center ${activeTab === 'students' ? 'bg-secondary text-white' : 'bg-white text-slate-600'}`}>
              <Users size={16} className="mr-2" /> My Students
            </button>
            <button onClick={() => setActiveTab('earnings')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center ${activeTab === 'earnings' ? 'bg-secondary text-white' : 'bg-white text-slate-600'}`}>
              <DollarSign size={16} className="mr-2" /> Earnings
            </button>
            <button onClick={() => setActiveTab('profile')} className={`w-full text-left px-4 py-3 rounded-lg font-bold flex items-center ${activeTab === 'profile' ? 'bg-secondary text-white' : 'bg-white text-slate-600'}`}>
              <User size={16} className="mr-2" /> My Profile
            </button>
            <button onClick={() => setProfile(null)} className="w-full text-left px-4 py-3 rounded-lg font-bold text-red-500 hover:bg-red-50 mt-8">Sign Out</button>
          </nav>
        </div>

        <div className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <Card title="Your Verification Status">
                {isVerified ? (
                  <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                    <h4 className="text-sm font-bold text-green-900 uppercase mb-2">✓ Credentials Verified</h4>
                    <p className="text-sm text-green-800 mb-4">
                      Your qualifications have been approved by our admin team. You're now visible to parents and can start receiving tutoring opportunities.
                    </p>
                    <details className="text-xs text-green-700">
                      <summary className="cursor-pointer font-bold mb-2">View your verified credentials</summary>
                      <div className="mt-2 ml-4 space-y-1">
                        <p>• Degree Certificate (NUS) - Verified ✓</p>
                        <p>• Teaching Qualification - Verified ✓</p>
                      </div>
                    </details>
                    <div className="mt-4 pt-4 border-t border-green-200">
                       <Button variant="outline" className="text-xs h-auto py-2">Update Credentials</Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
                    <h4 className="text-sm font-bold text-amber-900 uppercase mb-2">⏳ Verification Pending</h4>
                    <p className="text-sm text-amber-800 mb-4">
                      Your application is being reviewed. We'll notify you via WhatsApp when your credentials are verified (typically 24-48 hours).
                    </p>
                    <Button 
                      onClick={() => setShowUploadModal(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-xs h-auto py-2"
                    >
                      Upload Additional Documents
                    </Button>
                  </div>
                )}
              </Card>

              <Card title="How to Get Started">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Wait for Verification</h4>
                      <p className="text-sm text-slate-600">Our team reviews your credentials. You'll be notified within 24-48 hours.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Browse the Job Board</h4>
                      <p className="text-sm text-slate-600">Check "Job Board" to see available tutoring requests filtered by region and subject.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Apply for Opportunities</h4>
                      <p className="text-sm text-slate-600">Our matching team reviews your profile and connects you with suitable students.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-secondary text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">4</div>
                    <div>
                      <h4 className="font-bold text-slate-800">Manage & Earn</h4>
                      <p className="text-sm text-slate-600">Log lessons, track earnings, and communicate with parents through your dashboard.</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title="Tutor Community Benefits">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">📊 No Ongoing Commissions</h4>
                    <p className="text-sm text-blue-800">One-time 50% referral fee for Month 1. From Month 2 onwards, you keep 100% of lesson fees.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">🎯 Quality Students</h4>
                    <p className="text-sm text-blue-800">We vet all parent requests. You only get matched with serious, committed families.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">📞 24/7 Support</h4>
                    <p className="text-sm text-blue-800">Our team handles admin, scheduling, and any issues. You focus on teaching.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 mb-2">⭐ Build Your Reputation</h4>
                    <p className="text-sm text-blue-800">Parent reviews and ratings help you attract premium opportunities and referrals.</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {activeTab === 'students' && (
            <Card title="My Active Students">
              <div className="space-y-4">
                {/* Mock Active Student */}
                <div className="flex justify-between items-start border p-4 rounded-lg bg-white border-slate-200 hover:shadow-md transition">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-secondary font-bold text-sm flex-shrink-0">JD</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-slate-800">John Doe</h4>
                      <p className="text-sm text-secondary font-bold">Secondary 3 • A-Math</p>
                      <div className="text-xs text-slate-600 space-y-1 mt-2 mb-3">
                        <p className="flex items-center"><Clock size={12} className="mr-2"/> Fridays, 5:00 PM</p>
                        <p className="flex items-center"><MapPin size={12} className="mr-2"/> Tampines St 32</p>
                        <p className="flex items-center"><BookOpen size={12} className="mr-2"/> 8 lessons completed this month</p>
                      </div>
                      <div className="mt-3 flex gap-2">
                         {profile.isManaged && (
                           <Button onClick={() => setShowLogModal(true)} className="py-1 px-3 text-xs h-auto bg-green-600 hover:bg-green-700 shadow-none"><PlusCircle size={12} className="mr-1"/> Log Lesson</Button>
                         )}
                         <Button variant="outline" className="py-1 px-3 text-xs h-auto">Student Profile</Button>
                         <Button variant="outline" className="py-1 px-3 text-xs h-auto flex items-center"><MessageSquare size={12} className="mr-1"/> Message</Button>
                      </div>
                    </div>
                  </div>
                  <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide whitespace-nowrap flex-shrink-0">Active</span>
                </div>
                
                <p className="text-slate-400 text-xs text-center pt-4 italic">Showing 1 active student. You can manage multiple students from this dashboard.</p>
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

          {/* UPLOAD CERTIFICATE MODAL */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                  <button onClick={() => setShowUploadModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                     <X size={20} />
                  </button>
                  <h3 className="text-xl font-bold text-primary mb-4 flex items-center"><FileText className="mr-2 text-secondary"/> Upload Certificates</h3>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-secondary hover:bg-secondary hover:bg-opacity-5 transition-all">
                       <FileText size={40} className="mx-auto text-slate-400 mb-3" />
                       <label htmlFor="certUploadModal" className="cursor-pointer block">
                          <p className="font-bold text-slate-700">Click to select files</p>
                          <p className="text-xs text-slate-500 mt-1">PDF, JPG, or PNG (max 5MB each)</p>
                       </label>
                       <input 
                         type="file" 
                         multiple
                         accept=".pdf,.jpg,.jpeg,.png"
                         className="hidden"
                         id="certUploadModal"
                       />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <p className="text-sm text-slate-700 mb-2">
                          <strong>What to upload:</strong>
                       </p>
                       <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                          <li>Highest qualification certificate</li>
                          <li>Teaching certifications (if any)</li>
                          <li>Subject-specific qualifications</li>
                       </ul>
                    </div>

                    <div className="flex gap-3">
                       <Button 
                         onClick={() => {
                           setShowUploadModal(false);
                           setIsVerified(true);
                           alert("Certificates uploaded! Verification in progress (24-48 hours)");
                         }}
                         className="flex-1"
                       >
                         Submit Certificates
                       </Button>
                       <Button 
                         onClick={() => setShowUploadModal(false)}
                         variant="outline"
                         className="flex-1"
                       >
                         Cancel
                       </Button>
                    </div>
                  </div>
               </div>
            </div>
          )}
          
          {activeTab === 'jobs' && (
             <div className="space-y-6">
               <Card title="Active Job Opportunities">
                 <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                    <h4 className="font-bold text-blue-900 text-sm mb-2">🔍 How Jobs Work</h4>
                    <p className="text-sm text-blue-800">Browse available tutoring requests from verified families. Click "Apply" to submit your interest. Our team reviews and connects you if it's a good fit.</p>
                 </div>

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
                     { level: "Sec 4 G3 (Express)", subject: "Pure Chemistry", loc: "Tampines (East)", region: "East", rate: "$60/hr", status: "Urgent", engagement: "Exam prep, 8 weeks starting Feb" },
                     { level: "P6 Standard", subject: "Mathematics", loc: "Bishan (Central)", region: "Central", rate: "$50/hr", status: "New", engagement: "Regular lessons, 2x/week" },
                     { level: "JC 1", subject: "H2 Economics", loc: "Online / Zoom", region: "Online", rate: "$75/hr", status: "Open", engagement: "1-on-1 tuition, flexible hours" },
                     { level: "Sec 2 G2 (NA)", subject: "English", loc: "Jurong West", region: "West", rate: "$45/hr", status: "Open", engagement: "Foundation building, 3x/week" },
                     { level: "P4 Standard", subject: "Science", loc: "Yishun (North)", region: "North", rate: "$40/hr", status: "New", engagement: "Regular lessons" },
                   ].filter(j => jobFilter === 'All' || j.region === jobFilter).map((job, i) => (
                     <div key={i} className="flex justify-between items-start border border-slate-100 p-4 rounded-lg hover:shadow-md transition bg-white">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${job.status === 'Urgent' ? 'bg-red-500' : 'bg-green-500'}`}>{job.status}</span>
                             <h4 className="font-bold text-slate-800">{job.level} • {job.subject}</h4>
                          </div>
                          <div className="text-xs text-slate-600 space-y-1 mb-3">
                             <p className="flex items-center"><MapPin size={12} className="mr-2" /> {job.loc}</p>
                             <p className="flex items-center"><Clock size={12} className="mr-2" /> {job.engagement}</p>
                             <p className="flex items-center"><DollarSign size={12} className="mr-2" /> {job.rate}</p>
                          </div>
                        </div>
                        <Button className="py-2 px-4 text-xs ml-4" onClick={() => alert("✅ Application Submitted!\n\nOur matching team will review your profile and reach out within 24 hours if it's a good fit. You'll receive details about the student and family.")}>Apply Now</Button>
                     </div>
                   ))}
                 </div>
                 <p className="text-xs text-slate-500 mt-4 text-center italic">New opportunities posted daily. Check back regularly or enable notifications above.</p>
               </Card>

               {/* Singapore Map */}
               <Card title="Tutoring Regions in Singapore">
                 <div className="bg-slate-50 p-6 rounded-lg">
                   <div className="relative max-w-md mx-auto">
                     {/* Simple Singapore Map Representation */}
                     <div className="grid grid-cols-3 gap-2 text-center">
                       {/* North */}
                       <div className="col-span-3 bg-purple-100 border-2 border-purple-300 rounded-lg p-4 hover:shadow-md transition cursor-pointer" onClick={() => setJobFilter('North')}>
                         <h4 className="font-bold text-purple-900">NORTH</h4>
                         <p className="text-xs text-purple-700 mt-1">Yishun, Woodlands, Sembawang</p>
                       </div>
                       
                       {/* Central */}
                       <div className="col-span-3 bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 hover:shadow-md transition cursor-pointer" onClick={() => setJobFilter('Central')}>
                         <h4 className="font-bold text-yellow-900">CENTRAL</h4>
                         <p className="text-xs text-yellow-700 mt-1">Bishan, Ang Mo Kio, Toa Payoh</p>
                       </div>
                       
                       {/* West and East */}
                       <div className="col-span-1 bg-blue-100 border-2 border-blue-300 rounded-lg p-4 hover:shadow-md transition cursor-pointer" onClick={() => setJobFilter('West')}>
                         <h4 className="font-bold text-blue-900">WEST</h4>
                         <p className="text-xs text-blue-700 mt-1">Jurong, CCK</p>
                       </div>
                       
                       <div className="col-span-1"></div>
                       
                       <div className="col-span-1 bg-green-100 border-2 border-green-300 rounded-lg p-4 hover:shadow-md transition cursor-pointer" onClick={() => setJobFilter('East')}>
                         <h4 className="font-bold text-green-900">EAST</h4>
                         <p className="text-xs text-green-700 mt-1">Tampines, Bedok</p>
                       </div>
                     </div>
                     
                     <div className="mt-4 p-3 bg-white rounded-lg border border-slate-200">
                       <p className="text-xs text-slate-600 text-center">
                         <strong>💡 Tip:</strong> Click on a region to filter jobs and plan your tutoring schedule!
                       </p>
                     </div>
                   </div>
                 </div>
               </Card>
             </div>
          )}

          {activeTab === 'earnings' && (
            <div className="space-y-6">
              <Card title="Your Earnings & Payouts">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-xs text-green-700 font-bold uppercase mb-1">This Month</p>
                    <p className="text-2xl font-bold text-green-900">$2,400</p>
                    <p className="text-xs text-green-700 mt-1">12 lessons • All from parents directly</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs text-blue-700 font-bold uppercase mb-1">Total Lifetime</p>
                    <p className="text-2xl font-bold text-blue-900">$18,600</p>
                    <p className="text-xs text-blue-700 mt-1">8 months active</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-xs text-slate-700 font-bold uppercase mb-1">New Students</p>
                    <p className="text-2xl font-bold text-slate-900">3</p>
                    <p className="text-xs text-slate-700 mt-1">Month 1 (agency gets 50%)</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                   <h4 className="font-bold text-blue-900 mb-3">💰 How Your Earnings Work</h4>
                   <ul className="text-sm text-blue-800 space-y-2">
                      <li>• <strong>Set Your Rate:</strong> You agree on hourly rate with parents during matching (e.g., $50/hr, $60/hr, $75/hr)</li>
                      <li>• <strong>Month 1 Referral Fee:</strong> We charge parents 50% of Month 1 fees as our matching service fee</li>
                      <li>• <strong>From Month 2 Onwards:</strong> You collect 100% of lesson fees directly from parents
                         <div className="mt-2 bg-white rounded p-3 text-xs border border-blue-200">
                            <strong>Example:</strong> You agree on $50/hr, student takes 2 hours/week<br/>
                            • Month 1 (4 weeks): Parent pays agency $200 (50% of $400)<br/>
                            • <strong className="text-green-700">Month 2+: You collect $400/month directly from parent</strong>
                         </div>
                      </li>
                      <li>• <strong>Payment Method:</strong> Coordinate directly with parents (PayNow, bank transfer, cash)</li>
                   </ul>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 font-bold text-sm text-slate-700 grid grid-cols-5 gap-2">
                    <span>Date</span>
                    <span>Student</span>
                    <span>Duration</span>
                    <span>Rate</span>
                    <span className="text-right">Amount</span>
                  </div>
                  {[
                    { date: 'Jan 10', student: 'John Doe', duration: '2h', rate: '$50/h', amount: '$100' },
                    { date: 'Jan 8', student: 'Jane Smith', duration: '1.5h', rate: '$60/h', amount: '$90' },
                    { date: 'Jan 5', student: 'John Doe', duration: '2h', rate: '$50/h', amount: '$100' },
                  ].map((record, i) => (
                    <div key={i} className="px-4 py-3 border-t border-slate-200 text-sm grid grid-cols-5 gap-2 hover:bg-slate-50 transition">
                      <span className="text-slate-600">{record.date}</span>
                      <span className="font-bold text-slate-800">{record.student}</span>
                      <span className="text-slate-600">{record.duration}</span>
                      <span className="text-secondary font-bold">{record.rate}</span>
                      <span className="text-right font-bold text-slate-900">{record.amount}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                   <Button className="w-full" onClick={() => window.location.href = '#/help/tax-info'}>Tax & Banking Information</Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <Card title="Your Tutor Profile">
                <div className="bg-white p-6 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-4">
                      <div className="bg-gradient-to-br from-secondary to-blue-600 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg">DT</div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">{profile.name}</h3>
                        <p className="text-sm text-slate-600 mb-1">{profile.qualification}</p>
                        <p className="text-sm text-slate-600 mb-2 flex items-center">
                          <span className="text-yellow-500 mr-2">⭐</span> 4.9/5.0 (47 parent reviews)
                        </p>
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">✓ Verified Tutor</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-secondary text-white rounded-lg font-bold text-sm hover:bg-blue-800 transition">Edit Profile</button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="border border-slate-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-slate-600 uppercase font-bold mb-1">Teaching Experience</p>
                      <p className="text-2xl font-bold text-slate-800">{profile.experienceYears}+ yrs</p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-slate-600 uppercase font-bold mb-1">Active Students</p>
                      <p className="text-2xl font-bold text-slate-800">3</p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-slate-600 uppercase font-bold mb-1">Lessons This Month</p>
                      <p className="text-2xl font-bold text-slate-800">12</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-bold text-slate-800 mb-2">Subjects & Levels</h4>
                    <div className="flex flex-wrap gap-2">
                      {profile.subjects.map(subject => (
                        <span key={subject} className="bg-secondary text-white text-sm font-bold px-3 py-1 rounded-full">{subject}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-blue-900 mb-2">Your Teaching Philosophy</h4>
                    <p className="text-sm text-blue-800">Strategic pedagogy over drilling. I focus on identifying knowledge gaps and building academic confidence. Every student learns differently—I tailor my approach to their strengths and learning style.</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h4 className="font-bold text-slate-800 mb-3">Why Parents Choose You</h4>
                    <ul className="text-sm text-slate-700 space-y-2">
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span><strong>Verified Credentials:</strong> Background checked and qualifications confirmed by our team</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span><strong>Trusted Track Record:</strong> 4.9/5 rating from 47 parents based on real feedback</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span><strong>Results-Focused:</strong> Known for improving student grades and confidence</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
};
