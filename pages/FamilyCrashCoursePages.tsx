/**
 * FamilyCrashCoursePages.tsx
 *
 * Two SEO-optimised, production-ready landing pages:
 *   - PSLE Math & Science June Intensive
 *   - O-Level June Intensive Subject Bootcamps
 *
 * Architecture:
 *   - CrashCourseConfig  — shared data type (timetable, pricing, FAQs, CTAs)
 *   - configs            — one config per slug; update each season without
 *                          touching component logic
 *   - Shared components  — TimetableSection, PricingSection, FaqAccordion,
 *                          WhyUsSection, TestimonialsSection, FinalCtaSection,
 *                          LeadForm, MobileStickyBar, CtaBand
 *   - CrashCourseCampaignPage — single page renderer driven by config
 *   - Named page exports — consumed by App.tsx routes
 */

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  MessageCircle,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { submitParentInquiry } from '../services/parentSubmissions';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type CrashCourseSlug = 'psle-june-intensive' | 'o-level-june-intensive';

interface TimetableBlock {
  date: string;
  title: string;
  time: string;
  focus: string[];
}

interface PricingOption {
  title: string;
  range: string;
  note: string;
  highlight?: boolean;
}

interface FaqEntry {
  q: string;
  a: string;
}

interface Testimonial {
  quote: string;
  attribution: string;
}

