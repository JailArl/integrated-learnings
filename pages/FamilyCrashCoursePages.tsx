import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileSearch,
  GraduationCap,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { submitParentInquiry } from '../services/parentSubmissions';

type CrashCourseConfig = {
  slug: 'psle-june-intensive' | 'o-level-june-intensive';
  label: string;
  title: string;
  subtitle: string;
  summary: string;
  intensiveWindow: string;
  seatNote: string;
  audience: string[];
  keyBenefits: string[];
  targetPractice: string[];
  timetableHeader: string;
  timetableRows: Array<{ day: string; session: string; focus: string }>;
  packageCards: Array<{ name: string; price: string; detail: string; note: string }>;
  faq: Array<{ q: string; a: string }>;
  fitCheckPrompt: string;
  whatsappPrefill: string;
  leadSubjectList: string[];
};

const sharedFaq: Array<{ q: string; a: string }> = [
  {
    q: 'How is this different from weekly tuition?',
    a: 'This is a concentrated holiday intensive focused on weak-topic diagnosis, structured practice, correction, and feedback within a short timeline.',
  },
  {
    q: 'Will my child be assessed before enrolment?',
    a: 'Yes. We do a fit-check using recent results and topic pain points to confirm if the programme is suitable before final placement.',
  },
  {
    q: 'How big is each class?',
    a: 'Small-group intensive format with limited seats, so each student receives clearer guidance and correction support.',
  },
  {
    q: 'Is there support after the programme?',
    a: 'Optional study tracking support is available after programme completion for families who want continuity and accountability.',
  },
];

