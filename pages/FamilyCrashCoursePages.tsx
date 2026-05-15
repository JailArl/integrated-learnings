import React, { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Home,
  MessageCircle,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import { supabase } from '../services/supabase';

const WA_NUMBER = '6598882675';
const PAGE_TAG = 'exam-rescue-home-crash-course';
type CrashCourseVariant = 'combined' | 'psle' | 'olevel';

const EXAM_COUNTDOWN_TARGETS = {
  psleMath: new Date('2026-09-25T08:15:00+08:00').getTime(),
  oLevelMath: new Date('2026-10-21T14:00:00+08:00').getTime(),
} as const;

const northAreas = ['Woodlands', 'Admiralty', 'Marsiling', 'Sembawang', 'Canberra', 'Yishun', 'Khatib'];

const getTimeLeft = (targetTime: number, now: number) => Math.max(0, targetTime - now);

const formatCountdown = (timeLeft: number) => {
  const days = Math.floor(timeLeft / 86400000);
  const hours = Math.floor((timeLeft % 86400000) / 3600000);
  const mins = Math.floor((timeLeft % 3600000) / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const pad = (value: number) => String(value).padStart(2, '0');

  return {
    days: pad(days),
    hours: pad(hours),
    mins: pad(mins),
    secs: pad(secs),
  };
};

const CountdownCard: React.FC<{
  title: string;
  subtitle: string;
  timeLeft: number;
}> = ({ title, subtitle, timeLeft }) => {
  const parts = formatCountdown(timeLeft);

  return (
    <div className="rounded-2xl border border-white/15 bg-black/15 px-4 py-4 shadow-lg shadow-black/10 backdrop-blur-sm">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">{title}</p>
      <div className="mt-3 flex items-center gap-2 text-white">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_0_0_rgba(252,211,77,0.55)] animate-pulse" aria-hidden="true" />
        <span className="text-xs font-semibold text-slate-200">{subtitle}</span>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2 text-center">
        {[
          { label: 'Days', value: parts.days },
          { label: 'Hrs', value: parts.hours },
          { label: 'Mins', value: parts.mins },
          { label: 'Secs', value: parts.secs },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-white/10 bg-white/10 px-2 py-2">
            <div className="text-lg font-black tabular-nums text-white">{item.value}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-300">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const getPageSeo = (variant: CrashCourseVariant) => {
  if (variant === 'psle') {
    return {
      title: 'PSLE Math & Science June Crash Course Singapore | Integrated Learnings',
      description: 'PSLE Math and Science June holiday rescue course for weak topics, WA2 gaps, and exam preparation in North Singapore.',
      canonicalPath: '/family/crash-courses/psle-june-intensive',
    };
  }

  if (variant === 'olevel') {
    return {
      title: 'O-Level Math & Science June Crash Course Singapore | Integrated Learnings',
      description: 'O-Level E Math, A Math, Physics, Chemistry and Combined Science June holiday rescue course for weak chapters and exam preparation.',
      canonicalPath: '/family/crash-courses/o-level-june-intensive',
    };
  }

  return {
    title: 'PSLE & O-Level June Holiday Crash Courses Singapore | Integrated Learnings',
    description: 'Targeted PSLE and O-Level June holiday crash courses in North Singapore. Send WA2 or mid-year results for a free fit check.',
    canonicalPath: '/family/crash-courses/psle-june-intensive',
  };
};

const toWhatsApp = (text: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

const trackCtaClick = (ctaName: string, destination: string) => {
  try {
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'home_crash_course_cta_click', {
        event_category: 'crash_course',
        event_label: `${PAGE_TAG}:${ctaName}`,
        page_path: window.location.pathname,
        destination,
      });
      return;
    }
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({
        event: 'home_crash_course_cta_click',
        event_category: 'crash_course',
        event_label: `${PAGE_TAG}:${ctaName}`,
        page_path: window.location.pathname,
        destination,
      });
    }
  } catch {
    // Tracking must never block conversion actions.
  }
};

const setPageSeo = (title: string, description: string, canonicalPath: string) => {
  const previousTitle = document.title;
  document.title = title;

  let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  const previousDescription = metaDescription?.getAttribute('content') ?? '';
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);

  const setMeta = (selector: string, attr: 'name' | 'property', key: string, value: string) => {
    let el = document.querySelector<HTMLMetaElement>(selector);
    const previous = el?.getAttribute('content') ?? '';
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', value);
    return { el, previous };
  };

  const origin = window.location.origin || 'https://www.integratedlearnings.com.sg';
  const canonicalHref = `${origin}${canonicalPath}`;
  const ogTitle = setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  const ogDescription = setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  const ogUrl = setMeta('meta[property="og:url"]', 'property', 'og:url', canonicalHref);
  const twitterTitle = setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  const twitterDescription = setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);

  let canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const previousCanonicalHref = canonicalLink?.getAttribute('href') ?? '';
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', canonicalHref);

  return () => {
    document.title = previousTitle;
    metaDescription?.setAttribute('content', previousDescription);
    ogTitle.el?.setAttribute('content', ogTitle.previous);
    ogDescription.el?.setAttribute('content', ogDescription.previous);
    ogUrl.el?.setAttribute('content', ogUrl.previous);
    twitterTitle.el?.setAttribute('content', twitterTitle.previous);
    twitterDescription.el?.setAttribute('content', twitterDescription.previous);
    if (canonicalLink) {
      if (previousCanonicalHref) {
        canonicalLink.setAttribute('href', previousCanonicalHref);
      } else {
        canonicalLink.remove();
      }
    }
  };
};

const SectionHeading: React.FC<{ kicker?: string; title: string; subtitle?: string }> = ({ kicker, title, subtitle }) => (
  <div>
    {kicker && <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-600">{kicker}</p>}
    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
    {subtitle && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{subtitle}</p>}
  </div>
);

const SectionCard: React.FC<{ className?: string; children: React.ReactNode; id?: string }> = ({ className = '', children, id }) => (
  <article id={id} className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 ${className}`.trim()}>
    {children}
  </article>
);

const Pill: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`.trim()}>
    {children}
  </span>
);