interface CrashCourseConfig {
  slug: CrashCourseSlug;
  // SEO
  pageTitle: string;
  metaDescription: string;
  h1: string;
  h1Sub: string;
  // Hero
  eyebrow: string;
  heroCopy: string;
  capacityBadge: string;
  reserveCtaLabel: string;
  whatsappCtaLabel: string;
  whatsappHeroText: string;
  // Sections
  whoFor: string[];
  timetableBlocks: TimetableBlock[];
  timetableNote: string;
  pricingOptions: PricingOption[];
  pricingNote: string;
  whyUs: string[];
  safePromiseTitle: string;
  safePromiseBody: string;
  testimonials: Testimonial[];
  faq: FaqEntry[];
  // Final CTA
  finalHeadline: string;
  finalBody: string;
  whatsappFinalText: string;
  // Lead form
  formLevelLabel: string;
  formSubjectLabel: string;
  formSubjectOptions: string[];
  defaultLevel: string;
  defaultSchedule: string;
  // WhatsApp reservation text
  whatsappReserveText: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const WA_NUMBER = '6598882675';
const toWhatsApp = (text: string) =>
  `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

// ─────────────────────────────────────────────────────────────────────────────
// DATA — update this section each season, component logic stays untouched
// ─────────────────────────────────────────────────────────────────────────────

const configs: Record<CrashCourseSlug, CrashCourseConfig> = {
  'psle-june-intensive': {
    slug: 'psle-june-intensive',

    pageTitle: 'PSLE Math & Science June Intensive | Integrated Learnings Singapore',
    metaDescription:
      'Small-group PSLE Math and Science June Intensive crash course in Singapore. Structured revision, exam technique, and weak-topic correction. Capped at 8 students per group. Enquire now.',
    h1: 'PSLE Math & Science June Intensive',
    h1Sub:
      'A focused holiday revision programme for PSLE students who need stronger foundations, sharper exam technique, and structured practice — not just more worksheets.',

    eyebrow: 'June 2026 · Small-Group · PSLE Crash Course Singapore',
    heroCopy:
      'Targeted bootcamp blocks covering Math problem sums, Science answering technique, and mixed mock correction. Each block is built around the most common PSLE sticking points.',
    capacityBadge: 'Capped at 8 students per group · Seat confirmed upon payment',
    reserveCtaLabel: 'Reserve a Slot',
    whatsappCtaLabel: 'Get Timetable on WhatsApp',
    whatsappHeroText: 'Hi Integrated Learnings, please send the PSLE June Intensive timetable.',

    whoFor: [
      'Students who are weak in PSLE Math or Science',
      'Students who revise but keep making the same mistakes',
      'Students who need more structure, not just more drilling',
      'Parents who want the June holidays used purposefully',
    ],

    timetableBlocks: [
      {
        date: '16 Jun',
        title: 'Math Bootcamp — Part 1',
        time: '10:00 am – 1:00 pm',
        focus: [
          'Diagnostic drill to identify gaps',
          'Core concept review',
          'Worked examples with teacher explanation',
          'Guided practice',
        ],
      },
      {
        date: '17 Jun',
        title: 'Math Bootcamp — Part 2',
        time: '10:00 am – 1:00 pm',
        focus: [
          'Problem sums with varied question types',
          'Timed structured practice',
          'Method correction and strategy review',
        ],
      },
      {
        date: '18 Jun',
        title: 'Science Bootcamp — Part 1',
        time: '10:00 am – 1:00 pm',
        focus: [
          'Key concept consolidation',
          'Answering structure walkthrough',
          'MCQ and open-ended practice',
        ],
      },
      {
        date: '19 Jun',
        title: 'Science Bootcamp — Part 2',
        time: '10:00 am – 1:00 pm',
        focus: [
          'Application questions',
          'Open-ended correction clinic',
          'Common mistake review',
        ],
      },
      {
        date: '20 Jun',
        title: 'Mixed Mock + Correction Clinic',
        time: '10:00 am – 1:00 pm',
        focus: [
          'Timed mixed practice set',
          'Teacher-led correction and review',
          'Personal weak-topic action plan',
        ],
      },
    ],
    timetableNote:
      'Each session is 3 hours. Guided worksheets and practice materials are included. Sessions are modular — join one block or the full programme.',

    pricingOptions: [
      {
        title: 'Math Bootcamp',
        range: 'S$188 – S$218',
        note: '2 sessions · Concept review + method correction',
      },
      {
        title: 'Science Bootcamp',
        range: 'S$188 – S$218',
        note: '2 sessions · Answering structure + open-ended correction',
      },
      {
        title: 'Mock + Correction Clinic',
        range: 'S$88 – S$108',
        note: '1 session · Timed mixed set + teacher feedback',
      },
      {
        title: 'Full PSLE Intensive Bundle',
        range: 'S$398 – S$458',
        note: 'All 5 sessions · Complete programme support',
        highlight: true,
      },
    ],
    pricingNote:
      'Early-batch pricing applies while seats are available. Seat confirmed upon payment. Groups capped at 8 students.',

    whyUs: [
      'We identify exactly where your child is losing marks, not just which topics to cover.',
      'Concepts are explained clearly before students are asked to apply them under time pressure.',
      'Lessons are structured and paced to keep students focused across the session.',
      'Strong delivery in PSLE Math and Science, with materials built for exam application.',
      'Optional study tracking continuation after the programme to support follow-through.',
    ],

    safePromiseTitle: 'Right-Fit Promise',
    safePromiseBody:
      'If after the first session the programme is clearly not the right fit for your child, we will recommend the most suitable alternative and refund the unused prepaid portion in line with our policy.',

    testimonials: [
      {
        quote:
          '"My child finally understood where the marks were going. The correction session made a real difference."',
        attribution: 'Parent · P6 Student · PSLE Math Bootcamp',
      },
      {
        quote:
          '"Very structured. No wasted time, straight to the exam gaps. We knew exactly what to work on after."',
        attribution: 'Parent · P6 Student · Full PSLE Bundle',
      },
    ],

    faq: [
      {
        q: 'Is this suitable if my child is quite weak?',
        a: 'Yes. The programme is designed for students who need stronger foundations and active correction — not those who are already scoring well.',
      },
      {
        q: 'Can my child join only Math or only Science?',
        a: 'Yes. Each bootcamp block is standalone. You can choose one subject, both, or add the correction clinic.',
      },
      {
        q: 'What materials are provided?',
        a: 'Guided worksheets, structured practice sets, and correction resources are included in every session.',
      },
      {
        q: 'How small is the group?',
        a: 'Groups are capped at 8 students, which keeps feedback quality high and allows the teacher to correct individual mistakes.',
      },
      {
        q: 'What happens after I enquire?',
        a: 'Our team replies on WhatsApp, does a quick fit-check, and confirms the right block and slot before you enrol.',
      },
    ],

    finalHeadline: 'Use the June holidays to close the gaps — not let them widen.',
    finalBody:
      'Seats are limited. The earlier you confirm, the more flexibility you have on timing and subject combination.',
    whatsappFinalText: 'Hi Integrated Learnings, I want to enquire about PSLE June Intensive.',

    formLevelLabel: "Child's level (e.g. Primary 6)",
    formSubjectLabel: 'Programme of interest',
    formSubjectOptions: [
      'PSLE Math Bootcamp (2 sessions)',
      'PSLE Science Bootcamp (2 sessions)',
      'Mixed Mock + Correction Clinic',
      'Full PSLE Intensive Bundle (All 5 sessions)',
      'Not sure — please advise',
    ],
    defaultLevel: 'Primary 6',
    defaultSchedule: '10:00am – 1:00pm',
    whatsappReserveText:
      'Hi Integrated Learnings, I want to reserve a slot for PSLE June Intensive.',
  },

  'o-level-june-intensive': {
    slug: 'o-level-june-intensive',

    pageTitle:
      'O-Level June Intensive Subject Bootcamps | Physics Chemistry A Math E Math | Integrated Learnings',
    metaDescription:
      'O-Level June Intensive bootcamps in Singapore for Physics, Chemistry, A Math, and E Math. Small-group revision, weak-topic clinic, and mock correction. Capped at 8 students. Enquire now.',
    h1: 'O-Level June Intensive Subject Bootcamps',
    h1Sub:
      'Targeted revision for O-Level Physics, Chemistry, A Math, and E Math — with subject-specific bootcamps, a weak-topic clinic, and a mock correction session. Choose only the blocks your child needs.',

    eyebrow: 'June 2026 · Small-Group · O-Level Crash Course Singapore',
    heroCopy:
      'Each subject block targets the exact areas where O-Level students lose marks: structured question technique, calculation errors, concept application, and exam-pacing. Standalone or bundled.',
    capacityBadge: 'Capped at 8 students per subject block · Clinic sessions may be smaller',
    reserveCtaLabel: 'Reserve a Slot',
    whatsappCtaLabel: 'Check Subject Fit on WhatsApp',
    whatsappHeroText:
      'Hi Integrated Learnings, I want to check subject fit for O-Level June Intensive.',

    whoFor: [
      'Students falling behind in Physics, Chemistry, A Math, or E Math',
      'Students who understand content but cannot apply it well in exams',
      'Students who need a structured, focused holiday revision push',
      'Parents who want targeted revision — not last-minute panic sessions',
    ],

    timetableBlocks: [
      {
        date: '16–17 Jun',
        title: 'Physics Bootcamp',
        time: '2:00 pm – 5:00 pm',
        focus: [
          'Structured questions and technique',
          'MCQ review',
          'Calculation practice',
          'Error correction walkthrough',
        ],
      },
      {
        date: '18–19 Jun',
        title: 'Chemistry Bootcamp',
        time: '2:00 pm – 5:00 pm',
        focus: [
          'Concept consolidation',
          'Structured questions',
          'Application questions',
          'Mistake correction',
        ],
      },
      {
        date: '20–21 Jun',
        title: 'A Math Bootcamp',
        time: '2:00 pm – 5:00 pm',
        focus: [
          'Method flow and algebra',
          'Differentiation and integration drills',
          'Trigonometry review',
          'Exam-style practice',
        ],
      },
      {
        date: '22–23 Jun',
        title: 'E Math Bootcamp',
        time: '2:00 pm – 5:00 pm',
        focus: [
          'Timed practice sets',
          'Graphs, statistics, and geometry',
          'Accuracy and method correction',
        ],
      },
      {
        date: '24 Jun',
        title: 'Weak-Topic Clinic',
        time: '2:00 pm – 5:00 pm',
        focus: [
          'Students regrouped by topic weakness',
          'Targeted worksheet pack per group',
          'Guided walkthrough with teacher',
        ],
      },
      {
        date: '25 Jun',
        title: 'Mock + Correction Clinic',
        time: '2:00 pm – 5:00 pm',
        focus: [
          'Timed paper segment',
          'Live teacher review',
          'Personal weak-topic action plan',
        ],
      },
    ],
    timetableNote:
      'Sessions are 3 hours each. Materials included. Each subject block is standalone — join one, two, or combine with clinic sessions.',

    pricingOptions: [
      {
        title: '2-Day Subject Block',
        range: 'S$218 – S$258',
        note: 'Per subject · Physics, Chem, A Math, or E Math',
      },
      {
        title: 'Weak-Topic Clinic',
        range: 'S$98 – S$118',
        note: '1 session · Targeted correction by weakness',
      },
      {
        title: 'Mock + Correction Clinic',
        range: 'S$98 – S$118',
        note: '1 session · Timed segment + immediate feedback',
      },
      {
        title: '2-Subject Bundle',
        range: 'S$398 – S$478',
        note: 'Good fit for Math + Science combinations',
        highlight: true,
      },
      {
        title: 'Multi-Block Bundle',
        range: 'S$698 – S$798',
        note: '3+ subjects · Broader intensive support',
      },
    ],
    pricingNote:
      'Early-batch pricing applies while seats are available. Seat confirmed upon payment. Each block is capped at 8 students.',

    whyUs: [
      'Clarity-first approach — students understand the method before applying it under pressure.',
      'Strong diagnostic focus: we target repeated error patterns, not just topic coverage.',
      'Particularly strong delivery in Math, Physics, and Chemistry.',
      'Every session includes structured feedback and marked correction.',
      'Follow-through support available beyond the intensive — including optional study tracking.',
    ],

    safePromiseTitle: 'Clarity Promise',
    safePromiseBody:
      'Every student leaves with marked corrections, specific feedback on their key error patterns, and a clear next-step action plan for their weakest areas.',

    testimonials: [
      {
        quote:
          '"The Physics bootcamp gave my child the structured practice they were missing. Very focused and well-paced."',
        attribution: 'Parent · Sec 4 Student · Physics Bootcamp',
      },
      {
        quote:
          '"Very targeted. The correction feedback was specific and the action plan was practical. We knew what to do next."',
        attribution: 'Parent · Sec 4 Student · A Math + Chemistry Bundle',
      },
    ],

    faq: [
      {
        q: 'Can my child join just one subject block?',
        a: 'Yes. Every subject block is standalone. You choose based on where your child needs the most focused revision.',
      },
      {
        q: 'Is this suitable if my child is significantly behind?',
        a: 'Yes. We structure pacing and correction support for students who need rebuilding — not just revision acceleration.',
      },
      {
        q: 'Does every session include practice and correction?',
        a: 'Yes. Every block includes structured practice, active teacher feedback during the session, and correction of key errors.',
      },
      {
        q: 'Are the clinic sessions separate from the subject blocks?',
        a: 'Yes. The Weak-Topic Clinic and Mock Correction Clinic are standalone and can be taken independently or added to a subject block bundle.',
      },
      {
        q: 'What happens after I send an enquiry?',
        a: 'Our team contacts you on WhatsApp, does a subject fit-check, discusses priorities, and confirms available slots before enrolment.',
      },
    ],

    finalHeadline: 'The O-Level year is short. Use the June holidays well.',
    finalBody:
      'Subject blocks fill up quickly. Reserve early to secure the right combination and timing for your child.',
    whatsappFinalText:
      'Hi Integrated Learnings, I want to enquire about O-Level June Intensive.',

    formLevelLabel: "Student's level (e.g. Sec 4)",
    formSubjectLabel: 'Subject block(s) of interest',
    formSubjectOptions: [
      'Physics Bootcamp',
      'Chemistry Bootcamp',
      'A Math Bootcamp',
      'E Math Bootcamp',
      'Weak-Topic Clinic',
      'Mock + Correction Clinic',
      '2-Subject Bundle',
      'Multi-Block Bundle',
      'Not sure — please advise',
    ],
    defaultLevel: 'Secondary 4',
    defaultSchedule: '2:00pm – 5:00pm',
    whatsappReserveText:
      'Hi Integrated Learnings, I want to reserve a slot for O-Level June Intensive.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** CtaBand — repeatable urgency + action row */
const CtaBand: React.FC<{
  reserveLink: string;
  waLink: string;
  reserveLabel?: string;
  waLabel: string;
}> = ({ reserveLink, waLink, reserveLabel = 'Reserve a Slot', waLabel }) => (
  <div
    role="complementary"
    aria-label="Quick actions"
    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
      Limited seats &middot; Small-group intensive &middot; Seat confirmed upon payment
    </p>
    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
      <a
        href={reserveLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
      >
        {reserveLabel} <ArrowRight size={14} aria-hidden="true" />
      </a>
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
      >
        <MessageCircle size={14} aria-hidden="true" /> {waLabel}
      </a>
    </div>
  </div>
);

/** TimetableSection — mobile-scannable grid of session cards */
const TimetableSection: React.FC<{
  blocks: TimetableBlock[];
  note: string;
  headingId: string;
}> = ({ blocks, note, headingId }) => (
  <section
    aria-labelledby={headingId}
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    <h2 id={headingId} className="text-2xl font-black tracking-tight text-slate-900">
      Programme Timetable
    </h2>
    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">{note}</p>

    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {blocks.map((block) => (
        <article
          key={`${block.date}-${block.title}`}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-blue-200"
        >
          <div className="inline-flex w-fit items-center rounded-full border border-blue-100 bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-blue-700">
            {block.date}
          </div>

          <div>
            <h3 className="text-base font-black leading-snug text-slate-900">{block.title}</h3>
            <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock size={12} aria-hidden="true" /> {block.time}
            </p>
          </div>

          <ul
            className="mt-auto space-y-1.5"
            aria-label={`Session focus for ${block.title}`}
          >
            {block.focus.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-slate-700">
                <Target
                  size={13}
                  className="mt-[3px] shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  </section>
);

/** PricingSection — cards + comparison table */
const PricingSection: React.FC<{
  options: PricingOption[];
  note: string;
  reserveLink: string;
  headingId: string;
}> = ({ options, note, reserveLink, headingId }) => (
  <section
    aria-labelledby={headingId}
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    <h2 id={headingId} className="text-2xl font-black tracking-tight text-slate-900">
      Pricing &amp; Package Options
    </h2>

    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((opt) => (
        <article
          key={opt.title}
          className={`relative flex flex-col gap-2 rounded-2xl border p-5 transition ${
            opt.highlight
              ? 'border-amber-300 bg-amber-50 ring-1 ring-amber-200'
              : 'border-slate-200 bg-slate-50 hover:border-slate-300'
          }`}
        >
          {opt.highlight && (
            <span
              aria-label="Best value package"
              className="absolute right-4 top-4 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-900"
            >
              Best value
            </span>
          )}
          <p className="pr-20 text-sm font-black text-slate-900">{opt.title}</p>
          <p className="text-2xl font-black text-blue-800">{opt.range}</p>
          <p className="mt-auto text-xs leading-relaxed text-slate-500">{opt.note}</p>
        </article>
      ))}
    </div>

    <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full min-w-[460px] text-left text-sm">
        <caption className="sr-only">Package pricing comparison table</caption>
        <thead>
          <tr className="bg-slate-50">
            <th scope="col" className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Package
            </th>
            <th scope="col" className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Price range
            </th>
            <th scope="col" className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Best for
            </th>
          </tr>
        </thead>
        <tbody>
          {options.map((opt) => (
            <tr
              key={`cmp-${opt.title}`}
              className={`border-t border-slate-100 ${opt.highlight ? 'bg-amber-50/50' : ''}`}
            >
              <td className="px-4 py-3 font-semibold text-slate-800">{opt.title}</td>
              <td className="px-4 py-3 font-black text-blue-800">{opt.range}</td>
              <td className="px-4 py-3 text-slate-600">{opt.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-sm text-xs leading-relaxed text-slate-500">{note}</p>
      <a
        href={reserveLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
      >
        Reserve a Slot <ArrowRight size={14} aria-hidden="true" />
      </a>
    </div>
  </section>
);

/** FaqAccordion — accessible expand/collapse using <dl> */
const FaqAccordion: React.FC<{ items: FaqEntry[]; headingId: string }> = ({
  items,
  headingId,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const uid = useId();

  return (
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 id={headingId} className="text-2xl font-black tracking-tight text-slate-900">
        Frequently Asked Questions
      </h2>
      <dl className="mt-6 space-y-2">
        {items.map((item, idx) => {
          const isOpen = openIndex === idx;
          const btnId = `${uid}-q-${idx}`;
          const panelId = `${uid}-a-${idx}`;
          return (
            <div
              key={item.q}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
            >
              <dt>
                <button
                  id={btnId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() =>
                    setOpenIndex((prev) => (prev === idx ? null : idx))
                  }
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold text-slate-900">{item.q}</span>
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </dt>
              <dd
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                hidden={!isOpen}
                className="border-t border-slate-200 px-5 py-4"
              >
                <p className="text-sm leading-relaxed text-slate-600">{item.a}</p>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
};

/** WhyUsSection — credibility points + safe promise card side by side */
const WhyUsSection: React.FC<{
  points: string[];
  promiseTitle: string;
  promiseBody: string;
  headingId: string;
}> = ({ points, promiseTitle, promiseBody, headingId }) => (
  <div className="grid gap-5 lg:grid-cols-5">
    <section
      aria-labelledby={headingId}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:col-span-3"
    >
      <h2
        id={headingId}
        className="text-2xl font-black tracking-tight text-slate-900"
      >
        Why Integrated Learnings
      </h2>
      <ul className="mt-5 space-y-3">
        {points.map((pt) => (
          <li
            key={pt}
            className="flex items-start gap-3 text-sm leading-relaxed text-slate-700"
          >
            <CheckCircle2
              size={16}
              className="mt-[2px] shrink-0 text-emerald-600"
              aria-hidden="true"
            />
            {pt}
          </li>
        ))}
      </ul>
    </section>

    <section
      aria-label={promiseTitle}
      className="flex flex-col justify-between rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50 p-6 shadow-sm sm:p-8 lg:col-span-2"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500">
          Our Commitment
        </p>
        <h2 className="mt-2 text-xl font-black tracking-tight text-slate-900">
          {promiseTitle}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{promiseBody}</p>
      </div>
      <div className="mt-6 rounded-2xl border border-blue-100 bg-white/80 px-4 py-3">
        <p className="text-xs leading-relaxed text-slate-500">
          We focus on fit and follow-through. If the programme is not right for
          your child, we will say so.
        </p>
      </div>
    </section>
  </div>
);

/** TestimonialsSection — parent quote cards */
const TestimonialsSection: React.FC<{
  testimonials: Testimonial[];
  headingId: string;
}> = ({ testimonials, headingId }) => (
  <section
    aria-labelledby={headingId}
    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    <h2 id={headingId} className="text-2xl font-black tracking-tight text-slate-900">
      What Parents Have Said
    </h2>
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {testimonials.map((t) => (
        <figure
          key={t.attribution}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >
          <blockquote>
            <p className="text-sm leading-relaxed text-slate-700 before:content-none after:content-none">
              {t.quote}
            </p>
          </blockquote>
          <figcaption className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            {t.attribution}
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
);

/** FinalCtaSection — bottom conversion block */
const FinalCtaSection: React.FC<{
  headline: string;
  body: string;
  reserveLink: string;
  waLink: string;
  waLabel: string;
}> = ({ headline, body, reserveLink, waLink, waLabel }) => (
  <section
    aria-label="Reserve or enquire"
    className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-8 shadow-sm sm:p-10"
  >
    <p className="text-[11px] font-bold uppercase tracking-widest text-amber-600">
      Limited seats &middot; June 2026
    </p>
    <h2 className="mt-3 text-2xl font-black leading-snug tracking-tight text-slate-900 sm:text-3xl">
      {headline}
    </h2>
    <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">{body}</p>
    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <a
        href={reserveLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 py-3.5 text-sm font-black text-slate-950 shadow-md transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
      >
        Reserve a Slot <ArrowRight size={15} aria-hidden="true" />
      </a>
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-400 bg-white px-7 py-3.5 text-sm font-bold text-amber-700 transition hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
      >
        <MessageCircle size={15} aria-hidden="true" /> {waLabel}
      </a>
    </div>
  </section>
);

/** LeadForm — short, friction-light, accessible enquiry form */
const LeadForm: React.FC<{ config: CrashCourseConfig }> = ({ config }) => {
  const uid = useId();
  const [parentName, setParentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [level, setLevel] = useState(config.defaultLevel);
  const [subjectInterest, setSubjectInterest] = useState('');
  const [gradeConcern, setGradeConcern] = useState('');
  const [showExtra, setShowExtra] = useState(false);
  const [resultsNote, setResultsNote] = useState('');
  const [resultsFile, setResultsFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (
      !parentName.trim() ||
      !contactNumber.trim() ||
      !level.trim() ||
      !subjectInterest.trim() ||
      !gradeConcern.trim()
    ) {
      setNotice({
        type: 'error',
        text: 'Please complete all required fields before submitting.',
      });
      return;
    }

    setSubmitting(true);

    const result = await submitParentInquiry({
      parent_name: parentName.trim(),
      student_name: `${config.pageTitle} Lead`,
      contact_number: contactNumber.replace(/\s+/g, ''),
      email: `${contactNumber.replace(/\D/g, '') || 'lead'}@integratedlearns.local`,
      student_level: level.trim(),
      subjects: [subjectInterest.trim()],
      preferred_mode: 'group',
      postal_code: '',
      address: `Crash Course Landing — ${config.pageTitle}`,
      unit_number: '',
      learning_needs: gradeConcern.trim(),
      tutor_type: 'no-preference',
      preferred_schedule: config.defaultSchedule,
      additional_notes: [
        resultsNote.trim() || 'No results note provided.',
        resultsFile ? `Results file: ${resultsFile.name}` : 'No file attached.',
      ].join(' | '),
    });

    setSubmitting(false);

    if (!result.success) {
      setNotice({
        type: 'error',
        text: result.error || 'Submission failed. Please WhatsApp us directly.',
      });
      return;
    }

    setNotice({
      type: 'success',
      text: 'Submitted. Our team will contact you on WhatsApp shortly to confirm fit and slot options.',
    });
    setParentName('');
    setContactNumber('');
    setSubjectInterest('');
    setGradeConcern('');
    setResultsNote('');
    setResultsFile(null);
    setShowExtra(false);
  };

  const labelCls =
    'mb-1.5 block text-xs font-bold uppercase tracking-widest text-slate-500';
  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 transition placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100';

  return (
    <section
      id="enquire"
      aria-label="Enquire and reserve a slot"
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-2xl font-black tracking-tight text-slate-900">
        Reserve or Enquire
      </h2>
      <p className="mt-1.5 text-sm text-slate-500">
        Short form — we reply on WhatsApp to confirm fit and available slots.
      </p>

      <form
        ref={formRef}
        className="mt-6 grid gap-5 sm:grid-cols-2"
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label htmlFor={`${uid}-name`} className={labelCls}>
            Parent name{' '}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
          </label>
          <input
            id={`${uid}-name`}
            type="text"
            autoComplete="name"
            required
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className={inputCls}
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor={`${uid}-phone`} className={labelCls}>
            WhatsApp number{' '}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
          </label>
          <input
            id={`${uid}-phone`}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            placeholder="+65 9123 4567"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            className={inputCls}
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor={`${uid}-level`} className={labelCls}>
            {config.formLevelLabel}{' '}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
          </label>
          <input
            id={`${uid}-level`}
            type="text"
            required
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className={inputCls}
            aria-required="true"
          />
        </div>

        <div>
          <label htmlFor={`${uid}-subject`} className={labelCls}>
            {config.formSubjectLabel}{' '}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
          </label>
          <select
            id={`${uid}-subject`}
            required
            value={subjectInterest}
            onChange={(e) => setSubjectInterest(e.target.value)}
            className={inputCls}
            aria-required="true"
          >
            <option value="">Select a programme</option>
            {config.formSubjectOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-concern`} className={labelCls}>
            Latest grade or main concern{' '}
            <span aria-hidden="true" className="text-red-400">
              *
            </span>
          </label>
          <textarea
            id={`${uid}-concern`}
            required
            rows={3}
            placeholder="e.g. Scored 55 for Math last CA, struggles with problem sums"
            value={gradeConcern}
            onChange={(e) => setGradeConcern(e.target.value)}
            className={`${inputCls} resize-none`}
            aria-required="true"
          />
        </div>

        <div className="sm:col-span-2">
          <button
            type="button"
            aria-expanded={showExtra}
            onClick={() => setShowExtra((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ChevronDown
              size={13}
              aria-hidden="true"
              className={`transition-transform ${showExtra ? 'rotate-180' : ''}`}
            />
            {showExtra ? 'Hide results slip fields' : 'Attach results slip (optional)'}
          </button>

          {showExtra && (
            <div className="mt-4 space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div>
                <label htmlFor={`${uid}-file`} className={labelCls}>
                  Upload results slip (PDF, JPG, PNG)
                </label>
                <input
                  id={`${uid}-file`}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(e) =>
                    setResultsFile(e.target.files?.[0] ?? null)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
                />
              </div>
              <div>
                <label htmlFor={`${uid}-note`} className={labelCls}>
                  Note about results slip
                </label>
                <textarea
                  id={`${uid}-note`}
                  rows={2}
                  placeholder="Any context about the results"
                  value={resultsNote}
                  onChange={(e) => setResultsNote(e.target.value)}
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 py-3.5 text-sm font-black text-white shadow-md transition hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {submitting ? 'Submitting…' : 'Reserve My Slot'}
            {!submitting && <ArrowRight size={15} aria-hidden="true" />}
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-1 rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-xs leading-relaxed text-slate-500">
        <p>&#10003; We will reply with the timetable, package options, and fit-check steps.</p>
        <p>&#10003; No hard selling — we confirm fit before you commit.</p>
        <p>&#10003; Parents can share latest results for a quicker recommendation.</p>
      </div>

      {notice && (
        <div
          role="alert"
          aria-live="polite"
          className={`mt-5 rounded-xl border px-4 py-3 text-sm font-semibold ${
            notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {notice.text}
        </div>
      )}
    </section>
  );
};

/** MobileStickyBar — fixed bottom bar, hidden on md+ */
const MobileStickyBar: React.FC<{
  waLink: string;
  reserveLink: string;
}> = ({ waLink, reserveLink }) => (
  <div
    aria-label="Quick contact actions"
    className="fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur-sm md:hidden"
  >
    <a
      href={waLink}
      target="_blank"
      rel="noreferrer"
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white transition active:bg-emerald-700"
    >
      <MessageCircle size={14} aria-hidden="true" /> WhatsApp
    </a>
    <a
      href={reserveLink}
      target="_blank"
      rel="noreferrer"
      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950 transition active:bg-amber-400"
    >
      Reserve a Slot <ArrowRight size={14} aria-hidden="true" />
    </a>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PAGE RENDERER
// ─────────────────────────────────────────────────────────────────────────────

const CrashCourseCampaignPage: React.FC<{ config: CrashCourseConfig }> = ({
  config,
}) => {
  const reserveLink = useMemo(
    () => toWhatsApp(config.whatsappReserveText),
    [config.whatsappReserveText],
  );
  const waHeroLink = useMemo(
    () => toWhatsApp(config.whatsappHeroText),
    [config.whatsappHeroText],
  );
  const waFinalLink = useMemo(
    () => toWhatsApp(config.whatsappFinalText),
    [config.whatsappFinalText],
  );

  // SEO: manage page title + meta description, restore on unmount
  useEffect(() => {
    const prevTitle = document.title;
    document.title = config.pageTitle;

    let metaEl = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const prevContent = metaEl?.getAttribute('content') ?? '';
    if (!metaEl) {
      metaEl = document.createElement('meta');
      metaEl.setAttribute('name', 'description');
      document.head.appendChild(metaEl);
    }
    metaEl.setAttribute('content', config.metaDescription);

    return () => {
      document.title = prevTitle;
      metaEl?.setAttribute('content', prevContent);
    };
  }, [config.pageTitle, config.metaDescription]);

  // Stable section heading IDs (per slug)
  const ids = useMemo(
    () => ({
      whoFor: `${config.slug}-who`,
      timetable: `${config.slug}-timetable`,
      pricing: `${config.slug}-pricing`,
      why: `${config.slug}-why`,
      testimonials: `${config.slug}-testimonials`,
      faq: `${config.slug}-faq`,
    }),
    [config.slug],
  );

  return (
    <>
      {/* Skip to form for keyboard users */}
      <a
        href="#enquire"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:shadow-lg"
      >
        Skip to enquiry form
      </a>

      <div className="bg-[#f7f7f6] pb-24 text-slate-900 md:pb-0">
        {/* ── HERO ──────────────────────────────────────────────────── */}
        <header className="relative overflow-hidden bg-[linear-gradient(150deg,#0f172a_0%,#1e2940_50%,#1e3a8a_100%)] px-4 pb-16 pt-16 text-white sm:px-6 sm:pt-24">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-20 top-10 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-sky-400/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-5xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
              <Sparkles size={12} aria-hidden="true" /> {config.eyebrow}
            </p>

            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl">
              {config.h1}
            </h1>

            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-slate-300">
              {config.h1Sub}
            </p>

            <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-slate-400">
              {config.heroCopy}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={reserveLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-7 py-3.5 text-sm font-black text-slate-950 shadow-lg transition hover:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                {config.reserveCtaLabel} <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a
                href={waHeroLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/50"
              >
                <MessageCircle size={15} aria-hidden="true" />{' '}
                {config.whatsappCtaLabel}
              </a>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-5 py-3 text-xs font-semibold text-amber-200">
              <Users size={13} aria-hidden="true" /> {config.capacityBadge}
            </div>
          </div>
        </header>

        {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
        <main className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
          {/* CTA band — post-hero */}
          <CtaBand
            reserveLink={reserveLink}
            waLink={waHeroLink}
            waLabel={config.whatsappCtaLabel}
          />

          {/* Who this is for */}
          <section
            aria-labelledby={ids.whoFor}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <h2
              id={ids.whoFor}
              className="text-2xl font-black tracking-tight text-slate-900"
            >
              Who this programme is for
            </h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {config.whoFor.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-relaxed text-slate-700"
                >
                  <Users
                    size={15}
                    className="mt-[2px] shrink-0 text-blue-600"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Timetable */}
          <TimetableSection
            blocks={config.timetableBlocks}
            note={config.timetableNote}
            headingId={ids.timetable}
          />

          {/* Pricing */}
          <PricingSection
            options={config.pricingOptions}
            note={config.pricingNote}
            reserveLink={reserveLink}
            headingId={ids.pricing}
          />

          {/* CTA band — post-pricing */}
          <CtaBand
            reserveLink={reserveLink}
            waLink={waHeroLink}
            waLabel={config.whatsappCtaLabel}
          />

          {/* Why us + promise */}
          <WhyUsSection
            points={config.whyUs}
            promiseTitle={config.safePromiseTitle}
            promiseBody={config.safePromiseBody}
            headingId={ids.why}
          />

          {/* Testimonials */}
          <TestimonialsSection
            testimonials={config.testimonials}
            headingId={ids.testimonials}
          />

          {/* FAQ */}
          <FaqAccordion items={config.faq} headingId={ids.faq} />

          {/* Final CTA */}
          <FinalCtaSection
            headline={config.finalHeadline}
            body={config.finalBody}
            reserveLink={reserveLink}
            waLink={waFinalLink}
            waLabel={config.whatsappCtaLabel}
          />

          {/* Lead form */}
          <LeadForm config={config} />

          {/* Footer nav */}
          <nav aria-label="Page footer navigation" className="flex flex-col gap-3 sm:flex-row">
            <a
              href={waHeroLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500"
            >
              <MessageCircle size={15} aria-hidden="true" /> WhatsApp Integrated
              Learnings
            </a>
            <Link
              to="/tuition"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              &larr; Back to Family Tuition
            </Link>
          </nav>
        </main>
      </div>

      <MobileStickyBar waLink={waHeroLink} reserveLink={reserveLink} />
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// NAMED PAGE EXPORTS — consumed by App.tsx routes
// ─────────────────────────────────────────────────────────────────────────────

export const FamilyPSLEJuneIntensivePage: React.FC = () => (
  <CrashCourseCampaignPage config={configs['psle-june-intensive']} />
);

export const FamilyOLevelJuneIntensivePage: React.FC = () => (
  <CrashCourseCampaignPage config={configs['o-level-june-intensive']} />
);
