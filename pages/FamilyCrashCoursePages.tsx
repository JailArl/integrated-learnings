import React, { useEffect, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { submitParentInquiry } from '../services/parentSubmissions';

type CrashCourseSlug = 'psle-june-intensive' | 'o-level-june-intensive';

interface ScheduleEntry {
  date: string;
  title: string;
  time: string;
  bullets: string[];
  keySession?: boolean;
}

interface PricingCard {
  title: string;
  subtitle: string;
  standard: string;
  earlyBird: string;
  friendRate?: string;
  popular?: boolean;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface LeadFormContent {
  heading: string;
  levelLabel: string;
  interestLabel: string;
  interestOptions: string[];
  ctaLabel: string;
}

const WA_NUMBER = '6598882675';

const toWhatsApp = (text: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

const setPageSeo = (title: string, description: string) => {
  const prevTitle = document.title;
  document.title = title;

  let metaDescription = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  const previousDescription = metaDescription?.getAttribute('content') ?? '';

  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', description);

  return () => {
    document.title = prevTitle;
    metaDescription?.setAttribute('content', previousDescription);
  };
};

const SectionHeading: React.FC<{ kicker?: string; title: string; subtitle?: string }> = ({ kicker, title, subtitle }) => (
  <div>
    {kicker && <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-blue-600">{kicker}</p>}
    <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
    {subtitle && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{subtitle}</p>}
  </div>
);

const CampaignHero: React.FC<{
  badge: string;
  title: string;
  subtitle: string;
  supporting: string;
  trustLine: string;
  seatLine: string;
  reserveLabel: string;
  waLabel: string;
  fitCheckLabel: string;
  reserveLink: string;
  waLink: string;
  fitCheckLink: string;
}> = ({
  badge,
  title,
  subtitle,
  supporting,
  trustLine,
  seatLine,
  reserveLabel,
  waLabel,
  fitCheckLabel,
  reserveLink,
  waLink,
  fitCheckLink,
}) => (
  <header className="relative overflow-hidden bg-[linear-gradient(140deg,#0b1220_0%,#1e293b_45%,#1e3a8a_100%)] px-4 pb-14 pt-14 text-white sm:px-6 sm:pb-20 sm:pt-20">
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl" />
      <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-sky-300/15 blur-3xl" />
    </div>

    <div className="relative mx-auto max-w-6xl">
      <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">
        <Sparkles size={12} aria-hidden="true" /> {badge}
      </p>

      <h1 className="mt-5 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-slate-200">{subtitle}</p>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">{supporting}</p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={reserveLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-black text-slate-950 shadow-lg transition hover:bg-amber-300"
        >
          {reserveLabel} <ArrowRight size={15} aria-hidden="true" />
        </a>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/15"
        >
          <MessageCircle size={15} aria-hidden="true" /> {waLabel}
        </a>
        <a
          href={fitCheckLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/40 bg-amber-300/10 px-6 py-3.5 text-sm font-bold text-amber-100 transition hover:bg-amber-300/20"
        >
          <ShieldCheck size={15} aria-hidden="true" /> {fitCheckLabel}
        </a>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <p className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-xs font-semibold text-emerald-100">
          {trustLine}
        </p>
        <p className="rounded-2xl border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-xs font-semibold text-amber-100">
          {seatLine}
        </p>
      </div>
    </div>
  </header>
);

const ActionBand: React.FC<{
  reserveLink: string;
  waLink: string;
  fitCheckLink: string;
  waLabel: string;
}> = ({ reserveLink, waLink, fitCheckLink, waLabel }) => (
  <section aria-label="Quick actions" className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        Limited seats available · Seat confirmed upon payment
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={reserveLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-amber-400"
        >
          Reserve a Seat
        </a>
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100"
        >
          <MessageCircle size={14} aria-hidden="true" /> {waLabel}
        </a>
        <a
          href={fitCheckLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Send Latest Results Slip for Fit Check
        </a>
      </div>
    </div>
  </section>
);

const WhoForSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <SectionHeading title={title} />
    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <Users size={14} className="mt-0.5 shrink-0 text-blue-600" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  </section>
);

const ProgrammeFormat: React.FC<{ heading: string; copy: string; packages: string[] }> = ({ heading, copy, packages }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <SectionHeading title={heading} subtitle={copy} />
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      {packages.map((pkg) => (
        <article key={pkg} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm font-black text-slate-900">{pkg}</p>
        </article>
      ))}
    </div>
  </section>
);

const ScheduleSection: React.FC<{ entries: ScheduleEntry[] }> = ({ entries }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <SectionHeading
      kicker="Programme Schedule"
      title="Structured session flow for June"
      subtitle="Each session includes guided explanation, active practice, and correction feedback."
    />

    <ol className="mt-6 space-y-4" aria-label="Crash course schedule">
      {entries.map((entry, index) => (
        <li key={`${entry.date}-${entry.title}`} className="relative">
          <article
            className={`rounded-2xl border p-5 ${entry.keySession ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-200' : 'border-slate-200 bg-slate-50'}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wider ${entry.keySession ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>
                  {entry.date}
                </p>
                <h3 className="mt-2 text-lg font-black text-slate-900">{entry.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  <Clock3 size={12} aria-hidden="true" /> {entry.time}
                </span>
                {entry.keySession && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-900">
                    <Sparkles size={10} aria-hidden="true" /> Key session
                  </span>
                )}
              </div>
            </div>

            <ul className="mt-4 grid gap-y-2 sm:grid-cols-2">
              {entry.bullets.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-slate-700">
                  <Target size={13} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>

            <span className="pointer-events-none absolute -left-3 top-5 hidden h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white sm:flex">
              {index + 1}
            </span>
          </article>
        </li>
      ))}
    </ol>
  </section>
);

const BenefitsSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <SectionHeading title={title} />
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-sm leading-relaxed text-slate-700">{item}</p>
        </article>
      ))}
    </div>
  </section>
);

const PricingSection: React.FC<{
  heading: string;
  cards: PricingCard[];
  reserveLink: string;
  waLink: string;
  friendStripText: string;
  friendSmallPrint: string;
}> = ({ heading, cards, reserveLink, waLink, friendStripText, friendSmallPrint }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <SectionHeading
      kicker="Pricing"
      title={heading}
      subtitle="All prices are for the full block or bundle, not hourly rates."
    />

    <div className="mt-5 grid gap-4 lg:grid-cols-2">
      {cards.map((card) => (
        <article
          key={card.title}
          className={`relative rounded-2xl border p-5 ${card.popular ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-200' : 'border-slate-200 bg-slate-50'}`}
        >
          {card.popular && (
            <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-900">
              Most Popular
            </span>
          )}
          <h3 className="pr-24 text-base font-black text-slate-900">{card.title}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{card.subtitle}</p>

          <dl className="mt-4 space-y-1.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Standard</dt>
              <dd className="font-bold text-slate-800">{card.standard}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-slate-500">Early Bird</dt>
              <dd className="font-black text-emerald-700">{card.earlyBird}</dd>
            </div>
            {card.friendRate && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-slate-500">Friend Rate</dt>
                <dd className="font-black text-blue-700">{card.friendRate}</dd>
              </div>
            )}
          </dl>
        </article>
      ))}
    </div>

    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
      <p className="text-sm font-black text-emerald-800">Bring a Friend, Save Together</p>
      <p className="mt-1 text-sm text-emerald-700">{friendStripText}</p>
    </div>

    <div className="mt-4 space-y-1 text-xs text-slate-500">
      <p>Seat confirmed upon payment. Limited seats available.</p>
      <p>Small-group format, capped at 8 students for closer feedback and correction.</p>
      <p>Some clinic sessions may be capped smaller for closer correction.</p>
      <p>{friendSmallPrint}</p>
      <p>Promotions are not stackable. Students may choose the best available offer.</p>
    </div>

    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <a href={reserveLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-sm font-black text-slate-950 hover:bg-amber-400">
        Reserve a Seat
      </a>
      <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-6 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100">
        <MessageCircle size={14} aria-hidden="true" /> Get Timetable on WhatsApp
      </a>
    </div>
  </section>
);

const WhySection: React.FC<{ heading: string; points: string[] }> = ({ heading, points }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <SectionHeading title={heading} />
    <ul className="mt-5 space-y-3">
      {points.map((point) => (
        <li key={point} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700">
          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
          {point}
        </li>
      ))}
    </ul>
  </section>
);

const PromiseBlock: React.FC<{ heading: string; body: string }> = ({ heading, body }) => (
  <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-slate-50 p-6 shadow-sm sm:p-8">
    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-600">Promise</p>
    <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">{heading}</h2>
    <p className="mt-3 text-sm leading-relaxed text-slate-600">{body}</p>
  </section>
);

const FaqAccordion: React.FC<{ items: FaqItem[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(0);
  const uid = useId();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
    </section>
  );
};

const CampaignLeadForm: React.FC<{
  slug: CrashCourseSlug;
  content: LeadFormContent;
  defaultLevel: string;
  defaultSchedule: string;
  pageTitle: string;
}> = ({ slug, content, defaultLevel, defaultSchedule, pageTitle }) => {
  const uid = useId();
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [level, setLevel] = useState(defaultLevel);
  const [interest, setInterest] = useState('');
  const [concern, setConcern] = useState('');
  const [resultsNote, setResultsNote] = useState('');
  const [resultsFile, setResultsFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setNotice(null);

    if (!parentName.trim() || !phone.trim() || !level.trim() || !interest.trim() || !concern.trim()) {
      setNotice({ type: 'error', text: 'Please complete all required fields.' });
      return;
    }

    setSubmitting(true);
    const result = await submitParentInquiry({
      parent_name: parentName.trim(),
      student_name: `${slug}-lead`,
      contact_number: phone.replace(/\s+/g, ''),
      email: `${phone.replace(/\D/g, '') || 'lead'}@integratedlearns.local`,
      student_level: level.trim(),
      subjects: [interest.trim()],
      preferred_mode: 'group',
      postal_code: '',
      address: `Crash Course Landing - ${pageTitle}`,
      unit_number: '',
      learning_needs: concern.trim(),
      tutor_type: 'no-preference',
      preferred_schedule: defaultSchedule,
      additional_notes: [
        resultsNote.trim() || 'No results note.',
        resultsFile ? `Results file: ${resultsFile.name}` : 'No file attached.',
      ].join(' | '),
    });

    setSubmitting(false);
    if (!result.success) {
      setNotice({ type: 'error', text: result.error || 'Submission failed. Please WhatsApp us directly.' });
      return;
    }

    setNotice({ type: 'success', text: 'Submitted successfully. We will contact you on WhatsApp shortly.' });
    setParentName('');
    setPhone('');
    setInterest('');
    setConcern('');
    setResultsNote('');
    setResultsFile(null);
  };

  const labelClass = 'mb-1.5 block text-xs font-black uppercase tracking-[0.12em] text-slate-500';
  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200';

  return (
    <section id="reserve-form" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <SectionHeading title={content.heading} />
      <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor={`${uid}-name`} className={labelClass}>Parent name *</label>
          <input id={`${uid}-name`} required value={parentName} onChange={(e) => setParentName(e.target.value)} className={inputClass} autoComplete="name" />
        </div>

        <div>
          <label htmlFor={`${uid}-phone`} className={labelClass}>Mobile / WhatsApp number *</label>
          <input id={`${uid}-phone`} required value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} autoComplete="tel" />
        </div>

        <div>
          <label htmlFor={`${uid}-level`} className={labelClass}>{content.levelLabel} *</label>
          <input id={`${uid}-level`} required value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label htmlFor={`${uid}-interest`} className={labelClass}>{content.interestLabel} *</label>
          <select id={`${uid}-interest`} required value={interest} onChange={(e) => setInterest(e.target.value)} className={inputClass}>
            <option value="">Select an option</option>
            {content.interestOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-concern`} className={labelClass}>Latest grade / main concern *</label>
          <textarea
            id={`${uid}-concern`}
            required
            rows={3}
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            placeholder="Share latest score and main weakness areas"
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="sm:col-span-2 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div>
            <label htmlFor={`${uid}-results-note`} className={labelClass}>Optional results slip note</label>
            <textarea
              id={`${uid}-results-note`}
              rows={2}
              value={resultsNote}
              onChange={(e) => setResultsNote(e.target.value)}
              placeholder="Add context if sending latest result snapshot"
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label htmlFor={`${uid}-results-file`} className={labelClass}>Optional results slip upload</label>
            <input
              id={`${uid}-results-file`}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={(e) => setResultsFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center rounded-xl bg-blue-800 px-6 py-3.5 text-sm font-black text-white shadow transition hover:bg-blue-900 disabled:opacity-60 sm:w-auto">
            {submitting ? 'Submitting...' : content.ctaLabel}
          </button>
        </div>
      </form>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xs leading-relaxed text-slate-600">
        <p>We’ll reply with the timetable, package options, and fit-check steps.</p>
        <p>No hard selling.</p>
        <p>Parents can send latest results for a quick recommendation.</p>
      </div>

      {notice && (
        <p className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold ${notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {notice.text}
        </p>
      )}
    </section>
  );
};

const FinalCta: React.FC<{ headline: string; reserveLink: string; waLink: string; waLabel: string }> = ({ headline, reserveLink, waLink, waLabel }) => (
  <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-6 shadow-sm sm:p-8">
    <h2 className="text-2xl font-black tracking-tight text-slate-900">{headline}</h2>
    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
      <a href={reserveLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-black text-slate-950 hover:bg-amber-400">
        Reserve a Seat
      </a>
      <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-400 bg-white px-6 py-3.5 text-sm font-bold text-amber-700 hover:bg-amber-50">
        <MessageCircle size={14} aria-hidden="true" /> {waLabel}
      </a>
    </div>
  </section>
);

const StickyMobileCta: React.FC<{ waLink: string; reserveLink: string }> = ({ waLink, reserveLink }) => (
  <div className="fixed inset-x-0 bottom-0 z-50 flex gap-2 border-t border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur-sm md:hidden">
    <a href={waLink} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white">
      <MessageCircle size={14} aria-hidden="true" /> WhatsApp
    </a>
    <a href={reserveLink} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-3 text-xs font-black text-slate-950">
      Reserve a Seat <ArrowRight size={14} aria-hidden="true" />
    </a>
  </div>
);

const PageScaffold: React.FC<{
  hero: React.ReactNode;
  topCta: React.ReactNode;
  body: React.ReactNode;
  stickyBar: React.ReactNode;
}> = ({ hero, topCta, body, stickyBar }) => (
  <>
    <a href="#reserve-form" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:shadow-lg">
      Skip to reserve form
    </a>
    <div className="bg-[#f7f7f6] pb-24 md:pb-0">
      {hero}
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-10 sm:px-6">
        {topCta}
        {body}
        <nav className="flex flex-col gap-3 sm:flex-row">
          <Link to="/tuition" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Back to Family Tuition
          </Link>
        </nav>
      </main>
    </div>
    {stickyBar}
  </>
);

const PSLELeadForm: React.FC = () => (
  <CampaignLeadForm
    slug="psle-june-intensive"
    pageTitle="PSLE Math & Science June Intensive"
    defaultLevel="Primary 6"
    defaultSchedule="10:00am - 1:00pm"
    content={{
      heading: 'Reserve a PSLE Seat',
      levelLabel: 'Child level',
      interestLabel: 'Subject interest',
      interestOptions: [
        'Math Bootcamp',
        'Science Bootcamp',
        'Mixed Mock + Correction Clinic',
        'Full PSLE Intensive Bundle',
        'Not sure - please advise',
      ],
      ctaLabel: 'Reserve My Seat',
    }}
  />
);

const OLevelLeadForm: React.FC = () => (
  <CampaignLeadForm
    slug="o-level-june-intensive"
    pageTitle="O-Level June Intensive Subject Bootcamps"
    defaultLevel="Secondary 4"
    defaultSchedule="2:00pm - 5:00pm"
    content={{
      heading: 'Reserve an O-Level Seat',
      levelLabel: 'Student level',
      interestLabel: 'Subject block(s) interested in',
      interestOptions: [
        'Physics Bootcamp',
        'Chemistry Bootcamp',
        'A Math Bootcamp',
        'E Math Bootcamp',
        'Weak-Topic Clinic',
        'Mock + Correction Clinic',
        '2-Subject Bundle',
        'Final Review Bundle',
        'Not sure - please advise',
      ],
      ctaLabel: 'Reserve My Seat',
    }}
  />
);

export const FamilyPSLEJuneIntensivePage: React.FC = () => {
  useEffect(() => setPageSeo(
    'PSLE Math & Science June Intensive | Integrated Learnings',
    'Small-group PSLE Math & Science June Intensive with targeted practice, correction, and weak-topic support. Founding June Intake pricing now available.',
  ), []);

  const reserveLink = useMemo(() => toWhatsApp('Hi Integrated Learnings, I want to reserve a seat for PSLE June Intensive.'), []);
  const waLink = useMemo(() => toWhatsApp('Hi Integrated Learnings, please send me the PSLE June Intensive timetable.'), []);
  const fitCheckLink = useMemo(() => toWhatsApp('Hi Integrated Learnings, I want to send latest results slip for PSLE fit check.'), []);

  const schedule: ScheduleEntry[] = [
    {
      date: '16 Jun',
      title: 'Math Bootcamp - Part 1',
      time: '10:00am - 1:00pm',
      bullets: [
        'Diagnostic drill to identify gaps',
        'Worked examples with teacher explanation',
        'Core concept review',
        'Guided practice',
      ],
    },
    {
      date: '17 Jun',
      title: 'Math Bootcamp - Part 2',
      time: '10:00am - 1:00pm',
      bullets: [
        'Problem sums with varied question types',
        'Timed structured practice',
        'Method correction and strategy review',
      ],
    },
    {
      date: '18 Jun',
      title: 'Science Bootcamp - Part 1',
      time: '10:00am - 1:00pm',
      bullets: [
        'Key concept consolidation',
        'Answering structure walkthrough',
        'MCQ and open-ended practice',
      ],
    },
    {
      date: '19 Jun',
      title: 'Science Bootcamp - Part 2',
      time: '10:00am - 1:00pm',
      bullets: [
        'Application questions',
        'Open-ended correction clinic',
        'Common mistake review',
      ],
    },
    {
      date: '20 Jun',
      title: 'Mixed Mock + Correction Clinic',
      time: '10:00am - 1:00pm',
      keySession: true,
      bullets: [
        'Timed mixed practice set',
        'Teacher-led correction and review',
        'Personal weak-topic action plan',
      ],
    },
  ];

  const pricingCards: PricingCard[] = [
    {
      title: 'Math Bootcamp',
      subtitle: '2 sessions | 6 hours total',
      standard: 'S$218',
      earlyBird: 'S$188',
      friendRate: 'S$198 each',
    },
    {
      title: 'Science Bootcamp',
      subtitle: '2 sessions | 6 hours total',
      standard: 'S$218',
      earlyBird: 'S$188',
      friendRate: 'S$198 each',
    },
    {
      title: 'Mixed Mock + Correction Clinic',
      subtitle: '1 session | 3 hours total',
      standard: 'S$108',
      earlyBird: 'S$88',
    },
    {
      title: 'Full PSLE Intensive Bundle',
      subtitle: '5 sessions | 15 hours total',
      standard: 'S$488',
      earlyBird: 'S$428',
      friendRate: 'S$408 each',
      popular: true,
    },
  ];

  return (
    <PageScaffold
      hero={(
        <CampaignHero
          badge="Founding June Intake"
          title="PSLE Math & Science June Intensive"
          subtitle="Focused small-group revision for students who need clearer understanding, stronger answering technique, and more structured practice this holiday."
          supporting="Designed for students who need more than random worksheets - with targeted practice, correction, and weak-topic support."
          trustLine="Led by an educator with 10+ years of teaching experience in Math and Science support."
          seatLine="Small-group format, capped at 8 students for closer feedback and correction."
          reserveLabel="Reserve a Seat"
          waLabel="Get Timetable on WhatsApp"
          fitCheckLabel="Send Latest Results Slip for Fit Check"
          reserveLink={reserveLink}
          waLink={waLink}
          fitCheckLink={fitCheckLink}
        />
      )}
      topCta={<ActionBand reserveLink={reserveLink} waLink={waLink} fitCheckLink={fitCheckLink} waLabel="Get Timetable on WhatsApp" />}
      stickyBar={<StickyMobileCta waLink={waLink} reserveLink={reserveLink} />}
      body={(
        <>
          <WhoForSection
            title="Who this is for"
            items={[
              'Students who are weak in PSLE Math or Science',
              'Students who revise but still repeat the same mistakes',
              'Students who need clearer explanation and more structured guidance',
              'Parents who want the June holidays used properly',
            ]}
          />

          <ProgrammeFormat
            heading="A compact 5-day revision format"
            copy="This June programme is designed as a focused 5-day intensive. Students may join a single subject bootcamp or the full PSLE bundle."
            packages={['Math Bootcamp', 'Science Bootcamp', 'Full PSLE Intensive Bundle']}
          />

          <ScheduleSection entries={schedule} />

          <BenefitsSection
            title="What students will walk away with"
            items={[
              'clearer understanding of key Math and Science topics',
              'guided correction of repeated mistakes',
              'stronger answering structure for exam-style questions',
              'focused holiday momentum instead of random revision',
              'a clearer next-step plan after the programme',
            ]}
          />

          <PricingSection
            heading="Founding June Intake Pricing"
            cards={pricingCards}
            reserveLink={reserveLink}
            waLink={waLink}
            friendStripText="Sign up with 1 friend for the same PSLE block or bundle and both enjoy a special pair rate."
            friendSmallPrint="Friend pricing applies only when both students register for the same block or full bundle."
          />

          <ActionBand reserveLink={reserveLink} waLink={waLink} fitCheckLink={fitCheckLink} waLabel="Get Timetable on WhatsApp" />

          <WhySection
            heading="Why Integrated Learnings"
            points={[
              '10+ years of teaching experience in Math and Science support',
              'strong focus on identifying where students are actually getting stuck',
              'clearer explanation for students who struggle to follow difficult topics',
              'structured practice and correction, not random drilling',
              'lessons designed to keep students engaged and switched on',
              'optional study-tracking follow-through after the programme',
            ]}
          />

          <PromiseBlock
            heading="Right-Fit Promise"
            body="If after the first session the programme is clearly not the right fit, we will recommend the next best option and handle any unused portion according to our policy."
          />

          <FaqAccordion
            items={[
              {
                question: 'Is this suitable for weak students?',
                answer: 'Yes. The lessons are structured for students who need clearer guidance, more focused correction, and stronger fundamentals.',
              },
              {
                question: 'Can my child join only Math or only Science?',
                answer: 'Yes. Students can join only one subject bootcamp or choose the full bundle based on needs.',
              },
              {
                question: 'Are materials provided?',
                answer: 'Yes. Guided worksheets and structured practice materials are included.',
              },
              {
                question: 'Is this a small-group class?',
                answer: 'Yes. Small-group format is capped at 8 students for closer feedback and correction.',
              },
              {
                question: 'What happens after I enquire?',
                answer: 'We reply on WhatsApp with timetable details, package options, and fit-check steps before enrolment.',
              },
              {
                question: 'Can I send my child’s latest results slip first?',
                answer: 'Yes. You may send the latest results slip for a quick recommendation before deciding on a block or bundle.',
              },
            ]}
          />

          <PSLELeadForm />

          <FinalCta
            headline="Use the June holidays properly. Don’t wait for the next poor result."
            reserveLink={reserveLink}
            waLink={waLink}
            waLabel="WhatsApp for Details"
          />
        </>
      )}
    />
  );
};

export const FamilyOLevelJuneIntensivePage: React.FC = () => {
  useEffect(() => setPageSeo(
    'O-Level June Intensive Subject Bootcamps | Integrated Learnings',
    'Small-group O-Level holiday revision for Physics, Chemistry, A Math and E Math with weak-topic clinic and mock correction support. Founding June Intake pricing available.',
  ), []);

  const reserveLink = useMemo(() => toWhatsApp('Hi Integrated Learnings, I want to reserve a seat for O-Level June Intensive.'), []);
  const waLink = useMemo(() => toWhatsApp('Hi Integrated Learnings, please check subject fit for O-Level June Intensive.'), []);
  const fitCheckLink = useMemo(() => toWhatsApp('Hi Integrated Learnings, I want to send latest results slip for O-Level fit check.'), []);

  const schedule: ScheduleEntry[] = [
    {
      date: '16-17 Jun',
      title: 'Physics Bootcamp',
      time: '2:00pm - 5:00pm',
      bullets: [
        'Structured questions and technique',
        'MCQ review',
        'Calculation practice',
        'Error correction walkthrough',
      ],
    },
    {
      date: '18-19 Jun',
      title: 'Chemistry Bootcamp',
      time: '2:00pm - 5:00pm',
      bullets: [
        'Concept consolidation',
        'Structured questions',
        'Application questions',
        'Mistake correction',
      ],
    },
    {
      date: '20-21 Jun',
      title: 'A Math Bootcamp',
      time: '2:00pm - 5:00pm',
      bullets: [
        'Method flow and algebra',
        'Trigonometry review',
        'Differentiation and integration drills',
        'Exam-style practice',
      ],
    },
    {
      date: '22-23 Jun',
      title: 'E Math Bootcamp',
      time: '2:00pm - 5:00pm',
      bullets: [
        'Timed practice sets',
        'Graphs, statistics, and geometry',
        'Accuracy and method correction',
      ],
    },
    {
      date: '24 Jun',
      title: 'Weak-Topic Clinic',
      time: '2:00pm - 5:00pm',
      keySession: true,
      bullets: [
        'Students regrouped by topic weakness',
        'Guided walkthrough with teacher',
        'Targeted worksheet pack per group',
      ],
    },
    {
      date: '25 Jun',
      title: 'Mock + Correction Clinic',
      time: '2:00pm - 5:00pm',
      keySession: true,
      bullets: [
        'Timed paper segment',
        'Live teacher review',
        'Personal weak-topic action plan',
      ],
    },
  ];

  const pricingCards: PricingCard[] = [
    {
      title: 'Single Subject Bootcamp',
      subtitle: '2 sessions | 6 hours total',
      standard: 'S$248',
      earlyBird: 'S$218',
      friendRate: 'S$228 each',
    },
    {
      title: 'Weak-Topic Clinic',
      subtitle: '1 session | 3 hours total',
      standard: 'S$118',
      earlyBird: 'S$98',
    },
    {
      title: 'Mock + Correction Clinic',
      subtitle: '1 session | 3 hours total',
      standard: 'S$118',
      earlyBird: 'S$98',
    },
    {
      title: '2-Subject Bundle',
      subtitle: '4 sessions | 12 hours total',
      standard: 'S$458',
      earlyBird: 'S$398',
      friendRate: 'S$418 each',
    },
    {
      title: 'Final Review Bundle',
      subtitle: '6 sessions | 18 hours total',
      standard: 'S$638',
      earlyBird: 'S$568',
      popular: true,
    },
  ];

  return (
    <PageScaffold
      hero={(
        <CampaignHero
          badge="Founding June Intake"
          title="O-Level June Intensive Subject Bootcamps"
          subtitle="Focused holiday revision for Physics, Chemistry, A Math and E Math - with weak-topic clinic and mock correction support."
          supporting="Choose only the subject blocks your child needs, or bundle them for a stronger revision push."
          trustLine="Led by an educator with strong teaching support in Math, Physics and Chemistry."
          seatLine="Each core block is capped at 8 students. Clinic sessions may be capped smaller for closer correction."
          reserveLabel="Reserve a Seat"
          waLabel="Check Subject Fit on WhatsApp"
          fitCheckLabel="Send Latest Results Slip for Fit Check"
          reserveLink={reserveLink}
          waLink={waLink}
          fitCheckLink={fitCheckLink}
        />
      )}
      topCta={<ActionBand reserveLink={reserveLink} waLink={waLink} fitCheckLink={fitCheckLink} waLabel="Check Subject Fit on WhatsApp" />}
      stickyBar={<StickyMobileCta waLink={waLink} reserveLink={reserveLink} />}
      body={(
        <>
          <WhoForSection
            title="Who this is for"
            items={[
              'Students falling behind in Physics, Chemistry, A Math or E Math',
              'Students who know content but struggle to apply it in exam questions',
              'Students who need a structured holiday push',
              'Parents who want targeted revision, not last-minute panic',
            ]}
          />

          <ProgrammeFormat
            heading="Modular subject bootcamps for focused revision"
            copy="Students may join a single subject block, combine two subject blocks, or choose a stronger review bundle with clinic support."
            packages={['Single Subject Bootcamp', '2-Subject Bundle', 'Final Review Bundle']}
          />

          <ScheduleSection entries={schedule} />

          <BenefitsSection
            title="What students will walk away with"
            items={[
              'stronger clarity in weak topics',
              'structured correction of repeated mistakes',
              'more confidence with exam-style questions',
              'targeted practice instead of broad random drilling',
              'a clearer next-step action plan after the clinic and mock review',
            ]}
          />

          <PricingSection
            heading="Founding June Intake Pricing"
            cards={pricingCards}
            reserveLink={reserveLink}
            waLink={waLink}
            friendStripText="Sign up with 1 friend for the same O-Level block or bundle and both enjoy a special pair rate."
            friendSmallPrint="Friend pricing applies only when both students register for the same block or bundle."
          />

          <ActionBand reserveLink={reserveLink} waLink={waLink} fitCheckLink={fitCheckLink} waLabel="Check Subject Fit on WhatsApp" />

          <WhySection
            heading="Why Integrated Learnings"
            points={[
              'strong support in Math, Physics and Chemistry',
              'focus on diagnosing repeated mistakes clearly',
              'teaching style that helps students understand first, then apply',
              'structured practice and correction instead of rushed drilling',
              'lessons built to improve clarity, accuracy, and confidence',
              'optional study-tracking follow-through after the programme',
            ]}
          />

          <PromiseBlock
            heading="Clarity Promise"
            body="Students leave with clearer feedback, marked correction, and a next-step weak-topic action plan."
          />

          <FaqAccordion
            items={[
              {
                question: 'Can my child join only one subject?',
                answer: 'Yes. Subject blocks are modular, so you can choose only what is needed.',
              },
              {
                question: 'Is this suitable for weaker students?',
                answer: 'Yes. Sessions are structured to rebuild clarity and improve applied answering confidence.',
              },
              {
                question: 'Will there be practice and correction?',
                answer: 'Yes. Every block includes structured practice and guided correction.',
              },
              {
                question: 'Are the clinic sessions included?',
                answer: 'Clinic sessions can be taken standalone or as part of a bundle, depending on your chosen package.',
              },
              {
                question: 'What happens after I enquire?',
                answer: 'We reply via WhatsApp, run a fit check, and propose the most suitable block combination.',
              },
              {
                question: 'Can I send my child’s latest results slip first?',
                answer: 'Yes. You can send results first for a faster recommendation.',
              },
            ]}
          />

          <OLevelLeadForm />

          <FinalCta
            headline="Don’t let the June holidays pass without a proper revision push."
            reserveLink={reserveLink}
            waLink={waLink}
            waLabel="Get Full Timetable"
          />
        </>
      )}
    />
  );
};
