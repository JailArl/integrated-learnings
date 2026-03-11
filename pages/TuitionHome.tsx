import React, { useState } from 'react';
import { Section, Button } from '../components/Components';
import { SERVICES, PRICING_DATA } from '../constants';
import { Link } from 'react-router-dom';
import ParentInquiryForm from '../components/ParentInquiryForm';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  GraduationCap,
  LineChart,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  UserPlus,
  ClipboardList,
  Stethoscope,
  Star,
  MessageCircle,
} from 'lucide-react';

const TuitionHome: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How long does the matching process take?',
      a: 'Usually 2-5 business days. We analyze your needs, screen candidates, and match the right tutor based on learning style and expertise.',
    },
    {
      q: 'What are the typical rates?',
      a: 'Primary: $35-55/hr | Secondary: $45-80/hr | JC: $65-130/hr. One-to-one at your home. No upfront agency fees — pay per lesson.',
    },
    {
      q: 'What if the tutor isn\'t a good fit?',
      a: 'Free tutor swap within the first 2 lessons, no questions asked. Your child\'s progress is our priority.',
    },
    {
      q: 'Can I cancel or pause lessons?',
      a: 'Yes. Flexible monthly contracts. Pause or cancel with 1 week notice. No lock-in periods.',
    },
    {
      q: 'Do parents need to create an account?',
      a: 'No. Simply fill in the inquiry form on this page and we will reach out to you directly. No login required.',
    },
    {
      q: 'How do you vet your tutors?',
      a: 'All tutors go through identity verification, certificate review, an AI-powered personality interview, and a background check before gaining access to cases.',
    },
  ];

  const testimonials = [
    {
      quote: 'The diagnostic session was clear and practical. We got a tutor who matched my daughter\'s learning style on the first try.',
      name: 'May Yee, Parent',
    },
    {
      quote: 'Fast response and a structured plan. My son finally feels confident going into tests.',
      name: 'Angeline, Parent',
    },
    {
      quote: 'No more trial-and-error. The tutor fit our timing and expectations from week one.',
      name: 'Lina, Parent',
    },
    {
      quote: 'Professional, responsive, and transparent. We felt supported throughout the process.',
      name: 'Claren, Parent',
    },
  ];

  const SUBJECT_LEVELS = [
    { level: 'Primary (P1-P6)', subjects: ['English', 'Mathematics', 'Science', 'Chinese', 'Malay', 'Tamil'], color: 'blue' },
    { level: 'Secondary (S1-S5)', subjects: ['E/A Math', 'Pure/Combined Science', 'English', 'Humanities', 'Chinese', 'Literature'], color: 'indigo' },
    { level: 'JC / IB / IGCSE', subjects: ['H1/H2 Math', 'H2 Physics', 'H2 Chemistry', 'H2 Biology', 'General Paper', 'Economics'], color: 'purple' },
  ];

  return (
    <div className="bg-slate-50">
      {/* ================================================================
          SECTION 1: HERO
          ================================================================ */}
      <div className="relative overflow-hidden bg-[linear-gradient(145deg,#0f172a_0%,#1e293b_50%,#0f172a_100%)] pb-20 pt-24">
        {/* Atmosphere */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-20 left-[-9%] h-72 w-72 rounded-full bg-orange-400/25 blur-3xl animate-pulse" />
          <div className="absolute right-[-8%] top-14 h-80 w-80 rounded-full bg-teal-300/15 blur-3xl animate-pulse" style={{ animationDelay: '0.8s' }} />
          <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl animate-pulse" style={{ animationDelay: '1.2s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:22px_22px]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200/30 bg-orange-100/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">
              <Sparkles size={14} />
              Singapore's Diagnostic-First Tuition Matching
            </div>
            <h1 className="text-4xl font-black leading-[1.08] text-white md:text-6xl">
              Stop Guessing.
              <span className="mt-2 block bg-gradient-to-r from-orange-300 via-amber-200 to-teal-200 bg-clip-text text-transparent">
                Start Learning.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300 md:text-xl">
              We diagnose how your child learns, then match a vetted tutor who fits their subject needs, pace, and personality. No trial-and-error.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a href="#parent-inquiry" className="group inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-900/30 transition hover:bg-blue-700">
                Get Free Diagnostic Assessment
                <ArrowRight size={17} className="ml-2 transition-transform group-hover:translate-x-1" />
              </a>
              <Link to="/tutors/signup" className="inline-flex items-center justify-center rounded-lg border-2 border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20">
                <UserPlus size={17} className="mr-2" />
                I'm a Tutor
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-300">
              <span className="flex items-center"><BadgeCheck size={15} className="mr-2 text-emerald-300" />Verified Educators</span>
              <span className="flex items-center"><Clock3 size={15} className="mr-2 text-emerald-300" />2-5 Day Match</span>
              <span className="flex items-center"><ShieldCheck size={15} className="mr-2 text-emerald-300" />No Lock-in Contract</span>
            </div>
          </div>

          {/* Hero right — quick stats + blueprint */}
          <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">Your Match Blueprint</p>
            <div className="mt-5 space-y-4">
              {[
                { label: 'Learning Diagnosis', detail: 'Study habits, confidence blockers, exam profile' },
                { label: 'Tutor Persona Fit', detail: 'Teaching style, pace, communication match' },
                { label: 'Structured 12-Week Plan', detail: 'Milestones, parent updates, revision rhythm' },
              ].map((step, idx) => (
                <div key={step.label} className="rounded-xl border border-white/15 bg-slate-900/30 p-4">
                  <p className="text-sm font-bold text-white">{idx + 1}. {step.label}</p>
                  <p className="mt-1 text-sm text-slate-300">{step.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-center">
                <p className="text-2xl font-black text-white">250+</p>
                <p className="text-xs text-slate-200">Families Matched</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-center">
                <p className="text-2xl font-black text-white">95%</p>
                <p className="text-xs text-slate-200">Parent Satisfaction</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          SECTION 2: PARENT vs TUTOR SPLIT
          ================================================================ */}
      <Section className="bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Who Are You?</h2>
            <p className="mt-3 text-slate-600">Two paths, one platform. Choose yours.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Parent path */}
            <div className="group rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-8 transition hover:border-blue-400 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <ClipboardList size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">I'm a Parent</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Looking for a tutor? Fill out our inquiry form below — no account needed. We'll diagnose your child's learning needs and match them with a vetted educator within 2-5 days.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center"><CheckCircle2 size={15} className="mr-2 flex-shrink-0 text-blue-500" />No signup required</li>
                <li className="flex items-center"><CheckCircle2 size={15} className="mr-2 flex-shrink-0 text-blue-500" />Free diagnostic assessment</li>
                <li className="flex items-center"><CheckCircle2 size={15} className="mr-2 flex-shrink-0 text-blue-500" />Pay per lesson — no upfront fees</li>
              </ul>
              <a href="#parent-inquiry" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition group-hover:gap-3">
                Fill Inquiry Form <ArrowRight size={16} />
              </a>
            </div>

            {/* Tutor path */}
            <div className="group rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 transition hover:border-emerald-400 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">I'm a Tutor</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Join our educator network. Create an account, complete your profile, upload credentials, and take our AI interview — then start receiving matched cases.
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                <li className="flex items-center"><CheckCircle2 size={15} className="mr-2 flex-shrink-0 text-emerald-500" />Create free account</li>
                <li className="flex items-center"><CheckCircle2 size={15} className="mr-2 flex-shrink-0 text-emerald-500" />AI-powered character interview</li>
                <li className="flex items-center"><CheckCircle2 size={15} className="mr-2 flex-shrink-0 text-emerald-500" />Get matched with students in your area</li>
              </ul>
              <Link to="/tutors/signup" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition group-hover:gap-3">
                Create Tutor Account <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 3: HOW THE PROCESS WORKS
          ================================================================ */}
      <Section className="bg-slate-50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">How The Process Works</h2>
            <p className="mt-3 text-slate-600">Fast, structured, and transparent from first inquiry to first lesson.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {[
              { icon: ClipboardList, title: 'Share Child Profile', desc: 'Level, subject concerns, learning challenges, and goals in a quick form.' },
              { icon: Stethoscope, title: 'Receive Diagnosis', desc: 'We map study habits, confidence gaps, and learning preferences.' },
              { icon: Target, title: 'Tutor Shortlist', desc: 'You get best-fit educators with clear rationale for each match.' },
              { icon: CalendarClock, title: 'Start Lessons', desc: 'Begin with structure, milestones, and regular progress updates.' },
            ].map((item, idx) => (
              <div key={item.title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">{idx + 1}</div>
                <item.icon size={22} className="mb-3 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 4: SUBJECTS AND LEVELS
          ================================================================ */}
      <Section className="bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Subjects &amp; Levels We Cover</h2>
            <p className="mt-3 text-slate-600">From Primary foundation to JC exam mastery. All core and elective subjects.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {SUBJECT_LEVELS.map((group) => (
              <div key={group.level} className={`rounded-2xl border p-6 ${
                group.color === 'blue' ? 'border-blue-200 bg-blue-50' :
                group.color === 'indigo' ? 'border-indigo-200 bg-indigo-50' :
                'border-purple-200 bg-purple-50'
              }`}>
                <h3 className="text-lg font-bold text-slate-900">{group.level}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.subjects.map((s) => (
                    <span key={s} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Services grid */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <Link
                key={service.id}
                to={service.link}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={service.image} alt={service.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold text-slate-900 transition group-hover:text-blue-600">{service.title}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-600">{service.description}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600">
                    Learn More <ArrowRight size={15} className="ml-1 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick pricing reference */}
          <div className="mt-12 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100">
                  <th className="px-5 py-3 text-left font-semibold text-slate-700">Level</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-700">Part-time Tutor</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-700">Full-time Tutor</th>
                  <th className="px-5 py-3 text-left font-semibold text-slate-700">Ex/Current MOE</th>
                </tr>
              </thead>
              <tbody>
                {PRICING_DATA.map((tier) =>
                  tier.rates.map((rate, idx) => (
                    <tr key={`${tier.category}-${idx}`} className="border-b border-slate-200 last:border-b-0">
                      <td className="px-5 py-3 font-medium text-slate-800">{rate.level}</td>
                      <td className="px-5 py-3 text-slate-600">{rate.pt}</td>
                      <td className="px-5 py-3 text-slate-600">{rate.ft}</td>
                      <td className="px-5 py-3 text-slate-600">{rate.moe}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            Rates per hour. Actual rates may vary based on subject and tutor experience. <Link to="/tuition/pricing" className="text-blue-600 underline">Full pricing details</Link>
          </p>
        </div>
      </Section>

      {/* ================================================================
          SECTION 5: DIAGNOSTIC / ADVISORY
          ================================================================ */}
      <Section className="bg-gradient-to-b from-orange-50 to-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Diagnostic-Driven Matching</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">Not Just Any Tutor. The Right Tutor.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Our advisory layer is what separates us from tutor directories. We don't just list educators — we diagnose learner needs and match with intent.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-orange-100 bg-white p-6">
              <Brain className="mb-4 text-orange-600" size={28} />
              <h3 className="text-lg font-bold text-slate-900">Learning Style Calibration</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">We identify whether your child is a visual, auditory, or kinesthetic learner before selecting a tutor.</p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-6">
              <Target className="mb-4 text-sky-700" size={28} />
              <h3 className="text-lg font-bold text-slate-900">Precision Match Criteria</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Beyond looking at grades, we screen for teaching method, consistency, and student temperament compatibility.</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-white p-6">
              <LineChart className="mb-4 text-emerald-700" size={28} />
              <h3 className="text-lg font-bold text-slate-900">Progress Tracking</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Milestone planning and parent updates keep academic momentum visible and accountable over 12 weeks.</p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <LineChart size={30} className="mx-auto mb-3 text-orange-600" />
              <p className="text-3xl font-black text-slate-900">+1.5</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Average grade uplift in 12 weeks</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <Users size={30} className="mx-auto mb-3 text-orange-600" />
              <p className="text-3xl font-black text-slate-900">250+</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Families matched successfully</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <Star size={30} className="mx-auto mb-3 text-orange-600" />
              <p className="text-3xl font-black text-slate-900">95%+</p>
              <p className="mt-1 text-sm font-medium text-slate-600">Parent satisfaction feedback</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 6: TRUST (Testimonials + Why Us)
          ================================================================ */}
      <Section className="bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Parents Trust Our Process</h2>
            <p className="mt-3 text-slate-600">Real outcomes from families who switched to diagnostic matching.</p>
          </div>

          {/* Testimonials */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-7">
              <p className="text-xl font-semibold leading-relaxed text-slate-900">&ldquo;{testimonials[0].quote}&rdquo;</p>
              <p className="mt-5 text-sm font-bold text-orange-700">{testimonials[0].name}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {testimonials.slice(1).map((item) => (
                <div key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm leading-relaxed text-slate-700">&ldquo;{item.quote}&rdquo;</p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500">{item.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why choose us */}
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Diagnostic Matching', desc: 'Included free — no trial and error, just precision matching' },
              { title: 'Verified Tutors Only', desc: 'Character-vetted educators with proven track records' },
              { title: 'Flexible Contracts', desc: 'No lock-in. Pause or cancel with 1 week notice' },
              { title: 'Free Tutor Swap', desc: 'Within first 2 lessons if the fit isn\'t right' },
              { title: 'Real-Time Dashboard', desc: 'Track lessons, progress reports, and payments' },
              { title: 'Fast Response', desc: 'Matching within 2-5 days, support within 4 hours' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start rounded-xl border border-slate-200 bg-slate-50 p-5">
                <CheckCircle2 className="mr-3 mt-0.5 flex-shrink-0 text-blue-600" size={18} />
                <div>
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 7: PARENT INQUIRY FORM
          ================================================================ */}
      <Section id="parent-inquiry" className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Find the Right Tutor</h2>
            <p className="mt-3 text-slate-600">Fill in the form below. No account needed. We'll reach out within 1-2 business days.</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm md:p-8">
            <ParentInquiryForm />
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 8: TUTOR SIGNUP CTA
          ================================================================ */}
      <Section className="bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <GraduationCap size={14} />
            For Educators
          </div>
          <h2 className="text-3xl font-black md:text-4xl">Join Our Educator Network</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Create your free account, complete your profile, and start receiving matched cases from families in your area. Our onboarding takes less than 15 minutes.
          </p>

          <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
            {[
              { step: '1', title: 'Create Account', desc: 'Quick signup with email and password.' },
              { step: '2', title: 'Complete Profile', desc: 'Add subjects, qualifications, and upload documents.' },
              { step: '3', title: 'AI Interview', desc: 'Take our character interview and start receiving cases.' },
            ].map((item) => (
              <div key={item.step} className="rounded-xl border border-slate-700 bg-slate-800/80 p-5">
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">{item.step}</div>
                <h3 className="font-bold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/tutors/signup" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-600">
              <UserPlus size={18} />
              Create Tutor Account
            </Link>
            <Link to="/tutors/login" className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </Section>

      {/* ================================================================
          FAQ
          ================================================================ */}
      <Section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left font-semibold text-slate-800 transition hover:bg-slate-50"
                  aria-expanded={openFaq === idx}
                  aria-controls={`tuition-faq-${idx}`}
                  id={`tuition-faq-${idx}-button`}
                >
                  <span className="text-sm md:text-base">{faq.q}</span>
                  <ChevronDown size={18} className={`ml-4 flex-shrink-0 transition ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div
                    id={`tuition-faq-${idx}`}
                    role="region"
                    aria-labelledby={`tuition-faq-${idx}-button`}
                    className="border-t border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-relaxed text-slate-700"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ================================================================
          EDUCATION ROADMAP (kept from existing page)
          ================================================================ */}
      <Section className="bg-gradient-to-br from-slate-50 to-sky-50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Singapore Education Roadmap</h2>
          <p className="mt-4 text-lg text-slate-600">
            Navigate PSLE, FSBB, O-Levels, and beyond with our interactive metro map
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-blue-600" />
              <h4 className="font-bold text-slate-900">Primary</h4>
              <p className="mt-1 text-sm text-slate-600">P4 Streaming and PSLE strategy</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <School className="mx-auto mb-3 h-10 w-10 text-blue-600" />
              <h4 className="font-bold text-slate-900">Secondary</h4>
              <p className="mt-1 text-sm text-slate-600">FSBB (G1/G2/G3) and O-Level pathways</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <GraduationCap className="mx-auto mb-3 h-10 w-10 text-blue-600" />
              <h4 className="font-bold text-slate-900">Tertiary</h4>
              <p className="mt-1 text-sm text-slate-600">JC, Poly, and ITE options</p>
            </div>
          </div>
          <div className="mt-8">
            <Button to="/tuition/roadmap">View Interactive Roadmap</Button>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default TuitionHome;
