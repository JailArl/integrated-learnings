import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  MessageCircle,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { submitParentInquiry } from '../services/parentSubmissions';

type CrashCourseSlug = 'psle-june-intensive' | 'o-level-june-intensive';

type TimetableBlock = {
  date: string;
  title: string;
  time: string;
  targetPractice: string[];
};

type PricingCard = {
  title: string;
  range: string;
  note: string;
};

type CrashCourseConfig = {
  slug: CrashCourseSlug;
  pageTitle: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroSupportingLine: string;
  heroSecondaryCta: string;
  heroSecondaryWhatsAppText: string;
  capacityLine: string;
  finalHeadline: string;
  finalSecondaryCta: string;
  finalSecondaryWhatsAppText: string;
  leadFormLevelLabel: string;
  leadFormSubjectLabel: string;
  leadFormSubjectOptions: string[];
  whoFor: string[];
  timetableBlocks: TimetableBlock[];
  pricingCards: PricingCard[];
  whyIntegratedLearnings: string[];
  safePromiseTitle: string;
  safePromiseBody: string;
  faq: Array<{ q: string; a: string }>;
  whatsappDefaultText: string;
};

const toWhatsApp = (text: string) => `https://wa.me/6598882675?text=${encodeURIComponent(text)}`;

const configs: Record<CrashCourseSlug, CrashCourseConfig> = {
  'psle-june-intensive': {
    slug: 'psle-june-intensive',
    pageTitle: 'PSLE Math & Science June Intensive',
    heroHeadline: 'PSLE Math & Science June Intensive',
    heroSubheadline:
      'Focused holiday revision for students who need stronger foundations, better answering technique, and structured practice before the next exam stretch.',
    heroSupportingLine:
      'Small-group intensive with targeted practice, correction, and weak-topic support.',
    heroSecondaryCta: 'Get the Timetable on WhatsApp',
    heroSecondaryWhatsAppText:
      'Hi Integrated Learnings, please send me the PSLE June Intensive timetable.',
    capacityLine:
      'Small-group intensive, capped at 8 students for closer feedback and correction.',
    finalHeadline:
      'Use the June holidays properly. Don\'t wait for the next poor result.',
    finalSecondaryCta: 'WhatsApp for Details',
    finalSecondaryWhatsAppText:
      'Hi Integrated Learnings, I want details for PSLE June Intensive.',
    leadFormLevelLabel: 'Child level',
    leadFormSubjectLabel: 'Subject interest',
    leadFormSubjectOptions: ['PSLE Math Bootcamp', 'PSLE Science Bootcamp', 'Full PSLE Intensive Bundle'],
    whoFor: [
      'Students weak in PSLE Math or Science',
      'Students who revise but still make repeated mistakes',
      'Students who need more structure, not just more worksheets',
      'Parents who want the June holidays used properly',
    ],
    timetableBlocks: [
      {
        date: '16 Jun',
        title: 'Math Bootcamp 1',
        time: '10:00am - 1:00pm',
        targetPractice: [
          'Diagnostic drill',
          'Core concepts',
          'Worked examples',
          'Guided practice',
        ],
      },
      {
        date: '17 Jun',
        title: 'Math Bootcamp 2',
        time: '10:00am - 1:00pm',
        targetPractice: [
          'Problem sums',
          'Timed practice',
          'Correction and strategy review',
        ],
      },
      {
        date: '18 Jun',
        title: 'Science Bootcamp 1',
        time: '10:00am - 1:00pm',
        targetPractice: [
          'Key concepts',
          'Answering structure',
          'MCQ + OEQ practice',
        ],
      },
      {
        date: '19 Jun',
        title: 'Science Bootcamp 2',
        time: '10:00am - 1:00pm',
        targetPractice: [
          'Application questions',
          'Open-ended correction',
          'Common mistake review',
        ],
      },
      {
        date: '20 Jun',
        title: 'Mixed Mock + Correction Clinic',
        time: '10:00am - 1:00pm',
        targetPractice: [
          'Timed mixed practice',
          'Teacher review',
          'Weak-topic action plan',
        ],
      },
    ],
    pricingCards: [
      {
        title: 'Math Bootcamp (2 sessions)',
        range: 'S$188 - S$218',
        note: 'Focused concept + method correction',
      },
      {
        title: 'Science Bootcamp (2 sessions)',
        range: 'S$188 - S$218',
        note: 'Targeted answering + open-ended correction',
      },
      {
        title: 'Mixed Mock + Correction Clinic',
        range: 'S$88 - S$108',
        note: 'Timed mixed set + teacher feedback clinic',
      },
      {
        title: 'Full PSLE Intensive Bundle',
        range: 'S$398 - S$458',
        note: 'Best-value full programme support',
      },
    ],
    whyIntegratedLearnings: [
      'We help identify where students are actually getting stuck.',
      'We explain difficult topics in a clearer, more manageable way.',
      'We make lessons engaging so students stay switched on.',
      'We focus on structured support and follow-through.',
      'Strong support in Math and Science.',
      'Optional study tracking continuation after the programme.',
    ],
    safePromiseTitle: 'Right-Fit Promise',
    safePromiseBody:
      'If after the first session the programme is clearly not the right fit, we will recommend the next best option and refund the unused portion based on our policy.',
    faq: [
      {
        q: 'Is this suitable for weak students?',
        a: 'Yes. The programme is built for students who need stronger foundations, clearer method steps, and correction support.',
      },
      {
        q: 'Can my child join only Math or only Science?',
        a: 'Yes. Parents can choose one subject bootcamp or the full bundle based on current needs.',
      },
      {
        q: 'Are materials provided?',
        a: 'Yes. Guided worksheets, structured practice sets, and correction resources are included.',
      },
      {
        q: 'Is this small-group?',
        a: 'Yes. The group is capped at 8 students for closer feedback and correction quality.',
      },
      {
        q: 'What happens after I enquire?',
        a: 'Our team contacts you on WhatsApp, runs a fit-check, and confirms the best slot before enrolment.',
      },
    ],
    whatsappDefaultText:
      'Hi Integrated Learnings, I want to reserve a slot for PSLE Math & Science June Intensive.',
  },
  'o-level-june-intensive': {
    slug: 'o-level-june-intensive',
    pageTitle: 'O-Level June Intensive Subject Bootcamps',
    heroHeadline: 'O-Level June Intensive Subject Bootcamps',
    heroSubheadline:
      'Focused revision for Physics, Chemistry, A Math and E Math, with weak-topic clinic and mock correction support.',
    heroSupportingLine: 'Choose only the subject blocks your child needs.',
    heroSecondaryCta: 'Check Subject Fit on WhatsApp',
    heroSecondaryWhatsAppText:
      'Hi Integrated Learnings, can I check subject fit for O-Level June Intensive?',
    capacityLine:
      'Each subject block is capped at 8 students. Clinic sessions can be capped smaller for closer correction.',
    finalHeadline:
      'Don\'t let the June holidays pass without a proper revision push.',
    finalSecondaryCta: 'Get the Full Timetable',
    finalSecondaryWhatsAppText:
      'Hi Integrated Learnings, please send the full O-Level June Intensive timetable.',
    leadFormLevelLabel: 'Student level',
    leadFormSubjectLabel: 'Subject block(s) interested in',
    leadFormSubjectOptions: [
      'Physics Bootcamp',
      'Chemistry Bootcamp',
      'A Math Bootcamp',
      'E Math Bootcamp',
      'Weak-Topic Clinic',
      'Mock + Correction Clinic',
      '2-Subject Bundle',
      'Multi-Block Bundle',
    ],
    whoFor: [
      'Students falling behind in Physics, Chemistry, A Math or E Math',
      'Students who know content but cannot apply it well in exams',
      'Students who need a structured holiday push',
      'Parents who want targeted revision, not last-minute panic',
    ],
    timetableBlocks: [
      {
        date: '16-17 Jun',
        title: 'Physics Bootcamp',
        time: '2:00pm - 5:00pm',
        targetPractice: [
          'Structured questions',
          'MCQ review',
          'Calculation practice',
          'Common error correction',
        ],
      },
      {
        date: '18-19 Jun',
        title: 'Chemistry Bootcamp',
        time: '2:00pm - 5:00pm',
        targetPractice: [
          'Concepts',
          'Structured questions',
          'Application questions',
          'Mistake correction',
        ],
      },
      {
        date: '20-21 Jun',
        title: 'A Math Bootcamp',
        time: '2:00pm - 5:00pm',
        targetPractice: [
          'Methods',
          'Algebra',
          'Differentiation/integration drills',
          'Exam-style practice',
        ],
      },
      {
        date: '22-23 Jun',
        title: 'E Math Bootcamp',
        time: '2:00pm - 5:00pm',
        targetPractice: [
          'Timed practice',
          'Graphs/statistics/geometry review',
          'Accuracy and method correction',
        ],
      },
      {
        date: '24 Jun',
        title: 'Weak-Topic Clinic',
        time: '2:00pm - 5:00pm',
        targetPractice: [
          'Regroup students by weakness',
          'Targeted worksheet pack',
          'Guided walkthrough',
        ],
      },
      {
        date: '25 Jun',
        title: 'Mock + Correction Clinic',
        time: '2:00pm - 5:00pm',
        targetPractice: [
          'Timed paper segment',
          'Live review',
          'Personal action plan',
        ],
      },
    ],
    pricingCards: [
      {
        title: '2-day subject block',
        range: 'S$218 - S$258',
        note: 'Choose based on weakness priority',
      },
      {
        title: 'Weak-Topic Clinic',
        range: 'S$98 - S$118',
        note: 'Focused regroup and targeted correction',
      },
      {
        title: 'Mock + Correction Clinic',
        range: 'S$98 - S$118',
        note: 'Timed segment with immediate review',
      },
      {
        title: '2-subject bundle',
        range: 'S$398 - S$478',
        note: 'Good fit for Math + Science combos',
      },
      {
        title: 'Multi-block bundle',
        range: 'S$698 - S$798',
        note: 'For students needing broader intensive support',
      },
    ],
    whyIntegratedLearnings: [
      'Clarity-first teaching so students understand before applying.',
      'Strong diagnostic focus on repeated mistakes and weak sections.',
      'Stronger support in Math, Physics, and Chemistry.',
      'We help students understand first, then apply under exam pressure.',
      'Follow-through support beyond one-off lessons.',
      'Optional study tracking support after intensive blocks.',
    ],
    safePromiseTitle: 'Clarity Promise',
    safePromiseBody:
      'Students leave with clearer feedback, marked correction, and a next-step weak-topic action plan.',
    faq: [
      {
        q: 'Can my child join only one subject?',
        a: 'Yes. You can choose one subject block or combine multiple blocks based on needs.',
      },
      {
        q: 'Is this suitable for weaker students?',
        a: 'Yes. We structure correction and pacing support for students who need rebuilding, not just faster drilling.',
      },
      {
        q: 'Will there be practice and correction?',
        a: 'Yes. Every block includes structured practice plus active correction and feedback loops.',
      },
      {
        q: 'Are the clinic sessions included?',
        a: 'Clinic sessions can be taken as standalone or bundled depending on your selected package.',
      },
      {
        q: 'What happens after I enquire?',
        a: 'We contact you on WhatsApp for subject fit-check, discuss weak-topic priorities, and confirm suitable slots.',
      },
    ],
    whatsappDefaultText:
      'Hi Integrated Learnings, I want to reserve for O-Level June Intensive Subject Bootcamps.',
  },
};