const configs: Record<CrashCourseConfig['slug'], CrashCourseConfig> = {
  'psle-june-intensive': {
    slug: 'psle-june-intensive',
    label: 'PSLE June Intensive',
    title: 'PSLE June Intensive: Focused Revision Before School Reopens',
    subtitle: 'Small-group intensive for Primary 6 students who need targeted revision, clearer steps, and confidence recovery.',
    summary: 'We identify weak areas quickly, rebuild core methods, and drive structured practice with correction and feedback. This is not random worksheet drilling.',
    intensiveWindow: '16 - 25 June 2026',
    seatNote: 'Limited seats per class. Fit-check required before enrolment.',
    audience: [
      'Primary 6 students with unstable Math or Science performance',
      'Students who know concepts but lose marks through careless gaps',
      'Families who want a short, structured intensive before Term 3',
    ],
    keyBenefits: [
      'Targeted revision based on weak-topic diagnosis',
      'Step-by-step method correction for common PSLE question types',
      'Structured timed practice with correction loop',
      'Clear parent-facing summary of strengths, gaps, and next focus',
    ],
    targetPractice: [
      'Diagnostic checkpoint to identify question-type weaknesses',
      'Topic-by-topic guided drills with explicit method scaffolding',
      'Timed mini-paper blocks to train pacing and answer discipline',
      'Correction walkthroughs to prevent repeat mistakes',
    ],
    timetableHeader: 'Morning Track (PSLE)',
    timetableRows: [
      { day: 'Mon 16 Jun', session: '10:00am - 1:00pm', focus: 'Math Foundations + Fractions & Ratios' },
      { day: 'Tue 17 Jun', session: '10:00am - 1:00pm', focus: 'Science Concepts + Open-ended Techniques' },
      { day: 'Wed 18 Jun', session: '10:00am - 1:00pm', focus: 'Math Problem Solving Sprint' },
      { day: 'Thu 19 Jun', session: '10:00am - 1:00pm', focus: 'Science Data-based & Application Questions' },
      { day: 'Fri 20 Jun', session: '10:00am - 1:00pm', focus: 'Mixed Timed Practice + Correction Clinic' },
      { day: 'Mon 23 Jun', session: '10:00am - 1:00pm', focus: 'Math Heuristics & Error Patterns' },
      { day: 'Tue 24 Jun', session: '10:00am - 1:00pm', focus: 'Science Synthesis + Precision Answers' },
      { day: 'Wed 25 Jun', session: '10:00am - 1:00pm', focus: 'Mock Block + Final Feedback Notes' },
    ],
    packageCards: [
      {
        name: 'Math Intensive Package',
        price: 'SGD 320',
        detail: 'Focused weak-topic revision + timed practice + correction support',
        note: 'Small-group intensive, limited seats',
      },
      {
        name: 'Science Intensive Package',
        price: 'SGD 320',
        detail: 'Concept clarity + application training + open-ended correction',
        note: 'Small-group intensive, limited seats',
      },
      {
        name: 'Math + Science Bundle',
        price: 'SGD 600',
        detail: 'Full intensive across both core subjects with integrated progress recap',
        note: 'Best for students with broad-topic gaps',
      },
    ],
    faq: sharedFaq,
    fitCheckPrompt: 'Send your child\'s latest results slip and we will advise if this PSLE intensive is the right fit.',
    whatsappPrefill: 'Hi Integrated Learnings, I would like details for the PSLE June Intensive and timetable.',
    leadSubjectList: ['PSLE Math', 'PSLE Science'],
  },
  'o-level-june-intensive': {
    slug: 'o-level-june-intensive',
    label: 'O-Level June Intensive',
    title: 'O-Level June Intensive: Target Weak Topics Before Prelims Pressure Builds',
    subtitle: 'Structured small-group intensive for Sec 4/5 students who need stronger correction cycles and exam-priority practice.',
    summary: 'We focus on weak-topic diagnosis, targeted revision blocks, and high-value correction feedback so students improve where it matters most.',
    intensiveWindow: '16 - 25 June 2026',
    seatNote: 'Limited seats per class. Fit-check required before enrolment.',
    audience: [
      'Sec 4/5 students with inconsistent grades in key subjects',
      'Students needing structured practice instead of broad revision',
      'Families preparing early for prelim and O-Level pressure months',
    ],
    keyBenefits: [
      'Weak-topic diagnosis tied to exam-weighted priorities',
      'Focused revision and method correction for high-mark sections',
      'Timed practice with post-paper correction and feedback',
      'Clear action plan for what to continue after the intensive',
    ],
    targetPractice: [
      'Priority-topic recap with high-frequency question patterns',
      'Timed section drills to improve speed and accuracy under pressure',
      'Error tagging and correction protocol for recurring mistakes',
      'Exam-structure awareness and answer framing improvements',
    ],
    timetableHeader: 'Afternoon Track (O-Level)',
    timetableRows: [
      { day: 'Mon 16 Jun', session: '2:00pm - 5:00pm', focus: 'Physics Core Topics + Structured Application' },
      { day: 'Tue 17 Jun', session: '2:00pm - 5:00pm', focus: 'Physics Timed Drill + Correction' },
      { day: 'Wed 18 Jun', session: '2:00pm - 5:00pm', focus: 'Chemistry Concepts + Data Questions' },
      { day: 'Thu 19 Jun', session: '2:00pm - 5:00pm', focus: 'Chemistry Timed Drill + Correction' },
      { day: 'Fri 20 Jun', session: '2:00pm - 5:00pm', focus: 'A Math Techniques + Problem Sequence' },
      { day: 'Mon 23 Jun', session: '2:00pm - 5:00pm', focus: 'E Math Exam Blocks + Speed Control' },
      { day: 'Tue 24 Jun', session: '2:00pm - 5:00pm', focus: 'Weak-topic Clinic + Targeted Feedback' },
      { day: 'Wed 25 Jun', session: '2:00pm - 5:00pm', focus: 'Mock Segment + Next-step Strategy' },
    ],
    packageCards: [
      {
        name: 'Single Subject Intensive',
        price: 'SGD 280',
        detail: 'Choose one target subject for focused correction and intensive practice',
        note: 'Best for one major weak subject',
      },
      {
        name: 'Two Subject Intensive',
        price: 'SGD 520',
        detail: 'Two priority subjects with structured weak-topic progression',
        note: 'Strong value for common Math/Science pairings',
      },
      {
        name: 'Three Subject Intensive',
        price: 'SGD 740',
        detail: 'For students needing broader support before prelim season',
        note: 'Includes a consolidated fit-check summary',
      },
    ],
    faq: sharedFaq,
    fitCheckPrompt: 'Send your child\'s latest results slip and we will advise if this O-Level intensive fits current subject needs.',
    whatsappPrefill: 'Hi Integrated Learnings, I would like details for the O-Level June Intensive and timetable.',
    leadSubjectList: ['O-Level E Math', 'O-Level A Math', 'O-Level Physics', 'O-Level Chemistry'],
  },
};

const toWhatsApp = (text: string) => `https://wa.me/6598882675?text=${encodeURIComponent(text)}`;

