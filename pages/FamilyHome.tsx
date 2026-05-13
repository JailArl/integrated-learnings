import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle,
  Flame,
  MessageCircle,
  Search,
  Timer,
  UserPlus,
} from 'lucide-react';
import ParentInquiryForm from '../components/ParentInquiryForm';

const EARLY_BIRD_DEADLINE = new Date('2026-05-20T23:59:59+08:00').getTime();

type OptionKey = 'consistency' | 'tutor' | 'holiday' | 'enrichment';

type FamilyContext = {
  badge: string;
  heroLead: string;
  heroAccent: string;
  intro: string;
  bannerText: string;
  bannerCta: string;
  bannerHref: string;
  assistantTitle: string;
  assistantBody: string;
  question: string;
  subtitle: string;
  resultLead: string;
  resultHint: string;
  guideLabel: string;
};

const getSingaporeDateParts = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value ?? date.getFullYear()),
    month: Number(parts.find((part) => part.type === 'month')?.value ?? date.getMonth() + 1),
    day: Number(parts.find((part) => part.type === 'day')?.value ?? date.getDate()),
  };
};

const getFamilyContext = (date = new Date()): FamilyContext => {
  const { month } = getSingaporeDateParts(date);

  if (month >= 5 && month <= 6) {
    return {
      badge: 'WA2 / mid-year reset',
      heroLead: 'WA2 just wrapped',
      heroAccent: 'what should your family do next?',
      intro:
        'If the results are worrying, we will help you decide the next step without wasting time browsing.',
      bannerText: 'WA2 is over and many parents are worried about results. Let us help you choose the next move.',
      bannerCta: 'Talk to us',
      bannerHref: 'https://wa.me/6598882675?text=Hi%2C%20WA2%20just%20finished%20and%20I%27d%20like%20help%20choosing%20the%20next%20step%20for%20my%20child.',
      assistantTitle: 'Right after WA2, clarity matters',
      assistantBody: 'Pick the problem that feels most urgent and we will guide you to the best fix.',
      question: 'What are you trying to solve after WA2?',
      subtitle: 'Parents usually want one of four things here: stability, a tutor, holiday revision, or enrichment.',
      resultLead: 'Here is the most practical next step',
      resultHint: 'Scroll down for the matched option and next steps.',
      guideLabel: 'Mid-year guidance',
    };
  }

  if (month === 7 || month === 8) {
    return {
      badge: 'Holiday support',
      heroLead: 'June break is here',
      heroAccent: 'keep learning from slipping away',
      intro:
        'A good holiday plan should feel light, useful, and realistic. We will point you to the right mix of support.',
      bannerText: 'The holiday window is short. Keep momentum with a plan that suits your child.',
      bannerCta: 'Reserve now',
      bannerHref: 'https://wa.me/6598882675?text=Hi%2C%20I%27d%20like%20help%20planning%20my%20child%27s%20June%20holiday%20support.',
      assistantTitle: 'A better holiday than random revision',
      assistantBody: 'Choose the kind of support you want and we will match it to the right path.',
      question: 'What should your child focus on this break?',
      subtitle: 'Pick the closest fit and we will recommend the most useful holiday option.',
      resultLead: 'This is the best holiday fit',
      resultHint: 'Scroll down for the matched option and next steps.',
      guideLabel: 'Holiday planning',
    };
  }

  if (month >= 9 && month <= 10) {
    return {
      badge: 'Exam sprint',
      heroLead: 'The exam run-up is real',
      heroAccent: 'what needs the fastest repair?',
      intro:
        'This is the season for focused correction, not noise. We help families choose the shortest path to confidence.',
      bannerText: 'Parents are moving from concern to action. A focused plan now saves a lot of stress later.',
      bannerCta: 'Get focused help',
      bannerHref: 'https://wa.me/6598882675?text=Hi%2C%20I%20need%20help%20with%20exam%20prep%20for%20my%20child%20and%20want%20the%20best%20next%20step.',
      assistantTitle: 'Fast help, without the guesswork',
      assistantBody: 'Select the area that needs the most repair and we will point you to the right support.',
      question: 'What needs the fastest improvement?',
      subtitle: 'Choose one option and we will suggest the most practical next move.',
      resultLead: 'This is the strongest next move',
      resultHint: 'Scroll down for the matched option and next steps.',
      guideLabel: 'Exam season support',
    };
  }

  if (month >= 11 || month === 1) {
    return {
      badge: 'Results and reset',
      heroLead: 'Results are out or on the way',
      heroAccent: 'what should happen next?',
      intro:
        'When the year winds down, families need calm next steps, not rushed promises. We help you choose with confidence.',
      bannerText: 'If the results are mixed, do not panic. Start with a clear, calm plan.',
      bannerCta: 'Plan the next step',
      bannerHref: 'https://wa.me/6598882675?text=Hi%2C%20I%20would%20like%20help%20planning%20the%20next%20step%20after%20my%20child%27s%20results.',
      assistantTitle: 'A calm plan beats a rushed decision',
      assistantBody: 'Pick the area that needs attention and we will guide you to the right path.',
      question: 'What does your child need most now?',
      subtitle: 'Choose the closest fit and we will recommend the most sensible next step.',
      resultLead: 'Here is the clearest next step',
      resultHint: 'Scroll down for the matched option and next steps.',
      guideLabel: 'Results and planning',
    };
  }

  return {
    badge: 'New term reset',
    heroLead: 'How can we help',
    heroAccent: 'your family today?',
    intro:
      'A focused start works better than a rushed search. Tell us the situation and we will point you to the right support.',
    bannerText: 'If you want the right kind of help, start with the problem you are trying to solve.',
    bannerCta: 'Start here',
    bannerHref: 'https://wa.me/6598882675?text=Hi%2C%20I%27d%20like%20help%20choosing%20the%20right%20option%20for%20my%20child.',
    assistantTitle: 'Guided family assistant',
    assistantBody: 'Choose the closest fit. No browsing needed.',
    question: "What's on your mind today?",
    subtitle: 'Tap the option that fits best and we will point you to the right next step.',
    resultLead: 'Here is the most relevant option',
    resultHint: 'Scroll down for the matched option and next steps.',
    guideLabel: 'Quick guidance',
  };
};

