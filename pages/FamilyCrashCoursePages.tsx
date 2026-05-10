import React, { useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Home,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';

const WA_NUMBER = '6598882675';
const PAGE_TAG = 'final-lap-home-crash-course';
type CrashCourseVariant = 'combined' | 'psle' | 'olevel';

const northAreas = ['Woodlands', 'Admiralty', 'Marsiling', 'Sembawang', 'Canberra', 'Yishun', 'Khatib'];

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

const ComparisonTable: React.FC = () => (
  <SectionCard>
    <SectionHeading title="Normal tuition supports weekly learning. This crash course targets urgent correction in a short period." />
    <div className="mt-5 space-y-3 md:hidden">
      {[
        ['Fixed weekly pace', 'Diagnosis first, then focused correction'],
        ['Broad topic coverage', 'High-impact weak topics first'],
        ['Shared materials', 'Student-specific papers and errors'],
        ['General parent visibility', 'Clear parent updates and next steps'],
        ['Ends after lessons', 'Optional follow-through support'],
      ].map(([left, right]) => (
        <article key={left} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Typical option</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{left}</p>
          <p className="mt-3 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">Integrated Learnings</p>
          <p className="mt-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-slate-700">{right}</p>
        </article>
      ))}
    </div>

    <div className="mt-5 hidden overflow-x-auto md:block">
      <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
        <thead>
          <tr>
            <th className="w-1/2 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Normal Tuition / Generic Crash Course</th>
            <th className="w-1/2 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Integrated Learnings Home Crash Course</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Fixed weekly pace', 'Diagnosis first, then focused correction'],
            ['Broad topic coverage', 'High-impact weak topics first'],
            ['Shared materials', 'Student-specific papers and errors'],
            ['General parent visibility', 'Clear parent updates and next steps'],
            ['Ends after lessons', 'Optional follow-through support'],
          ].map(([left, right]) => (
            <tr key={left} className="align-top">
              <td className="rounded-l-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-slate-700">{left}</td>
              <td className="rounded-r-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-slate-700">{right}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionCard>
);

const getPageCopy = (variant: CrashCourseVariant) => {
  const isPsle = variant === 'psle';
  const isOLevel = variant === 'olevel';

  return {
    heroTitle: isPsle
      ? 'PSLE Math & Science Final-Lap Crash Course'
      : isOLevel
        ? 'O-Level Math & Science Final-Lap Crash Course'
        : 'PSLE & O-Level Final-Lap Crash Course',
    heroLocationTitle: 'North Singapore',
    heroSubtitle: isPsle
      ? 'Diagnostic-based home crash course for P6 students who need targeted Math and Science correction, stronger exam technique, and clearer parent-visible progress.'
      : isOLevel
        ? 'Diagnostic-based home crash course for Sec 4 and Sec 5 students who need targeted chapter rescue, stronger paper strategy, and clearer exam technique.'
        : 'Diagnostic-based home crash course for PSLE and O-Level students who need targeted weak-topic correction, stronger exam technique, and clearer parent-visible progress.',
    heroSupport: isPsle
      ? 'We first identify where marks are being lost, then focus on the highest-impact PSLE gaps before moving into timed exam-style practice.'
      : isOLevel
        ? 'We first identify where marks are being lost, then focus on the highest-impact O-Level gaps before moving into timed exam-style practice.'
        : 'We first identify where marks are being lost, then focus on the highest-impact gaps before moving into timed exam-style practice.',
    heroStrong: isPsle
      ? 'Led by experienced Math and Science educators focused on diagnostic correction, exam-style practice, and parent-visible lesson updates.'
      : isOLevel
        ? 'Led by experienced Math and Science educators focused on chapter rescue, paper strategy, exam-style correction, and parent-visible lesson updates.'
        : 'Led by experienced Math and Science educators focused on diagnostic correction, exam-style practice, and parent-visible lesson updates.',
    locationLine: `Available first for North Singapore: ${northAreas.join(', ')} and nearby estates.`,
    heroBadges: isPsle
      ? [
          'PSLE Math & Science',
          'P6 final-lap support',
          'Student\'s home / host family / tutor-hosted study space',
          'North Singapore first',
          'Parent updates after each session',
          'StudyPulse follow-through available',
        ]
      : isOLevel
        ? [
            'E-Math, A-Math, Physics & Chemistry',
            'Sec 4 / Sec 5 final-lap support',
            'Student\'s home / host family / tutor-hosted study space',
            'North Singapore first',
            'Parent updates after each session',
            'StudyPulse follow-through available',
          ]
        : [
            'Student\'s home / host family / tutor-hosted study space',
            'PSLE Math & Science',
            'O-Level E-Math, A-Math, Physics & Chemistry',
            'North Singapore first',
            'Parent updates after each session',
            'StudyPulse follow-through available',
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
    pslePackageSubtitle: 'Built as a short intensive model: 3 focused correction blocks + 1 final revision block (4 blocks × 3h = 12h), typically completed over 1–2 weeks depending on schedule and stamina.',
    oLevelPackageTitle: 'O-Level Math & Science Crash Course',
    oLevelPackageSubtitle: 'Built as a short intensive model: 3 focused correction blocks + 1 final revision / paper strategy block (4 blocks × 3h = 12h), typically completed over 1–2 weeks depending on schedule and stamina.',
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
    finalNote: 'Final recommendation depends on subject, location, urgency, student needs, and suitable lesson format after fit check.',
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

  useEffect(() => setPageSeo(pageSeo.title, pageSeo.description, pageSeo.canonicalPath), [pageSeo.title, pageSeo.description, pageSeo.canonicalPath]);

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

  const uspCards = [
    {
      title: 'Diagnostic First, Not Worksheet First',
      body: 'We begin by reviewing the student’s current performance, recent papers, or weak-topic list before deciding what to focus on.',
    },
    {
      title: 'Personalised Final-Lap Plan',
      body: 'Each crash course is adjusted based on the student’s actual gaps instead of forcing every child through the same lesson sequence.',
    },
    {
      title: 'Exam-Style Correction',
      body: 'We focus on how marks are lost in real questions, including careless mistakes, missing keywords, weak explanation, poor problem-solving flow, and time pressure.',
    },
    {
      title: 'Parent-Visible Progress',
      body: 'Parents receive updates after sessions so they know what was covered, what was observed, and what the student should work on next.',
    },
    {
      title: 'Follow-Through After the Crash Course',
      body: 'Students receive a post-course revision direction. StudyPulse or weekly correction support can be added if the student needs accountability after the crash course.',
    },
  ];

  const pslePackages = [
    {
      title: 'PSLE 4-Block Final-Lap Intensive',
      duration: '4 blocks × 3h = 12h',
      bestFor: 'serious PSLE Math or Science final-lap preparation',
      format: "student's home or tutor-hosted study space, subject to schedule",
      price: 'See pricing by format',
      includes: [
        '3 focused correction blocks',
        '1 final revision block',
        'Weak-topic mapping',
        'Exam-style guided practice',
        'Timed mini-practice',
        'Parent updates and next-step plan',
        'StudyPulse follow-through option',
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
        'Small-group diagnostic review',
        'Targeted correction based on group needs',
        'Exam-style guided practice',
        'Final revision block',
        'Parent updates where suitable',
        'Group size kept to 2–4 students',
      ],
    },
  ];

  const oLevelPackages = [
    {
      title: 'O-Level 4-Block Subject Intensive',
      duration: '4 blocks × 3h = 12h',
      bestFor: 'serious O-Level subject final-lap preparation',
      format: "student's home or tutor-hosted study space, subject to schedule",
      price: 'See pricing by format',
      includes: [
        '3 focused subject correction blocks',
        '1 final revision / paper strategy block',
        'Weak-chapter mapping',
        'Timed section practice',
        'Paper strategy and correction plan',
        'Parent/student next-step summary',
        'StudyPulse follow-through option',
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
        'Small-group diagnostic review',
        'Targeted chapter correction based on group needs',
        'Timed exam-style practice',
        'Final revision / paper strategy block',
        'Parent/student updates where suitable',
        'Group size kept to 2–4 students',
      ],
    },
  ];

  const faqItems = [
    {
      question: 'Is this normal tuition?',
      answer: 'No. Normal tuition usually runs weekly. This is a short intensive focused on urgent correction before the exam.',
    },
    {
      question: 'How do you know what my child needs?',
      answer: 'Parents can send recent papers, result slips, or weak-topic lists. We use these to identify priority issues before recommending the format and plan.',
    },
    {
      question: 'Where are lessons conducted?',
      answer: 'Most sessions are at the student\'s home within North Singapore. Friend-group sessions can run at one host family\'s home.',
    },
    {
      question: 'Can my child come to tutor-hosted study space?',
      answer: 'Yes, selected sessions are available at a small tutor-hosted study space, subject to schedule and student fit.',
    },
    {
      question: 'Can friends join?',
      answer: 'Yes. Small groups are usually 2–4 students with similar level and subject needs.',
    },
    {
      question: 'Do you guarantee improvement?',
      answer: 'No responsible educator should guarantee grades. We provide clear diagnosis, structured correction, and parent updates.',
    },
    {
      question: 'What happens after the crash course?',
      answer: 'You can continue with follow-through options such as StudyPulse tracking or weekly correction support if needed.',
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
            <div>
              <Pill className="border-white/15 bg-white/10 text-amber-200">
                <Sparkles size={12} className="mr-2" aria-hidden="true" /> Find the gap. Fix the gap. Push the final lap.
              </Pill>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
                <span className="block">{pageCopy.heroTitle}</span>
                <span className="mt-1 block text-amber-300">{pageCopy.heroLocationTitle}</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">{pageCopy.heroSubtitle}</p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{pageCopy.heroSupport}</p>
              <p className="mt-4 max-w-2xl rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-amber-100">
                {pageCopy.heroStrong}
              </p>
              <p className="mt-4 max-w-2xl text-sm font-semibold text-slate-300">{pageCopy.locationLine}</p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-200">Parent clarity</p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">Free fit check before recommendation</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-200">Progress visibility</p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">Parent updates after each session</p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-200">Flexible venue</p>
                  <p className="mt-1 text-sm font-semibold text-slate-100">Home, host family, or tutor-hosted option</p>
                </div>
              </div>

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

              <div className="mt-8 grid gap-2 sm:grid-cols-2">
                {pageCopy.heroBadges.map((badge) => (
                  <div key={badge} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 backdrop-blur-sm">
                    {badge}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <SectionCard className="border-white/10 bg-white/5 p-5 text-white backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Home-based correction flow</p>
                <div className="mt-4 space-y-3">
                  {[
                    'Diagnostic review using school work, result slips, or weak-topic lists',
                    'Targeted correction on the highest-impact scoring gaps first',
                    'Timed exam-style practice once foundations are repaired',
                  ].map((line) => (
                    <div key={line} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                      <Target size={16} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
                      <p className="text-sm leading-relaxed text-slate-200">{line}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard className="border-white/10 bg-white/5 p-5 text-white backdrop-blur-sm">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-300">North Singapore focus</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {northAreas.map((area) => (
                    <Pill key={area} className="border-white/15 bg-white/10 text-slate-100">
                      {area}
                    </Pill>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">
                  Lessons can be conducted at the student\'s home within North Singapore. For friend-group sessions, one host family may provide the venue. Selected mini-group sessions may also be conducted at a small tutor-hosted study space, with details shared before confirmation.
                </p>
              </SectionCard>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6 lg:py-12">
        <SectionCard>
          <SectionHeading
            kicker={pageCopy.methodKicker}
            title={pageCopy.methodTitle}
            subtitle={pageCopy.methodSubtitle}
          />
          <p className="mt-4 text-sm leading-7 text-slate-600">
            We first identify where marks are being lost, then focus on high-impact weak topics, answering technique, and exam-style practice. The aim is to use limited holiday time more effectively, not to rush through the whole syllabus blindly.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {pageCopy.methodCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">{card.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{card.text}</p>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeading
            kicker="Difference"
            title="Why Integrated Learnings Is Different"
            subtitle={pageCopy.differenceSubtitle}
          />
          <p className="mt-4 text-sm leading-7 text-slate-600">
            We use the student’s recent work to decide what to fix first, then run focused correction in a short window.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {uspCards.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <ComparisonTable />
            <SectionCard className="h-full border-slate-200 bg-slate-50">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Final note</p>
              <p className="mt-3 text-lg font-bold leading-8 text-slate-900">
                Normal tuition supports weekly learning. This crash course is built for urgent correction over a short period.
              </p>
            </SectionCard>
          </div>
        </SectionCard>

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
            subtitle="Different families need different arrangements. We can recommend the most suitable format after the free WhatsApp fit check, based on the student’s needs, location, schedule, and whether the child learns better alone or in a small group."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-900">Tutor Travels to Student’s Home</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Best for: maximum convenience and focused 1-to-1 support</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">We conduct lessons at home within North Singapore where schedules allow.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-900">Tutor-Hosted Study Space</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Best for: longer focused sessions and better-value arrangements</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">Selected sessions run at a small tutor-hosted study space, often at better value due to no travel time.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-900">Mini-Group Format</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Best for: 2–4 students of similar level</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">Small groups can meet at a host family’s home or selected tutor-hosted slots to reduce per-student cost.</p>
            </article>
          </div>
          <p className="mt-5 text-xs text-slate-500">
            Final recommendation depends on subject, lesson location format, group size, urgency, and student needs after the free WhatsApp fit check.
          </p>
        </SectionCard>

        <SectionCard>
          <SectionHeading
            kicker="PRICING BY FORMAT"
            title="View Pricing by Lesson Format"
            subtitle="Choose the format that fits your family. You can open more than one option to compare pricing. Final recommendation depends on subject, lesson location, group size, urgency, and student needs after the free WhatsApp fit check."
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
              Not sure which package fits? Start with a free WhatsApp fit check. We’ll review recent results and recommend the right option.
            </p>
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <PackageCard
                title="PSLE 1-Day Targeted Correction"
                duration="1 block × 3h"
                bestFor="urgent correction on one major weak area before deciding on the full intensive"
                format="student's home or tutor-hosted study space, subject to schedule"
                price="See pricing by format"
                includes={[
                  'Quick review of recent work or weak topics',
                  'Targeted correction on one urgent scoring gap',
                  'Guided PSLE-style practice',
                  'Parent update after session',
                  'Recommendation on whether the full intensive is needed',
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
              Not sure which package fits? Start with a free WhatsApp fit check. We’ll review recent results and recommend the right option.
            </p>
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <PackageCard
                title="O-Level 1-Day Chapter Rescue"
                duration="1 block × 3h"
                bestFor="urgent correction on one weak chapter, question type, or paper section"
                format="student's home or tutor-hosted study space, subject to schedule"
                price="See pricing by format"
                includes={[
                  'Paper/result review',
                  'Targeted correction on one urgent weak chapter or question type',
                  'Guided exam-style drilling',
                  'Parent/student next-step summary',
                  'Recommendation on whether the full intensive is needed',
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
            kicker="FINAL STEP"
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
