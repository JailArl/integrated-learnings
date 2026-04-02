import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle,
  ClipboardCheck,
  MessageCircle,
  Search,
  UserPlus,
} from 'lucide-react';
import ParentInquiryForm from '../components/ParentInquiryForm';

/* ── tiny mock data for dashboard preview ── */
const MOCK_SUBJECTS = [
  { subj: 'Mathematics', status: 'Completed', color: 'emerald' as const },
  { subj: 'English', status: 'In Progress', color: 'amber' as const },
  { subj: 'Science', status: 'Not Started', color: 'slate' as const },
];

const COLOR_MAP = { emerald: 'bg-emerald-400', amber: 'bg-amber-400', slate: 'bg-slate-500' } as const;
const TEXT_MAP = { emerald: 'text-emerald-400', amber: 'text-amber-400', slate: 'text-slate-500' } as const;

const FamilyHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_55%,#0b3b2e_100%)] px-4 pb-20 pt-20 text-white sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-50" aria-hidden="true">
          <div className="absolute left-[-10%] top-8 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute right-[-6%] top-16 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute bottom-[-10%] left-1/3 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            {/* Left — Copy + CTAs */}
            <div>
              <p className="mb-4 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                For Families
              </p>
              <h1 className="font-sans text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Your Child&rsquo;s Education,
                <span className="block text-amber-300">Sorted.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                Build daily study habits together. Find the right tutor. Get homework help when your child is stuck. Everything Singapore parents need — in one place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/studypulse"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400"
                >
                  Try StudyPulse Free
                  <ArrowRight size={16} className="ml-2" />
                </Link>
                <a
                  href="#parent-inquiry"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Find a Tutor
                </a>
              </div>
            </div>

            {/* Right — Dashboard Preview (CSS mockup, no images needed) */}
            <div className="hidden lg:block" aria-hidden="true">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
                <div className="rounded-xl bg-slate-900/80 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <span className="text-xs font-medium text-slate-400">StudyPulse Dashboard</span>
                    </div>
                    <span className="text-xs text-slate-500">Today</span>
                  </div>

                  <div className="space-y-2.5">
                    {MOCK_SUBJECTS.map((item) => (
                      <div key={item.subj} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${COLOR_MAP[item.color]}`} />
                          <span className="text-sm font-medium text-slate-200">{item.subj}</span>
                        </div>
                        <span className={`text-xs font-medium ${TEXT_MAP[item.color]}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>

                  {/* Exam countdown bar */}
                  <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-amber-300">PSLE &mdash; 127 days left</span>
                      <span className="text-xs text-amber-400/70">68% on track</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                      <div className="h-full w-[68%] rounded-full bg-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-slate-500">Your child&rsquo;s daily progress at a glance</p>
            </div>
          </div>

          {/* Trust Stats */}
          <div className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:grid-cols-4">
            {[
              { val: 'P1 – JC2', label: 'All Levels' },
              { val: '15+', label: 'Subjects Covered' },
              { val: 'Daily', label: 'Study Reports' },
              { val: '< 3 days', label: 'Avg. Tutor Match' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white sm:text-3xl">{s.val}</p>
                <p className="mt-1 text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES GRID (4 cards) ═══════════ */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">What We Offer</p>
          <h2 className="mt-3 text-center text-3xl font-black text-slate-900 sm:text-4xl">Four Ways We Help Your Family</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {/* Card 1 — StudyPulse */}
            <article className="group rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm transition hover:shadow-md lg:p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <BarChart3 size={24} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Most Popular</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Study Monitoring</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your child checks in daily via WhatsApp. You see their consistency on a dashboard. Streaks build, habits form, and you stay in the loop — without nagging.
              </p>
              <ul className="mt-4 space-y-2">
                {['Daily WhatsApp check-ins', 'Streaks & consistency tracking', 'Weekly progress reports'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle size={15} className="mt-0.5 shrink-0 text-amber-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/studypulse"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
              >
                Start Free
                <ArrowRight size={16} className="ml-2" />
              </Link>
            </article>

            {/* Card 2 — Find a Tutor */}
            <article className="group rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm transition hover:shadow-md lg:p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Search size={24} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-600">Tutor Matching</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Find a Tutor</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Tell us your child&apos;s level, subjects, and learning style. We&apos;ll match you with a vetted tutor — not just whoever is available.
              </p>
              <ul className="mt-4 space-y-2">
                {['Matched by subject & teaching style', 'Transparent indicative rates', 'Switch anytime, no lock-in'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle size={15} className="mt-0.5 shrink-0 text-sky-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#parent-inquiry"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-700"
              >
                Request a Tutor
              </a>
            </article>

            {/* Card 3 — Coursework Help (NEW) */}
            <article className="group rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-sm transition hover:shadow-md lg:p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <MessageCircle size={24} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-violet-600">Homework Help</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Coursework Help</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Stuck on a Math problem sum? Can&apos;t help with Chinese composition? Just WhatsApp us — our tutors will guide your child through it.
              </p>
              <ul className="mt-4 space-y-2">
                {['WhatsApp us anytime', 'Guided by qualified tutors', 'Math, Science, Chinese & more'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle size={15} className="mt-0.5 shrink-0 text-violet-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/6588888888"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                WhatsApp Us
              </a>
            </article>

            {/* Card 4 — Become a Tutor */}
            <article className="group rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm transition hover:shadow-md lg:p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <UserPlus size={24} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">For Tutors</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Become a Tutor</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Join our network of vetted tutors in Singapore. Set your own rates, choose your students, and grow your teaching practice on your own terms.
              </p>
              <ul className="mt-4 space-y-2">
                {['Set your own rates', 'Choose your students', 'No commission on first 3 months'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/tutor-signup"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Apply Now
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* ═══════════ WHY FAMILIES CHOOSE US ═══════════ */}
      <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Why Families Choose Us</p>
          <h2 className="mt-3 text-center text-3xl font-black text-slate-900">Built for Singapore Parents</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: BarChart3,
                color: 'amber',
                title: 'Study monitoring that works',
                desc: 'No app for your child to install. They check in via WhatsApp. You see everything on your dashboard.',
              },
              {
                icon: Search,
                color: 'sky',
                title: 'Vetted tutor matching',
                desc: 'Tell us the subject, level, and location. We match you with a tutor based on fit — not just availability.',
              },
              {
                icon: MessageCircle,
                color: 'violet',
                title: 'Coursework help on WhatsApp',
                desc: 'Stuck on a problem sum? Just WhatsApp us. A qualified tutor will guide your child through it.',
              },
            ].map((t) => (
              <div key={t.title} className="rounded-2xl border border-slate-100 bg-stone-50 p-6">
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-full ${t.color === 'amber' ? 'bg-amber-100 text-amber-700' : t.color === 'sky' ? 'bg-sky-100 text-sky-700' : 'bg-violet-100 text-violet-700'}`}>
                  <t.icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PARENT INQUIRY FORM ═══════════ */}
      <section id="parent-inquiry" className="border-t border-slate-200 bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">Get Started</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Find the Right Tutor or Get Homework Help</h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Tell us about your child&apos;s learning needs. Whether you need a regular tutor, on-demand coursework help, or both — we&apos;ll match you with the right support.
            </p>
          </div>
          <ParentInquiryForm />
        </div>
      </section>
    </div>
  );
};

export default FamilyHome;