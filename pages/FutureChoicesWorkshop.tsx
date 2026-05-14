import React, { useEffect, useId, useState } from 'react';
import { CheckCircle2, ChevronDown, Clock3, MessageCircle, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';

const WA_NUMBER = '6598882675';
const PAGE_PATH = '/family/programmes/future-choices-workshop';

const faqWhyMatters = [
  {
    question: 'Why should my child attend this workshop?',
    answer: 'Many students are told to study hard, but they may not see why it matters. This workshop lets them experience how study, work, money, and life choices affect future options — in a safe simulation.',
  },
  {
    question: 'My child has no money now. Why learn about investing?',
    answer: 'Because students still have time, effort, attention, and habits. For a student, using time well is one of the first investments they can make.',
  },
  {
    question: 'Are you saying studies are everything?',
    answer: 'No. Study matters, but life is not only grades. The Happiness Index teaches balance, rest, relationships, and sustainable choices.',
  },
  {
    question: 'What does life has no reset button mean?',
    answer: 'Choices move forward in real life. Students learn to think before choosing, and also learn how to adapt when things do not go well.',
  },
  {
    question: 'Will this pressure my child?',
    answer: 'No. The tone is realistic but encouraging. The goal is reflection, not fear.',
  },
  {
    question: 'What should my child take away?',
    answer: 'A clearer sense of why effort matters, how choices affect options, and how to balance ambition with happiness.',
  },
];

const faqLogistics = [
  {
    question: 'Can I choose any June date?',
    answer: 'No. The workshop runs on fixed cohort dates so the session stays interactive, structured, and properly facilitated. Parents can choose from the available Zoom or physical workshop runs.',
  },
  {
    question: 'What are the Zoom dates?',
    answer: 'The planned Zoom cohorts are 10 June, 17 June, and 24 June 2026.',
  },
  {
    question: 'What are the physical class dates?',
    answer: 'The planned physical classroom runs are 20 June and 27 June 2026. The venue will be in the central area and confirmed before payment.',
  },
  {
    question: 'Do I need to pay before the physical venue is confirmed?',
    answer: 'No. For physical workshops, final venue, timing, and pricing will be confirmed before payment.',
  },
  {
    question: 'Can parents form a private group?',
    answer: 'Yes. Parents can form a private friend group, available by Zoom or physical classroom, subject to schedule and venue.',
  },
  {
    question: 'Can my child join only Part 1?',
    answer: 'Yes. Part 1 can be booked on its own. Part 2 is optional, and the 2-Day Bundle is available for families who want both.',
  },
];

const pricingPlans = [
  {
    title: 'Part 1 only',
    name: 'Future Choices Simulation Workshop',
    duration: '1-Day Workshop',
    earlyBird: 'S$128',
    standard: 'S$158',
    friendRate: 'S$138 each',
    description: 'Core life-simulation workshop for students to understand how choices shape future options.',
    badge: null,
    cta: 'Reserve Seat for Selected Date',
  },
  {
    title: 'Part 2 only',
    name: 'Economics for Real Life',
    duration: '1-Day Workshop',
    earlyBird: 'S$108',
    standard: 'S$138',
    friendRate: 'S$118 each',
    description: 'Optional follow-up for students who want deeper practical economics thinking for real life.',
    badge: null,
    cta: 'Get Workshop Details on WhatsApp',
  },
  {
    title: '2-Day Bundle',
    name: 'Future Choices + Economics Bundle',
    duration: '2-Day Workshop',
    earlyBird: 'S$218',
    standard: 'S$268',
    friendRate: 'S$228 each',
    description: 'Includes Part 1 and Part 2 for families who want a fuller June learning experience.',
    badge: 'Most Popular',
    cta: 'Ask About the 2-Day Bundle',
  },
];

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

const toWhatsApp = (text: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

const trackCtaClick = (ctaName: string, destination: string) => {
  try {
    const w = window as any;
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'future_choices_cta_click', {
        event_category: 'future_choices_workshop',
        event_label: `future_choices_workshop:${ctaName}`,
        page_path: window.location.pathname,
        destination,
      });
      return;
    }
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({
        event: 'future_choices_cta_click',
        event_category: 'future_choices_workshop',
        event_label: `future_choices_workshop:${ctaName}`,
        page_path: window.location.pathname,
        destination,
      });
    }
  } catch {
    // Tracking should never block conversions.
  }
};

