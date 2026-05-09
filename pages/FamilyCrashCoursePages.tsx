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
    <SectionHeading title="Normal tuition supports weekly learning. Our crash course targets urgent scoring gaps before the final lap." />
    <div className="mt-5 overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
        <thead>
          <tr>
            <th className="w-1/2 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Normal Tuition / Generic Crash Course</th>
            <th className="w-1/2 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Integrated Learnings Home Crash Course</th>
          </tr>
        </thead>
        <tbody>
          {[
            ['Usually follows a fixed weekly pace', 'Starts with diagnosis and weak-gap mapping'],
            ['Often covers topics broadly', 'Targets the highest-impact scoring gaps first'],
            ['Same materials for many students', 'Uses the student’s actual papers, errors, and weak areas'],
            ['Parent may only know that the lesson happened', 'Parent receives clear lesson updates and next steps'],
            ['Ends after the lesson/package', 'Offers follow-through through revision targets, StudyPulse, or weekly correction support'],
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
      ? 'PSLE Math & Science Home Crash Course'
      : isOLevel
        ? 'O-Level Math & Science Home Crash Course'
        : 'PSLE & O-Level Home Crash Course',
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
    methodKicker: 'Method',
    methodTitle: isPsle
      ? 'Not Normal Tuition. A Targeted PSLE Final-Lap Intervention.'
      : isOLevel
        ? 'Not Normal Tuition. A Targeted O-Level Final-Lap Intervention.'
        : 'Not Normal Tuition. A Targeted Final-Lap Intervention.',
    methodSubtitle: isPsle
      ? 'Normal tuition can be useful for weekly learning. This crash course serves a different purpose: diagnose the child’s current PSLE scoring gaps, fix the most urgent issues, then push into exam-style practice.'
      : isOLevel
        ? 'Normal tuition can be useful for weekly learning. This crash course serves a different purpose: diagnose the child’s current O-Level scoring gaps, fix the most urgent issues, then push into exam-style practice.'
        : 'Normal tuition can be useful for weekly learning. This crash course serves a different purpose: diagnose the child’s current scoring gaps, fix the most urgent issues, then push into exam-style practice.',
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
    differenceSubtitle: 'Normal tuition can be useful, but our crash course serves a different purpose. It is built around the student’s actual work, not a fixed weekly script.',
    chooserTitle: 'Choose Your Level',
    chooserSubtitle: 'Pick the level that matches your child’s final-lap pressure point.',
    pslePackageTitle: 'PSLE Math & Science Home Crash Course',
    pslePackageSubtitle: 'For P6 students who need targeted correction before the final stretch. The course can focus on Math, Science, or a Math + Science combination depending on the child’s current gaps.',
    oLevelPackageTitle: 'O-Level Math & Science Home Crash Course',
    oLevelPackageSubtitle: 'For Sec 4 and Sec 5 students who need focused chapter rescue, paper strategy, and exam-technique correction before the final stretch.',
    friendGroupTitle: isPsle ? 'PSLE Friend-Group Home Crash Course' : isOLevel ? 'O-Level Friend-Group Home Crash Course' : 'Friend-Group Home Crash Course',
    friendGroupSubtitle: isPsle
      ? 'Have 2–4 P6 students from the same school, estate, class, or friend group? We can conduct a small PSLE crash course at one host family\'s home. One host family provides the venue, and we travel to the lesson. This keeps the lesson focused while reducing cost per student.'
      : isOLevel
        ? 'Have 2–4 Sec 4 / Sec 5 students from the same school, estate, class, or friend group? We can conduct a small O-Level crash course at one host family\'s home. One host family provides the venue, and we travel to the lesson. This keeps the lesson focused while reducing cost per student.'
        : 'Have 2–4 students from the same school, estate, class, or friend group? We can conduct a small-group crash course at one host family\'s home. One host family provides the venue, and we travel to the lesson. This keeps the lesson focused while reducing cost per student.',
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
    oLevelCrossLink: 'Looking for O-Level support? View O-Level Home Crash Course.',
    psleCrossLink: 'Looking for PSLE support? View PSLE Math & Science Home Crash Course.',
  };
};

