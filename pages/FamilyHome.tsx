import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle,
  Flame,
  MessageCircle,
  Search,
  Timer,
  UserPlus,
} from 'lucide-react';
import ParentInquiryForm from '../components/ParentInquiryForm';

const EARLY_BIRD_DEADLINE = new Date('2026-05-20T23:59:59+08:00').getTime();

const FamilyHome: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, EARLY_BIRD_DEADLINE - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(Math.max(0, EARLY_BIRD_DEADLINE - Date.now())), 1000);
    return () => clearInterval(id);
  }, []);
  const days = Math.floor(timeLeft / 86400000);
  const hours = Math.floor((timeLeft % 86400000) / 3600000);
  const mins = Math.floor((timeLeft % 3600000) / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">

      {/* ═══════════ URGENCY BANNER ═══════════ */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 px-3 py-2.5 text-white shadow-lg sm:gap-6 sm:px-4">
        <Timer size={15} className="shrink-0" />
        <p className="text-xs font-bold sm:text-sm">
          🔥 June Holiday Crash Course — Early Bird closes in&nbsp;
          <span className="font-black tabular-nums">
            {pad(days)}d {pad(hours)}h {pad(mins)}m {pad(secs)}s
          </span>
        </p>
        <a
          href="https://wa.me/6598882675?text=Hi%2C%20I%27d%20like%20to%20find%20out%20more%20about%20the%20June%20Holiday%20Crash%20Course"
          target="_blank" rel="noopener noreferrer"
          className="hidden shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-black text-orange-600 shadow transition hover:bg-orange-50 sm:inline-flex"
        >
          Reserve Now →
        </a>
      </div>

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
                <Link
                  to="/tuition/request"
                  className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  Find a Tutor
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

      {/* ═══════════ DECISION FLOW ═══════════ */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Start Here</p>
          <h2 className="mt-3 text-center text-3xl font-black text-slate-900 sm:text-4xl">What are you looking for?</h2>
          <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-7 text-slate-600 sm:text-base">
            Choose a pathway based on what your family needs now. StudyPulse remains our flagship for day-to-day study consistency, while holiday options are grouped for June planning.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm sm:p-7">
              <div className="inline-flex items-center rounded-full border border-amber-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                Pathway 1: Academic Support
              </div>
              <h3 className="mt-4 text-2xl font-black text-slate-900">Keep daily learning consistent</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Start with StudyPulse for daily accountability. Add tutor matching when you need stronger subject support.
              </p>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-amber-200 bg-white p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <BarChart3 size={20} />
                  </div>
                  <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-amber-700">Primary Recommendation</p>
                  <h4 className="mt-1 text-lg font-black text-slate-900">StudyPulse</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Daily WhatsApp check-ins, streak tracking, and parent visibility without nagging.</p>
                  <Link
                    to="/studypulse"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
                  >
                    Try StudyPulse
                    <ArrowRight size={15} className="ml-2" />
                  </Link>
                </div>

                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Search size={20} />
                  </div>
                  <h4 className="mt-3 text-lg font-black text-slate-900">Need subject support too?</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Use our tutor request flow for a matched educator based on level, subject, and goals.</p>
                  <Link
                    to="/tuition/request"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-sky-300 bg-white px-4 py-2.5 text-sm font-bold text-sky-700 transition hover:bg-sky-100"
                  >
                    Find a Tutor
                    <ArrowRight size={15} className="ml-2" />
                  </Link>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-6 shadow-sm sm:p-7">
              <div className="inline-flex items-center rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">
                Pathway 2: Holiday Programmes
              </div>
              <h3 className="mt-4 text-2xl font-black text-slate-900">Use June holidays meaningfully</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Choose between exam-focused crash courses or a practical enrichment workshop for real-world thinking.
              </p>

              <div className="mt-5 grid gap-4">
                <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                    <Flame size={20} />
                  </div>
                  <h4 className="mt-3 text-lg font-black text-slate-900">Crash Courses (PSLE/O-Level)</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Intensive revision tracks for students preparing for major exams this year.</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      to="/family/crash-courses/psle-june-intensive"
                      className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700"
                    >
                      PSLE
                    </Link>
                    <Link
                      to="/family/crash-courses/o-level-june-intensive"
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      O-Level
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-200 bg-white p-5">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                    <BookOpenCheck size={20} />
                  </div>
                  <h4 className="mt-3 text-lg font-black text-slate-900">Holiday Enrichment: Future Choices</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">For Sec 1-3 students exploring money, choices, consequences, and adulthood through guided simulations.</p>
                  <Link
                    to="/family/programmes/future-choices-workshop"
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700"
                  >
                    View Workshop
                    <ArrowRight size={15} className="ml-2" />
                  </Link>
                </div>
              </div>
            </article>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 sm:px-6">
            <p className="font-semibold">For Educators: looking to teach with us instead?</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <p className="text-emerald-700">Join our tutor network with flexible schedules and student matching support.</p>
              <Link to="/tutor-signup" className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700">
                Become a Tutor
                <UserPlus size={13} className="ml-1.5" />
              </Link>
            </div>
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
              <div className="mb-4 rounded-xl border border-sky-200 bg-white p-3 text-xs text-sky-800">
                Prefer a full-page experience? Use our dedicated parent request page:
                <Link to="/tuition/request" className="ml-1 font-bold underline hover:text-sky-900">/tuition/request</Link>
              </div>
              <ParentInquiryForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FamilyHome;
