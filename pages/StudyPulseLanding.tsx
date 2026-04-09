import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Crown,
  MessageSquare,
  Minus,
  Smartphone,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react';

/* ── Plan feature rows for comparison table ── */
const COMPARE_ROWS: { label: string; free: string | boolean; premium: string | boolean }[] = [
  { label: 'Children tracked', free: '1', premium: 'Unlimited' },
  { label: 'Subjects per child', free: '1', premium: 'All subjects' },
  { label: 'Check-in frequency', free: '3x/week (Tue, Thu, Sat)', premium: 'Daily' },
  { label: 'Weekly parent report', free: true, premium: true },
  { label: 'Daily parent summary', free: false, premium: true },
  { label: 'Exam countdown & alerts', free: true, premium: true },
  { label: 'Auto pause after exam', free: false, premium: true },
  { label: 'Auto restart for new term', free: false, premium: true },
  { label: 'Exam result follow-up reminders', free: false, premium: true },
  { label: 'Smart tutor/diagnostic triggers', free: false, premium: true },
  { label: 'Crash course & holiday prompts', free: false, premium: true },
  { label: 'Blurred daily insights preview', free: true, premium: false },
];

const StudyPulseLanding: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#faf8f4] text-slate-900">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-[linear-gradient(155deg,#0f172a_0%,#1e3a5f_50%,#0c4a3e_100%)] px-4 pb-16 pt-20 text-white sm:px-6 lg:px-8 lg:pb-24 lg:pt-28">
        <div className="absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true">
          <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute right-[-6%] top-24 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="absolute bottom-[-10%] left-1/3 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            <BarChart3 size={14} aria-hidden="true" />
            For PSLE &middot; O-Level &middot; A-Level Parents
          </div>
          <h1 className="mx-auto max-w-4xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Your child&rsquo;s major exam is coming.<br className="hidden sm:block" />
            <span className="text-amber-300">Are they actually studying?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            StudyPulse sends your child a daily WhatsApp check-in. You see their consistency on a dashboard. No app to install &mdash; just real visibility into their study habits before the big exam.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/studypulse/setup" className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-amber-300">
              Start Free &mdash; No Credit Card <ArrowRight size={16} className="ml-2" aria-hidden="true" />
            </Link>
            <a href="#pricing" className="inline-flex items-center justify-center rounded-xl bg-white/10 border border-white/20 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20">
              See Plans &amp; Pricing
            </a>
          </div>
          <p className="mt-5 text-sm text-slate-400">Already have an account? <Link to="/studypulse/login" className="font-semibold text-amber-300 hover:text-amber-200">Sign in</Link></p>

          {/* Trust stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[
              { val: 'PSLE · O · A', sub: 'Major Exam Support' },
              { val: '< 5 min', sub: 'Setup Time' },
              { val: 'WhatsApp', sub: 'No App to Install' },
            ].map((s) => (
              <div key={s.sub} className="text-center">
                <p className="text-xl font-black text-white sm:text-2xl">{s.val}</p>
                <p className="mt-1 text-[11px] text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PROBLEM ═══════════ */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">PSLE, O-Level, A-Level &mdash; the stakes are real.</h2>
            <p className="mt-3 text-slate-600">These are real challenges parents face in the months before a major exam.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {([
              { icon: Smartphone, color: 'red' as const, title: '\u201CThey say they studied\u201D', desc: "But you\u2019re not sure. PSLE and O-Level revision needs daily consistency \u2014 a check-in removes the guesswork." },
              { icon: AlertTriangle, color: 'amber' as const, title: '\u201CI only find out during results\u201D', desc: "By exam day, it\u2019s too late. StudyPulse shows patterns week by week, so you can act months before the paper." },
              { icon: Clock3, color: 'orange' as const, title: '\u201CRevision only happens last minute\u201D', desc: "National exams can\u2019t be crammed. When your child checks in daily, revision becomes a habit \u2014 not a panic." },
              { icon: Target, color: 'slate' as const, title: '\u201CI want to help but I\u2019m working\u201D', desc: "Work, household, other kids. StudyPulse keeps you in the loop with a 30-second daily glance \u2014 no hovering needed." },
            ]).map((item) => (
              <div key={item.title} className={`rounded-2xl border p-6 ${item.color === 'red' ? 'border-red-100 bg-gradient-to-br from-red-50 to-white' : item.color === 'amber' ? 'border-amber-100 bg-gradient-to-br from-amber-50 to-white' : item.color === 'orange' ? 'border-orange-100 bg-gradient-to-br from-orange-50 to-white' : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'}`}>
                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.color === 'red' ? 'bg-red-100 text-red-500' : item.color === 'amber' ? 'bg-amber-100 text-amber-600' : item.color === 'orange' ? 'bg-orange-100 text-orange-500' : 'bg-slate-100 text-slate-500'}`}>
                  <item.icon size={20} aria-hidden="true" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">How it works</h2>
            <p className="mt-3 text-slate-600">No app to install. Your child just uses WhatsApp.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: CalendarCheck, step: '1', title: 'Set subjects & schedule', desc: 'You choose what to track \u2014 Math, Science, Chinese \u2014 and how often. Takes under 5 minutes.' },
              { icon: CheckCircle2, step: '2', title: 'Child checks in via WhatsApp', desc: 'On check-in days, your child reports what they studied. No app needed \u2014 just a WhatsApp message.' },
              { icon: MessageSquare, step: '3', title: 'You get clear reports', desc: '\u201CMath: completed. Science: skipped. Chinese: partial.\u201D \u2014 Sent to your dashboard and WhatsApp.' },
              { icon: Zap, step: '4', title: 'Celebrate progress together', desc: 'See streaks build, habits form, and consistency grow. If your child needs extra help, request a tutor or diagnostic from the dashboard.' },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{item.step}</div>
                <item.icon size={20} className="mb-3 text-blue-700" aria-hidden="true" />
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHAT FREE USERS SEE (conversion nudge) ═══════════ */}
      <section className="border-t border-slate-200 bg-[#faf8f4] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">What you get on the Free plan</h2>
            <p className="mt-3 text-slate-600">Enough to build the habit and see if it works for your family.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* What you GET */}
            <div className="rounded-2xl border border-emerald-200 bg-white p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-emerald-600">You get</p>
              <ul className="space-y-3">
                {['Track 1 child, 1 subject', 'Check-ins 3x/week (Tue, Thu, Sat)', 'Sunday weekly report', 'Exam countdown visible', 'Request tutor / diagnostic anytime'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* What you DON'T get */}
            <div className="rounded-2xl border border-red-200 bg-white p-6">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-red-500">You don&rsquo;t get</p>
              <ul className="space-y-3">
                {['Monday, Wednesday, Friday, Sunday \u2014 no check-ins', 'No daily summary to parent', 'No auto pause / restart after exams', 'No exam follow-up reminders', 'No smart tutor triggers'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-500">
                    <X size={15} className="mt-0.5 shrink-0 text-red-400" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* The reality */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:col-span-2 lg:col-span-1">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-amber-700">The difference</p>
              <p className="text-sm leading-6 text-slate-700">
                Free check-ins happen 3 times a week. That&rsquo;s enough to start building the habit. But <strong>daily check-ins build stronger streaks</strong> and catch missed days before they become patterns.
              </p>
              <p className="mt-4 text-sm leading-6 text-slate-700">
                On Premium, your child checks in every day. You see full weekly summaries with insights &mdash; not just snapshots.
              </p>
              <a href="#pricing" className="mt-5 inline-flex items-center text-sm font-bold text-amber-700 hover:text-amber-800">
                See Premium plans <ArrowRight size={14} className="ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FIRST IN SINGAPORE ═══════════ */}
      <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700">
            <Sparkles size={14} /> First in Singapore
          </div>
          <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">Nothing like this exists yet.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            There are tuition agencies. There are assessment books. But no one has built a system that tells PSLE, O-Level, and A-Level parents
            <strong className="text-slate-900"> whether their child actually studied today</strong> &mdash;
            without the parent having to be physically there.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-3">
            {[
              { title: 'Not a tuition app', desc: 'We don\u2019t teach. We help you see what\u2019s really happening at home.' },
              { title: 'Not a homework app', desc: 'Your child\u2019s school sets the work. We track whether it gets done.' },
              { title: 'Not a screen-time tool', desc: 'We don\u2019t block phones. We build study accountability through check-ins.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-stone-50 p-5">
                <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 2-TIER PRICING ═══════════ */}
      <section id="pricing" className="border-t border-slate-200 bg-[#faf8f4] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-black text-slate-900 sm:text-4xl">Simple pricing. No hidden fees.</h2>
            <p className="mt-3 text-slate-600">Start free. Upgrade when you want daily visibility.</p>
          </div>

          {/* 2 Cards */}
          <div className="mx-auto grid max-w-4xl gap-6 lg:grid-cols-2">
            {/* FREE */}
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Free</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-black text-slate-900">$0</span>
                <span className="mb-1 text-sm text-slate-500">forever</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Try it with 1 child, 1 subject</p>
              <div className="mt-6 space-y-3">
                <Row label="1 child" included />
                <Row label="1 subject" included />
                <Row label="3 check-ins/week" included />
                <Row label="Weekly report" included />
                <Row label="Daily summary" />
                <Row label="Auto pause / restart" />
                <Row label="Smart triggers" />
              </div>
              <Link to="/studypulse/setup" className="mt-7 inline-flex w-full items-center justify-center rounded-xl border-2 border-slate-900 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50">
                Start Free
              </Link>
            </div>

            {/* PREMIUM */}
            <div className="relative rounded-3xl border-2 border-amber-400 bg-white p-7 shadow-xl">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-4 py-1 text-xs font-bold text-slate-950">RECOMMENDED</div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Premium</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-4xl font-black text-slate-900">$9.90</span>
                <span className="mb-1 text-sm text-slate-500">/month</span>
              </div>
              <p className="mt-2 text-sm text-amber-700 font-semibold">Less than 2 bubble teas</p>
              <div className="mt-6 space-y-3">
                <Row label="Unlimited children" included highlight />
                <Row label="All subjects" included highlight />
                <Row label="Daily check-ins" included highlight />
                <Row label="Daily parent summary" included highlight />
                <Row label="Auto pause / restart" included highlight />
                <Row label="Exam follow-up reminders" included highlight />
                <Row label="Smart tutor/diagnostic triggers" included highlight />
              </div>
              <Link to="/studypulse/setup?plan=premium" className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 shadow transition hover:bg-amber-400">
                <Crown size={16} className="mr-2" /> Get Premium
              </Link>
              <p className="mt-3 text-center text-xs text-slate-400">Pay via PayNow. No auto-renewal. Cancel anytime.</p>
            </div>
          </div>

          {/* Full comparison table (collapsed by default) */}
          <details className="mx-auto mt-8 max-w-5xl">
            <summary className="cursor-pointer text-center text-sm font-semibold text-blue-600 hover:text-blue-700">
              View full plan comparison
            </summary>
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-4 py-3 font-bold text-slate-500">Feature</th>
                    <th className="px-4 py-3 text-center font-bold text-slate-500">Free</th>
                    <th className="px-4 py-3 text-center font-bold text-amber-600">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((r) => (
                    <tr key={r.label} className="border-b border-slate-50">
                      <td className="px-4 py-2.5 text-slate-700">{r.label}</td>
                      <td className="px-4 py-2.5 text-center">{renderCell(r.free)}</td>
                      <td className="px-4 py-2.5 text-center">{renderCell(r.premium)}</td>
                    </tr>
                  ))}
                  <tr className="border-b border-slate-50 bg-slate-50 font-bold">
                    <td className="px-4 py-2.5 text-slate-900">Price</td>
                    <td className="px-4 py-2.5 text-center text-slate-900">$0</td>
                    <td className="px-4 py-2.5 text-center text-amber-700">$9.90/mo</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
      </section>

      {/* ═══════════ THE REAL QUESTION ═══════════ */}
      <section className="border-t border-slate-200 bg-slate-900 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-base font-black text-white sm:text-lg">
            Your child has PSLE, O-Levels, or A-Levels coming. <span className="text-amber-300">Are they revising consistently?</span>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            StudyPulse helps you find out &mdash; in under 30 seconds a day.
          </p>
          <Link to="/studypulse/setup" className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-300">
            Try It Free <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="border-t border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-black text-slate-900 sm:text-3xl">Common questions</h2>
          {[
            { q: 'Does my child need to install any app?', a: 'No. Your child interacts via WhatsApp only \u2014 no app download, no login. You manage everything from your parent dashboard.' },
            { q: 'What if my child lies about studying?', a: 'The system tracks patterns over time. If your child says \u201Cdone\u201D but results don\u2019t improve, the data will show it. Weekly reports make gaps visible fast.' },
            { q: 'Is this only for PSLE / O-Level / A-Level students?', a: 'We designed it for major exam years, but it works for any level. Study habits built in P4\u2013P5 carry into PSLE year. Same for Sec 1\u20133 leading to O-Levels.' },
            { q: 'Can I track multiple children on the free plan?', a: 'Free is limited to 1 child, 1 subject. Upgrade to Premium to track all your children and all their subjects \u2014 no limits.' },
            { q: 'What subjects can I track?', a: 'Any subject your child is studying \u2014 Math, Science, Chinese, English, Malay, Tamil, and more. Premium users can track all subjects.' },
            { q: 'How long does setup take?', a: 'Under 5 minutes. Enter your details, add your child\u2019s subjects, and you\u2019re done. Your child gets a WhatsApp prompt to start checking in.' },
            { q: 'Can I cancel or downgrade anytime?', a: 'Yes. No lock-in, no contract, no auto-renewal. You pay monthly via PayNow and simply stop when you want to.' },
            { q: 'My child already has tuition. Is this useful?', a: 'Especially useful. Tuition covers 1\u20132 hours a week per subject. But PSLE and O-Level results depend on what happens the other 5 days. StudyPulse tracks whether your child is actually revising consistently between sessions.' },
            { q: 'When should I start using this?', a: 'The earlier the better. Parents who start 6\u201312 months before the exam give their child time to build the daily habit. Starting in the last month before PSLE or O-Levels is too late for habit formation.' },
          ].map((item, i) => (
            <div key={i} className="border-b border-slate-100">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between py-4 text-left"
              >
                <span className="text-sm font-semibold text-slate-900">{item.q}</span>
                <ChevronDown size={16} className={`shrink-0 text-slate-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <p className="pb-4 text-sm leading-6 text-slate-600">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="border-t border-slate-200 bg-gradient-to-b from-slate-900 to-slate-950 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-black text-white sm:text-3xl">PSLE. O-Level. A-Level.<br />Small daily habits &rarr; big exam results.</h2>
          <p className="mt-3 text-base text-slate-400">Set up in under 5 minutes. Start free &mdash; upgrade when your child&rsquo;s exam season begins.</p>
          <Link to="/studypulse/setup" className="mt-8 inline-flex items-center justify-center rounded-xl bg-amber-400 px-8 py-4 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-amber-300">
            Start Free <ArrowRight size={16} className="ml-2" />
          </Link>
          <p className="mt-4 text-xs text-slate-500">No credit card required. No lock-in.</p>
        </div>
      </section>
    </div>
  );
};

/* ── Pricing row helper ── */
const Row: React.FC<{ label: string; included?: boolean; highlight?: boolean }> = ({ label, included, highlight }) => (
  <div className="flex items-center gap-2.5">
    {included
      ? <Check size={15} className={highlight ? 'text-amber-500' : 'text-emerald-500'} />
      : <Minus size={15} className="text-slate-300" />}
    <span className={`text-sm ${included ? 'text-slate-700' : 'text-slate-400'}`}>{label}</span>
  </div>
);

/* ── Comparison table cell helper ── */
const renderCell = (val: string | boolean) => {
  if (val === true) return <Check size={16} className="mx-auto text-emerald-500" />;
  if (val === false) return <X size={16} className="mx-auto text-slate-300" />;
  return <span className="text-slate-700">{val}</span>;
};

export default StudyPulseLanding;