const CrashCourseLandingPage: React.FC<{ variant?: CrashCourseVariant }> = ({ variant = 'combined' }) => {
  const pageSeo = getPageSeo(variant);
  const pageCopy = getPageCopy(variant);
  const isPsle = variant === 'psle';
  const isOLevel = variant === 'olevel';
  const showCombined = variant === 'combined';

  useEffect(() => setPageSeo(pageSeo.title, pageSeo.description, pageSeo.canonicalPath), [pageSeo.title, pageSeo.description, pageSeo.canonicalPath]);

  const slotsLink = toWhatsApp('Hi Integrated Learnings, I want to check available home slots for the PSLE & O-Level final-lap home crash course.');
  const fitCheckLink = toWhatsApp('Hi Integrated Learnings, I want to send my child’s latest result slip for a PSLE / O-Level fit check.');
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
      title: 'PSLE Mini Rescue',
      duration: '2 sessions × 1.5h',
      bestFor: 'quick diagnosis and urgent correction',
      format: '1-to-1 home',
      price: 'From $240 total',
      includes: [
        'Review of recent work or weak topics',
        'Targeted correction on key scoring leaks',
        'Parent update after each session',
        'Short follow-up plan',
      ],
    },
    {
      title: 'PSLE 3-Session Intensive',
      duration: '3 sessions × 1.5h',
      bestFor: 'focused short-term improvement',
      format: '1-to-1 home',
      price: 'From $360 total',
      includes: [
        'Diagnostic review',
        'Weak-topic correction',
        'Exam-style guided practice',
        'Parent update after every session',
        'Free 7-day StudyPulse follow-through option',
      ],
      popular: true,
    },
    {
      title: 'PSLE 6-Session Final-Lap Programme',
      duration: '6 sessions × 1.5h',
      bestFor: 'structured final-lap preparation',
      format: '1-to-1 home',
      price: 'From $720 total',
      includes: [
        'Weak-topic mapping',
        'Progressive correction plan',
        'Math/Science exam-style practice',
        'Timed mini-paper practice',
        'Parent updates',
        '14-day StudyPulse follow-through option',
      ],
    },
  ];

  const oLevelPackages = [
    {
      title: 'O-Level Mini Rescue',
      duration: '2 sessions × 2h',
      bestFor: 'urgent weak-chapter correction',
      format: '1-to-1 home',
      price: 'From $320 total',
      includes: [
        'Paper/result review',
        'Weak chapter diagnosis',
        'Targeted chapter correction',
        'Exam-style drilling',
        'Parent/student next-step summary',
      ],
    },
    {
      title: 'O-Level 4-Session Intensive',
      duration: '4 sessions × 2h',
      bestFor: 'one-subject final-lap improvement',
      format: '1-to-1 home',
      price: 'From $640 total',
      includes: [
        'Diagnostic review',
        'Two major weak-chapter corrections',
        'Timed section practice',
        'Exam strategy and correction plan',
      ],
      popular: true,
    },
    {
      title: 'O-Level 8-Session Final-Lap Programme',
      duration: '8 sessions × 2h',
      bestFor: 'serious structured preparation',
      format: '1-to-1 home',
      price: 'From $1,280 total',
      includes: [
        'Diagnostic paper review',
        'Foundation gap repair',
        'High-weightage topic correction',
        'Timed practice',
        'Paper strategy',
        'Final correction plan',
      ],
    },
  ];

  const faqItems = [
    {
      question: 'Is this the same as normal 1-to-1 tuition?',
      answer: 'No. Normal tuition usually follows a weekly teaching pace. This is a short, focused crash course that starts with diagnosis, targets the student’s scoring gaps, and moves into exam-style practice.',
    },
    {
      question: 'How do you know what my child needs?',
      answer: 'Parents can send the latest result slip, school paper, marked work, or weak-topic list. We use this to identify the main scoring leaks before recommending the course structure.',
    },
    {
      question: 'Where are lessons conducted?',
      answer: 'Most lessons are conducted at the student\'s home within North Singapore. Friend-group sessions can be held at one host family\'s home. Selected mini-group sessions may be conducted at a small tutor-hosted study space, capped at a small group size. Details will be shared before confirmation.',
    },
    {
      question: 'Which areas do you cover?',
      answer: `We are focusing on North Singapore first, including ${northAreas.join(', ')} and nearby estates. Other areas can be considered depending on schedule.`,
    },
    {
      question: 'Can friends or siblings join?',
      answer: 'Yes, if they are at a similar level and need similar subject support. For quality, home groups are usually kept to 2–4 students.',
    },
    {
      question: 'Do you provide materials?',
      answer: 'Yes. Materials may include targeted worksheets, exam-style questions, correction tasks, and practice plans. Students can also use their school papers or existing work for diagnosis.',
    },
    {
      question: 'Are meals provided?',
      answer: 'Meals are not provided for normal crash-course sessions conducted at the student\'s home or host family\'s home because sessions are kept focused and usually last 1.5–2 hours. For longer future mock simulation events, light refreshments may be arranged depending on duration and venue.',
    },
    {
      question: 'Is transport provided?',
      answer: 'Transport is not needed for these lessons because we conduct the session at the student\'s home or at one host family\'s home for friend-group sessions. For future mock simulation events, we will aim to choose venues near MRT/bus access where possible.',
    },
    {
      question: 'What happens after the crash course?',
      answer: 'Parents may continue with weekly support, StudyPulse follow-through, or future mock exam simulation events.',
    },
    {
      question: 'Will there be a mock exam?',
      answer: 'Mock exam simulation will be opened if there is enough interest, usually around 20 or more students for a suitable level/subject group.',
    },
    {
      question: 'Do you guarantee improvement?',
      answer: 'No responsible educator should guarantee grades. What we provide is targeted diagnosis, structured correction, exam-style practice, and clear parent updates.',
    },
  ];

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
            Every student starts from a different point. Some are strong in one chapter but weak in another. Some know the content but struggle when questions become exam-style. Others lose marks through careless mistakes, weak answering structure, or poor time management.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            That is why the crash course starts with diagnosis first. We identify the gaps that matter most, fix them in order, then move the student into timed practice.
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
            Most tuition programmes follow a fixed class structure, fixed worksheets, or a general revision schedule. That can be useful, but it may not solve the real reason a student is losing marks.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            At Integrated Learnings, we start with the student’s actual work. We look at recent papers, weak topics, careless-error patterns, answering structure, and exam habits. From there, we design the crash-course focus around the gaps that are costing the most marks.
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The aim is not to cover everything for the sake of covering. The aim is to identify what matters most now, fix the urgent gaps, and push the student into exam-style application.
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
                Normal tuition supports weekly learning. Our crash course targets urgent scoring gaps before the final lap.
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

        {(showCombined || isPsle) && (
          <SectionCard id="psle-packages">
            <SectionHeading
              kicker="PSLE"
              title={pageCopy.pslePackageTitle}
              subtitle={pageCopy.pslePackageSubtitle}
            />
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Not sure which package fits? Start with a free WhatsApp fit check. Send the latest result slip, school paper, or weak-topic list. We’ll recommend whether your child should start with a one-off targeted correction session, a short rescue package, or a longer final-lap programme.
            </p>
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <PackageCard
                title="PSLE First Targeted Correction Session"
                duration="1 session × 1.5h"
                bestFor="first paid lesson after the free WhatsApp fit check"
                format="student's home / tutor-hosted study space"
                price="From $120"
                includes={[
                  'Quick review of recent work or weak topics',
                  'Targeted correction on one urgent scoring gap',
                  'Parent update after session',
                  'Recommendation on whether a package is needed',
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
            <p className="mt-5 text-xs text-slate-500">Final recommendation depends on subject, lesson location format, urgency, and student needs after fit check.</p>
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
              Not sure which package fits? Start with a free WhatsApp fit check. Send the latest result slip, school paper, or weak-topic list. We’ll recommend whether the student should start with a one-off targeted correction session, a short rescue package, or a longer final-lap programme.
            </p>
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              <PackageCard
                title="O-Level First Targeted Correction Session"
                duration="1 session × 2h"
                bestFor="first paid lesson after the free WhatsApp fit check"
                format="student's home / tutor-hosted study space"
                price="From $160"
                includes={[
                  'Paper/result review',
                  'Targeted weak-chapter correction',
                  'Parent/student next-step summary',
                  'Recommendation on whether a package is needed',
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
            <p className="mt-5 text-xs text-slate-500">Final recommendation depends on subject, lesson location format, urgency, and student needs after fit check.</p>
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
                'We travel to the student\'s home within North Singapore first',
                'Student learns in a familiar environment',
                'Suitable for North Singapore families',
                'Friend-group classes are conducted at one host family\'s home',
                'Selected mini-group sessions may be held at a small tutor-hosted study space',
                'For future mock simulation events, venues will be selected near MRT/bus access where possible',
              ]}
            />
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              <p className="font-bold text-slate-900">Quality-control note</p>
              <p className="mt-2">Tutor-hosted sessions are kept small and are not positioned as a mass-group format.</p>
              <p className="font-bold text-slate-900">Meal note</p>
              <p className="mt-2">Meals are not provided for normal crash-course sessions conducted at the student\'s home or host family\'s home because sessions are kept focused and usually last 1.5–2 hours. For longer friend-group sessions, students may prepare their own snacks if needed.</p>
              <p className="mt-4 font-bold text-slate-900">Future event note</p>
              <p className="mt-2">For future mock exam simulation events, light refreshments may be arranged depending on duration and venue. Lunch will only be considered for longer event formats. No fixed public venue is currently promised.</p>
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
            title={pageCopy.howToStartTitle}
            subtitle={pageCopy.howToStartSubtitle}
          />
          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {[
              { step: '1', title: 'Send result slip or weak-topic list', body: 'Parent sends the latest school paper, result slip, or a simple list of weak topics.' },
              { step: '2', title: pageCopy.step2Title, body: pageCopy.step2Body },
              { step: '3', title: 'Choose the crash-course format', body: 'We recommend the suitable package and timing based on urgency, subject, and student needs.' },
              { step: '4', title: 'Start targeted correction', body: 'The course begins with diagnosis, then zeroes in on the most important scoring gaps.' },
              { step: '5', title: 'Receive parent updates', body: 'Parents receive clear updates after lessons, including what was covered, what was observed, and what to do next.' },
            ].map((item) => (
              <article key={item.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-600">Step {item.step}</p>
                <p className="mt-2 text-sm font-black text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
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