const GUIDE_STEPS = [
  {
    id: 'root',
    question: "What's on your mind today?",
    subtitle: 'Tap the option that fits best and we\'ll point you to the right next step.',
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
  const [selected, setSelected] = useState<OptionKey | null>(null);
  const [flashId, setFlashId] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const activeOption = GUIDE_STEPS[0].options.find((opt) => opt.key === selected) ?? null;
  const familyContext = getFamilyContext();

  useEffect(() => {
    if (selected && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    }
  }, [selected]);

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">

      {/* ═══════════ URGENCY BANNER ═══════════ */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-gradient-to-r from-slate-900 via-sky-800 to-emerald-700 px-3 py-2.5 text-white shadow-lg sm:gap-6 sm:px-4">
        <Timer size={15} className="shrink-0" />
        <p className="text-xs font-bold sm:text-sm">
          Parent sign-up discount is available for the crash course. {familyContext.bannerText}
        </p>
        <a
          href={familyContext.bannerHref}
          target="_blank" rel="noopener noreferrer"
          className="hidden shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-black text-orange-600 shadow transition hover:bg-orange-50 sm:inline-flex"
        >
          {familyContext.bannerCta} →
        </a>
      </div>

      {/* ═══════════ GUIDED HERO ═══════════ */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_60%,#0b2233_100%)] px-4 pb-16 pt-14 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute left-[-10%] top-6 h-56 w-56 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute right-[-6%] top-14 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute bottom-[-8%] left-1/3 h-64 w-64 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="text-center lg:text-left">
            <p className="mb-4 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              {familyContext.badge}
            </p>
            <h1 className="font-sans text-4xl font-black leading-tight sm:text-5xl">
              {familyContext.heroLead}
              <span className="block text-sky-300">{familyContext.heroAccent}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-300 lg:mx-0">
              {familyContext.intro}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-2xl shadow-slate-950/25 backdrop-blur sm:p-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-400/20 text-sky-200">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{familyContext.assistantTitle}</p>
                <p className="text-xs text-slate-300">{familyContext.assistantBody}</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-slate-800 shadow-sm">
                {familyContext.question}
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-br-md bg-sky-500/15 px-4 py-3 text-sm leading-6 text-sky-50 ring-1 ring-inset ring-sky-300/20">
                {familyContext.subtitle}
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {GUIDE_STEPS[0].options.map((opt) => {
                const isActive = selected === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSelected(opt.key);
                      setFlashId((value) => value + 1);
                    }}
                    className={`relative flex items-start gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left transition ${
                      isActive
                        ? 'border-sky-300 bg-sky-400/20 shadow-lg shadow-sky-950/10'
                        : 'border-white/15 bg-white/5 hover:border-sky-300/40 hover:bg-white/10'
                    }`}
                    aria-pressed={isActive}
                  >
                    {isActive && <span key={`${opt.key}-${flashId}`} className="pointer-events-none absolute inset-0 rounded-2xl animate-family-flash" aria-hidden="true" />}
                    <span className="text-xl leading-none">{opt.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold leading-snug text-white">{opt.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">{opt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeOption && (
              <div key={`${selected ?? 'none'}-${flashId}`} className="mt-4 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-50 animate-family-flash">
                <span className="font-bold">{familyContext.resultLead}:</span> {activeOption.label}
                <span className="block text-xs text-emerald-100/80">{familyContext.resultHint}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════ INTERACTIVE GUIDE ═══════════ */}
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">Recommended next step</h2>
            <p className="mt-2 text-sm text-slate-500">We use your selection above and map it to the most practical path for your child.</p>
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
                ← Change selection in the guided assistant above
              </button>
            </div>
          )}

          {!selected && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-slate-600">Choose one option in the guided assistant above to see a personalised recommendation here.</p>
              <a href="#parent-inquiry" className="mt-4 inline-flex items-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700">
                Skip to Request Form
                <ArrowRight size={14} className="ml-2" />
              </a>
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