const CrashCourseLeadForm: React.FC<{ config: CrashCourseConfig }> = ({ config }) => {
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState(config.slug === 'psle-june-intensive' ? 'Primary 6' : 'Secondary 4');
  const [resultsSnapshot, setResultsSnapshot] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!parentName.trim() || !studentName.trim() || !contactNumber.trim() || !email.trim()) {
      setMessage({ type: 'error', text: 'Please complete name, contact, and email fields.' });
      return;
    }

    setLoading(true);
    const resp = await submitParentInquiry({
      parent_name: parentName.trim(),
      student_name: studentName.trim(),
      contact_number: contactNumber.replace(/\s+/g, ''),
      email: email.trim(),
      student_level: level,
      subjects: config.leadSubjectList,
      preferred_mode: 'group',
      postal_code: '',
      address: 'Crash Course Campaign Lead',
      unit_number: '',
      learning_needs: `Crash Course Lead - ${config.label}`,
      tutor_type: 'no-preference',
      preferred_schedule: config.intensiveWindow,
      additional_notes: resultsSnapshot ? `Latest results snapshot: ${resultsSnapshot}` : 'Interested in crash course fit-check and timetable.',
    });
    setLoading(false);

    if (!resp.success) {
      setMessage({ type: 'error', text: resp.error || 'Could not submit enquiry. Please WhatsApp us directly.' });
      return;
    }

    setMessage({ type: 'success', text: 'Enquiry submitted. Our team will WhatsApp you shortly for fit-check and scheduling.' });
    setParentName('');
    setStudentName('');
    setContactNumber('');
    setEmail('');
    setResultsSnapshot('');
  };

  return (
    <section id="lead-form" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">Lead Form</p>
        <h3 className="mt-2 text-2xl font-black text-primary">Request Fit-Check and Timetable</h3>
        <p className="mt-2 text-sm text-slate-600">Share key details and we will advise the best class fit before enrolment.</p>
      </div>

      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Parent Name" className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
        <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Student Name" className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
        <input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="WhatsApp Number" className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Parent Email" className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
        <input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Level (e.g. Primary 6 / Sec 4)" className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none sm:col-span-2" />
        <textarea value={resultsSnapshot} onChange={(e) => setResultsSnapshot(e.target.value)} placeholder="Latest results slip summary (optional)" rows={4} className="rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none sm:col-span-2" />
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-60 sm:col-span-2">
          {loading ? 'Submitting...' : 'Reserve a Slot'} <ArrowRight size={15} className="ml-2" />
        </button>
      </form>

      {message && (
        <p className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {message.text}
        </p>
      )}
    </section>
  );
};

