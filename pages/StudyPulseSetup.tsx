import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Crown, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { completeSetup, PLAN_LIMITS, type PlanType, type ExamType, type SetupPayload } from '../services/studyquest';

const LEVELS = [
  'Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6',
  'Secondary 1','Secondary 2','Secondary 3','Secondary 4','Secondary 5',
  'JC 1','JC 2',
];
const FREE_SUBJECTS = ['Math','Science','Chinese','English','Malay','Tamil','Other'];
const PREMIUM_SUBJECTS = ['Math','Science','Chinese'];

interface ChildForm {
  name: string;
  level: string;
  whatsapp: string;
  subjects: { name: string; examType: ExamType; examDate: string }[];
  commenceDate: string;
  studyDaysPerWeek: number;
  reminderTime: string;
  checkTime: string;
}

const emptyChild = (): ChildForm => ({
  name: '',
  level: '',
  whatsapp: '',
  subjects: [{ name: '', examType: 'normal', examDate: '' }],
  commenceDate: new Date().toISOString().split('T')[0],
  studyDaysPerWeek: 5,
  reminderTime: '16:00',
  checkTime: '21:00',
});

const StudyPulseSetup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Parent fields
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentWhatsapp, setParentWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Plan
  const [plan, setPlan] = useState<PlanType>(searchParams.get('plan') === 'premium' ? 'premium' : 'free');
  const limits = PLAN_LIMITS[plan];
  const availableSubjects = plan === 'free' ? FREE_SUBJECTS : PREMIUM_SUBJECTS;

  // Children
  const [children, setChildren] = useState<ChildForm[]>([emptyChild()]);

  const updateChild = (idx: number, patch: Partial<ChildForm>) => {
    setChildren((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  };

  const addChild = () => {
    if (children.length < limits.maxChildren) setChildren((prev) => [...prev, emptyChild()]);
  };

  const removeChild = (idx: number) => {
    if (children.length > 1) setChildren((prev) => prev.filter((_, i) => i !== idx));
  };

  const addSubject = (childIdx: number) => {
    const c = children[childIdx];
    if (c.subjects.length < limits.maxSubjects) {
      updateChild(childIdx, { subjects: [...c.subjects, { name: '', examType: 'normal', examDate: '' }] });
    }
  };

  const removeSubject = (childIdx: number, subIdx: number) => {
    const c = children[childIdx];
    if (c.subjects.length > 1) {
      updateChild(childIdx, { subjects: c.subjects.filter((_, i) => i !== subIdx) });
    }
  };

  const updateSubject = (childIdx: number, subIdx: number, patch: Partial<ChildForm['subjects'][0]>) => {
    const c = children[childIdx];
    const newSubs = c.subjects.map((s, i) => (i === subIdx ? { ...s, ...patch } : s));
    updateChild(childIdx, { subjects: newSubs });
  };

  // Validation
  const validateStep1 = () => {
    if (!parentName.trim()) return 'Parent name is required';
    if (!parentEmail.trim() || !/\S+@\S+\.\S+/.test(parentEmail)) return 'Valid email is required';
    if (!parentWhatsapp.trim()) return 'WhatsApp number is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    return '';
  };

  const validateStep2 = () => {
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (!c.name.trim()) return `Child ${i + 1}: name is required`;
      if (!c.level) return `Child ${i + 1}: level is required`;
      if (!c.whatsapp.trim()) return `Child ${i + 1}: WhatsApp number is required`;
      for (let j = 0; j < c.subjects.length; j++) {
        if (!c.subjects[j].name) return `Child ${i + 1}, Subject ${j + 1}: select a subject`;
        if (!c.subjects[j].examDate) return `Child ${i + 1}, Subject ${j + 1}: exam date is required`;
      }
    }
    return '';
  };

  const next = () => {
    setError('');
    if (step === 1) {
      const e = validateStep1();
      if (e) { setError(e); return; }
    }
    if (step === 2) {
      const e = validateStep2();
      if (e) { setError(e); return; }
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const back = () => { setError(''); setStep((s) => Math.max(s - 1, 1)); };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      // Sign up or get existing user
      if (!supabase) { setError('Supabase not configured'); setLoading(false); return; }

      let userId: string;
      // Try sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: parentEmail,
        password,
        options: { data: { full_name: parentName, role: 'parent' } },
      });

      if (signUpError) {
        // If already exists, try sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: parentEmail,
          password,
        });
        if (signInError) { setError('Account issue: ' + signInError.message); setLoading(false); return; }
        userId = signInData.user!.id;
      } else {
        userId = signUpData.user!.id;
      }

      const payload: SetupPayload = {
        parentName,
        parentEmail,
        parentWhatsapp,
        planType: plan,
        children: children.map((c) => ({
          name: c.name,
          level: c.level,
          whatsapp: c.whatsapp,
          subjects: c.subjects,
          commenceDate: c.commenceDate,
          studyDaysPerWeek: c.studyDaysPerWeek,
          reminderTime: c.reminderTime,
          checkTime: c.checkTime,
        })),
      };

      const ok = await completeSetup(userId, payload);
      if (!ok) { setError('Setup failed. Please try again.'); setLoading(false); return; }

      navigate('/studypulse/app');
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    }
    setLoading(false);
  };

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';
  const labelCls = 'block text-xs font-bold uppercase tracking-[0.12em] text-slate-500 mb-1.5';

  return (
    <div className="min-h-screen bg-[#faf8f4] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate('/studypulse')} className="mb-4 inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-700">
            <ArrowLeft size={16} className="mr-1" /> Back to Overview
          </button>
          <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">Set Up Study Monitoring</h1>
          <p className="mt-2 text-sm text-slate-600">Only parents register. Children interact via WhatsApp later.</p>
        </div>

        {/* Steps indicator */}
        <div className="mb-8 flex gap-2">
          {['Parent Info', 'Children & Subjects', 'Review & Confirm'].map((label, i) => (
            <div key={label} className={`flex-1 rounded-full py-2 text-center text-xs font-bold ${step > i + 1 ? 'bg-emerald-100 text-emerald-700' : step === i + 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-400'}`}>
              {step > i + 1 ? <Check size={14} className="inline" /> : null} {label}
            </div>
          ))}
        </div>

        {/* Plan selector */}
        <div className="mb-6 flex gap-3">
          <button onClick={() => { setPlan('free'); setChildren((prev) => prev.slice(0, 1).map((c) => ({ ...c, subjects: c.subjects.slice(0, 1) }))); }} className={`flex-1 rounded-xl border-2 p-4 text-left transition ${plan === 'free' ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50'}`}>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Free</p>
            <p className="mt-1 text-lg font-black text-slate-900">$0<span className="text-sm font-normal text-slate-400">/mo</span></p>
            <p className="mt-1 text-xs text-slate-500">1 child · 1 subject · weekly</p>
          </button>
          <button onClick={() => setPlan('premium')} className={`flex-1 rounded-xl border-2 p-4 text-left transition ${plan === 'premium' ? 'border-amber-400 bg-amber-50' : 'border-slate-200 bg-slate-50'}`}>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-600">Premium</p>
            <p className="mt-1 text-lg font-black text-slate-900">$9.90<span className="text-sm font-normal text-slate-400">/mo</span></p>
            <p className="mt-1 text-xs text-slate-500">3 children · 3 subjects · daily</p>
          </button>
        </div>

        {/* ── STEP 1: Parent Info ── */}
        {step === 1 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-slate-900">Parent Details</h2>
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Full Name</label>
                <input className={inputCls} placeholder="Your full name" value={parentName} onChange={(e) => setParentName(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" placeholder="email@example.com" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp Number</label>
                <input className={inputCls} type="tel" placeholder="+65 9123 4567" value={parentWhatsapp} onChange={(e) => setParentWhatsapp(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input className={inputCls} type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Confirm Password</label>
                <input className={inputCls} type="password" placeholder="Re-enter your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Children & Subjects ── */}
        {step === 2 && (
          <div className="space-y-5">
            {children.map((child, ci) => (
              <div key={ci} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-black text-slate-900">Child {ci + 1}</h2>
                  {children.length > 1 && (
                    <button onClick={() => removeChild(ci)} className="text-xs font-semibold text-red-500 hover:text-red-700">
                      <Trash2 size={14} className="inline mr-1" /> Remove
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Child Name</label>
                    <input className={inputCls} placeholder="Child's name" value={child.name} onChange={(e) => updateChild(ci, { name: e.target.value })} />
                  </div>
                  <div>
                    <label className={labelCls}>Level</label>
                    <select className={inputCls} value={child.level} onChange={(e) => updateChild(ci, { level: e.target.value })}>
                      <option value="">Select level</option>
                      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Child WhatsApp Number</label>
                    <input className={inputCls} type="tel" placeholder="+65 8123 4567" value={child.whatsapp} onChange={(e) => updateChild(ci, { whatsapp: e.target.value })} />
                  </div>

                  {/* Subjects */}
                  <div className="border-t border-slate-100 pt-4">
                    <p className={labelCls}>Monitored Subjects</p>
                    {child.subjects.map((sub, si) => (
                      <div key={si} className="mb-3 rounded-xl bg-slate-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">Subject {si + 1}</span>
                          {child.subjects.length > 1 && (
                            <button onClick={() => removeSubject(ci, si)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                          )}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <select className={inputCls} value={sub.name} onChange={(e) => updateSubject(ci, si, { name: e.target.value })}>
                            <option value="">Subject</option>
                            {availableSubjects.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <select className={inputCls} value={sub.examType} onChange={(e) => updateSubject(ci, si, { examType: e.target.value as ExamType })}>
                            <option value="normal">Normal Exam</option>
                            <option value="major">Major Exam</option>
                          </select>
                          <input className={inputCls} type="date" value={sub.examDate} onChange={(e) => updateSubject(ci, si, { examDate: e.target.value })} />
                        </div>
                      </div>
                    ))}
                    {child.subjects.length < limits.maxSubjects && (
                      <button onClick={() => addSubject(ci)} className="mt-1 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800">
                        <Plus size={14} className="mr-1" /> Add Subject
                      </button>
                    )}
                  </div>

                  {/* Study settings */}
                  <div className="border-t border-slate-100 pt-4">
                    <p className={labelCls}>Study Settings</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Commence Date</label>
                        <input className={inputCls} type="date" value={child.commenceDate} onChange={(e) => updateChild(ci, { commenceDate: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Study Days / Week</label>
                        <select className={inputCls} value={child.studyDaysPerWeek} onChange={(e) => updateChild(ci, { studyDaysPerWeek: parseInt(e.target.value) })}>
                          {[1,2,3,4,5,6,7].map((n) => <option key={n} value={n}>{n} days</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>First Reminder Time</label>
                        <input className={inputCls} type="time" value={child.reminderTime} onChange={(e) => updateChild(ci, { reminderTime: e.target.value })} />
                      </div>
                      <div>
                        <label className={labelCls}>Check / Completion Time</label>
                        <input className={inputCls} type="time" value={child.checkTime} onChange={(e) => updateChild(ci, { checkTime: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {children.length < limits.maxChildren && (
              <button onClick={addChild} className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4 text-center text-sm font-semibold text-slate-500 transition hover:border-blue-400 hover:text-blue-600">
                <Plus size={16} className="mr-1 inline" /> Add Another Child
              </button>
            )}

            {plan === 'free' && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <Crown size={16} className="mr-2 inline text-amber-500" />
                Free plan supports 1 child and 1 subject. <button onClick={() => setPlan('premium')} className="font-bold underline">Upgrade to Premium</button> for more.
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Review ── */}
        {step === 3 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-black text-slate-900">Review Your Setup</h2>

            <div className="mb-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Plan</p>
              <p className="mt-1 text-base font-bold text-slate-900">{plan === 'free' ? 'Free — $0/mo' : plan === 'premium' ? 'Premium — $9.90/mo' : 'Family+ — $12.90/mo'}</p>
            </div>

            <div className="mb-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Parent</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{parentName}</p>
              <p className="text-sm text-slate-600">{parentEmail} · {parentWhatsapp}</p>
            </div>

            {children.map((c, i) => (
              <div key={i} className="mb-4 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Child {i + 1}</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{c.name} — {c.level}</p>
                <p className="text-sm text-slate-600">WhatsApp: {c.whatsapp}</p>
                <div className="mt-2 space-y-1">
                  {c.subjects.map((s, si) => (
                    <p key={si} className="text-xs text-slate-500">
                      {s.name} · {s.examType === 'major' ? 'Major' : 'Normal'} Exam · {s.examDate}
                    </p>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Starts {c.commenceDate} · {c.studyDaysPerWeek} days/wk · Reminder {c.reminderTime} · Check {c.checkTime}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

        {/* Navigation */}
        <div className="mt-6 flex gap-3">
          {step > 1 && (
            <button onClick={back} className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <ArrowLeft size={16} className="mr-2" /> Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={next} className="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800">
              Next <ArrowRight size={16} className="ml-2" />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 inline-flex items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow transition hover:bg-amber-400 disabled:opacity-50">
              {loading ? 'Setting up…' : 'Complete Setup & Start Monitoring'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyPulseSetup;