const sectionClass = 'mx-auto max-w-6xl px-4 sm:px-6 lg:px-8';

const desktopLeadClass = 'text-base leading-8 text-slate-600 sm:text-lg lg:text-xl lg:leading-9';

const PrimaryButton: React.FC<{
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'solid' | 'ghost' | 'dark';
  className?: string;
  type?: 'button' | 'submit';
}> = ({ children, href, onClick, variant = 'solid', className = '', type = 'button' }) => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  const styles = {
    solid: 'bg-sky-600 text-white shadow-lg shadow-sky-600/20 hover:bg-sky-700 focus-visible:ring-sky-600',
    ghost: 'border border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-300',
    dark: 'bg-slate-950 text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800 focus-visible:ring-slate-950',
  };

  if (href) {
    const isExternalLink = href.startsWith('http');
    return (
      <a
        href={href}
        target={isExternalLink ? '_blank' : undefined}
        rel={isExternalLink ? 'noreferrer' : undefined}
        onClick={() => trackCtaClick(String(children), href)}
        className={`${base} ${styles[variant]} ${className}`.trim()}
      >
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]} ${className}`.trim()}>
      {children}
    </button>
  );
};

const SectionHeading: React.FC<{ kicker?: string; title: string; subtitle?: string }> = ({ kicker, title, subtitle }) => (
  <div className="max-w-3xl">
    {kicker && <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-sky-700">{kicker}</p>}
    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">{title}</h2>
    {subtitle && <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p>}
  </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <article className={`rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] ${className}`.trim()}>
    {children}
  </article>
);

const FaqAccordion: React.FC<{ items: { question: string; answer: string }[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = open === index;
        const buttonId = `${uid}-faq-btn-${index}`;
        const panelId = `${uid}-faq-panel-${index}`;

        return (
          <Card key={item.question} className="overflow-hidden">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen((prev) => (prev === index ? null : index))}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
              >
                <span className="text-sm font-bold text-slate-950 sm:text-base">{item.question}</span>
                <ChevronDown size={18} className={`shrink-0 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </h3>

      <section id="reserve-seat" className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            title="Reserve a June Workshop Date"
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
            <Card className="p-6 sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Quick Message Template</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">Tap the button to message us on WhatsApp. Edit the pre-filled message with your child's details.</p>
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="border-t border-slate-200 px-5 py-4 sm:px-6">
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                Hi, I would like details for the Future Choices Simulation Workshop.\nChild level: Secondary __\nPreferred mode: Zoom / Physical / Private group\nPreferred date: 10 Jun Zoom / 17 Jun Zoom / 24 Jun Zoom / 20 Jun Physical / 27 Jun Physical\nInterested in: Part 1 / Part 2 / 2-Day Bundle\nQuestions: __
              </div>
              <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
              <PrimaryButton
                href={toWhatsApp(quickTemplateText)}
                variant="dark"
                className="mt-6 w-full"
              >
                Message Us to Reserve a Date
              </PrimaryButton>
            </Card>
          </div>
        </div>
      </section>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const FutureChoicesWorkshop: React.FC = () => {
  useEffect(() => {
    const cleanup = setPageSeo(
      'Future Choices Life Simulation Workshop Sec 1–5 | Integrated Learnings',
      'June holiday life-simulation and financial literacy workshop for secondary school students (Sec 1–5), covering study choices, money habits, happiness, and future pathways.',
      PAGE_PATH,
    );

    return cleanup;
  }, []);

  const zoomScheduleText = 'Hi, I would like to view June intake dates for the Future Choices Simulation Workshop. Child level: Secondary __.';
  const physicalInterestText = 'Hi, I would like to join the physical waitlist for the Future Choices Simulation Workshop. Child level: Secondary __.';
  const quickTemplateText = [
    'Hi, I would like details for the Future Choices Simulation Workshop.',
    'Child level: Secondary __',
    'Preferred mode: Zoom / Physical / Private group',
    'Preferred date: 10 Jun Zoom / 17 Jun Zoom / 20 Jun Physical / 24 Jun Zoom / 27 Jun Physical',
    'Interested in: Part 1 / Part 2 / 2-Day Bundle',
    'Questions: __',
  ].join('\n');

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.14),_transparent_24%),linear-gradient(180deg,#f8fbff_0%,#f5f7fb_26%,#eef3f9_100%)] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/6 to-transparent" aria-hidden="true" />
        <section className="relative pb-14 pt-8 sm:pt-10 lg:pb-20">
          <div className={`${sectionClass} relative`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                  For Secondary School Students: Sec 1-5
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-600">Integrated Learnings</p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                 <PrimaryButton href={toWhatsApp(zoomScheduleText)} variant="ghost">Ask About Physical Run</PrimaryButton>
                 <PrimaryButton href={toWhatsApp(physicalInterestText)}>Choose a June Workshop Date</PrimaryButton>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
              <div>
                <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-7xl lg:leading-[1.02]">
                  Help Your Child Understand Why Choices Matter
                </h1>
                <p className={`mt-5 max-w-2xl ${desktopLeadClass}`}>
                  A June holiday life-simulation workshop for secondary students to experience how study, money, work, happiness, and education pathways affect future options.
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base lg:text-lg lg:leading-8">
                  Students may not have money to invest yet — but they do have time, effort, habits, and choices. This workshop helps them see why studying now can open more doors later.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {['Life-choice simulator', 'Financial literacy', 'Sec 1-5 suitable', 'June intake'].map((item) => (
                    <span key={item} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href={toWhatsApp(zoomScheduleText)} className="sm:min-w-[220px]">Choose a June Workshop Date</PrimaryButton>
                  <PrimaryButton href={toWhatsApp(physicalInterestText)} variant="ghost" className="sm:min-w-[280px]">Ask About Physical Run</PrimaryButton>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-sky-700" /> Warm, guided facilitation focused on reflection and growth.</span>
                  <span className="inline-flex items-center gap-2"><Clock3 size={16} className="text-sky-700" /> Fixed June intakes. Limited seats. Clear schedule. Better learning flow.</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-sky-500/10 blur-2xl" aria-hidden="true" />
                <Card className="relative overflow-hidden border-slate-200 bg-slate-950 text-white">
                  <div className="bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.35),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] p-6 sm:p-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">
                      <Sparkles size={13} /> June Holiday Experience
                    </div>
                    <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">A safe place to learn through choices</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      Students make decisions, see outcomes, and discuss what they would do differently next time.
                    </p>

                    <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm leading-7 text-sky-50">
                      Not fear. Not nagging. Just guided reflection, maturity, and perspective.
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            kicker="June 2026 Workshop Runs"
            title="June 2026 Workshop Runs"
            subtitle="Choose one fixed cohort date. Seats are limited so the session stays interactive and discussion-led."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[
              ['10 Jun — Zoom Cohort 1', 'Live online workshop'],
              ['17 Jun — Zoom Cohort 2', 'Live online workshop'],
              ['24 Jun — Zoom Cohort 3', 'Live online workshop'],
              ['20 Jun, Sat — Physical Run A', 'Central venue TBC'],
              ['27 Jun, Sat — Physical Run B', 'Central venue TBC'],
            ].map(([title, desc]) => (
              <Card key={title} className="p-4">
                <h3 className="text-sm font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-xs text-slate-600">{desc}</p>
              </Card>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">Physical venue will be confirmed before payment.</p>
        </div>
      </section>

      <section className="py-6 sm:py-10">
        <div className={sectionClass}>
          <SectionHeading
            title="Why we created this workshop"
            subtitle="Many students are told to 'study hard', but they may not truly understand why. This workshop lets them experience future choices safely — so the lesson feels real, not like another lecture."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Time is their first investment', 'Before students have money, they have time. They learn how effort and habits create future options.'],
              ['Life has no reset button', 'Choices move forward. Students learn to think before choosing, and recover when things do not go well.'],
              ['Balance matters too', 'The Happiness Index shows that a good future is not only about grades or income.'],
            ].map(([title, text]) => (
              <Card key={title} className="h-full p-5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                  <Target size={18} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            title="Useful for every secondary stage"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Sec 1–2: Build awareness early', 'Understand how habits and effort affect future options.'],
              ['Sec 3: Choose before pressure builds', 'See how priorities matter as workload and subject demands increase.'],
              ['Sec 4–5: Connect studies to next steps', 'Link current effort to N-Level, O-Level, ITE, Poly, JC, and work-study routes.'],
              ['Parents: Start a better conversation', 'Help your child understand life choices without more nagging.'],
            ].map(([title, text]) => (
              <Card key={title} className="p-5">
                <h3 className="text-base font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            title="What your child will play through"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              ['Education pathways', 'ITE, Poly, JC, university, work-study and alternative routes.'],
              ['Study vs work choices', 'Short-term temptation versus long-term payoff.'],
              ['Money systems', 'CPF, tax, housing, loans, inflation, savings and investing.'],
              ['Career progression', 'How skills, qualifications and habits affect income.'],
              ['Happiness Index', 'Balancing money, rest, relationships, health and goals.'],
              ['Risk and resilience', 'Mistakes, setbacks, scams, recovery and moving forward.'],
            ].map(([title, text]) => (
              <Card key={title} className="p-5">
                <h3 className="text-base font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            title="Choose how your child joins"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['Zoom cohort', 'Fixed online dates with live facilitation and discussion.'],
              ['Physical classroom', '20 or 27 June. Central venue TBC before payment.'],
              ['Private friend group', 'By request, subject to schedule, group size, and pricing.'],
            ].map(([title, text]) => (
              <Card key={title} className="p-5">
                <h3 className="text-base font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </Card>
            ))}
          </div>

        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            kicker="June intake"
            title="June 2026 Workshop Runs"
            subtitle="Choose from the fixed cohort dates below."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {[
              ['Zoom Cohort 1', '10 June 2026', 'Live online workshop with guided choices, discussion, and reflection.'],
              ['Zoom Cohort 2', '17 June 2026', 'Mid-June online cohort for families who want a structured holiday activity.'],
              ['Zoom Cohort 3', '24 June 2026', 'Final online cohort before the end of the June holidays.'],
              ['Physical Run A', '20 June 2026, Saturday', 'Central area classroom venue, to be confirmed.'],
              ['Physical Run B', '27 June 2026, Saturday', 'Central area classroom venue, to be confirmed.'],
            ].map(([mode, when, location]) => (
              <Card key={mode} className="p-5">
                <h3 className="text-base font-black text-slate-950">{mode}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-700">{when}</p>
                <p className="mt-1 text-sm text-slate-600">{location}</p>
              </Card>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-600">To keep the workshop interactive and discussion-led, each run has limited seats. Parents should select one of the fixed cohort dates instead of requesting random June dates.</p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            kicker="Programme format"
            title="Choose the format that fits best"
            subtitle="The workshop is packaged clearly so parents can choose the core experience, the follow-up, or the full two-day bundle."
            />

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">From $108. Choose Part 1, Part 2, or the full 2-day bundle.</p>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card key={plan.title} className={`relative p-6 sm:p-7 ${plan.badge ? 'ring-2 ring-amber-300' : ''}`}>
                {plan.badge && <span className="absolute right-5 top-5 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-950">{plan.badge}</span>}
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{plan.title}</p>
                <h3 className="mt-2 pr-24 text-xl font-black text-slate-950">{plan.name}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">{plan.duration}</p>
                <p className="mt-4 text-sm leading-7 text-slate-600">{plan.description}</p>

                <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-500">Early Bird</span>
                    <span className="font-black text-slate-950">{plan.earlyBird}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-500">Standard</span>
                    <span className="font-black text-slate-950">{plan.standard}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-slate-500">Friend Rate</span>
                    <span className="font-black text-slate-950">{plan.friendRate}</span>
                  </div>
                </div>

                <PrimaryButton
                  href={plan.cta === 'Reserve Seat for Selected Date' ? '#reserve-seat' : toWhatsApp(`Hi, I would like details for ${plan.name}. Please share the workshop schedule, pricing, and registration steps.`)}
                  variant={plan.cta === 'Reserve Seat for Selected Date' ? 'solid' : 'ghost'}
                  className="mt-6 w-full"
                >
                  {plan.cta}
                </PrimaryButton>
              </Card>
            ))}
          </div>

          <p className="mt-5 text-sm text-slate-600">Online Zoom pricing applies to live online workshops.</p>
          <p className="mt-2 text-sm text-slate-600">Physical classroom pricing may differ depending on venue cost. Final price, venue, and timing will be confirmed before payment.</p>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading kicker="FAQ" title="FAQ" subtitle="Parents usually ask about both learning value and logistics." />
          <div className="mt-6 space-y-8">
            <div>
              <h3 className="text-lg font-black text-slate-950">A. Why this matters</h3>
              <div className="mt-3">
                <FaqAccordion items={faqWhyMatters} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-950">B. Logistics</h3>
              <div className="mt-3">
                <FaqAccordion items={faqLogistics} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="reserve-seat" className="py-8 sm:py-12">
        <div className={sectionClass}>
          <div className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
            <div>
              <SectionHeading
                kicker="Reserve Seat for Selected Date"
                title="WhatsApp Us Directly"
                subtitle="No form needed. Message us directly and we’ll reply with workshop schedule, pricing, and registration steps."
              />
              <Card className="mt-6 p-6">
                <p className="text-sm leading-7 text-slate-600">This page now uses direct WhatsApp enquiries only, so you can get a faster response and ask follow-up questions immediately.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <PrimaryButton href={toWhatsApp(quickTemplateText)}>Message on WhatsApp</PrimaryButton>
                  <PrimaryButton href="#pricing" variant="ghost">Review Pricing First</PrimaryButton>
                </div>
                <p className="mt-4 text-xs leading-6 text-slate-500">Tip: Include your child’s level and preferred workshop option in your first message for quicker support.</p>
              </Card>
            </div>

            <Card className="p-6 sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Quick Message Template</p>
              <h3 className="mt-3 text-2xl font-black text-slate-950">Copy-and-send in one tap</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">Tap the button below to open WhatsApp with a pre-filled message. Edit anything before sending.</p>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                Hi, I would like details for the Future Choices Simulation Workshop.\nChild level: Secondary __\nPreferred mode: Zoom / Physical / Private group\nPreferred date: 10 Jun Zoom / 17 Jun Zoom / 20 Jun Physical / 24 Jun Zoom / 27 Jun Physical\nInterested in: Part 1 / Part 2 / 2-Day Bundle\nQuestions: __
              </div>

              <PrimaryButton
                href={toWhatsApp(quickTemplateText)}
                variant="dark"
                className="mt-6 w-full"
              >
                Open WhatsApp Now
              </PrimaryButton>
              <p className="mt-3 text-xs leading-6 text-slate-500">We usually reply as quickly as possible during operating hours.</p>
            </Card>
          </div>
        </div>
      </section>

        <section id="reserve-seat" className="py-8 sm:py-12">
          <div className={sectionClass}>
            <SectionHeading
              title="Reserve a June Workshop Date"
            />
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
              <Card className="p-6 sm:p-7">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">Quick Message Template</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">Tap the button to message us on WhatsApp. Edit the pre-filled message with your child's details.</p>

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                  Hi, I would like details for the Future Choices Simulation Workshop.\nChild level: Secondary __\nPreferred mode: Zoom / Physical / Private group\nPreferred date: 10 Jun Zoom / 17 Jun Zoom / 24 Jun Zoom / 20 Jun Physical / 27 Jun Physical\nInterested in: Part 1 / Part 2 / 2-Day Bundle\nQuestions: __
                </div>

                <PrimaryButton
                  href={toWhatsApp(quickTemplateText)}
                  variant="dark"
                  className="mt-6 w-full"
                >
                  Message Us to Reserve a Date
                </PrimaryButton>
              </Card>
            </div>
          </div>
        </section>

        <div className="h-24 sm:hidden" aria-hidden="true" />

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3">
           <PrimaryButton href={toWhatsApp(zoomScheduleText)} className="w-full">Choose a Date</PrimaryButton>
           <PrimaryButton href={toWhatsApp(physicalInterestText)} variant="ghost" className="w-full">Ask Physical</PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default FutureChoicesWorkshop;