const ActionButton: React.FC<{
  label: string;
  href: string;
  className?: string;
  ctaName: string;
  icon?: React.ReactNode;
}> = ({ label, href, className = '', ctaName, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    onClick={() => trackCtaClick(ctaName, href)}
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition ${className}`.trim()}
  >
    {icon}
    {label}
  </a>
);

const BulletList: React.FC<{ items: string[]; iconClassName?: string }> = ({ items, iconClassName = 'text-emerald-600' }) => (
  <ul className="space-y-2">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-2 text-sm leading-relaxed text-slate-700">
        <CheckCircle2 size={15} className={`mt-0.5 shrink-0 ${iconClassName}`} aria-hidden="true" />
        {item}
      </li>
    ))}
  </ul>
);

const FaqAccordion: React.FC<{ items: { question: string; answer: string }[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <SectionCard>
      <SectionHeading title="FAQ" />
      <div className="mt-5 space-y-2">
        {items.map((item, index) => {
          const isOpen = open === index;
          const buttonId = `${uid}-faq-btn-${index}`;
          const panelId = `${uid}-faq-panel-${index}`;

          return (
            <article key={item.question} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen((prev) => (prev === index ? null : index))}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold text-slate-900">{item.question}</span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </h3>
              <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="border-t border-slate-200 px-5 py-4">
                <p className="text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </div>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
};

const PackageCard: React.FC<{
  title: string;
  scheduleNote?: string;
  duration: string;
  bestFor: string;
  format: string;
  price?: string;
  includes: string[];
  popular?: boolean;
}> = ({ title, scheduleNote, duration, bestFor, format, price, includes, popular }) => (
  <article className={`relative rounded-2xl border p-5 ${popular ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-200' : 'border-slate-200 bg-slate-50'}`}>
    {popular && (
      <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-900">
        Most Popular
      </span>
    )}
    <h3 className="pr-24 text-lg font-black text-slate-900">{title}</h3>
    {scheduleNote ? <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">{scheduleNote}</p> : null}
    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
      <span>{duration}</span>
      <span>•</span>
      <span>{bestFor}</span>
      <span>•</span>
      <span>{format}</span>
    </div>
    {price ? <p className="mt-4 text-2xl font-black text-slate-900">{price}</p> : null}
    <ul className="mt-4 space-y-2">
      {includes.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  </article>
);

const LevelCard: React.FC<{
  title: string;
  subtitle: string;
  focus: string[];
  href: string;
  ctaLabel: string;
}> = ({ title, subtitle, focus, href, ctaLabel }) => (
  <SectionCard className="h-full border-2 border-slate-200">
    <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Choose Your Level</p>
    <h3 className="mt-2 text-2xl font-black text-slate-900">{title}</h3>
    <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
    <BulletList items={focus} />
    <div className="mt-6">
      <a href={href} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">
        {ctaLabel} <ArrowRight size={15} className="ml-2" aria-hidden="true" />
      </a>
    </div>
  </SectionCard>
);

const getPageCopy = (variant: CrashCourseVariant) => {
  const isPsle = variant === 'psle';
  const isOLevel = variant === 'olevel';
  const currentMonth = new Date().toLocaleString('en-US', { timeZone: 'Asia/Singapore', month: 'short' });
  const inWa2Season = ['May', 'Jun'].includes(currentMonth);
  const inMidYearSeason = ['Jul', 'Aug'].includes(currentMonth);
  const inExamSprint = ['Sep', 'Oct'].includes(currentMonth);

  const seasonalNote = isPsle
    ? '⚠️ WA2 results just revealed the weak topics. Our June Holiday Rescue Intake starts 15 June 2026, focusing on urgent gaps before Term 3 begins.'
    : isOLevel
      ? '⚠️ WA2 / mid-year results just exposed the weak chapters. Our June Holiday Rescue Intake starts 15 June 2026, focusing on urgent Math and Science gaps before Term 3 begins.'
    : inWa2Season
      ? '⚠️ WA2 results just revealed the weak topics. Parents are telling us their kids feel overwhelmed. We rescue grades by fixing urgent gaps in just 2-4 weeks before PSLE pressure builds.'
      : inMidYearSeason
        ? '⚠️ Mid-year results are painful. Your child\'s weak topics are now crystal clear. This is exactly when focused rescue makes the biggest difference—don\'t wait.'
        : inExamSprint
          ? '⚠️ Exam is close. Every weak chapter costs marks. Our exam rescue course targets only the urgent scoring gaps that matter most right now.'
          : '⚠️ Recent results are below target? We rescue your child\'s score by sprinting on urgent gaps first, not generic weekly learning.';

  return {
    heroTitle: isPsle
      ? 'PSLE Math & Science Exam Rescue Course'
      : isOLevel
        ? 'O-Level Math & Science Exam Rescue Course'
        : 'PSLE & O-Level Exam Rescue Course',
    heroLocationTitle: 'North Singapore',
    heroSubtitle: isPsle
      ? 'WA2 results just came in and they\'re stressful. We diagnose weak topics fast and focus on real score recovery before PSLE.'
      : isOLevel
        ? 'Mid-year results are painful. We rescue the exact weak chapters and paper skills your child needs now, before it\'s too late.'
        : 'If recent results missed the mark, we rescue your scores by fixing the biggest gaps first in a focused sprint.',
    seasonalNote,
    promiseItems: isPsle
      ? [
          '✓ Rapid diagnosis: Identify the 2-3 weak topics causing most mark loss within 1 session',
          '✓ Urgent rescue: Focused 1-2 week sprint on highest-impact gaps only (not broad review)',
          '✓ Parent visibility: Real-time updates after each session so you track progress daily',
          '✓ Exam-ready: Prove methods and timing under timed PSLE-style questions before the real exam',
        ]
      : isOLevel
        ? [
            '✓ Chapter-level rescue: Diagnose and fix the most costly O-Level chapters in 1-2 sessions',
            '✓ Paper strategy: Focused practice on time management and high-scoring section tactics',
            '✓ Parent visibility: Real-time updates after each session so you track progress daily',
            '✓ Exam-ready: Timed practice in exam conditions—no surprises on the real day',
          ]
        : [
            '✓ Rapid diagnosis: Identify the 2-3 urgent gaps causing most mark loss in your first session',
            '✓ Focused rescue: Sprint on highest-impact topics only—not broad, slow review',
            '✓ Parent visibility: Real-time updates after each session so you track progress daily',
            '✓ Exam-ready: Timed practice under exam conditions to build confidence before test day',
          ],
    methodKicker: 'Exam Rescue',
    methodTitle: 'How Our Exam Rescue Works',
    methodSubtitle: 'Forget slow, broad tuition. Exam rescue is an emergency intensive: diagnose the worst gaps fast, fix them first, then prove readiness before exam day.',
    methodCards: isPsle
      ? [
          {
            title: 'Diagnose',
            text: 'We review recent school papers, result slips, weak-topic lists, or practice work to identify where marks are being lost.',
          },
          {
            title: 'Zero In',
            text: 'We target PSLE weak chapters, careless-error patterns, answering structure, or time-management issues first.',
          },
          {
            title: 'Rebuild',
            text: 'We correct misconceptions, rebuild missing foundations, and teach clearer methods or answering frameworks.',
          },
          {
            title: 'Push',
            text: 'Once the key gaps are repaired, we move into timed PSLE-style questions so the student can apply skills under pressure.',
          },
        ]
      : isOLevel
        ? [
            {
              title: 'Diagnose',
              text: 'We review recent school papers, result slips, weak-topic lists, or practice work to identify where marks are being lost.',
            },
            {
              title: 'Zero In',
              text: 'We target O-Level weak chapters, careless-error patterns, answering structure, or time-management issues first.',
            },
            {
              title: 'Rebuild',
              text: 'We correct misconceptions, rebuild missing foundations, and teach clearer methods or answering frameworks.',
            },
            {
              title: 'Push',
              text: 'Once the key gaps are repaired, we move into timed O-Level-style questions so the student can apply skills under pressure.',
            },
          ]
        : [
            {
              title: 'Diagnose',
              text: 'We review recent school papers, result slips, weak-topic lists, or practice work to identify where marks are being lost.',
            },
            {
              title: 'Zero In',
              text: 'We target the highest-impact gaps first, such as weak chapters, careless-error patterns, answering structure, or time-management issues.',
            },
            {
              title: 'Rebuild',
              text: 'We correct misconceptions, rebuild missing foundations, and teach clearer methods or answering frameworks.',
            },
            {
              title: 'Push',
              text: 'Once the key gaps are repaired, we move into timed exam-style questions so the student can apply skills under pressure.',
            },
          ],
    differenceSubtitle: 'Normal tuition supports weekly learning. This crash course focuses on urgent correction in a short period.',
    chooserTitle: 'Choose Your Level',
    chooserSubtitle: 'Pick the level based on your child age and exam timeline.',
    pslePackageTitle: 'PSLE Math & Science Exam Rescue Course',
    pslePackageSubtitle: 'Emergency 2-4 week intensive to rescue weak topics before PSLE.',
    oLevelPackageTitle: 'O-Level Math & Science Exam Rescue Course',
    oLevelPackageSubtitle: 'Emergency 2-4 week intensive to rescue weak chapters before O-Levels.',
    friendGroupTitle: isPsle ? 'PSLE Friend-Group Home Exam Rescue' : isOLevel ? 'O-Level Friend-Group Home Exam Rescue' : 'Friend-Group Home Exam Rescue',
    friendGroupSubtitle: isPsle
      ? 'Have 2–4 P6 students from the same school, estate, class, or friend group? Mini-groups can be conducted at one host family\'s home or selected tutor-hosted study space slots. This keeps the lesson focused while reducing cost per student.'
      : isOLevel
        ? 'Have 2–4 Sec 4 / Sec 5 students from the same school, estate, class, or friend group? Mini-groups can be conducted at one host family\'s home or selected tutor-hosted study space slots. This keeps the lesson focused while reducing cost per student.'
        : 'Have 2–4 students from the same school, estate, class, or friend group? Mini-groups can be conducted at one host family\'s home or selected tutor-hosted study space slots. This keeps the lesson focused while reducing cost per student.',
    friendGroupPricing1: isPsle ? 'PSLE friend-group option: From $45/student/hr' : isOLevel ? 'O-Level friend-group option: From $50/student/hr' : 'PSLE friend-group option: From $45/student/hr',
    friendGroupPricing2: isPsle ? 'O-Level friend-group option: From $50/student/hr' : isOLevel ? 'PSLE friend-group option: From $45/student/hr' : 'O-Level friend-group option: From $50/student/hr',
    friendGroupCta: 'Form a Friend Group',
    afterCourseTitle: 'Keep the Rescue Momentum After the Exam Course',
    afterCourseSubtitle: 'After we rescue urgent gaps, students need accountability and consistency to lock in the improvements.',
    logisticsTitle: 'Flexible Home-Based Options for North Singapore Families',
    logisticsSubtitle: 'Lessons can be conducted at the student\'s home within North Singapore. For friend-group sessions, one host family may provide the venue. Selected mini-group sessions may also be conducted at a small tutor-hosted study space, with details shared before confirmation.',
    mockTitle: isPsle ? 'Optional: PSLE Full-Length Mock Before Real Exam' : isOLevel ? 'Optional: O-Level Full-Length Mock Before Real Exam' : 'Optional: Full-Length Mock Exam Before Test Day',
    mockSubtitle: isPsle
      ? 'After your exam rescue course, prove readiness with a timed PSLE mock under real exam conditions. Spot any last-minute panic points before the actual exam date.'
      : isOLevel
        ? 'After your exam rescue course, confirm readiness with a timed O-Level mock under real exam conditions. Remove final worries before the real papers.'
        : 'After your exam rescue course, test readiness with a full timed mock under real exam conditions. Spot any final weak points before test day.',
    mockButtonLabel: isPsle ? 'Secure PSLE Mock Spot' : isOLevel ? 'Secure O-Level Mock Spot' : 'Secure Mock Exam Spot',
    howToStartTitle: 'How to Start',
    howToStartSubtitle: 'A clear process so parents know what happens before the first session starts.',
    step2Title: 'We do a fit check',
    step2Body: isPsle
      ? 'We diagnose whether your child needs 1-to-1 exam rescue, friend-group support, or a mock exam before the real thing.'
      : isOLevel
        ? 'We diagnose whether your child needs 1-to-1 exam rescue, friend-group support, or a mock exam before the real papers.'
        : 'We diagnose whether your child needs 1-to-1 exam rescue, friend-group support, or a mock exam practice run.',
    suitableForTitle: 'Suitable For Students Who...',
    suitableForItems: isPsle
      ? [
          'Students who keep losing marks despite studying',
          'Students who are strong in some chapters but weak in others',
          'Students who need help with Math problem-solving flow',
          'Students who need help with Science open-ended answering',
          'Students who struggle with PSLE chapter application',
          'Students who repeat the same careless mistakes',
          'Students who need focused correction before the final exam stretch',
          'Students who need a clearer revision plan and parent-visible progress',
        ]
      : isOLevel
        ? [
            'Students who keep losing marks despite studying',
            'Students who are strong in some chapters but weak in others',
            'Students who need help with Math problem-solving flow',
            'Students who need help with Science open-ended answering',
            'Students who struggle with O-Level chapter application',
            'Students who repeat the same careless mistakes',
            'Students who need focused correction before the final exam stretch',
            'Students who need a clearer revision plan and parent-visible progress',
          ]
        : [
            'Students who keep losing marks despite studying',
            'Students who are strong in some chapters but weak in others',
            'Students who need help with Math problem-solving flow',
            'Students who need help with Science open-ended answering',
            'Students who struggle with O-Level chapter application',
            'Students who repeat the same careless mistakes',
            'Students who need focused correction before the final exam stretch',
            'Students who need a clearer revision plan and parent-visible progress',
          ],
    fitCheckTitle: 'Before We Rescue Your Child',
    fitCheckSubtitle: 'Exam rescue works best when the student is willing to correct mistakes and practise between sessions. We focus on confidence and results, not stress and false promises. This programme is NOT suitable if you need guaranteed score jumps or full-year syllabus coverage.',
    finalTitle: 'Let us rescue your child\'s score. Start here.',
    finalSubtitle: 'Send us the latest result slip, weak-topic list, or just tell us your child\'s situation. We\'ll diagnose in 1 WhatsApp fit check and confirm if exam rescue is right for your family. No long intake forms. No hard selling. Just honest, fast advice.',
    finalNote: '✓ Focused diagnosis | ✓ Real score improvement | ✓ Parent-visible progress | ✓ Stress-aware instruction',
    oLevelCrossLink: 'Looking for O-Level support? View O-Level Math & Science Exam Rescue Course.',
    psleCrossLink: 'Looking for PSLE support? View PSLE Math & Science Exam Rescue Course.',
  };
};

// ─── Inline Crash Course Enquiry Form ────────────────────────────────────────

const ENQUIRY_COOLDOWN_MS = 10 * 60 * 1000;

const InlineCrashEnquiryForm: React.FC<{ variant: 'psle' | 'olevel' }> = ({ variant }) => {
  const isPsle = variant === 'psle';
  const studentLevelDefault = isPsle ? 'Primary 6' : 'Secondary 4';
  const subjectTag = isPsle ? 'PSLE June Intensive (Enquiry)' : 'O-Level June Intensive (Enquiry)';
  const formLoadTime = useRef(Date.now());
  const submittingRef = useRef(false);

  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current || submitted) return;
    setError('');

    // Anti-spam guards
    if (honeypot) return;
    if (Date.now() - formLoadTime.current < 2500) {
      setError('Please take a moment to fill in the form.');
      return;
    }
    const lastSubmit = localStorage.getItem('il_crash_enquiry');
    if (lastSubmit && Date.now() - Number(lastSubmit) < ENQUIRY_COOLDOWN_MS) {
      setError('You already submitted recently. Please wait a few minutes before trying again.');
      return;
    }

    const cleanPhone = phone.replace(/\s/g, '');
    if (!parentName.trim()) { setError('Your name is required.'); return; }
    if (!/^[89]\d{7}$/.test(cleanPhone)) {
      setError('Please enter a valid Singapore mobile number (8 digits, starting with 8 or 9).');
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    try {
      if (!supabase) throw new Error('Not configured');
      const { error: dbError } = await supabase.from('parent_submissions').insert([{
        parent_name: parentName.trim(),
        student_name: '',
        contact_number: cleanPhone,
        email: '',
        student_level: studentLevelDefault,
        subjects: [subjectTag],
        preferred_mode: 'home',
        location: null,
        budget_range: null,
        current_challenge: note.trim() || null,
        goals: null,
        preferred_contact_timing: null,
        additional_notes: null,
        status: 'new',
      }]);
      if (dbError) throw dbError;

      // Fire Google Ads conversion — only on successful submission
      try {
        const w = window as any;
        if (typeof w.gtag === 'function') {
          w.gtag('event', 'conversion', {
            send_to: 'AW-18165644066/UK4uCMXF4K0cEKL2htZD',
            value: 1.0,
            currency: 'SGD',
          });
        }
      } catch {
        // Tracking must never block the success state.
      }

      localStorage.setItem('il_crash_enquiry', String(Date.now()));
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or reach us on WhatsApp.');
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center">
        <CheckCircle2 size={40} className="mx-auto mb-3 text-green-600" aria-hidden="true" />
        <h3 className="text-lg font-black text-slate-900">Enquiry Received!</h3>
        <p className="mt-2 text-sm text-slate-600">
          We'll reach out to you on WhatsApp within 1 business day to arrange a free fit check.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Honeypot — hidden from real users */}
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: 'none' }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cc-parent-name" className="mb-1 block text-xs font-bold text-slate-700">
            Your name <span className="text-rose-500">*</span>
          </label>
          <input
            id="cc-parent-name"
            type="text"
            autoComplete="name"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="Parent / guardian name"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            required
          />
        </div>
        <div>
          <label htmlFor="cc-phone" className="mb-1 block text-xs font-bold text-slate-700">
            WhatsApp / mobile <span className="text-rose-500">*</span>
          </label>
          <input
            id="cc-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 91234567"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="cc-note" className="mb-1 block text-xs font-bold text-slate-700">
          Anything you'd like us to know? <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="cc-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder={isPsle
            ? 'e.g. My child is weak in Math fractions and Science open-ended. WA2 was 65 for Math.'
            : 'e.g. My child is weak in A Math differentiation and Physics electricity. Mid-year was 52.'}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-amber-400 disabled:opacity-60"
      >
        {loading ? 'Sending…' : (
          <>
            <Send size={15} aria-hidden="true" />
            Send Enquiry — We'll WhatsApp You
          </>
        )}
      </button>

      <p className="text-center text-[11px] text-slate-400">
        No spam. We only use your number to follow up on this enquiry.
      </p>
    </form>
  );
};

const CrashCourseLandingPage: React.FC<{ variant?: CrashCourseVariant }> = ({ variant = 'combined' }) => {
  const pageSeo = getPageSeo(variant);
  const pageCopy = getPageCopy(variant);
  const isPsle = variant === 'psle';
  const isOLevel = variant === 'olevel';
  const showCombined = variant === 'combined';
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => setPageSeo(pageSeo.title, pageSeo.description, pageSeo.canonicalPath), [pageSeo.title, pageSeo.description, pageSeo.canonicalPath]);

  useEffect(() => {
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  const psleCountdown = getTimeLeft(EXAM_COUNTDOWN_TARGETS.psleMath, now);
  const oLevelCountdown = getTimeLeft(EXAM_COUNTDOWN_TARGETS.oLevelMath, now);

  const fitCheckMessage = isPsle
    ? [
        'Hi Integrated Learnings, I\'m interested in the PSLE Math & Science Home Crash Course.',
        '',
        'My child is in P6.',
        '',
        'Subject needed:',
        'Latest score / result:',
        'Weak topics:',
        'Preferred lesson format:',
        '1. Student\'s home',
        '2. Tutor-hosted study space',
        '3. Mini-group',
        '',
        'Preferred area:',
        'Preferred timing:',
        '',
        'I can send the result slip / school paper for a free WhatsApp fit check.',
      ].join('\n')
    : isOLevel
      ? [
          'Hi Integrated Learnings, I\'m interested in the O-Level Math & Science Home Crash Course.',
          '',
          'My child is in Sec 4 / Sec 5.',
          '',
          'Subject needed:',
          'E-Math / A-Math / Physics / Chemistry / Combined Science',
          '',
          'Latest score / result:',
          'Weak chapters:',
          'Preferred lesson format:',
          '1. Student\'s home',
          '2. Tutor-hosted study space',
          '3. Mini-group',
          '',
          'Preferred area:',
          'Preferred timing:',
          '',
          'I can send the result slip / school paper for a free WhatsApp fit check.',
        ].join('\n')
      : 'Hi Integrated Learnings, I\'m interested in the PSLE & O-Level Home Crash Course. I can send the result slip / school paper for a free WhatsApp fit check.';

  const slotsMessage = isPsle
    ? [
        'Hi Integrated Learnings, I\'m checking PSLE June Rescue intake availability.',
        '',
        'My child is in P6.',
        '',
        'Subject needed:',
        'Preferred lesson format:',
        '1. Student\'s home',
        '2. Tutor-hosted study space',
        '3. Mini-group',
        '',
        'Preferred area:',
        'Preferred intake window: Intake A (15-19 Jun) / Intake B (22-26 Jun) / 1-Day Targeted Correction',
        '',
        'Please advise intake availability and suitable package.',
      ].join('\n')
    : isOLevel
      ? [
          'Hi Integrated Learnings, I\'m checking O-Level June Rescue intake availability.',
          '',
          'My child is in Sec 4 / Sec 5.',
          '',
          'Subject needed:',
          'E-Math / A-Math / Physics / Chemistry / Combined Science',
          '',
          'Preferred lesson format:',
          '1. Student\'s home',
          '2. Tutor-hosted study space',
          '3. Mini-group',
          '',
          'Preferred area:',
          'Preferred intake window: Math Focus (15-19 Jun) / Science Focus (22-26 Jun) / 1-Day Chapter Rescue',
          '',
          'Please advise intake availability and suitable package.',
        ].join('\n')
      : 'Hi Integrated Learnings, I\'m checking June intake availability for PSLE / O-Level crash courses. Please advise the available intakes and suitable package.';

  const slotsLink = toWhatsApp(slotsMessage);
  const fitCheckLink = toWhatsApp(fitCheckMessage);
  const friendGroupLink = toWhatsApp('Hi Integrated Learnings, I have 2-4 students and would like to form a friend-group home crash course.');
  const followThroughLink = toWhatsApp('Hi Integrated Learnings, please tell me about post-crash-course follow-through and StudyPulse options.');
  const mockInterestLink = toWhatsApp('Hi Integrated Learnings, I want to join the mock exam interest list for PSLE / O-Level.');
  const pslePackageLink = '#psle-packages';
  const oLevelPackageLink = '#olevel-packages';

  const pslePackages = [
    {
      title: 'PSLE 4-Block Exam Rescue Intensive',
      scheduleNote: 'Recommended intake: 15–28 June. 4 focused sessions over 1–2 weeks before Term 3 resumes.',
      duration: '4 blocks × 3h = 12h',
      bestFor: 'main PSLE weak-topic rescue before exam sprint',
      format: "student's home or tutor-hosted study space, subject to schedule",
      price: '',
      includes: [
        '3 urgent-gap rescue blocks + 1 final readiness check',
        'Weak-topic diagnosis and scoring-gap prioritization',
        'Exam-style practice under real time pressure',
        'Parent update with confidence-building plan',
      ],
      popular: true,
    },
    {
      title: 'PSLE Mini-Group 4-Block Exam Rescue',
      scheduleNote: 'Group runs from week of 15 June. Subject to matching students with similar weak topics.',
      duration: '4 blocks × 3h = 12h',
      bestFor: '2–4 students with same weak topics needing rescue',
      format: "host family's home only",
      price: '',
      includes: [
        'Small-group diagnostic and urgent-gap targeting',
        'Exam-style guided practice + final readiness block',
        'Parent updates tracking visible improvement',
        'Group size kept to 2-4 students for focus',
      ],
    },
  ];

  const oLevelPackages = [
    {
      title: 'O-Level 4-Block Exam Rescue Intensive',
      scheduleNote: 'Recommended intake: 15–28 June. 4 focused sessions over 1–2 weeks to fix costly chapters before Term 3.',
      duration: '4 blocks × 3h = 12h',
      bestFor: 'urgent chapter rescue before O-Level exams',
      format: "student's home or tutor-hosted study space, subject to schedule",
      price: '',
      includes: [
        '3 urgent-chapter rescue blocks + 1 paper-strategy block',
        'Costly-chapter prioritization and rapid fixing',
        'Timed exam-style practice with real pressure',
        'Parent/student confidence-building summary',
      ],
      popular: true,
    },
    {
      title: 'O-Level Mini-Group 4-Block Exam Rescue',
      scheduleNote: 'Group runs from week of 15 June. Best for students with similar subject gaps needing focused exam practice.',
      duration: '4 blocks × 3h = 12h',
      bestFor: '2–4 students with same weak chapters needing rescue',
      format: "host family's home only",
      price: '',
      includes: [
        'Small-group diagnosis and urgent-chapter targeting',
        'Timed exam-style practice + paper strategy block',
        'Parent/student updates showing visible improvement',
        'Group size kept to 2-4 students for focus',
      ],
    },
  ];

  const faqItems = [
    {
      question: 'My child just finished WA2 / mid-year and the results are low. Is this the right timing?',
      answer: isPsle
        ? 'Yes. This is one of the best times to act because WA2 / mid-year results usually reveal the exact weak topics before the PSLE pressure period builds. Our June Holiday Rescue Intake starts from 15 June 2026, giving your child time to fix urgent gaps before Term 3 begins on 29 June 2026.'
        : isOLevel
          ? 'Yes. WA2 / mid-year results usually reveal the chapters and paper skills that are costing the most marks. Our June Holiday Rescue Intake starts from 15 June 2026, giving your child time to fix urgent gaps before Term 3, prelim pressure, and the final O-Level written papers.'
        : 'Yes. This is exactly when many parents come to us. We review recent papers quickly, identify urgent weak topics, and focus on high-impact correction first.',
    },
    ...(isPsle
      ? [
          {
            question: 'Why does the June Rescue Intake start from 15 June?',
            answer: 'Many families travel during the first part of the June holidays. Starting from 15 June allows students to use the second half of the holiday for focused rescue work before school reopens. It also keeps the learning fresh before Term 3.',
          },
          {
            question: 'Can my child still join after 15 June?',
            answer: 'Yes, subject to tutor availability. For students joining later, we may recommend a shorter targeted correction session or a compressed 4-block rescue plan, depending on the child\'s weak topics and schedule.',
          },
          {
            question: 'What if we are travelling during part of June?',
            answer: 'That is okay. Send us your child\'s result slip or weak-topic list first. We will recommend whether your child should do a 1-day targeted correction, a 4-block intensive, or a mini-group option based on the remaining available dates.',
          },
          {
            question: 'Do I need to book the full 15–28 June period?',
            answer: 'No. The 15–28 June period is the rescue window, not a compulsory full-time course. The actual number of sessions depends on your child\'s needs. Some students only need one focused correction session, while others benefit more from a 4-block rescue plan.',
          },
          {
            question: 'Can I choose any date in June?',
            answer: 'No. To keep the rescue programme focused and organised, we run on selected June intake windows. This helps us group students properly, avoid schedule clashes, and maintain lesson quality.',
          },
          {
            question: 'What are the PSLE June intake dates?',
            answer: 'The main PSLE rescue windows are 15–19 June and 22–26 June 2026. Limited 1-day targeted correction slots may be available on selected weekdays.',
          },
        ]
      : []),
    ...(isOLevel
      ? [
          {
            question: 'Why does the O-Level June Rescue Intake start from 15 June?',
            answer: 'Many families travel during the first part of June. Starting from 15 June uses the second half of the holiday for focused repair work, while keeping the learning fresh before school reopens.',
          },
          {
            question: 'Can my child join after 15 June?',
            answer: 'Yes, subject to tutor availability. For later joiners, we may recommend a 1-day chapter rescue or a compressed 4-block plan depending on the subject and weak chapters.',
          },
          {
            question: 'What subjects can this cover?',
            answer: 'We can support E Math, A Math, Pure Physics, Pure Chemistry, and Combined Science. The final recommendation depends on your child\'s latest paper, result slip, or weak-topic list.',
          },
          {
            question: 'Do I need to book the full 15–28 June period?',
            answer: 'No. The 15–28 June period is the rescue window. Your child may only need one focused session, or may benefit from a 4-block intensive if there are multiple weak chapters.',
          },
          {
            question: 'Can I choose any date in June?',
            answer: 'No. To keep the rescue programme focused and organised, we run on selected June intake windows. This helps us group students properly, avoid schedule clashes, and maintain lesson quality.',
          },
          {
            question: 'What are the O-Level June intake dates?',
            answer: 'The O-Level Math Rescue Focus runs from 15–19 June 2026. The Science Rescue Focus runs from 22–26 June 2026. Selected 1-day chapter rescue slots may also be available.',
          },
          {
            question: 'Can my child join both Math and Science rescue?',
            answer: 'Yes, subject to availability. We may recommend different intake windows so the schedule does not overload the student.',
          },
        ]
      : []),
    {
      question: 'How fast can we see improvement?',
      answer: isPsle
        ? 'Most students should feel clearer after the first session because we focus only on the highest-impact gaps. The goal is not to reteach everything, but to fix the topics and question types causing the biggest mark loss before Term 3 begins.'
        : 'Many students show clearer methods and fewer repeated mistakes within 2-3 sessions. Score movement depends on baseline, effort, and exam timeline.',
    },
    {
      question: 'How do you know what my child needs?',
      answer: 'Send us recent papers, result slips, or weak-topic lists. We diagnose mark-loss patterns first, then recommend the most suitable crash-course route.',
    },
    {
      question: 'What exactly happens in this crash course?',
      answer: 'Simple flow: diagnose weak topics, correct the highest-impact gaps, then move into guided or timed exam-style practice.',
    },
    {
      question: 'Where can lessons be conducted?',
      answer: 'Most sessions are at the student\'s home in North Singapore. We also have selected tutor-hosted slots and small friend-group arrangements.',
    },
    {
      question: 'Can friends join as a mini-group?',
      answer: 'Yes. Mini-groups are usually 2-4 students with similar level and subject needs. This can reduce cost per student while keeping the group focused.',
    },
    {
      question: 'Do you guarantee score jumps?',
      answer: 'No responsible educator should guarantee grades. We promise clear diagnosis, focused correction, and parent-visible updates after each session.',
    },
    {
      question: 'What is the difference from normal weekly tuition?',
      answer: isPsle
        ? 'Normal weekly tuition is usually long-term and chapter-by-chapter. This rescue course is short, targeted, and exam-focused. We use recent work, WA2 / mid-year results, or weak-topic lists to identify what is costing the most marks, then fix those gaps first.'
        : isOLevel
          ? 'Normal weekly tuition is usually long-term and chapter-by-chapter. This rescue course is short, targeted, and exam-focused. We identify the chapters and paper skills causing the biggest mark loss, then fix those first.'
        : 'Normal tuition is broad and ongoing. This crash course is short and urgent: fix the biggest scoring gaps first, then apply in exam-style questions.',
    },
    {
      question: 'What happens after the crash course ends?',
      answer: 'We provide a follow-through plan. If needed, families can continue with StudyPulse or weekly correction support for accountability.',
    },
  ];

  const [openPricingPanels, setOpenPricingPanels] = useState<Record<string, boolean>>(() => ({
    tutor_hosted: false,
    student_home: false,
    mini_group: false,
  }));

  const togglePricingPanel = (panelId: 'student_home' | 'tutor_hosted' | 'mini_group') => {
    setOpenPricingPanels((prev) => ({
      student_home: panelId === 'student_home' ? !prev.student_home : false,
      tutor_hosted: panelId === 'tutor_hosted' ? !prev.tutor_hosted : false,
      mini_group: panelId === 'mini_group' ? !prev.mini_group : false,
    }));
  };

  const pricingRows = {
    studentHome: isOLevel
      ? [
          { name: 'Light Boost', displayPrice: 'From S$85/hr', detail: '1 × 3h | Total from S$255', note: 'Ideal for sharp focus on one critical area.' },
          { name: 'Targeted Rescue', displayPrice: 'From S$83/hr', detail: '2 × 3h | Total from S$500', note: 'Structured multi-session support for key weakness.' },
          { name: 'Intensive Rescue', displayPrice: 'From S$80/hr', detail: '4 × 3h | Total from S$960', note: 'Deep comprehensive rescue before exam sprint.' },
        ]
      : [
          { name: 'Light Boost', displayPrice: 'From S$80/hr', detail: '1 × 3h | Total from S$240', note: 'Ideal for sharp focus on one critical area.' },
          { name: 'Targeted Rescue', displayPrice: 'From S$78/hr', detail: '2 × 3h | Total from S$470', note: 'Structured multi-session support for key weakness.' },
          { name: 'Intensive Rescue', displayPrice: 'From S$77/hr', detail: '4 × 3h | Total from S$920', note: 'Deep comprehensive rescue before exam sprint.' },
        ],
    tutorHosted: isOLevel
      ? [
          { name: 'Focused Boost', displayPrice: 'From S$52.50/hr', detail: '1 × 4h | Total from S$210/student', note: 'Longer focused block with break and refreshments.' },
          { name: 'Targeted Rescue', displayPrice: 'From S$50/hr', detail: '2 × 4h | Total from S$400/student', note: 'Multi-session intensive support at better value.' },
          { name: 'Intensive Rescue', displayPrice: 'From S$47.50/hr', detail: '4 × 4h | Total from S$760/student', note: 'Comprehensive path to exam readiness.' },
        ]
      : [
          { name: 'Focused Boost', displayPrice: 'From S$47.50/hr', detail: '1 × 4h | Total from S$190/student', note: 'Longer focused block with break and refreshments.' },
          { name: 'Targeted Rescue', displayPrice: 'From S$45/hr', detail: '2 × 4h | Total from S$360/student', note: 'Multi-session intensive support at better value.' },
          { name: 'Intensive Rescue', displayPrice: 'From S$42.50/hr', detail: '4 × 4h | Total from S$680/student', note: 'Comprehensive path to exam readiness.' },
        ],
    miniGroupHostFamily: isOLevel
      ? [
          { groupSize: '2 students', displayPrice: 'From S$50/student/hr' },
          { groupSize: '3 students', displayPrice: 'From S$45/student/hr' },
          { groupSize: '4 students', displayPrice: 'From S$40/student/hr' },
        ]
      : [
          { groupSize: '2 students', displayPrice: 'From S$45/student/hr' },
          { groupSize: '3 students', displayPrice: 'From S$40/student/hr' },
          { groupSize: '4 students', displayPrice: 'From S$35/student/hr' },
        ],
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 text-left text-slate-900 [letter-spacing:normal] [word-spacing:normal] [word-break:normal] [overflow-wrap:normal] [hyphens:none] md:pb-0">
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_55%,#0b3b2e_100%)] px-4 pb-20 pt-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-50" aria-hidden="true">
          <div className="absolute left-[-10%] top-8 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute right-[-6%] top-16 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute bottom-[-10%] left-1/3 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="order-1 lg:order-2 grid gap-4">
              <SectionCard className="border-white/10 bg-white/5 p-5 text-white backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Official 2026 SEAB exam countdown</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Real exam clock. Focus on the subject with the biggest scoring gap first.
                </p>
                <div className={`mt-4 grid gap-3 ${showCombined ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                  {showCombined ? (
                    <>
                      <CountdownCard
                        title="PSLE Math starts in"
                        subtitle="25 Sep 2026, 8:15 am"
                        timeLeft={psleCountdown}
                      />
                      <CountdownCard
                        title="O-Level Math starts in"
                        subtitle="21 Oct 2026, 2:00 pm"
                        timeLeft={oLevelCountdown}
                      />
                    </>
                  ) : isPsle ? (
                    <CountdownCard
                      title="PSLE Math starts in"
                      subtitle="25 Sep 2026, 8:15 am"
                      timeLeft={psleCountdown}
                    />
                  ) : (
                    <CountdownCard
                      title="O-Level Math starts in"
                      subtitle="21 Oct 2026, 2:00 pm"
                      timeLeft={oLevelCountdown}
                    />
                  )}
                </div>
              </SectionCard>
            </div>

            <div className="order-2 lg:order-1">
              <Pill className="border-white/15 bg-white/10 text-amber-200">
                <Sparkles size={12} className="mr-2" aria-hidden="true" /> Find the gap. Rescue the score. Prove it before exam day.
              </Pill>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
                <span className="block">{pageCopy.heroTitle}</span>
                <span className="mt-1 block text-amber-300">{pageCopy.heroLocationTitle}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">{pageCopy.heroSubtitle}</p>
              {(isPsle || isOLevel) && (
                <>
                  <p className="mt-3 inline-flex items-center rounded-full border border-amber-200/50 bg-amber-200/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-amber-200">
                    June Holiday Rescue Intake: Starts 15 June 2026
                  </p>
                  <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-amber-100 sm:text-base">
                    {isPsle
                      ? 'Designed for students who need urgent Math & Science gap-closing before Term 3 and PSLE preparation intensifies.'
                      : 'For students who need to repair weak chapters before Term 3, prelim pressure, and the final O-Level written papers. June is the first serious rescue window before Term 3, prelim pressure, and the final O-Level written papers.'}
                  </p>
                </>
              )}
              <p className="mt-4 max-w-2xl rounded-2xl border border-amber-300/30 bg-amber-100/10 px-4 py-3 text-sm font-semibold text-amber-100">
                {pageCopy.seasonalNote}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ActionButton
                  label={isPsle || isOLevel ? 'Reserve June Rescue Slot' : "Secure Your Child's Spot"}
                  href={fitCheckLink}
                  ctaName="hero_fit_check"
                  icon={<FileText size={15} aria-hidden="true" />}
                  className="bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-300"
                />
                <ActionButton
                  label={isPsle || isOLevel ? 'Check Intake Availability' : 'Check Available Slots'}
                  href={slotsLink}
                  ctaName="hero_check_slots"
                  icon={<Home size={15} aria-hidden="true" />}
                  className="border border-white/20 bg-white/10 text-white hover:bg-white/15"
                />
              </div>

              <p className="mt-3 text-xs font-semibold text-slate-300">
                North Singapore coverage: Woodlands, Admiralty, Marsiling, Sembawang, Canberra, Yishun, and nearby.
              </p>

              {isPsle && (
                <p className="mt-2 text-xs text-slate-300">
                  Need O-Level support instead?{' '}
                  <Link to="/family/crash-courses/o-level-june-intensive" className="font-semibold text-amber-200 underline decoration-amber-200/70 underline-offset-2 hover:text-amber-100">
                    Switch to O-Level crash course
                  </Link>
                </p>
              )}
              {isOLevel && (
                <p className="mt-2 text-xs text-slate-300">
                  Need PSLE support instead?{' '}
                  <Link to="/family/crash-courses/psle-june-intensive" className="font-semibold text-amber-200 underline decoration-amber-200/70 underline-offset-2 hover:text-amber-100">
                    Switch to PSLE crash course
                  </Link>
                </p>
              )}

              <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-300">What we deliver</p>
                <div className="mt-3 space-y-2">
                  {pageCopy.promiseItems.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-slate-200">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-300" aria-hidden="true" />
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:py-12">
        {showCombined && (
          <SectionCard>
            <SectionHeading
              kicker="Programmes"
              title={pageCopy.chooserTitle}
              subtitle={pageCopy.chooserSubtitle}
            />
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <LevelCard
                title="PSLE Home Crash Course"
                subtitle="For P6 students preparing for PSLE Math and Science."
                focus={[
                  'Math problem sums and heuristics',
                  'Science open-ended answering',
                  'Careless mistake patterns',
                  'Weak topics and concept gaps',
                  'Timed PSLE-style practice',
                ]}
                href={pslePackageLink}
                ctaLabel="View PSLE Options"
              />
              <LevelCard
                title="O-Level Home Crash Course"
                subtitle="For Sec 4 / Sec 5 students preparing for O-Level subjects."
                focus={[
                  'E-Math and A-Math chapter rescue',
                  'Physics concept application and structured answers',
                  'Chemistry high-yield chapters and answering precision',
                  'Timed paper strategy',
                  'Weak-topic correction',
                ]}
                href={oLevelPackageLink}
                ctaLabel="View O-Level Options"
              />
            </div>
          </SectionCard>
        )}

        <SectionCard>
          <SectionHeading
            kicker="LESSON FORMAT"
            title="Choose the Lesson Format That Fits"
            subtitle="Tap a format to view pricing. We recommend based on your child’s gaps, timeline, and budget."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <h3>
                <button
                  type="button"
                  aria-expanded={openPricingPanels.student_home}
                  onClick={() => togglePricingPanel('student_home')}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-black text-slate-900">Tutor Travels to Student’s Home</span>
                    <span className="mt-1 inline-block rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">Premium Convenience</span>
                    {(isPsle || isOLevel) && <span className="mt-2 inline-block rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800">June slots: 15–28 June</span>}
                    <span className="mt-2 block text-xs font-semibold text-slate-600">Convenient 1-to-1 support at home. Includes complimentary diagnostic + action plan.</span>
                  </span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${openPricingPanels.student_home ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </h3>
              {!openPricingPanels.student_home ? null : (
                <div className="border-t border-slate-200 px-5 py-4">
                  <div className="space-y-3 text-sm">
                    {pricingRows.studentHome.map((row) => (
                      <div key={row.name} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-black text-slate-900">{row.name}</p>
                            <p className="mt-0.5 text-2xl font-black text-amber-600">{row.displayPrice}</p>
                            <p className="mt-1 text-xs text-slate-600">{row.detail}</p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{row.note}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-600">Recommended after fit check: Light Boost, Targeted Rescue, or Intensive Rescue.</p>
                </div>
              )}
            </article>

            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <h3>
                <button
                  type="button"
                  aria-expanded={openPricingPanels.tutor_hosted}
                  onClick={() => togglePricingPanel('tutor_hosted')}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-black text-slate-900">Tutor-Hosted Study Space</span>
                    <span className="mt-1 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Better Value</span>
                    {(isPsle || isOLevel) && <span className="mt-2 inline-block rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800">June slots: 15–28 June</span>}
                    <span className="mt-2 block text-xs font-semibold text-slate-600">Students who want longer focused sessions without the higher cost of home visits. Starts from 1 student. Each 4-hour session includes a short break and refreshments.</span>
                  </span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${openPricingPanels.tutor_hosted ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </h3>
              {!openPricingPanels.tutor_hosted ? null : (
                <div className="border-t border-slate-200 px-5 py-4">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Pricing is per student</p>
                  <div className="space-y-3 text-sm">
                    {pricingRows.tutorHosted.map((row) => (
                      <div key={row.name} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-black text-slate-900">{row.name}</p>
                            <p className="mt-0.5 text-2xl font-black text-emerald-600">{row.displayPrice}</p>
                            <p className="mt-1 text-xs text-slate-600">{row.detail}</p>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{row.note}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-600">Tutor-hosted pricing is per student and is designed to offer better value than home visits while still keeping sessions focused and structured.</p>
                </div>
              )}
            </article>

            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <h3>
                <button
                  type="button"
                  aria-expanded={openPricingPanels.mini_group}
                  onClick={() => togglePricingPanel('mini_group')}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="flex-1">
                    <span className="block text-sm font-black text-slate-900">Mini-Group (Host-Family Only)</span>
                    <span className="mt-1 inline-block rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">Shared Cost</span>
                    {(isPsle || isOLevel) && <span className="mt-2 inline-block rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-800">Group intake: Week of 15 June</span>}
                    <span className="mt-2 block text-xs font-semibold text-slate-600">2–4 students with similar needs. Runs at one host-family home only. Group stays small for focus and quality.</span>
                  </span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${openPricingPanels.mini_group ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </h3>
              {!openPricingPanels.mini_group ? null : (
                <div className="border-t border-slate-200 px-5 py-4">
                  <div className="space-y-2">
                    {pricingRows.miniGroupHostFamily.map((item) => (
                      <div key={item.groupSize} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <span className="text-sm font-semibold text-slate-900">{item.groupSize}</span>
                        <span className="text-lg font-black text-blue-600">{item.displayPrice}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-slate-600">Mini-group rates apply only when students are of similar level and learning needs after fit check.</p>
                </div>
              )}
            </article>
          </div>
          <p className="mt-5 text-xs font-semibold text-slate-700">
            Prices shown are starting rates. Final recommendation depends on level, subject, learning needs, and travel.
          </p>
        </SectionCard>

        {isPsle && (
          <SectionCard>
            <SectionHeading
              kicker="Schedule"
              title="PSLE June Rescue Intakes"
              subtitle="Fixed June intakes. Limited seats per intake. Clear schedule for better learning flow."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  window: '15–19 June 2026',
                  title: 'Intake A',
                  body: 'Best for students who need to start urgent topic correction early in the second half of June.',
                },
                {
                  window: '22–26 June 2026',
                  title: 'Intake B',
                  body: 'Best for students who need a final focused rescue window before Term 3 begins.',
                },
                {
                  window: 'Selected weekdays only',
                  title: '1-Day Targeted Correction',
                  body: 'For one urgent weak topic, careless-error correction, or quick paper review.',
                },
              ].map((item) => (
                <article key={item.window} className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                  <p className="text-sm font-black text-slate-900">{item.title}</p>
                  <p className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-800">{item.window}</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">{item.body}</p>
                </article>
              ))}
            </div>
            <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Fixed June intakes. Limited seats. Clear schedule. Better learning flow. Private arrangements are by request only, subject to availability and pricing.
            </p>
          </SectionCard>
        )}

        {isOLevel && (
          <SectionCard>
            <SectionHeading
              kicker="Schedule"
              title="O-Level June Rescue Intakes"
              subtitle="Fixed June intakes. Limited seats per intake. Clear schedule for better learning flow."
            />
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  window: '15–19 June 2026',
                  title: 'Math Rescue Focus',
                  body: 'For E Math and A Math students who need chapter repair, method correction, and timed practice.',
                },
                {
                  window: '22–26 June 2026',
                  title: 'Science Rescue Focus',
                  body: 'For Physics, Chemistry, and Combined Science students who need concept repair and exam-answering practice.',
                },
                {
                  window: 'Selected weekdays only',
                  title: '1-Day Chapter Rescue',
                  body: 'For one urgent weak chapter, paper section, or quick result-based correction.',
                },
              ].map((item) => (
                <article key={item.window} className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5">
                  <p className="text-sm font-black text-slate-900">{item.title}</p>
                  <p className="inline-flex rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-800">{item.window}</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">{item.body}</p>
                </article>
              ))}
            </div>
            <p className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Fixed June intakes. Limited seats. Clear schedule. Better learning flow. Private arrangements are by request only, subject to availability and pricing.
            </p>
          </SectionCard>
        )}

        {(showCombined || isPsle) && (
          <SectionCard id="psle-packages">
            <SectionHeading
              kicker="PSLE"
              title={pageCopy.pslePackageTitle}
              subtitle={pageCopy.pslePackageSubtitle}
            />
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Send your child’s latest paper for a free WhatsApp fit check. We’ll recommend the best package.
            </p>
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <PackageCard
                title="PSLE 1-Day Targeted Correction"
                scheduleNote="Available from 15 June onwards. Suitable for one urgent weak topic or careless-error correction."
                duration="1 block × 3h"
                bestFor="quick rescue on one major weak topic"
                format="student's home or tutor-hosted study space, subject to schedule"
                price=""
                includes={[
                  'Quick diagnostic from recent work',
                  'Targeted correction on one urgent scoring gap',
                  'Guided PSLE-style practice + parent update',
                ]}
              />
              {pslePackages.map((pkg) => <PackageCard key={pkg.title} {...pkg} />)}
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-black text-slate-900">We don't teach everything. We fix the highest-impact gaps first.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Crash courses work best when they are targeted. We review the student's latest paper, identify the chapters and question types causing the biggest mark loss, then focus the lesson blocks on the most recoverable gaps first.</p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">PSLE Math Rescue Focus</p>
                <BulletList
                  items={[
                    'Fractions, ratio and percentage',
                    'Whole-number / decimal calculation accuracy',
                    'Area, perimeter and volume',
                    'Angles, geometry and visual reasoning',
                    'Patterns and number rules',
                    'Problem sums and model drawing',
                    'Data, tables and graph interpretation',
                    'Careless-error tracking and checking routines',
                  ]}
                />
              </SectionCard>
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">PSLE Science Rescue Focus</p>
                <BulletList
                  items={[
                    'Systems, cycles, interactions and energy',
                    'Forces and simple application questions',
                    'Experimental skills and fair-test questions',
                    'Graphs, tables and data-based questions',
                    'Open-ended answering structure',
                    'Keywords, comparison and explanation precision',
                    'Common misconception correction',
                    'MCQ elimination and OEQ mark-scoring habits',
                  ]}
                />
              </SectionCard>
            </div>
            <p className="mt-5 text-xs text-slate-600 font-medium">Final topic selection is customised after reviewing the student's latest paper or result slip.</p>
            {!showCombined && (
              <p className="mt-5 text-xs text-slate-500">
                <Link to="/family/crash-courses/o-level-june-intensive" className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900 hover:decoration-slate-500">
                  {pageCopy.psleCrossLink}
                </Link>
              </p>
            )}
            <p className="mt-5 text-xs text-slate-500">Package prices vary by format. Open the lesson-format cards above to compare options.</p>
          </SectionCard>
        )}

        {(showCombined || isOLevel) && (
          <SectionCard id="olevel-packages">
            <SectionHeading
              kicker="O-Level"
              title={pageCopy.oLevelPackageTitle}
              subtitle={pageCopy.oLevelPackageSubtitle}
            />
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Send your child’s latest paper for a free WhatsApp fit check. We’ll recommend the best package.
            </p>
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <PackageCard
                title="O-Level 1-Day Chapter Rescue"
                scheduleNote="Available from 15 June onwards. Best for one urgent weak chapter or paper section."
                duration="1 block × 3h"
                bestFor="quick rescue on one weak chapter or paper section"
                format="student's home or tutor-hosted study space, subject to schedule"
                price=""
                includes={[
                  'Quick paper/result diagnostic',
                  'Targeted correction on one urgent weak chapter',
                  'Guided exam-style drilling + next-step summary',
                ]}
              />
              {oLevelPackages.map((pkg) => <PackageCard key={pkg.title} {...pkg} />)}
            </div>

            <div className="mt-10">
              <h3 className="text-xl font-black text-slate-900">We don't teach everything. We fix the highest-impact gaps first.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Crash courses work best when they are targeted. We review the student's latest paper, identify the chapters and question types causing the biggest mark loss, then focus the lesson blocks on the most recoverable gaps first.</p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">E Math Rescue Focus</p>
                <BulletList
                  items={[
                    'Algebra manipulation and equation solving',
                    'Graphs, functions and coordinate geometry',
                    'Vectors and area-ratio questions',
                    'Trigonometry, bearings and 3D problems',
                    'Geometry, angles and similarity',
                    'Mensuration, units and composite figures',
                    'Statistics and probability',
                    'Paper strategy, time allocation and method-mark recovery',
                  ]}
                />
              </SectionCard>
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">A Math Rescue Focus</p>
                <BulletList
                  items={[
                    'Algebra, indices, surds and logarithms',
                    'Quadratic equations and inequalities',
                    'Functions and graph transformations',
                    'Coordinate geometry and linear law',
                    'Trigonometry identities and equations',
                    'Differentiation and applications',
                    'Integration and area under curve',
                    'Exam-question breakdown and method flow',
                  ]}
                />
              </SectionCard>
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Pure Physics Rescue Focus</p>
                <BulletList
                  items={[
                    'Kinematics and motion graphs',
                    'Forces, moments and pressure',
                    'Energy, work and power',
                    'Thermal physics and heat transfer',
                    'Electricity and circuits',
                    'Waves, light and sound',
                    'Electromagnetism and induction',
                    'Formula selection, units and structured-answer phrasing',
                  ]}
                />
              </SectionCard>
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Pure Chemistry Rescue Focus</p>
                <BulletList
                  items={[
                    'Mole concept and chemical calculations',
                    'Acids, bases and salts',
                    'Chemical bonding and structure-property links',
                    'Qualitative analysis',
                    'Electrolysis',
                    'Redox and reactivity series',
                    'Organic chemistry basics',
                    'Answer precision, keywords and practical planning',
                  ]}
                />
              </SectionCard>
            </div>

            <div className="mt-4 grid gap-4">
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Combined Science Physics/Chemistry Rescue Focus</p>
                <BulletList
                  items={[
                    'Physics: kinematics, forces and motion graphs',
                    'Physics: electricity, circuits and formula selection',
                    'Physics: heat transfer, waves and light basics',
                    'Chemistry: mole concept and equation balancing',
                    'Chemistry: acids, bases, salts and QA',
                    'Chemistry: electrolysis, reactivity and redox',
                    'Practical skills: tables, graphs, sources of error and improvements',
                    'Answering skills: keywords, units and structured explanations',
                  ]}
                />
              </SectionCard>
            </div>
            <p className="mt-5 text-xs text-slate-600 font-medium">Final topic selection is customised after reviewing the student's latest paper or result slip.</p>
            {!showCombined && (
              <p className="mt-5 text-xs text-slate-500">
                <Link to="/family/crash-courses/psle-june-intensive" className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900 hover:decoration-slate-500">
                  {pageCopy.oLevelCrossLink}
                </Link>
              </p>
            )}
            <p className="mt-5 text-xs text-slate-500">Package prices vary by lesson format. Open the lesson format cards above to compare student-home, tutor-hosted, and mini-group options.</p>
          </SectionCard>
        )}

        {showCombined && (
        <SectionCard>
          <SectionHeading
            kicker="Friend Group"
            title={pageCopy.friendGroupTitle}
            subtitle={pageCopy.friendGroupSubtitle}
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <BulletList
                items={[
                  'Best group size: 2–4 students',
                  'One host family provides the venue',
                  'Lessons are conducted at the host family\'s home for the group',
                  'Suitable for classmates, neighbours, siblings, or friends',
                  'Same level and similar subject needs recommended',
                  'Host family may receive a small discount when 3 or more students join',
                ]}
              />
              <p className="mt-4 text-xs text-slate-500">For quality control, home friend-groups are kept small. If there are more than 4–5 students, we may recommend a separate mini-group slot or mock simulation format.</p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-black text-emerald-800">Pricing display</p>
              <div className="mt-4 space-y-3 text-sm text-emerald-900">
                <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 font-semibold">{pageCopy.friendGroupPricing1}</div>
                <div className="rounded-xl border border-emerald-200 bg-white px-4 py-3 font-semibold">{pageCopy.friendGroupPricing2}</div>
              </div>
              <div className="mt-5">
                <ActionButton
                  label={pageCopy.friendGroupCta}
                  href={friendGroupLink}
                  ctaName="friend_group_cta"
                  icon={<Users size={15} aria-hidden="true" />}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                />
              </div>
            </div>
          </div>
        </SectionCard>
        )}

        {showCombined && (
        <SectionCard>
          <SectionHeading
            kicker="After Course"
            title={pageCopy.afterCourseTitle}
            subtitle={pageCopy.afterCourseSubtitle}
          />
          <p className="mt-4 text-sm leading-7 text-slate-600">
            After the crash course, we provide a simple follow-through plan so parents know what the child should continue working on. For students who need more accountability, StudyPulse can be added to help track revision progress through check-ins and parent updates.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Free Follow-Up Plan',
                body: 'Student receives clear revision targets after the final crash-course session.',
              },
              {
                title: 'StudyPulse Tracking',
                body: 'Parents can monitor whether the child is keeping up with agreed revision targets after the crash course.',
              },
              {
                title: 'Weekly Correction Support',
                body: 'For students who still need guided exam correction after the crash course.',
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-6">
            <ActionButton
              label="Ask About Post-Crash-Course Follow-Through"
              href={followThroughLink}
              ctaName="follow_through_cta"
              icon={<MessageCircle size={15} aria-hidden="true" />}
              className="border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            />
          </div>
        </SectionCard>
        )}

        {showCombined && (
        <SectionCard>
          <SectionHeading
            kicker="Logistics"
            title={pageCopy.logisticsTitle}
            subtitle={pageCopy.logisticsSubtitle}
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <BulletList
              items={[
                'We travel to the student\'s home within North Singapore where scheduling allows',
                'Student learns in a familiar environment',
                'Friend-group classes can be conducted at one host family\'s home',
                'Selected mini-group sessions may use a small tutor-hosted study space',
                'Future mock exam events may use a separate North-side venue near MRT/bus access',
              ]}
            />
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              <p className="font-bold text-slate-900">Quality-control note</p>
              <p className="mt-2">Tutor-hosted sessions are kept small and are not positioned as a mass-group format. Details will be shared before confirmation.</p>
              <p className="mt-4 font-bold text-slate-900">Future event note</p>
              <p className="mt-2">For future mock exam simulation events, venues will be selected near MRT/bus access where possible. Light refreshments may be arranged depending on duration and venue.</p>
            </div>
          </div>
        </SectionCard>
        )}

        {showCombined && (
        <SectionCard>
          <SectionHeading
            kicker="Mock Exam"
            title={pageCopy.mockTitle}
            subtitle={pageCopy.mockSubtitle}
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <BulletList
              items={[
                'Timed mock paper',
                'Exam-style environment',
                'Paper collection and marking',
                'Key-question correction',
                'Weak-topic diagnosis',
                'Parent summary / next-step recommendation',
              ]}
            />
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-900">
              <p className="font-bold text-amber-900">Threshold note</p>
              <p className="mt-2">Mock simulation will be opened when there is enough demand, usually around 20 or more interested students for a suitable level/subject group.</p>
              <div className="mt-5">
                <ActionButton
                  label={pageCopy.mockButtonLabel}
                  href={mockInterestLink}
                  ctaName="mock_interest_cta"
                  icon={<Clock3 size={15} aria-hidden="true" />}
                  className="bg-amber-400 text-slate-950 hover:bg-amber-300"
                />
              </div>
            </div>
          </div>
        </SectionCard>
        )}

        {showCombined && (
        <SectionCard>
          <SectionHeading
            kicker="How It Works"
            title="How the 4-Block Intensive Works"
            subtitle="The programme is built around 3 focused correction blocks + 1 final revision block. Each block is longer than normal tuition so there is time to review mistakes, teach correction methods, practise exam-style questions, and correct immediately."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              { step: '1', title: 'Diagnose & Prioritise', body: 'Identify key scoring gaps from recent work.' },
              { step: '2', title: 'Targeted Correction', body: 'Fix weak topics, repeated mistakes, and answering issues.' },
              { step: '3', title: 'Exam-Style Application', body: 'Practise under guided or timed conditions.' },
              { step: '4', title: 'Final Revision Plan', body: 'Consolidate strategies and give parents the next-step plan.' },
            ].map((item) => (
              <article key={item.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">{item.step}</p>
                <p className="mt-2 text-sm font-black text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            School holidays offer more flexible time and less school-day pressure, making it easier to complete a focused intensive block over 1–2 weeks.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Each block is 3 hours. For younger students, short breaks can be included where needed.
          </p>
          <div className="mt-6">
            <ActionButton
              label="Send Result Slip for Fit Check"
              href={fitCheckLink}
              ctaName="how_to_start_fit_check"
              icon={<FileText size={15} aria-hidden="true" />}
              className="bg-slate-900 text-white hover:bg-slate-800"
            />
          </div>
        </SectionCard>
        )}

        {showCombined && (
        <SectionCard>
          <SectionHeading
            kicker="Suitable For"
            title={pageCopy.suitableForTitle}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <BulletList
              items={pageCopy.suitableForItems}
            />
          </div>
        </SectionCard>
        )}

        {showCombined && (
        <SectionCard>
          <SectionHeading
            kicker="Fit Check"
            title={pageCopy.fitCheckTitle}
            subtitle={pageCopy.fitCheckSubtitle}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <BulletList
              items={[
                'Families seeking only a full-year syllabus teaching programme',
                'Parents asking for guaranteed score improvement claims',
                'Students unwilling to complete assigned corrections between sessions',
                'Families looking for a large generic lecture class',
              ]}
              iconClassName="text-rose-600"
            />
          </div>
        </SectionCard>
        )}

        <FaqAccordion items={faqItems} />

        {(isPsle || isOLevel) && (
          <SectionCard id="enquiry-form">
            <SectionHeading
              kicker="ENQUIRE NOW"
              title={isPsle ? 'Get a Free PSLE Fit Check' : 'Get a Free O-Level Fit Check'}
              subtitle="Leave your name and number. We’ll WhatsApp you within 1 business day to review your child’s results and recommend the right rescue plan."
            />
            <div className="mt-6">
              <InlineCrashEnquiryForm variant={isPsle ? 'psle' : 'olevel'} />
            </div>
          </SectionCard>
        )}

        <SectionCard className="border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
          <SectionHeading
            kicker="NEXT STEP"
            title={pageCopy.finalTitle}
            subtitle={isPsle || isOLevel ? 'We will review your child’s latest WA2 / mid-year result and recommend whether a 1-day, 4-block, or mini-group rescue plan is most suitable.' : pageCopy.finalSubtitle}
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ActionButton
              label={isPsle || isOLevel ? 'Send Result Slip for Free Fit Check' : 'Send Result Slip for Fit Check'}
              href={fitCheckLink}
              ctaName="final_fit_check"
              icon={<FileText size={15} aria-hidden="true" />}
              className="bg-amber-500 text-slate-950 hover:bg-amber-400"
            />
            <ActionButton
              label={isPsle || isOLevel ? 'Check Intake Availability' : 'Check Available Home Slots'}
              href={slotsLink}
              ctaName="final_slots"
              icon={<Home size={15} aria-hidden="true" />}
              className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            />
          </div>
          <p className="mt-4 text-xs text-slate-600">
            {pageCopy.finalNote}
          </p>
        </SectionCard>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur-sm md:hidden [padding-bottom:calc(0.5rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2">
          <a
            href={slotsLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackCtaClick('mobile_sticky_slots', slotsLink)}
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-3 py-3 text-xs font-black text-slate-950 transition hover:bg-amber-400"
          >
            {isPsle || isOLevel ? 'Check Intake' : 'Check Home Slots'}
          </a>
          <a
            href={fitCheckLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackCtaClick('mobile_sticky_fit_check', fitCheckLink)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50"
          >
            {isPsle || isOLevel ? 'Free Fit Check' : 'Send Result Slip'}
          </a>
        </div>
      </div>
    </div>
  );
};

export const FamilyPSLEJuneIntensivePage: React.FC = () => <CrashCourseLandingPage variant="psle" />;
export const FamilyOLevelJuneIntensivePage: React.FC = () => <CrashCourseLandingPage variant="olevel" />;
