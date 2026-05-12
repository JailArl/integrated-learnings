import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle,
  Flame,
  Search,
  Timer,
  UserPlus,
} from 'lucide-react';
import ParentInquiryForm from '../components/ParentInquiryForm';

const EARLY_BIRD_DEADLINE = new Date('2026-05-20T23:59:59+08:00').getTime();

type OptionKey = 'consistency' | 'tutor' | 'holiday' | 'enrichment';

const GUIDE_STEPS = [
  {
    id: 'root',
    question: "What's on your mind today?",
    subtitle: 'Pick the one that fits best — we\'ll point you in the right direction.',
    options: [
      {
        key: 'consistency' as OptionKey,
        emoji: '📅',
        label: 'My child needs to study more consistently',
        desc: 'They keep procrastinating or I can\'t tell if they\'re actually working.',
      },
      {
        key: 'tutor' as OptionKey,
        emoji: '🎓',
        label: 'I\'m looking for a tutor',
        desc: 'They need proper subject support from a qualified educator.',
      },
      {
        key: 'holiday' as OptionKey,
        emoji: '📆',
        label: 'I want to plan for the June holidays',
        desc: 'Crash course, revision programme, or something more enriching.',
      },
      {
        key: 'enrichment' as OptionKey,
        emoji: '🌱',
        label: 'I want something beyond academics',
        desc: 'Life skills, decision-making, financial literacy for teens.',
      },
    ],
  },
];