const CrashCourseCampaignPage: React.FC<{ config: CrashCourseConfig }> = ({ config }) => {
  const whatsappGeneral = useMemo(() => toWhatsApp(config.whatsappPrefill), [config.whatsappPrefill]);
  const fitCheckWhatsApp = useMemo(() => toWhatsApp(`${config.whatsappPrefill} I would like to send the latest results slip for fit-check.`), [config.whatsappPrefill]);

  return (
    <div className="bg-stone-50 pb-24 text-slate-900 md:pb-0">
      <section className="relative overflow-hidden bg-[linear-gradient(150deg,#0f172a_0%,#111827_45%,#1e3a8a_100%)] px-4 pb-16 pt-16 text-white sm:px-6 sm:pt-20">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute left-[-8%] top-12 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute right-[-8%] top-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
            <Sparkles size={14} /> {config.label} · {config.intensiveWindow}
          </p>
          <h1 className="mt-4 max-w-4xl text-3xl font-black leading-tight sm:text-5xl">{config.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">{config.subtitle}</p>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{config.summary}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={whatsappGeneral} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300">
              Reserve a Slot <ArrowRight size={15} className="ml-2" />
            </a>
            <a href={toWhatsApp(`${config.whatsappPrefill} Please send me the latest timetable.`)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20">
              Get the Timetable on WhatsApp
            </a>
            <a href={fitCheckWhatsApp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50/10 px-6 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-100/20">
              Send Latest Results Slip for Fit Check
            </a>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Programme Window</p>
              <p className="mt-1 text-sm font-semibold text-white">{config.intensiveWindow}</p>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Class Structure</p>
              <p className="mt-1 text-sm font-semibold text-white">Small-group intensive + correction loop</p>
            </div>
            <div className="rounded-xl border border-red-300/40 bg-red-500/10 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-red-200">Limited Seats</p>
              <p className="mt-1 text-sm font-semibold text-red-100">{config.seatNote}</p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 sm:py-12">
        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-primary">Why This Programme</h2>
            <div className="mt-4 space-y-3">
              {config.keyBenefits.map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" /> {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-primary">Who It Is For</h2>
            <div className="mt-4 space-y-3">
              {config.audience.map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <Users size={16} className="mt-0.5 shrink-0 text-secondary" /> {item}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-primary">Timetable</h2>
              <p className="mt-1 text-sm text-slate-600">{config.timetableHeader} · Structured sessions with guided correction.</p>
            </div>
            <a href={toWhatsApp(`${config.whatsappPrefill} Please send the full timetable.`)} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-xl border border-secondary px-4 py-2 text-xs font-bold text-secondary transition hover:bg-blue-50">
              <CalendarDays size={14} className="mr-1.5" /> Get the Timetable on WhatsApp
            </a>
          </div>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[580px] text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-600">Day</th>
                  <th className="px-4 py-3 font-bold text-slate-600">Session</th>
                  <th className="px-4 py-3 font-bold text-slate-600">Focus</th>
                </tr>
              </thead>
              <tbody>
                {config.timetableRows.map((row) => (
                  <tr key={`${row.day}-${row.focus}`} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-700">{row.day}</td>
                    <td className="px-4 py-3 text-slate-600">{row.session}</td>
                    <td className="px-4 py-3 text-slate-600">{row.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-primary">Target Practice: What Students Will Do</h2>
            <div className="mt-4 space-y-3">
              {config.targetPractice.map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <Target size={16} className="mt-0.5 shrink-0 text-rose-600" /> {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-primary">Why Integrated Learnings</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <p className="flex items-start gap-2"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-secondary" /> Strong Math and Science support with clear method breakdowns.</p>
              <p className="flex items-start gap-2"><FileSearch size={16} className="mt-0.5 shrink-0 text-secondary" /> Weak-topic diagnosis and correction strategy, not random worksheets.</p>
              <p className="flex items-start gap-2"><TrendingUp size={16} className="mt-0.5 shrink-0 text-secondary" /> Structured accountability and optional study tracking after the programme.</p>
              <p className="flex items-start gap-2"><GraduationCap size={16} className="mt-0.5 shrink-0 text-secondary" /> Teaching approach designed to match how students think and learn.</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-primary">Pricing & Packages</h2>
          <p className="mt-2 text-sm text-slate-600">Transparent pricing, clear structure, fit-check before enrolment.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {config.packageCards.map((pkg) => (
              <article key={pkg.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-primary">{pkg.name}</p>
                <p className="mt-2 text-2xl font-black text-secondary">{pkg.price}</p>
                <p className="mt-2 text-sm text-slate-700">{pkg.detail}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{pkg.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-primary">FAQ</h2>
          <div className="mt-4 space-y-4">
            {config.faq.map((item) => (
              <article key={item.q} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-primary">{item.q}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Final CTA</p>
          <h2 className="mt-2 text-2xl font-black text-primary sm:text-3xl">Ready to Secure a Seat?</h2>
          <p className="mt-2 text-sm text-slate-700">{config.fitCheckPrompt}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={whatsappGeneral} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-400">
              Reserve a Slot <ArrowRight size={15} className="ml-2" />
            </a>
            <a href={fitCheckWhatsApp} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border border-amber-500 bg-white px-6 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100">
              Send Latest Results Slip for Fit Check
            </a>
          </div>
        </section>

        <CrashCourseLeadForm config={config} />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-primary">WhatsApp Contact</h2>
          <p className="mt-2 text-sm text-slate-600">Prefer immediate discussion with our team? Use WhatsApp for timetable, fit-check, and seat confirmation.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappGeneral} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500">
              <MessageCircle size={15} className="mr-2" /> WhatsApp Integrated Learnings
            </a>
            <Link to="/tuition" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Back to Family Tuition Page
            </Link>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl gap-2">
          <a href={whatsappGeneral} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-3 py-3 text-xs font-black text-white">
            <MessageCircle size={14} className="mr-1.5" /> WhatsApp
          </a>
          <a href="#lead-form" className="inline-flex flex-1 items-center justify-center rounded-xl bg-secondary px-3 py-3 text-xs font-black text-white">
            Enquire / Reserve
          </a>
        </div>
      </div>
    </div>
  );
};

export const FamilyPSLEJuneIntensivePage: React.FC = () => <CrashCourseCampaignPage config={configs['psle-june-intensive']} />;

export const FamilyOLevelJuneIntensivePage: React.FC = () => <CrashCourseCampaignPage config={configs['o-level-june-intensive']} />;
