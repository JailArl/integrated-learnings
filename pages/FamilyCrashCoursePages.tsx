import React, { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Home,
  MessageCircle,
  Sparkles,
  Users,
} from 'lucide-react';

const WA_NUMBER = '6598882675';
const PAGE_TAG = 'final-lap-home-crash-course';
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
      title: 'PSLE Math & Science Home Crash Course | Integrated Learnings Singapore',
      description: 'Personalised home-based PSLE Math and Science final-lap crash course in North Singapore. Diagnostic-based correction for weak topics, exam technique, and parent-visible progress.',
      canonicalPath: '/family/crash-courses/psle-june-intensive',
    };
  }

  if (variant === 'olevel') {
    return {
      title: 'O-Level Math & Science Home Crash Course | Integrated Learnings Singapore',
      description: 'Personalised home-based O-Level E-Math, A-Math, Physics and Chemistry final-lap crash course in North Singapore. Diagnostic-based chapter rescue, paper strategy, and parent-visible progress.',
      canonicalPath: '/family/crash-courses/o-level-june-intensive',
    };
  }

  return {
    title: 'PSLE & O-Level Home Crash Course | Integrated Learnings Singapore',
    description: 'Personalised home-based PSLE and O-Level final-lap crash courses in North Singapore. Diagnostic-based correction for Math, Science, E-Math, A-Math, Physics and Chemistry, with parent updates and StudyPulse follow-through.',
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
  duration: string;
  bestFor: string;
  format: string;
  price: string;
  includes: string[];
  popular?: boolean;
}> = ({ title, duration, bestFor, format, price, includes, popular }) => (
  <article className={`relative rounded-2xl border p-5 ${popular ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-200' : 'border-slate-200 bg-slate-50'}`}>
    {popular && (
      <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-900">
        Most Popular
      </span>
    )}
    <h3 className="pr-24 text-lg font-black text-slate-900">{title}</h3>
    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
      <span>{duration}</span>
      <span>•</span>
      <span>{bestFor}</span>
      <span>•</span>
      <span>{format}</span>
    </div>
    <p className="mt-4 text-2xl font-black text-slate-900">{price}</p>
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

  const seasonalNote = inWa2Season
    ? 'WA2 results just came in. If your child did not hit target, we can help you fix urgent gaps quickly before exam pressure builds.'
    : inMidYearSeason
      ? 'Mid-year results reveal the real weak topics. Most students need targeted correction now, not another generic weekly routine.'
      : inExamSprint
        ? 'Exam window is near. This crash course focuses only on the scoring gaps that matter most right now.'
        : 'If recent results are below expectations, we focus on urgent correction first so your child can recover faster.';

  return {
    heroTitle: isPsle
      ? 'PSLE Math & Science Final-Lap Crash Course'
      : isOLevel
        ? 'O-Level Math & Science Final-Lap Crash Course'
        : 'PSLE & O-Level Final-Lap Crash Course',
    heroLocationTitle: 'North Singapore',
    heroSubtitle: isPsle
      ? 'Your child\'s WA2 result may not be where you hoped. We focus on fast, targeted correction before PSLE.'
      : isOLevel
        ? 'Mid-year results can feel stressful. We target the exact weak chapters and paper skills your child needs now.'
        : 'If results are below expectations, we run focused correction on the biggest scoring gaps first.',
    seasonalNote,
    promiseItems: isPsle
      ? [
          'Diagnostic review from WA2 papers or recent school work',
          'Targeted weak-topic correction in a short 1-2 week sprint',
          'Parent updates after each session so you can track progress',
          'Exam-style practice focused on real scoring improvement',
        ]
      : isOLevel
        ? [
            'Fast chapter-level diagnosis from recent tests or papers',
            'Targeted rescue on the most costly weak chapters first',
            'Parent updates after each session with next-step focus',
            'Timed paper strategy and exam-style correction support',
          ]
        : [
            'Fast diagnosis from recent tests, papers, and weak-topic lists',
            'Targeted correction on highest-impact scoring gaps first',
            'Parent updates after each session with clear next steps',
            'Exam-style practice that builds results under time pressure',
          ],
    methodKicker: 'Crash Course',
    methodTitle: 'What Is a Crash Course?',
    methodSubtitle: 'A crash course is not a full-year tuition replacement. It is a short intensive block designed to fix urgent scoring gaps before the exam.',
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
    chooserSubtitle: 'Pick the level that matches your child’s final-lap pressure point.',
    pslePackageTitle: 'PSLE Math & Science Crash Course',
    pslePackageSubtitle: 'Short intensive format for urgent correction before PSLE.',
    oLevelPackageTitle: 'O-Level Math & Science Crash Course',
    oLevelPackageSubtitle: 'Short intensive format for urgent chapter rescue before O-Levels.',
    friendGroupTitle: isPsle ? 'PSLE Friend-Group Home Crash Course' : isOLevel ? 'O-Level Friend-Group Home Crash Course' : 'Friend-Group Home Crash Course',
    friendGroupSubtitle: isPsle
      ? 'Have 2–4 P6 students from the same school, estate, class, or friend group? Mini-groups can be conducted at one host family\'s home or selected tutor-hosted study space slots. This keeps the lesson focused while reducing cost per student.'
      : isOLevel
        ? 'Have 2–4 Sec 4 / Sec 5 students from the same school, estate, class, or friend group? Mini-groups can be conducted at one host family\'s home or selected tutor-hosted study space slots. This keeps the lesson focused while reducing cost per student.'
        : 'Have 2–4 students from the same school, estate, class, or friend group? Mini-groups can be conducted at one host family\'s home or selected tutor-hosted study space slots. This keeps the lesson focused while reducing cost per student.',
    friendGroupPricing1: isPsle ? 'PSLE friend-group option: From $45/student/hr' : isOLevel ? 'O-Level friend-group option: From $50/student/hr' : 'PSLE friend-group option: From $45/student/hr',
    friendGroupPricing2: isPsle ? 'O-Level friend-group option: From $50/student/hr' : isOLevel ? 'PSLE friend-group option: From $45/student/hr' : 'O-Level friend-group option: From $50/student/hr',
    friendGroupCta: 'Form a Friend Group',
    afterCourseTitle: 'Keep the Momentum After the Crash Course',
    afterCourseSubtitle: 'A crash course can correct urgent gaps, but students still need consistency after the session ends.',
    logisticsTitle: 'Flexible Home-Based Options for North Singapore Families',
    logisticsSubtitle: 'Lessons can be conducted at the student\'s home within North Singapore. For friend-group sessions, one host family may provide the venue. Selected mini-group sessions may also be conducted at a small tutor-hosted study space, with details shared before confirmation.',
    mockTitle: isPsle ? 'Coming Next: PSLE Mock Simulation Interest List' : isOLevel ? 'Coming Next: O-Level Mock Simulation Interest List' : 'Coming Next: Mock Exam Simulation Day',
    mockSubtitle: isPsle
      ? 'If enough students register interest, Integrated Learnings will open a North Singapore PSLE mock simulation. Students will sit for a timed paper under exam-style conditions, followed by correction, diagnosis, and next-step recommendations.'
      : isOLevel
        ? 'If enough students register interest, Integrated Learnings will open a North Singapore O-Level mock simulation. Students will sit for a timed paper under exam-style conditions, followed by correction, diagnosis, and next-step recommendations.'
        : 'If enough students register interest, Integrated Learnings will open a North Singapore mock exam simulation for PSLE and O-Level students. Students will sit for a timed paper under exam-style conditions, followed by correction, diagnosis, and next-step recommendations.',
    mockButtonLabel: isPsle ? 'Join PSLE Mock Interest List' : isOLevel ? 'Join O-Level Mock Interest List' : 'Join Mock Exam Interest List',
    howToStartTitle: 'How to Start',
    howToStartSubtitle: 'A clear process so parents know what happens before the first session starts.',
    step2Title: 'We do a fit check',
    step2Body: isPsle
      ? 'We identify whether the student needs PSLE, 1-to-1, friend-group, or mock-simulation support.'
      : isOLevel
        ? 'We identify whether the student needs O-Level, 1-to-1, friend-group, or mock-simulation support.'
        : 'We identify whether the student needs PSLE, O-Level, 1-to-1, friend-group, or mock-simulation support.',
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
    fitCheckTitle: 'Before You Sign Up',
    fitCheckSubtitle: 'This programme works best when the student is willing to attempt corrections and practise between sessions. It may not be the right fit if the family is looking for a full-year syllabus programme, a large lecture class, or guaranteed score claims.',
    finalTitle: 'Ready to check if this fits your child?',
    finalSubtitle: 'Send the latest result slip, weak-topic list, or a short description of your child’s situation. We’ll recommend whether the route-specific crash course, friend-group support, or another option fits best.',
    finalNote: 'Best recommendation depends on subject, location, urgency, student needs, and suitable lesson format after fit check.',
    oLevelCrossLink: 'Looking for O-Level support? View O-Level Math & Science Crash Course.',
    psleCrossLink: 'Looking for PSLE support? View PSLE Math & Science Crash Course.',
  };
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
        'Hi Integrated Learnings, I\'m checking available PSLE Home Crash Course slots.',
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
        'Preferred days/timing:',
        '',
        'Please advise the available slots and suitable package.',
      ].join('\n')
    : isOLevel
      ? [
          'Hi Integrated Learnings, I\'m checking available O-Level Home Crash Course slots.',
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
          'Preferred days/timing:',
          '',
          'Please advise the available slots and suitable package.',
        ].join('\n')
      : 'Hi Integrated Learnings, I\'m checking available home crash course slots for PSLE / O-Level. Please advise the available slots and suitable package.';

  const slotsLink = toWhatsApp(slotsMessage);
  const fitCheckLink = toWhatsApp(fitCheckMessage);
  const friendGroupLink = toWhatsApp('Hi Integrated Learnings, I have 2-4 students and would like to form a friend-group home crash course.');
  const followThroughLink = toWhatsApp('Hi Integrated Learnings, please tell me about post-crash-course follow-through and StudyPulse options.');
  const mockInterestLink = toWhatsApp('Hi Integrated Learnings, I want to join the mock exam interest list for PSLE / O-Level.');
  const pslePackageLink = '#psle-packages';
  const oLevelPackageLink = '#olevel-packages';

  const pslePackages = [
    {
      title: 'PSLE 4-Block Final-Lap Intensive',
      duration: '4 blocks × 3h = 12h',
      bestFor: 'main PSLE weak-topic correction before exam sprint',
      format: "student's home or tutor-hosted study space, subject to schedule",
      price: 'See pricing by format',
      includes: [
        '3 correction blocks + 1 final revision block',
        'Weak-topic mapping and scoring-gap focus',
        'Exam-style guided and timed practice',
        'Parent update with next-step plan',
      ],
      popular: true,
    },
    {
      title: 'PSLE Mini-Group 4-Block Intensive',
      duration: '4 blocks × 3h = 12h',
      bestFor: '2–4 students of similar level and subject needs',
      format: "host family's home or tutor-hosted study space, subject to schedule",
      price: 'See pricing by format',
      includes: [
        'Small-group diagnostic review and weak-topic targeting',
        'Exam-style guided practice + final revision block',
        'Parent updates where suitable',
        'Group size kept to 2-4 students',
      ],
    },
  ];

  const oLevelPackages = [
    {
      title: 'O-Level 4-Block Subject Intensive',
      duration: '4 blocks × 3h = 12h',
      bestFor: 'urgent chapter rescue before O-Level papers',
      format: "student's home or tutor-hosted study space, subject to schedule",
      price: 'See pricing by format',
      includes: [
        '3 correction blocks + 1 final paper-strategy block',
        'Weak-chapter mapping and chapter rescue focus',
        'Timed section practice with correction plan',
        'Parent/student next-step summary',
      ],
      popular: true,
    },
    {
      title: 'O-Level Mini-Group 4-Block Intensive',
      duration: '4 blocks × 3h = 12h',
      bestFor: '2–4 students of similar level and subject needs',
      format: "host family's home or tutor-hosted study space, subject to schedule",
      price: 'See pricing by format',
      includes: [
        'Small-group diagnostic review and chapter targeting',
        'Timed exam-style practice + paper strategy block',
        'Parent/student updates where suitable',
        'Group size kept to 2-4 students',
      ],
    },
  ];

  const faqItems = [
    {
      question: 'My child just finished WA2 / mid-year and the results are low. Is this the right timing?',
      answer: 'Yes. This is exactly when many parents come to us. We review recent papers quickly, identify urgent weak topics, and focus on high-impact correction first.',
    },
    {
      question: 'How fast can we see improvement?',
      answer: 'Many students show clearer methods and fewer repeated mistakes within 2-3 sessions. Score movement depends on baseline, effort, and exam timeline.',
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
      answer: 'Normal tuition is broad and ongoing. This crash course is short and urgent: fix the biggest scoring gaps first, then apply in exam-style questions.',
    },
    {
      question: 'What happens after the crash course ends?',
      answer: 'We provide a follow-through plan. If needed, families can continue with StudyPulse or weekly correction support for accountability.',
    },
  ];

  const [openPricingPanels, setOpenPricingPanels] = useState<Record<string, boolean>>(() => ({
    tutor_hosted: true,
    student_home: false,
    mini_group: false,
  }));

  const togglePricingPanel = (panelId: string) => {
    setOpenPricingPanels((prev) => ({ ...prev, [panelId]: !prev[panelId] }));
  };

  const pricingRows = {
    studentHome: isOLevel
      ? [
          { name: '1-Day Chapter Rescue', detail: '1 × 3h', price: 'From $255' },
          { name: '4-Block Subject Intensive', detail: '4 × 3h = 12h', price: 'From $1,020 total' },
        ]
      : [
          { name: '1-Day Targeted Correction', detail: '1 × 3h', price: 'From $240' },
          { name: '4-Block Final-Lap Intensive', detail: '4 × 3h = 12h', price: 'From $960 total' },
        ],
    tutorHosted: isOLevel
      ? [
          { name: '1-Day Chapter Rescue', detail: '1 × 3h', price: 'From $225' },
          { name: '4-Block Subject Intensive', detail: '4 × 3h = 12h', price: 'From $900 total' },
        ]
      : [
          { name: '1-Day Targeted Correction', detail: '1 × 3h', price: 'From $210' },
          { name: '4-Block Final-Lap Intensive', detail: '4 × 3h = 12h', price: 'From $840 total' },
        ],
    miniGroupTutorHosted: isOLevel
      ? [
          '2 students | From $60/student/hr',
          '3 students | From $55/student/hr',
          '4 students | From $50/student/hr',
        ]
      : [
          '2 students | From $55/student/hr',
          '3 students | From $50/student/hr',
          '4 students | From $45/student/hr',
        ],
    miniGroupHostFamily: isOLevel
      ? [
          '2 students | From $65/student/hr',
          '3 students | From $60/student/hr',
          '4 students | From $55/student/hr',
        ]
      : [
          '2 students | From $60/student/hr',
          '3 students | From $55/student/hr',
          '4 students | From $50/student/hr',
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
                <Sparkles size={12} className="mr-2" aria-hidden="true" /> Find the gap. Fix the gap. Push the final lap.
              </Pill>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
                <span className="block">{pageCopy.heroTitle}</span>
                <span className="mt-1 block text-amber-300">{pageCopy.heroLocationTitle}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">{pageCopy.heroSubtitle}</p>
              <p className="mt-4 max-w-2xl rounded-2xl border border-amber-300/30 bg-amber-100/10 px-4 py-3 text-sm font-semibold text-amber-100">
                {pageCopy.seasonalNote}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <ActionButton
                  label="Send Result Slip for Fit Check"
                  href={fitCheckLink}
                  ctaName="hero_fit_check"
                  icon={<FileText size={15} aria-hidden="true" />}
                  className="bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 hover:bg-amber-300"
                />
                <ActionButton
                  label="Check Available Home Slots"
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
            subtitle="Pick the format that matches your schedule and your child’s learning style. We’ll recommend the best one during fit check."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-900">Tutor Travels to Student’s Home</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Best for: convenience + focused 1-to-1 support</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">We teach at your home in North Singapore where schedules allow.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-900">Tutor-Hosted Study Space</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Best for: longer focused sessions at better value</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">Selected slots are available at our small tutor-hosted study space.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-900">Mini-Group Format</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Best for: 2–4 students of similar level</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">Study with friends at a host home or selected tutor-hosted slots to reduce cost per student.</p>
            </article>
          </div>
          <p className="mt-5 text-xs text-slate-500">
            Best format depends on subject, location, group size, urgency, and student needs after the free WhatsApp fit check.
          </p>
        </SectionCard>

        <SectionCard>
          <SectionHeading
            kicker="PRICING BY FORMAT"
            title="View Pricing by Lesson Format"
            subtitle="Open each format to compare pricing. Best fit depends on subject, location, group size, urgency, and student needs after fit check."
          />

          <div className="mt-6 space-y-3">
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <h3>
                <button
                  type="button"
                  aria-expanded={openPricingPanels.student_home}
                  onClick={() => togglePricingPanel('student_home')}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span>
                    <span className="block text-sm font-black text-slate-900">Tutor Travels to Student’s Home</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">Best for families who want maximum convenience and focused 1-to-1 support at home. Home-visit pricing includes tutor travel time and scheduling buffer.</span>
                  </span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${openPricingPanels.student_home ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </h3>
              {!openPricingPanels.student_home ? null : (
                <div className="border-t border-slate-200 px-5 py-4">
                  <div className="space-y-2 text-sm">
                    {pricingRows.studentHome.map((row) => (
                      <div key={row.name} className="flex flex-col justify-between gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-center">
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="text-slate-600">{row.detail} | {row.price}</p>
                      </div>
                    ))}
                  </div>
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
                  <span>
                    <span className="block text-sm font-black text-slate-900">Tutor-Hosted Study Space</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">Best for students who can travel to us and want longer, more focused sessions at better value. Better value because there is no tutor travel time.</span>
                  </span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${openPricingPanels.tutor_hosted ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </h3>
              {!openPricingPanels.tutor_hosted ? null : (
                <div className="border-t border-slate-200 px-5 py-4">
                  <div className="space-y-2 text-sm">
                    {pricingRows.tutorHosted.map((row) => (
                      <div key={row.name} className="flex flex-col justify-between gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-center">
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="text-slate-600">{row.detail} | {row.price}</p>
                      </div>
                    ))}
                  </div>
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
                  <span>
                    <span className="block text-sm font-black text-slate-900">Mini-Group Crash Course</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500">Best for 2–4 students of similar level. Mini-groups lower the cost per student while keeping the group small and targeted.</span>
                  </span>
                  <ChevronDown size={16} className={`shrink-0 text-slate-500 transition-transform ${openPricingPanels.mini_group ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
              </h3>
              {!openPricingPanels.mini_group ? null : (
                <div className="border-t border-slate-200 px-5 py-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Tutor-hosted mini-group</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {pricingRows.miniGroupTutorHosted.map((line) => <li key={line}>{line}</li>)}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">Host-family mini-group</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {pricingRows.miniGroupHostFamily.map((line) => <li key={line}>{line}</li>)}
                      </ul>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-600">Mini-groups are subject to student fit, similar level/subject needs, and suitable scheduling. Group size is kept to 2–4 students.</p>
                </div>
              )}
            </article>
          </div>
        </SectionCard>

        {(showCombined || isPsle) && (
          <SectionCard id="psle-packages">
            <SectionHeading
              kicker="PSLE"
              title={pageCopy.pslePackageTitle}
              subtitle={pageCopy.pslePackageSubtitle}
            />
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Send your child’s latest paper for a free WhatsApp fit check. We’ll recommend the right package.
            </p>
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <PackageCard
                title="PSLE 1-Day Targeted Correction"
                duration="1 block × 3h"
                bestFor="quick rescue on one major weak topic"
                format="student's home or tutor-hosted study space, subject to schedule"
                price="See pricing by format"
                includes={[
                  'Quick diagnostic from recent work',
                  'Targeted correction on one urgent scoring gap',
                  'Guided PSLE-style practice + parent update',
                ]}
              />
              {pslePackages.map((pkg) => <PackageCard key={pkg.title} {...pkg} />)}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">PSLE Math focus</p>
                <BulletList
                  items={[
                    'Fractions, ratio, percentage',
                    'Speed and rate',
                    'Area, perimeter, volume',
                    'Angles and geometry',
                    'Pattern questions',
                    'Problem sums and heuristics',
                    'Careless-error tracking',
                  ]}
                />
              </SectionCard>
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">PSLE Science focus</p>
                <BulletList
                  items={[
                    'Systems',
                    'Cycles',
                    'Interactions',
                    'Energy',
                    'Forces',
                    'Experimental skills',
                    'Graphs, tables, data-based questions',
                    'Open-ended answering and keywords',
                  ]}
                />
              </SectionCard>
            </div>
            {!showCombined && (
              <p className="mt-5 text-xs text-slate-500">
                <Link to="/family/crash-courses/o-level-june-intensive" className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900 hover:decoration-slate-500">
                  {pageCopy.psleCrossLink}
                </Link>
              </p>
            )}
            <p className="mt-5 text-xs text-slate-500">Package prices vary by lesson format. Open the pricing panels above to compare student-home, tutor-hosted, and mini-group options. Tutor-hosted sessions may allow longer blocks or better-value arrangements because no travel time is needed.</p>
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
              Send your child’s latest paper for a free WhatsApp fit check. We’ll recommend the right package.
            </p>
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <PackageCard
                title="O-Level 1-Day Chapter Rescue"
                duration="1 block × 3h"
                bestFor="quick rescue on one weak chapter or paper section"
                format="student's home or tutor-hosted study space, subject to schedule"
                price="See pricing by format"
                includes={[
                  'Quick paper/result diagnostic',
                  'Targeted correction on one urgent weak chapter',
                  'Guided exam-style drilling + next-step summary',
                ]}
              />
              {oLevelPackages.map((pkg) => <PackageCard key={pkg.title} {...pkg} />)}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">E-Math</p>
                <BulletList
                  items={[
                    'Algebra',
                    'Geometry',
                    'Graphs',
                    'Mensuration',
                    'Trigonometry',
                    'Paper strategy',
                    'Common scoring traps',
                  ]}
                />
              </SectionCard>
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">A-Math</p>
                <BulletList
                  items={[
                    'Calculus',
                    'Trigonometry',
                    'Functions',
                    'Logarithms',
                    'Coordinate geometry',
                    'Equation solving',
                    'Exam question breakdown',
                  ]}
                />
              </SectionCard>
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Physics</p>
                <BulletList
                  items={[
                    'Concept application',
                    'Formula selection',
                    'Structured answering',
                    'Graph/data interpretation',
                    'Practical-style skills',
                    'Common misconception correction',
                  ]}
                />
              </SectionCard>
              <SectionCard className="border-slate-200 bg-slate-50">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Chemistry</p>
                <BulletList
                  items={[
                    'Mole concept',
                    'Chemical bonding',
                    'Acids, bases and salts',
                    'QA',
                    'Electrolysis',
                    'Organic chemistry',
                    'Answer precision',
                  ]}
                />
              </SectionCard>
            </div>
            {!showCombined && (
              <p className="mt-5 text-xs text-slate-500">
                <Link to="/family/crash-courses/psle-june-intensive" className="font-medium text-slate-600 underline decoration-slate-300 underline-offset-2 transition hover:text-slate-900 hover:decoration-slate-500">
                  {pageCopy.oLevelCrossLink}
                </Link>
              </p>
            )}
            <p className="mt-5 text-xs text-slate-500">Package prices vary by lesson format. Open the pricing panels above to compare student-home, tutor-hosted, and mini-group options. Tutor-hosted sessions may allow longer blocks or better-value arrangements because no travel time is needed.</p>
          </SectionCard>
        )}

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

        <FaqAccordion items={faqItems} />

        <SectionCard className="border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
          <SectionHeading
            kicker="NEXT STEP"
            title={pageCopy.finalTitle}
            subtitle={pageCopy.finalSubtitle}
          />
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ActionButton
              label="Send Result Slip for Fit Check"
              href={fitCheckLink}
              ctaName="final_fit_check"
              icon={<FileText size={15} aria-hidden="true" />}
              className="bg-amber-500 text-slate-950 hover:bg-amber-400"
            />
            <ActionButton
              label="Check Available Home Slots"
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
            Check Home Slots
          </a>
          <a
            href={fitCheckLink}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackCtaClick('mobile_sticky_fit_check', fitCheckLink)}
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-50"
          >
            Send Result Slip
          </a>
        </div>
      </div>
    </div>
  );
};

export const FamilyPSLEJuneIntensivePage: React.FC = () => <CrashCourseLandingPage variant="psle" />;
export const FamilyOLevelJuneIntensivePage: React.FC = () => <CrashCourseLandingPage variant="olevel" />;