const CrashCourseLeadForm: React.FC<{ config: CrashCourseConfig }> = ({ config }) => {
  const [parentName, setParentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [level, setLevel] = useState(config.slug === 'psle-june-intensive' ? 'Primary 6' : 'Secondary 4');
  const [subjectInterest, setSubjectInterest] = useState('');
  const [gradeConcern, setGradeConcern] = useState('');
  const [resultsSlipNote, setResultsSlipNote] = useState('');
  const [resultsSlipFile, setResultsSlipFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(null);

    if (!parentName.trim() || !contactNumber.trim() || !level.trim() || !subjectInterest.trim() || !gradeConcern.trim()) {
      setNotice({ type: 'error', text: 'Please complete all required fields before submitting.' });
      return;
    }

    setLoading(true);
    const fallbackEmail = `${contactNumber.replace(/\D/g, '') || 'lead'}@integratedlearns.local`;
    const fileNote = resultsSlipFile ? `Results slip file selected: ${resultsSlipFile.name}` : 'No file selected';

    const response = await submitParentInquiry({
      parent_name: parentName.trim(),
      student_name: `${config.pageTitle} Lead`,
      contact_number: contactNumber.replace(/\s+/g, ''),
      email: fallbackEmail,
      student_level: level.trim(),
      subjects: [subjectInterest.trim()],
      preferred_mode: 'group',
      postal_code: '',
      address: `Crash Course Landing - ${config.pageTitle}`,
      unit_number: '',
      learning_needs: gradeConcern.trim(),
      tutor_type: 'no-preference',
      preferred_schedule: config.slug === 'psle-june-intensive' ? '10:00am - 1:00pm' : '2:00pm - 5:00pm',
      additional_notes: `${resultsSlipNote.trim() || 'No results note provided.'} | ${fileNote}`,
    });

    setLoading(false);
    if (!response.success) {
      setNotice({ type: 'error', text: response.error || 'Submission failed. Please WhatsApp us directly.' });
      return;
    }

    setNotice({ type: 'success', text: 'Submitted. Our team will contact you on WhatsApp for fit-check and slot confirmation.' });
    setParentName('');
    setContactNumber('');
    setSubjectInterest('');
    setGradeConcern('');
    setResultsSlipNote('');
    setResultsSlipFile(null);
  };

  return (
    <section id="lead-form" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-xl font-black text-primary">Lead Form</h2>
      <p className="mt-1 text-sm text-slate-600">Complete this and we will WhatsApp you to confirm fit and available slots.</p>

      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Parent name</label>
          <input value={parentName} onChange={(e) => setParentName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Mobile / WhatsApp number</label>
          <input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{config.leadFormLevelLabel}</label>
          <input value={level} onChange={(e) => setLevel(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{config.leadFormSubjectLabel}</label>
          <select value={subjectInterest} onChange={(e) => setSubjectInterest(e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none">
            <option value="">Select option</option>
            {config.leadFormSubjectOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Latest grade / concern</label>
          <textarea value={gradeConcern} onChange={(e) => setGradeConcern(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold uppercase tracking-[0.1em] text-slate-500">Optional upload or note for results slip</label>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(e) => setResultsSlipFile(e.target.files?.[0] || null)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white" />
          <textarea value={resultsSlipNote} onChange={(e) => setResultsSlipNote(e.target.value)} rows={2} placeholder="Add any note about the results slip here" className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-secondary focus:outline-none" />
        </div>

        <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-xl bg-secondary px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-60 sm:col-span-2">
          {loading ? 'Submitting...' : 'Reserve My Slot'} <ArrowRight size={15} className="ml-2" />
        </button>
      </form>

      {notice && (
        <p className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.text}
        </p>
      )}
    </section>
  );
};

const CrashCourseCampaignPage: React.FC<{ config: CrashCourseConfig }> = ({ config }) => {
  const reserveLink = useMemo(() => toWhatsApp(config.whatsappDefaultText), [config.whatsappDefaultText]);
  const heroSecondaryLink = useMemo(() => toWhatsApp(config.heroSecondaryWhatsAppText), [config.heroSecondaryWhatsAppText]);
  const finalSecondaryLink = useMemo(() => toWhatsApp(config.finalSecondaryWhatsAppText), [config.finalSecondaryWhatsAppText]);

  useEffect(() => {
    document.title = `${config.pageTitle} | Integrated Learnings`;
  }, [config.pageTitle]);

  return (
    <div className="bg-stone-50 pb-24 text-slate-900 md:pb-0">
      <section className="relative overflow-hidden bg-[linear-gradient(155deg,#0f172a_0%,#1f2937_45%,#1e3a8a_100%)] px-4 pb-16 pt-16 text-white sm:px-6 sm:pt-20">
        <div className="absolute inset-0 opacity-35" aria-hidden="true">
          <div className="absolute left-[-8%] top-12 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute right-[-8%] top-10 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
            <Sparkles size={14} /> Integrated Learnings · June Intensive
          </p>
          <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">{config.heroHeadline}</h1>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-200 sm:text-base">{config.heroSubheadline}</p>
          <p className="mt-3 max-w-3xl text-sm font-semibold text-slate-100">{config.heroSupportingLine}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={reserveLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300">
              Reserve a Slot <ArrowRight size={15} className="ml-2" />
            </a>
            <a href={heroSecondaryLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20">
              {config.heroSecondaryCta}
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-300/40 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-100">
            {config.capacityLine}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-primary">Who this is for</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {config.whoFor.map((item) => (
              <p key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <Users size={16} className="mt-0.5 shrink-0 text-secondary" /> {item}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-primary">Programme Structure</h2>
          <p className="mt-2 text-sm text-slate-600">Compact block-based format for focused revision and easier parent planning.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {config.timetableBlocks.map((block) => (
              <article key={`${block.date}-${block.title}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-secondary">{block.date}</p>
                <h3 className="mt-1 text-base font-black text-primary">{block.title}</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-600">
                  <ClipboardCheck size={13} /> {block.time}
                </p>
                <div className="mt-3 space-y-1.5">
                  {block.targetPractice.map((point) => (
                    <p key={point} className="flex items-start gap-2 text-sm text-slate-700">
                      <Target size={14} className="mt-0.5 shrink-0 text-emerald-600" /> {point}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-primary">Pricing and Package Options</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {config.pricingCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-black text-primary">{card.title}</p>
                <p className="mt-2 text-2xl font-black text-secondary">{card.range}</p>
                <p className="mt-2 text-sm text-slate-700">{card.note}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p>Early-bird / first-batch pricing may apply.</p>
            <p className="mt-1">Seat confirmed upon payment.</p>
            <p className="mt-1 font-semibold">Limited seats available.</p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-primary">Why Integrated Learnings</h2>
            <div className="mt-4 space-y-3">
              {config.whyIntegratedLearnings.map((item) => (
                <p key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" /> {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-primary">{config.safePromiseTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{config.safePromiseBody}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-primary">FAQ</h2>
          <div className="mt-4 space-y-3">
            {config.faq.map((item) => (
              <article key={item.q} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-primary">{item.q}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-primary">{config.finalHeadline}</h2>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href={reserveLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-400">
              Reserve a Slot <ArrowRight size={15} className="ml-2" />
            </a>
            <a href={finalSecondaryLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl border border-amber-500 bg-white px-6 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100">
              {config.finalSecondaryCta}
            </a>
          </div>
        </section>

        <CrashCourseLeadForm config={config} />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-primary">WhatsApp Contact Prompt</h2>
          <p className="mt-2 text-sm text-slate-600">Prefer to speak to us first? WhatsApp us for fit-check and class availability.</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <a href={reserveLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-500">
              <MessageCircle size={15} className="mr-2" /> WhatsApp Integrated Learnings
            </a>
            <Link to="/tuition" className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Back to Family Tuition
            </Link>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-3xl gap-2">
          <a href={reserveLink} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-3 py-3 text-xs font-black text-white">
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