const RECOMMENDATIONS: Record<OptionKey, React.ReactNode> = {
  consistency: (
    <div className="animate-fade-in rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm sm:p-8">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Best match for you</p>
      <h3 className="text-2xl font-black text-slate-900">StudyPulse</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        A daily WhatsApp check-in system that holds your child accountable without you having to nag. You get a short summary each night — without installing anything.
      </p>
      <ul className="mt-4 space-y-2">
        {[
          'Daily check-ins via WhatsApp',
          'Streak tracking keeps motivation up',
          'You get a parent summary each night',
          'Free to start — no app required',
        ].map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/studypulse"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-md shadow-amber-200 transition hover:bg-amber-400"
      >
        Try StudyPulse Free
        <ArrowRight size={15} className="ml-2" />
      </Link>
      <p className="mt-3 text-xs text-slate-400">Works via WhatsApp. No installation needed for your child.</p>
    </div>
  ),
  tutor: (
    <div className="animate-fade-in rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm sm:p-8">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-sky-600">Best match for you</p>
      <h3 className="text-2xl font-black text-slate-900">Tutor Matching</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        Tell us what you need — level, subjects, availability. We'll match your child with a vetted tutor, not just whoever is available that week.
      </p>
      <ul className="mt-4 space-y-2">
        {[
          'Matched by subject, level, and teaching style',
          'Transparent rates — no hidden fees',
          'Switch anytime, no lock-in contract',
          'P1 through JC2, all subjects',
        ].map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle size={14} className="mt-0.5 shrink-0 text-sky-500" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/tuition/request"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-sky-200 transition hover:bg-sky-700"
      >
        Find a Tutor
        <ArrowRight size={15} className="ml-2" />
      </Link>
      <p className="mt-3 text-xs text-slate-400">Or scroll down to fill in a quick inquiry form below.</p>
    </div>
  ),
  holiday: (
    <div className="animate-fade-in space-y-4">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">June holiday options for your child</p>
      <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <Flame size={18} />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-black text-slate-900">Crash Courses — Exam Revision</h4>
            <p className="mt-1 text-sm leading-6 text-slate-600">Intensive programmes for PSLE and O-Level students. Cover key topics, exam techniques, and timed practice.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/family/crash-courses/psle-june-intensive" className="inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-sky-700">
                PSLE <ArrowRight size={13} className="ml-1" />
              </Link>
              <Link to="/family/crash-courses/o-level-june-intensive" className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700">
                O-Level <ArrowRight size={13} className="ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
            <BookOpenCheck size={18} />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-black text-slate-900">Future Choices Workshop — Enrichment</h4>
            <p className="mt-1 text-sm leading-6 text-slate-600">For Sec 1–3 students. Life simulation, financial decisions, real-world thinking. Not your typical holiday class.</p>
            <Link to="/family/programmes/future-choices-workshop" className="mt-3 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700">
              View Workshop <ArrowRight size={13} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  ),
  enrichment: (
    <div className="animate-fade-in rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm sm:p-8">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Best match for you</p>
      <h3 className="text-2xl font-black text-slate-900">Future Choices Workshop</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">
        A holiday simulation workshop where Sec 1–3 students experience adult decisions — budgeting, career paths, life trade-offs — through structured gameplay and guided debrief.
      </p>
      <ul className="mt-4 space-y-2">
        {[
          'Sec 1–3 students (ages 13–15)',
          'Financial literacy and life decisions',
          'Small group simulation format',
          'June holiday dates — limited slots',
        ].map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
            <CheckCircle size={14} className="mt-0.5 shrink-0 text-indigo-500" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/family/programmes/future-choices-workshop"
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
      >
        View Workshop Details
        <ArrowRight size={15} className="ml-2" />
      </Link>
    </div>
  ),
};

const FamilyHome: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, EARLY_BIRD_DEADLINE - Date.now()));
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(Math.max(0, EARLY_BIRD_DEADLINE - Date.now())), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (selected && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }, [selected]);

  const days = Math.floor(timeLeft / 86400000);
  const hours = Math.floor((timeLeft % 86400000) / 3600000);
  const mins = Math.floor((timeLeft % 3600000) / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">

      {/* ═══════════ URGENCY BANNER ═══════════ */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-3 py-2.5 text-white shadow-lg sm:gap-6 sm:px-4">
        <Timer size={15} className="shrink-0" />
        <p className="text-xs font-bold sm:text-sm">
          🔥 June Holiday Crash Course — Early Bird closes in&nbsp;
          <span className="font-black tabular-nums">
            {pad(days)}d {pad(hours)}h {pad(mins)}m {pad(secs)}s
          </span>
        </p>
        <a
          href="https://wa.me/6598882675?text=Hi%2C%20I%27d%20like%20to%20find%20out%20more%20about%20the%20June%20Holiday%20Crash%20Course"
          target="_blank" rel="noopener noreferrer"
          className="hidden shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-black text-orange-600 shadow transition hover:bg-orange-50 sm:inline-flex"
        >
          Reserve Now →
        </a>
      </div>

      {/* ═══════════ GUIDED HERO ═══════════ */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_60%,#0b2233_100%)] px-4 pb-16 pt-14 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute left-[-10%] top-6 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute right-[-6%] top-14 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute bottom-[-8%] left-1/3 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="mb-4 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
            For Singapore Families
          </p>
          <h1 className="font-sans text-4xl font-black leading-tight sm:text-5xl">
            How can we help
            <span className="block text-sky-300">your family today?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-300">
            Tell us what you&rsquo;re dealing with and we&rsquo;ll guide you to the right option — no browsing required.
          </p>
        </div>
      </section>

      {/* ═══════════ INTERACTIVE GUIDE ═══════════ */}
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">

          {/* Question */}
          <div className="mb-6 text-center">
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">{GUIDE_STEPS[0].question}</h2>
            <p className="mt-2 text-sm text-slate-500">{GUIDE_STEPS[0].subtitle}</p>
          </div>

          {/* Option cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {GUIDE_STEPS[0].options.map((opt) => {
              const isActive = selected === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelected(opt.key)}
                  className={`group flex items-start gap-4 rounded-2xl border p-4 text-left transition-all sm:p-5 ${
                    isActive
                      ? 'border-sky-500 bg-sky-50 shadow-md shadow-sky-100 ring-2 ring-sky-400'
                      : 'border-slate-200 bg-white shadow-sm hover:border-sky-300 hover:bg-sky-50/50 hover:shadow-md'
                  }`}
                  aria-pressed={isActive}
                >
                  <span className="mt-0.5 text-2xl leading-none">{opt.emoji}</span>
                  <div className="flex-1">
                    <p className={`text-sm font-bold leading-snug ${isActive ? 'text-sky-800' : 'text-slate-800 group-hover:text-sky-800'}`}>
                      {opt.label}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{opt.desc}</p>
                  </div>
                  {isActive && (
                    <span className="ml-1 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
                      <CheckCircle size={12} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Result */}
          {selected && (
            <div ref={resultRef} className="mt-8 scroll-mt-20">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Here&rsquo;s what we suggest</p>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              {RECOMMENDATIONS[selected]}
              <button
                onClick={() => setSelected(null)}
                className="mt-4 text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
              >
                ← Choose a different option
              </button>
            </div>
          )}

          {/* Educator strip */}
          <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-emerald-700"><span className="font-semibold">For educators:</span> looking to teach with us?</p>
              <Link to="/tutor-signup" className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700">
                Become a Tutor
                <UserPlus size={13} className="ml-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FIND A TUTOR + INQUIRY FORM ═══════════ */}
      <section id="parent-inquiry" className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 grid gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Search size={24} />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Tutor Matching</p>
              <h2 className="mt-3 text-3xl font-black text-slate-900">Find the Right Tutor</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Tell us your child&apos;s level, subjects, and learning style. We&apos;ll match you with a vetted tutor — not just whoever is available.
              </p>
              <ul className="mt-5 space-y-2">
                {['Matched by subject & teaching style', 'Transparent indicative rates', 'Switch anytime, no lock-in', 'P1 to JC2, all subjects'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle size={15} className="mt-0.5 shrink-0 text-sky-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="mb-4 rounded-xl border border-sky-200 bg-white p-3 text-xs text-sky-800">
                Prefer a full-page experience? Use our dedicated parent request page:
                <Link to="/tuition/request" className="ml-1 font-bold underline hover:text-sky-900">/tuition/request</Link>
              </div>
              <ParentInquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FamilyHome;
