import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle,
  ClipboardCheck,
  Flame,
  Search,
  UserPlus,
} from 'lucide-react';
import ParentInquiryForm from '../components/ParentInquiryForm';

const FamilyHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-[linear-gradient(160deg,#0f172a_0%,#1e293b_55%,#0b3b2e_100%)] px-4 pb-20 pt-20h text-white sm:px-6 lg:px-8">
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
                For Singapore Parents
              </p>
              <h1 className="font-sans text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                You can&rsquo;t be there
                <span className="block text-amber-300">every evening.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg">
                You work hard. You pay for tuition. But when you get home, you still don&rsquo;t know if they actually studied. StudyPulse gives you a simple daily answer — without the nagging.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/studypulse"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:bg-amber-400"
                >
                  Try Free — No App Needed
                  <ArrowRight size={16} className="ml-2" />
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-500">Works via WhatsApp. Your child doesn&rsquo;t need to install anything.</p>
            </div>

            {/* Right — WhatsApp Conversation Mockup */}
            <div className="hidden lg:block" aria-hidden="true">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
                <div className="rounded-xl bg-[#0b141a] p-4">
                  {/* WhatsApp header */}
                  <div className="mb-3 flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-slate-900">SP</div>
                    <div>
                      <p className="text-sm font-semibold text-white">StudyPulse</p>
                      <p className="text-[10px] text-slate-500">online</p>
                    </div>
                  </div>
                  {/* Chat bubbles */}
                  <div className="space-y-2.5">
                    <div className="max-w-[80%]">
                      <div className="rounded-lg rounded-tl-none bg-[#202c33] px-3 py-2">
                        <p className="text-sm text-slate-200">Hi Ahmad! 👋 Time for your daily check-in. Did you study today?</p>
                        <p className="mt-1 text-right text-[10px] text-slate-500">8:30 PM</p>
                      </div>
                    </div>
                    <div className="ml-auto max-w-[70%]">
                      <div className="rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2">
                        <p className="text-sm text-white">Yes! Finished Math worksheet ✓</p>
                        <p className="mt-1 text-right text-[10px] text-emerald-400/70">8:33 PM ✓✓</p>
                      </div>
                    </div>
                    <div className="max-w-[80%]">
                      <div className="rounded-lg rounded-tl-none bg-[#202c33] px-3 py-2">
                        <p className="text-sm text-slate-200">Nice work! 📚 What topic?</p>
                        <p className="mt-1 text-right text-[10px] text-slate-500">8:33 PM</p>
                      </div>
                    </div>
                    <div className="ml-auto max-w-[70%]">
                      <div className="rounded-lg rounded-tr-none bg-[#005c4b] px-3 py-2">
                        <p className="text-sm text-white">Fractions — chapter 5</p>
                        <p className="mt-1 text-right text-[10px] text-emerald-400/70">8:34 PM ✓✓</p>
                      </div>
                    </div>
                    <div className="max-w-[80%]">
                      <div className="rounded-lg rounded-tl-none bg-[#202c33] px-3 py-2">
                        <p className="text-sm text-slate-200">🔥 5-day streak! Keep it going!</p>
                        <p className="mt-1 text-right text-[10px] text-slate-500">8:34 PM</p>
                      </div>
                    </div>
                  </div>
                  {/* Parent notification */}
                  <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">You receive at 9:45 PM</p>
                    <p className="mt-1 text-xs text-amber-200/80">✅ Ahmad checked in — Done! Math (Fractions). 🔥 5-day streak.</p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-slate-500">This is how it works. Every evening. No app needed.</p>
            </div>
          </div>

          {/* Singapore Parent Pain Points */}
          <div className="mt-14 border-t border-white/10 pt-8">
            <p className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Sound familiar?</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { emoji: '😩', pain: '"I come home tired and I have no energy left to check if they\'ve done their homework."' },
                { emoji: '📱', pain: '"They say they\'re studying but they\'re on their phone the whole time."' },
                { emoji: '🤷', pain: '"I work late. By the time I\'m home, I have no idea what they did all evening."' },
                { emoji: '😤', pain: '"Every time I ask about homework it becomes an argument."' },
              ].map((p) => (
                <div key={p.pain} className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm">
                  <span className="text-2xl">{p.emoji}</span>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{p.pain}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-slate-400">StudyPulse replaces the guesswork with a simple daily check-in — no nagging required.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ SERVICES GRID (3 cards) ═══════════ */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">What We Offer</p>
          <h2 className="mt-3 text-center text-3xl font-black text-slate-900 sm:text-4xl">Three Ways We Help Your Family</h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

            {/* Card 2 — Crash Courses */}
            <article className="group rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-6 shadow-sm transition hover:shadow-md lg:p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                <Flame size={24} />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Exam Prep</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Crash Courses</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Intensive revision before mid-year, end-of-year, or major exams. Small group or 1-to-1 sessions focused on weak topics and exam techniques.
              </p>
              <ul className="mt-4 space-y-2">
                {['Exam-focused intensive revision', 'Holiday & pre-exam schedules', 'P4–JC2, all core subjects'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle size={15} className="mt-0.5 shrink-0 text-orange-600" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#parent-inquiry"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                Register Interest
              </a>
            </article>

            {/* Card 3 — Become a Tutor */}
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

      {/* ═══════════ FIND A TUTOR + INQUIRY FORM ═══════════ */}
      <section id="parent-inquiry" className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 grid gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Search size={24} />
              </div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-600">Tutor Matching</p>
              <h2 className="mt-3 text-3xl font-black text-slate-900">Find the Right Tutor</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Tell us your child&apos;s level, subjects, and learning style. We&apos;ll match you with a vetted tutor — not just whoever is available.
              </p>
              <ul className="mt-5 space-y-2">
                {['Matched by subject & teaching style', 'Transparent indicative rates', 'Switch anytime, no lock-in', 'P1 to JC2, all subjects'].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle size={15} className="mt-0.5 shrink-0 text-sky-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <ParentInquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FamilyHome;
