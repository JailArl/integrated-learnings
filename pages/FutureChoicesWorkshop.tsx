import React, { useEffect, useId, useState } from 'react';
import { CheckCircle2, ChevronDown, Clock3, MessageCircle, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';
import { submitFutureChoicesEnquiry } from '../services/futureChoicesEnquiries';

const WA_NUMBER = '6598882675';
const PAGE_PATH = '/family/programmes/future-choices-workshop';

const workshopOptions = [
  'Part 1 only - Future Choices Simulation Workshop',
  'Part 2 only - Economics for Real Life',
  '2-Day Future Choices Bundle',
];

const studentLevels = ['Secondary 1', 'Secondary 2', 'Secondary 3'];

const faqItems = [
  {
    question: 'Is this suitable for all Sec 1–3 students?',
    answer: 'Yes. The workshop is designed for Sec 1 to Sec 3 students and is structured to be accessible, practical, and discussion-led without assuming prior subject knowledge.',
  },
  {
    question: 'Does my child need prior knowledge in economics or finance?',
    answer: 'No. The workshop is built for everyday thinking, not prior academic preparation. Students only need to be ready to take part in scenarios, discussion, and reflection.',
  },
  {
    question: 'Is this a classroom workshop or online?',
    answer: 'This is a classroom workshop. The format is intentionally hands-on so students can respond to scenarios, discuss choices, and learn from the group setting.',
  },
  {
    question: 'Can my child join only Part 1?',
    answer: 'Yes. Part 1 is the core workshop and can be booked on its own. Part 2 is optional for families who want to go deeper.',
  },
  {
    question: 'Is Part 2 compulsory?',
    answer: 'No. Part 2 is an add-on workshop for families who want a deeper follow-up on economics thinking for real life.',
  },
  {
    question: 'What happens after I enquire?',
    answer: 'We will reply with the workshop details, pricing, and the next steps. If needed, we can also help you decide which option fits best.',
  },
  {
    question: 'Can friends sign up together?',
    answer: 'Yes. If two students register for the same workshop or bundle, the friend rate applies to both students.',
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
    description: 'The core June holiday workshop for students who want a meaningful, hands-on simulation experience.',
    badge: null,
    cta: 'Reserve a Seat',
  },
  {
    title: 'Part 2 only',
    name: 'Economics for Real Life',
    duration: '1-Day Workshop',
    earlyBird: 'S$108',
    standard: 'S$138',
    friendRate: 'S$118 each',
    description: 'An optional follow-up for students who want to go deeper into prices, incentives, markets, and everyday decisions.',
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
    description: 'Includes Part 1 and Part 2 for families who want the full June holiday experience.',
    badge: 'Most Popular',
    cta: 'Ask About the 2-Day Bundle',
  },
];

const inputClass = 'w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100';

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

const FaqAccordion: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <div className="space-y-3">
      {faqItems.map((item, index) => {
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
            <div id={panelId} role="region" aria-labelledby={buttonId} hidden={!isOpen} className="border-t border-slate-200 px-5 py-4 sm:px-6">
              <p className="text-sm leading-7 text-slate-600">{item.answer}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

const Field: React.FC<{ label: string; htmlFor: string; children: React.ReactNode }> = ({ label, htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block">
    <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
    {children}
  </label>
);

const FutureChoicesWorkshop: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parentName, setParentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [studentLevel, setStudentLevel] = useState('Secondary 1');
  const [workshopOption, setWorkshopOption] = useState(workshopOptions[0]);
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    const cleanup = setPageSeo(
      'Sec 1–3 Future Choices Simulation Workshop | Integrated Learnings',
      'A hands-on June holiday workshop for Sec 1–3 students to explore money, choices, consequences, and real-life decision-making through realistic simulations and guided discussion.',
      PAGE_PATH,
    );

    return cleanup;
  }, []);

  const heroWhatsAppText = 'Hi, I would like the workshop details for the Future Choices Simulation Workshop. Please share the available options and pricing.';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const cleanedPhone = contactNumber.replace(/\s/g, '');
    if (!parentName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!cleanedPhone || !/^[89]\d{7}$/.test(cleanedPhone)) {
      setError('Please enter a valid Singapore mobile number.');
      return;
    }
    if (!studentLevel) {
      setError('Please select the student level.');
      return;
    }
    if (!workshopOption) {
      setError('Please select a workshop option.');
      return;
    }

    setLoading(true);
    const result = await submitFutureChoicesEnquiry({
      parent_name: parentName.trim(),
      contact_number: cleanedPhone,
      student_level: studentLevel,
      workshop_option: workshopOption,
      additional_notes: additionalNotes.trim(),
      source_path: PAGE_PATH,
    });
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'We could not submit your enquiry. Please try WhatsApp instead.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.14),_transparent_24%),linear-gradient(180deg,#f8fbff_0%,#f5f7fb_26%,#eef3f9_100%)] text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-slate-950/6 to-transparent" aria-hidden="true" />
        <section className="relative pb-14 pt-8 sm:pt-10 lg:pb-20">
          <div className={`${sectionClass} relative`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="inline-flex items-center rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700 shadow-sm">
                  June Holiday Programme for Sec 1–3
                </p>
                <p className="mt-3 text-sm font-semibold text-slate-600">Integrated Learnings</p>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <PrimaryButton href={toWhatsApp(heroWhatsAppText)} variant="ghost">Get Workshop Details on WhatsApp</PrimaryButton>
                <PrimaryButton href="#reserve-seat">Reserve a Seat</PrimaryButton>
              </div>
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center">
              <div>
                <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Future Choices Simulation Workshop
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  A hands-on June holiday workshop that helps teens think about money, choices, consequences, and adulthood through realistic simulations and guided discussion.
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                  Designed for students who are growing up fast, but rarely get a real chance to think through how life decisions actually work.
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {['Practical', 'Interactive', 'Real-world', 'Small-group format'].map((item) => (
                    <span key={item} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <PrimaryButton href="#reserve-seat" className="sm:min-w-[170px]">Reserve a Seat</PrimaryButton>
                  <PrimaryButton href={toWhatsApp(heroWhatsAppText)} variant="ghost" className="sm:min-w-[250px]">Get Workshop Details on WhatsApp</PrimaryButton>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-sky-700" /> Led by an educator together with a guest facilitator with real banking-industry experience.</span>
                  <span className="inline-flex items-center gap-2"><Clock3 size={16} className="text-sky-700" /> Limited seats. Small-group format for better discussion and engagement.</span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 rounded-[2rem] bg-sky-500/10 blur-2xl" aria-hidden="true" />
                <Card className="relative overflow-hidden border-slate-200 bg-slate-950 text-white">
                  <div className="bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.35),_transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.94))] p-6 sm:p-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-200">
                      <Sparkles size={13} /> June Holiday Experience
                    </div>
                    <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">A better way to use the June holidays</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      More than a generic holiday class. Students step through realistic situations, compare trade-offs, and discuss how everyday decisions shape outcomes.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      {[
                        ['Sec 1–3', 'Target audience'],
                        ['1 or 2 days', 'Flexible format'],
                        ['Hands-on', 'Simulation-led'],
                        ['Future-ready', 'Practical thinking'],
                      ].map(([value, label]) => (
                        <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xl font-black text-white">{value}</p>
                          <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm leading-7 text-sky-50">
                      Premium-but-approachable, structured for parents who want something meaningful, engaging, and useful for the holidays.
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="py-6 sm:py-10">
        <div className={sectionClass}>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ['More meaningful than just another holiday activity', 'A structured experience with real-world scenarios and discussion.'],
              ['Helps teens think about money and life choices earlier', 'Students see how decisions about spending, work, and priorities connect.'],
              ['Encourages reflection, discussion, and practical decision-making', 'The workshop is designed to get students thinking, not just listening.'],
              ['Gives students real-world exposure beyond school routines', 'A useful break from passive screen time or filler holiday activities.'],
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
            kicker="Who it is for"
            title="Who this workshop is for"
            subtitle="Built for parents who want the June holidays to be useful, not wasted, and for students who are ready for more than a passive class."
          />

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="p-6 sm:p-7">
              <ul className="space-y-4">
                {[
                  'Sec 1 to Sec 3 students',
                  'Students who are curious, thoughtful, or need stronger real-world exposure',
                  'Students who enjoy activities, scenarios, and discussion more than passive lectures',
                  'Parents who want the June holidays to be useful, not wasted',
                  'Students who are old enough to start thinking about money, choices, and future consequences',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Practical', 'Students see how choices affect outcomes in everyday life.'],
                ['Engaging', 'They are drawn into scenarios, not asked to sit through a lecture.'],
                ['Real-world', 'The workshop connects directly to money, work, and responsibility.'],
                ['Future-ready', 'Parents get a learning experience that feels relevant beyond school.'],
              ].map(([title, text]) => (
                <Card key={title} className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-700">{title}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            kicker="What students will experience"
            title="What happens in the workshop"
            subtitle="Interactive, thoughtful, and built to feel like a real-world simulation rather than a finance lecture."
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {[
              ['01', 'Realistic life and money scenarios', 'Students respond to situations that mirror choices they will face as they grow up.'],
              ['02', 'Decision-making under different situations', 'They compare options when money, time, and responsibility pull in different directions.'],
              ['03', 'Group discussion and guided reflection', 'Facilitators help students articulate how and why they chose a path.'],
              ['04', 'Consequences and trade-offs from different choices', 'The workshop makes outcomes visible instead of abstract.'],
              ['05', 'Practical insights into adulthood and responsibility', 'Students leave with a clearer sense of what real-life decisions can involve.'],
            ].map(([index, title, text]) => (
              <Card key={index} className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-700">Step {index}</p>
                <h3 className="mt-3 text-base font-bold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            kicker="Programme format"
            title="Choose the format that fits best"
            subtitle="The workshop is packaged clearly so parents can choose the core experience, the follow-up, or the full two-day bundle."
          />

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
                  href={plan.cta === 'Reserve a Seat' ? '#reserve-seat' : toWhatsApp(`Hi, I would like details for ${plan.name}. Please share the workshop schedule, pricing, and registration steps.`)}
                  variant={plan.cta === 'Reserve a Seat' ? 'solid' : 'ghost'}
                  className="mt-6 w-full"
                >
                  {plan.cta}
                </PrimaryButton>
              </Card>
            ))}
          </div>

          <Card className="mt-5 bg-slate-950 px-5 py-4 text-white sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-200">Bring a Friend, Save Together</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">Join with 1 friend for the same workshop and both enjoy a special pair rate.</p>
              </div>
              <p className="text-xs leading-6 text-slate-300">All prices are for the full workshop or bundle, not hourly rates. Friend pricing applies only when both students register for the same workshop or bundle. Promotions are not stackable. Seat confirmed upon payment. Limited seats available.</p>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 sm:p-7">
              <SectionHeading
                kicker="Part 1 details"
                title="Part 1: Future Choices Simulation Workshop"
                subtitle="A highly interactive classroom workshop where students step into realistic scenarios involving money, trade-offs, pressure, work, and long-term choices."
              />
              <ul className="mt-6 space-y-3">
                {[
                  'understand that choices have consequences',
                  'think more clearly about spending, saving, and priorities',
                  'reflect on real-life pressures and decisions',
                  'build more awareness of what adulthood can actually look like',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 sm:p-7">
              <SectionHeading
                kicker="Part 2 details"
                title="Optional Part 2: Economics for Real Life"
                subtitle="A follow-up workshop for students who want to explore how economics shows up in everyday life - from prices and incentives to choices, markets, and behaviour."
              />
              <ul className="mt-6 space-y-3">
                {[
                  'understand simple economic thinking in real life',
                  'see how incentives shape decisions',
                  'explore why prices move and why trade-offs matter',
                  'build stronger future-readiness and economic awareness',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            kicker="Who will be leading the workshop"
            title="Who will be leading the workshop"
            subtitle="Led by an educator together with a guest facilitator who brings real-world banking-industry experience into the discussion, helping students connect classroom thinking with real-life financial and decision-making contexts."
          />

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card className="p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <Users size={20} />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-950">Integrated Learnings educator</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">The workshop is guided by an educator who keeps the session structured, clear, and age-appropriate for Sec 1 to Sec 3 students.</p>
            </Card>
            <Card className="p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <MessageCircle size={20} />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-950">Guest facilitator with banking experience</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">A guest facilitator with real banking-industry experience contributes practical perspective without turning the workshop into a corporate talk or exam class.</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading
            kicker="Why this stands out"
            title="Why this workshop stands out"
            subtitle="Parents usually want something more useful than another lecture, and more engaging than another screen-based activity. This is built to sit in the middle: practical, structured, and discussion-led."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              'Not just theory',
              'Not just another lecture',
              'Not just another screen-based activity',
              'Interactive, discussion-led, and practical',
              'Helps teens connect choices with outcomes',
              'Designed to be meaningful, not just time-filling',
              'Premium-but-approachable feel for parents',
              'Future-readiness without sounding like tuition',
            ].map((item) => (
              <Card key={item} className="p-5">
                <p className="text-sm font-semibold text-slate-800">{item}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className={sectionClass}>
          <SectionHeading kicker="FAQ" title="FAQ" />
          <div className="mt-6">
            <FaqAccordion />
          </div>
        </div>
      </section>

      <section id="reserve-seat" className="py-8 sm:py-12">
        <div className={sectionClass}>
          <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <SectionHeading
                kicker="Reserve a Seat"
                title="Reserve a Seat"
                subtitle="We’ll reply with the workshop details, pricing, and next steps. No hard selling."
              />
              <Card className="mt-6 p-6">
                <p className="text-sm leading-7 text-slate-600">This enquiry form is for parents who want a clear response without having to WhatsApp first. If you prefer, you can still message us directly using the WhatsApp button.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <PrimaryButton href={toWhatsApp(heroWhatsAppText)} variant="ghost">Get Workshop Details on WhatsApp</PrimaryButton>
                </div>
              </Card>
            </div>

            <Card className="p-6 sm:p-7">
              {submitted ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Enquiry received</p>
                  <h3 className="mt-3 text-2xl font-black text-slate-950">Thanks - we’ve received your details.</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">We’ll reply with the workshop details, pricing, and the next steps shortly. If you want faster follow-up, you can also WhatsApp us now.</p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <PrimaryButton href={toWhatsApp(heroWhatsAppText)}>Get Workshop Details on WhatsApp</PrimaryButton>
                    <PrimaryButton href="#pricing" variant="ghost">Review Pricing</PrimaryButton>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Parent name" htmlFor="parent-name">
                      <input id="parent-name" value={parentName} onChange={(e) => setParentName(e.target.value)} autoComplete="name" className={inputClass} placeholder="Your name" />
                    </Field>
                    <Field label="Mobile / WhatsApp number" htmlFor="contact-number">
                      <input id="contact-number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} autoComplete="tel" inputMode="tel" className={inputClass} placeholder="9123 4567" />
                    </Field>
                    <Field label="Student level" htmlFor="student-level">
                      <select id="student-level" value={studentLevel} onChange={(e) => setStudentLevel(e.target.value)} className={inputClass}>
                        {studentLevels.map((level) => <option key={level} value={level}>{level}</option>)}
                      </select>
                    </Field>
                    <Field label="Workshop option interested in" htmlFor="workshop-option">
                      <select id="workshop-option" value={workshopOption} onChange={(e) => setWorkshopOption(e.target.value)} className={inputClass}>
                        {workshopOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </Field>
                  </div>
                  <Field label="Any question or note" htmlFor="notes">
                    <textarea id="notes" value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} rows={5} className={inputClass} placeholder="Let us know anything you'd like us to note." />
                  </Field>

                  {error && <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

                  <PrimaryButton type="submit" variant="dark" className="w-full">
                    {loading ? 'Submitting...' : 'Reserve My Seat'}
                  </PrimaryButton>
                  <p className="text-xs leading-6 text-slate-500">We’ll reply with the workshop details, pricing, and next steps. No hard selling.</p>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="pb-10 pt-6 sm:pb-16 sm:pt-10">
        <div className={sectionClass}>
          <Card className="overflow-hidden bg-slate-950 text-white">
            <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-200">Final CTA</p>
                <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">Give your teen a more meaningful June holiday.</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">A practical, engaging workshop for Sec 1–3 students to explore money, choices, and the real world more thoughtfully.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <PrimaryButton href="#reserve-seat" variant="ghost">Reserve a Seat</PrimaryButton>
                <PrimaryButton href={toWhatsApp(heroWhatsAppText)}>Get Workshop Details on WhatsApp</PrimaryButton>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="h-24 sm:hidden" aria-hidden="true" />

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3">
          <PrimaryButton href="#reserve-seat" className="w-full">Reserve a Seat</PrimaryButton>
          <PrimaryButton href={toWhatsApp(heroWhatsAppText)} variant="ghost" className="w-full">WhatsApp</PrimaryButton>
        </div>
      </div>
    </div>
  );
};

export default FutureChoicesWorkshop;