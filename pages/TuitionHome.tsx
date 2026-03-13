import React, { useState } from 'react';
import { Section } from '../components/Components';
import { Link } from 'react-router-dom';
import ParentInquiryForm from '../components/ParentInquiryForm';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ClipboardList,
  LineChart,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';

const TuitionHome: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How fast can I get a tutor?',
      a: 'Most families receive a tutor recommendation within 2\u20133 business days after submitting the inquiry form.',
    },
    {
      q: 'How do you match tutors to my child?',
      a: 'We review your child\u2019s level, subjects, learning challenges, personality, and goals. We then match them with a tutor whose teaching style, experience, and temperament are the best fit \u2014 not just whoever is available.',
    },
    {
      q: 'What if the tutor isn\'t a good fit?',
      a: 'We offer a free tutor replacement within the first 2 lessons, no questions asked. Your child\u2019s learning matters more than any single match.',
    },
    {
      q: 'How much does it cost?',
      a: 'Primary: $35\u201355/hr \u00b7 Secondary: $45\u201380/hr \u00b7 JC: $65\u2013130/hr. You pay per lesson directly to the tutor. No upfront fees, no packages, no lock-in contracts.',
    },
    {
      q: 'Do I need to create an account?',
      a: 'No. Simply fill in the inquiry form on this page. We\u2019ll reach out to discuss your child\u2019s needs \u2014 no login required.',
    },
    {
      q: 'How are your tutors vetted?',
      a: 'Every tutor goes through identity verification, credential review, an AI-powered character assessment, and a background check before joining our network.',
    },
    {
      q: 'Can you help students who are already doing well?',
      a: 'Yes. We work with students across the full spectrum \u2014 from those who need to close gaps to high-achievers preparing for competitive exams or DSA applications.',
    },
    {
      q: 'What if my child needs more than just tutoring?',
      a: 'We also advise on study habits, exam strategies, and learning approaches. If tutoring alone isn\u2019t the right solution, we\u2019ll tell you.',
    },
    {
      q: 'How are payments handled?',
      a: 'Parents pay the tutor directly on a per-lesson basis. No platform fees, no hidden charges. We\u2019ll walk you through the details when we discuss the match.',
    },
    {
      q: 'Why should I use your platform instead of finding a tutor myself?',
      a: 'Finding a tutor on your own takes time and guesswork. We\u2019ve done the vetting, understand the Singapore education landscape, and match based on compatibility \u2014 not just availability. If it doesn\u2019t work out, we replace the tutor for free. Most parents tell us this saves them months of trial and error.',
    },
  ];

  const testimonials = [
    {
      quote: 'We spent 6 months switching between 3 tutors. Every change cost our son time \u2014 half a school year of momentum lost. When Integrated Learnings matched him with the right tutor, he improved from C6 to B3 in Maths within 8 weeks. I wish we\u2019d started here.',
      name: 'Parent of Sec 2 student, E. Math',
    },
    {
      quote: 'The diagnostic session gave us clarity on what our daughter actually needed. It wasn\u2019t just about finding a tutor \u2014 it was about understanding where her learning gaps really were.',
      name: 'May Yee, Parent of P5 student',
    },
    {
      quote: 'They didn\u2019t just throw a tutor at us. They asked the right questions, matched someone who fits my son\u2019s personality, and he finally feels confident going into tests.',
      name: 'Angeline, Parent of Sec 3 student',
    },
    {
      quote: 'Professional, responsive, and transparent. We felt supported \u2014 not sold to.',
      name: 'Claren, Parent',
    },
  ];

  const SUBJECT_LEVELS = [
    { level: 'Primary (P1\u2013P6)', subjects: ['English', 'Mathematics', 'Science', 'Chinese', 'Malay', 'Tamil'], color: 'blue' },
    { level: 'Secondary (S1\u2013S5)', subjects: ['E/A Math', 'Pure/Combined Science', 'English', 'Humanities', 'Chinese', 'Literature'], color: 'indigo' },
    { level: 'JC / IB / IGCSE', subjects: ['H1/H2 Math', 'H2 Physics', 'H2 Chemistry', 'H2 Biology', 'General Paper', 'Economics'], color: 'purple' },
  ];

  return (
    <div className="bg-slate-50">
      {/* ================================================================
          SECTION 1: HERO
          ================================================================ */}
      <div className="relative overflow-hidden bg-[linear-gradient(145deg,#0f172a_0%,#1e293b_50%,#0f172a_100%)] pb-20 pt-24">
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute -top-20 left-[-9%] h-72 w-72 rounded-full bg-blue-400/20 blur-3xl animate-pulse" />
          <div className="absolute right-[-8%] top-14 h-80 w-80 rounded-full bg-teal-300/15 blur-3xl animate-pulse" style={{ animationDelay: '0.8s' }} />
          <div className="absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl animate-pulse" style={{ animationDelay: '1.2s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] [background-size:22px_22px]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/30 bg-blue-100/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
              <BadgeCheck size={14} />
              Trusted by 250+ Singapore Families
            </div>
            <h1 className="text-4xl font-black leading-[1.08] text-white md:text-6xl">
              Find the Right Tutor
              <span className="mt-2 block bg-gradient-to-r from-blue-300 via-cyan-200 to-teal-200 bg-clip-text text-transparent">
                Without the Guesswork.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300 md:text-xl">
              We match your child with a verified, compatible tutor based on their learning needs, personality, and goals &mdash; so you don&rsquo;t waste months on the wrong fit.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a href="#parent-inquiry" className="group inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-900/30 transition hover:bg-blue-700">
                Request a Tutor Match
                <ArrowRight size={17} className="ml-2 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#how-it-works" className="inline-flex items-center justify-center rounded-lg border-2 border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20">
                See How It Works
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-300">
              <span className="flex items-center"><ShieldCheck size={15} className="mr-2 text-emerald-300" />Verified &amp; Background-Checked</span>
              <span className="flex items-center"><RefreshCw size={15} className="mr-2 text-emerald-300" />Free Replacement if Not a Fit</span>
              <span className="flex items-center"><BadgeCheck size={15} className="mr-2 text-emerald-300" />No Lock-in Contract</span>
            </div>
          </div>

          {/* Hero right — speed + pricing at a glance */}
          <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl md:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">At a Glance</p>
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-white/15 bg-slate-900/30 p-4">
                <p className="text-sm font-bold text-white flex items-center"><Clock3 size={16} className="mr-2 text-blue-300" /> How fast?</p>
                <p className="mt-1 text-sm text-slate-300">Most families are matched within 2&ndash;3 business days.</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-slate-900/30 p-4">
                <p className="text-sm font-bold text-white flex items-center"><LineChart size={16} className="mr-2 text-blue-300" /> How much?</p>
                <p className="mt-1 text-sm text-slate-300">Primary: from $35/hr &middot; Secondary: from $45/hr &middot; JC: from $65/hr</p>
                <p className="mt-1 text-xs text-slate-400">Pay per lesson only. No upfront fees.</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-slate-900/30 p-4">
                <p className="text-sm font-bold text-white flex items-center"><ShieldCheck size={16} className="mr-2 text-blue-300" /> What if it doesn&rsquo;t work?</p>
                <p className="mt-1 text-sm text-slate-300">Free tutor replacement within the first 2 lessons.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================
          SECTION 2: PAIN POINTS
          ================================================================ */}
      <Section className="bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Finding the right tutor shouldn&rsquo;t feel this hard.</h2>
            <p className="mt-3 text-slate-600">If any of these sound familiar, you&rsquo;re not alone.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-7">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-500">
                <X size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900">&ldquo;We tried, but it didn&rsquo;t work out&rdquo;</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                You found a tutor who looked great on paper &mdash; but your child didn&rsquo;t connect with them. Lessons felt flat. Grades didn&rsquo;t move. You&rsquo;re back to square one, and your child has lost another term.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-7">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-500">
                <Search size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900">&ldquo;We&rsquo;re not sure what our child needs&rdquo;</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Is it the content they&rsquo;re struggling with? Study habits? Confidence? Exam technique? Without knowing the root cause, every tutor feels like a gamble.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-7">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <ClipboardList size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900">&ldquo;It&rsquo;s become a coordination headache&rdquo;</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Messaging agencies, comparing profiles, scheduling trial lessons, chasing progress updates. It takes up time you don&rsquo;t have &mdash; and the uncertainty doesn&rsquo;t help.
              </p>
            </div>
          </div>
          <p className="mt-8 text-center text-base text-slate-600">
            We built Integrated Learnings to solve exactly this. Not another tutor directory &mdash; <span className="font-semibold text-slate-900">a smarter way to find the right match, right away.</span>
          </p>
        </div>
      </Section>

      {/* ================================================================
          SECTION 3: HOW IT WORKS
          ================================================================ */}
      <Section id="how-it-works" className="bg-slate-50">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">3 Simple Steps. No Account Needed.</h2>
            <p className="mt-3 text-slate-600">From inquiry to first lesson &mdash; fast, simple, and transparent.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: ClipboardList, title: 'Tell Us About Your Child', desc: 'Fill in a short form with your child\u2019s level, subjects, challenges, and goals. Takes under 3 minutes.' },
              { icon: Target, title: 'We Find the Right Match', desc: 'Our team reviews your child\u2019s profile and recommends the best-fit tutor from our vetted network \u2014 usually within 2\u20133 business days.' },
              { icon: BookOpen, title: 'Lessons Begin', desc: 'Your matched tutor reaches out to schedule the first session. If it\u2019s not the right fit within the first 2 lessons, we\u2019ll swap the tutor for free.' },
            ].map((item, idx) => (
              <div key={item.title} className="relative rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{idx + 1}</div>
                <item.icon size={22} className="mb-3 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href="#parent-inquiry" className="group inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700">
              Submit Your Child&rsquo;s Profile
              <ArrowRight size={17} className="ml-2 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 4: WHAT MAKES US DIFFERENT
          ================================================================ */}
      <Section className="bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">We Don&rsquo;t Just List Tutors. We Match Them.</h2>
            <p className="mt-3 text-slate-600">Here&rsquo;s how our approach compares to typical tuition agencies.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-7">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">Typical Tuition Agencies</p>
              <ul className="space-y-4">
                {[
                  'Send you a list of available tutors',
                  'You choose based on a profile and bio',
                  'No follow-up after matching',
                  'Locked into a package or contract',
                  'If it doesn\u2019t work, start over',
                ].map((item) => (
                  <li key={item} className="flex items-start text-sm text-slate-600">
                    <X size={16} className="mr-3 mt-0.5 flex-shrink-0 text-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-7">
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.15em] text-blue-600">Integrated Learnings</p>
              <ul className="space-y-4">
                {[
                  'We recommend one matched tutor based on your child\u2019s needs',
                  'We assess learning style, personality fit, and teaching approach',
                  'We check in at 2 weeks and 6 weeks to ensure it\u2019s working',
                  'Pay per lesson. Pause or stop anytime. No contract.',
                  'Free tutor swap within the first 2 lessons',
                ].map((item) => (
                  <li key={item} className="flex items-start text-sm text-slate-700">
                    <CheckCircle2 size={16} className="mr-3 mt-0.5 flex-shrink-0 text-blue-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 5: TUTOR QUALITY & VETTING
          ================================================================ */}
      <Section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Every Tutor Has Been Carefully Vetted.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              We don&rsquo;t accept every applicant. Our educators go through a structured screening process before they&rsquo;re matched with any family.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              { icon: Shield, title: 'Identity & Credential Verification', desc: 'Academic certificates, teaching experience, and NRIC are verified before onboarding.' },
              { icon: Brain, title: 'AI-Powered Character Assessment', desc: 'Our proprietary interview evaluates teaching philosophy, patience, communication style, and reliability \u2014 not just qualifications.' },
              { icon: ShieldCheck, title: 'Background Check', desc: 'All tutors undergo a background screening for your peace of mind.' },
              { icon: Star, title: 'Ongoing Quality Feedback', desc: 'After lessons begin, parents rate their experience. Tutors with consistently low feedback are reviewed and removed from the network.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex-shrink-0 rounded-xl bg-blue-50 p-3">
                  <item.icon size={22} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            We accept fewer than 1 in 5 tutor applicants into our network.
          </p>
        </div>
      </Section>

      {/* ================================================================
          SECTION 6: EXPECTED OUTCOMES
          ================================================================ */}
      <Section className="bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">What Parents Can Expect</h2>
            <p className="mt-3 text-slate-600">A clear timeline from the first lesson to visible progress.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-7">
              <div className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">Week 1&ndash;2</div>
              <h3 className="text-base font-bold text-slate-900">Understanding</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Your tutor gets to know your child&rsquo;s strengths, gaps, and learning habits. A lesson rhythm is established.</p>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-7">
              <div className="mb-3 inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Week 3&ndash;6</div>
              <h3 className="text-base font-bold text-slate-900">Building Momentum</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Targeted practice on weak areas. Study strategies are introduced. Your child starts feeling more confident.</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-7">
              <div className="mb-3 inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Week 7&ndash;12</div>
              <h3 className="text-base font-bold text-slate-900">Visible Progress</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Grade improvement becomes measurable. Exam confidence grows. Parents receive progress updates.</p>
            </div>
          </div>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-slate-900">
              <TrendingUp size={24} className="text-blue-600" />
              <p className="text-lg font-bold">On average, students improve by 1&ndash;2 grade bands within one school term.</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <a href="#parent-inquiry" className="group inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-blue-700">
              Start Your Child&rsquo;s Journey
              <ArrowRight size={17} className="ml-2 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 7: SOCIAL PROOF
          ================================================================ */}
      <Section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Hear From Parents Who Found the Right Fit.</h2>
          </div>
          {/* Featured testimonial */}
          <div className="mb-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8">
            <p className="text-lg font-semibold leading-relaxed text-slate-900 md:text-xl">&ldquo;{testimonials[0].quote}&rdquo;</p>
            <p className="mt-5 text-sm font-bold text-blue-700">&mdash; {testimonials[0].name}</p>
          </div>
          {/* Other testimonials */}
          <div className="grid gap-4 sm:grid-cols-3">
            {testimonials.slice(1).map((item) => (
              <div key={item.name} className="rounded-2xl border border-slate-200 bg-white p-6">
                <p className="text-sm leading-relaxed text-slate-700">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">&mdash; {item.name}</p>
              </div>
            ))}
          </div>
          {/* Founder credibility */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 text-center">
            <p className="text-sm italic text-slate-600">
              Founded by a parent who experienced the same frustrations &mdash; and spent 10+ years in education building a better system.
            </p>
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 8: SUBJECTS & LEVELS
          ================================================================ */}
      <Section className="bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">We Cover All Major Subjects and Levels.</h2>
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
          <p className="mt-6 text-center text-sm text-slate-500">
            Don&rsquo;t see your subject? Let us know &mdash; we likely have a tutor for it.{' '}
            <Link to="/international-students" className="font-semibold text-blue-600 hover:underline">Looking for international student support?</Link>
          </p>
        </div>
      </Section>

      {/* ================================================================
          SECTION 9: FAQ
          ================================================================ */}
      <Section className="bg-slate-50">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-3xl font-black text-slate-900">Questions Parents Ask Before Getting Started</h2>
          <p className="mb-8 text-center text-slate-600">Answers to the most common concerns.</p>
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
          SECTION 10: FINAL CTA + INQUIRY FORM
          ================================================================ */}
      <Section id="parent-inquiry" className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl">Ready to Find the Right Tutor for Your Child?</h2>
            <p className="mt-3 text-slate-600">Tell us about your child&rsquo;s learning needs. No account required. No obligation. Our team will review your submission and reach out within 1&ndash;2 business days with a personalised recommendation.</p>
          </div>
          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm md:p-8">
            <ParentInquiryForm />
          </div>
          <div className="mt-6 flex flex-col items-center gap-2 text-center text-xs text-slate-500">
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              <span className="flex items-center"><ShieldCheck size={13} className="mr-1.5 text-slate-400" />Your information is kept confidential</span>
              <span className="flex items-center"><CheckCircle2 size={13} className="mr-1.5 text-slate-400" />No spam &mdash; we only contact you about your inquiry</span>
              <span className="flex items-center"><BadgeCheck size={13} className="mr-1.5 text-slate-400" />Free to submit. You only pay when lessons begin.</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ================================================================
          STICKY MOBILE CTA
          ================================================================ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-blue-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:hidden">
        <a href="#parent-inquiry" className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700">
          Request a Tutor Match
          <ArrowRight size={16} className="ml-2" />
        </a>
      </div>
    </div>
  );
};

export default TuitionHome;
