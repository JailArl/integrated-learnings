
import React, { useEffect, useState } from 'react';
import { Section, Button } from '../components/Components';
import { SERVICES } from '../constants';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2, AlertOctagon, BookOpen, GraduationCap, School, ChevronDown, Star, TrendingUp, Users, Award, Microscope, Target } from 'lucide-react';

const TuitionHome: React.FC = () => {
  const [openFaqParent, setOpenFaqParent] = useState<number | null>(0);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('section') === 'about') {
      const section = document.getElementById('about');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location.search]);

  const parentFaqs = [
    {
      q: "How long does the tutor matching process take?",
      a: "Usually 2-5 business days. We analyze your request, screen candidates, and conduct compatibility checks before assigning a tutor. Once matched, your tutor will reach out to schedule the first lesson."
    },
    {
      q: "What's the typical cost of tuition?",
      a: "Rates vary by level and subject. Primary students: $40-55/hr, Secondary: $50-75/hr, JC: $65-90/hr. One-to-One at your home is standard. We don't charge upfront—you pay only for completed lessons. Premium pricing reflects our diagnostic-driven matching service."
    },
    {
      q: "What if I'm not satisfied with my tutor?",
      a: "We offer a free tutor swap within the first 2 lessons, no questions asked. Your satisfaction is our priority. After that, we encourage a discussion first, but swaps are still possible."
    },
    {
      q: "Can I pause or cancel lessons anytime?",
      a: "Yes. We operate on a flexible monthly contract. You can pause for 1-2 months or cancel with 1 week notice. No lock-in periods or hidden fees."
    },
    {
      q: "Do you offer trial lessons?",
      a: "Not formally, but many tutors offer a 30-min intro call before the first paid lesson. This is perfect for compatibility and a quick learning-style check."
    },
    {
      q: "What's included in diagnostic matching?",
      a: "Our diagnostic matching is a premium service included at no extra cost for families requesting tutors. We evaluate learning profile, identify knowledge gaps, and match the most compatible tutor quickly. It's a curated, high-touch process for families who want the right tutor fast."
    }
  ];
  return (
    <>
      {/* Hero - Premium Minimalist Design */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-28 pb-32 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-block mb-6">
              <span className="bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                Singapore's Premier Education Consultancy
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white mb-8 leading-tight">
              Strategic Learning.<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Measurable Excellence.</span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-slate-300 leading-relaxed font-light">
              From <strong className="text-white font-semibold">diagnostic-driven tutor matching</strong> to long-term academic planning—we engineer success, not hope for it.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <span className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-400" />Trusted by Singapore families</span>
              <span className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-400" />High parent satisfaction</span>
              <span className="flex items-center"><CheckCircle2 size={16} className="mr-2 text-green-400" />Diagnostic-first approach</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button to="/parents" className="px-10 py-5 text-lg shadow-2xl shadow-blue-900/50 hover:scale-105 transition-transform">
              Request a Tutor
            </Button>
            <Button to="/tuition?section=about" variant="white" className="px-10 py-5 text-lg shadow-xl hover:scale-105 transition-transform">
              How We're Different
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-16">
            <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-2xl font-bold text-blue-200 mb-2">Verified</p>
              <p className="text-xs text-slate-300 uppercase tracking-wide">Tutor Network</p>
            </div>
            <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-2xl font-bold text-blue-200 mb-2">Growing</p>
              <p className="text-xs text-slate-300 uppercase tracking-wide">Student Community</p>
            </div>
            <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-2xl font-bold text-blue-200 mb-2">Premium</p>
              <p className="text-xs text-slate-300 uppercase tracking-wide">Matching Service</p>
            </div>
            <div className="text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
              <p className="text-2xl font-bold text-blue-200 mb-2">Fast</p>
              <p className="text-xs text-slate-300 uppercase tracking-wide">Response Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 RESULTS & OUTCOMES SECTION */}
      <Section className="bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Proven Results. Real Outcomes.</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Our students don't just improve—they transform. Here’s what families report.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl border-2 border-green-200 p-8 text-center shadow-sm">
            <TrendingUp size={48} className="text-green-600 mx-auto mb-4" />
            <p className="text-4xl font-bold text-green-700 mb-2">+1.5 Grades</p>
            <p className="text-slate-600">Average improvement within 12 weeks</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-green-200 p-8 text-center shadow-sm">
            <Star size={48} className="text-green-600 mx-auto mb-4" />
            <p className="text-4xl font-bold text-green-700 mb-2">95%</p>
            <p className="text-slate-600">Parent satisfaction rate</p>
          </div>
          <div className="bg-white rounded-xl border-2 border-green-200 p-8 text-center shadow-sm">
            <Users size={48} className="text-green-600 mx-auto mb-4" />
            <p className="text-4xl font-bold text-green-700 mb-2">250+</p>
            <p className="text-slate-600">Families matched successfully</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-8 text-center">
          <p className="text-lg font-semibold mb-4">Ready to request your tutor match?</p>
          <Button to="/parents" variant="white" className="text-lg px-8 py-3">
            Request a Tutor
          </Button>
        </div>
      </Section>



      {/* 👨‍💼 FOUNDER STORY */}
      <Section className="bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">Why I Built Integrated Learnings</h2>
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 mb-8">
            <p className="text-lg leading-relaxed mb-4">
              My son is bright, but we spent <strong>6 months switching between 3 tutors</strong>. Every change cost him time—half a school year drifted, momentum faded, and his confidence slipped.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              When we finally landed the right tutor, he climbed a grade in 8 weeks. I realized the issue isn't finding “a” tutor—it's matching with the right one on the first try.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              After 10+ years in tuition, I realized we could systematize matching. That moment with my son crystallized it: <strong>diagnose learning needs, pinpoint root causes, match with intent</strong>—not luck.
            </p>
            <p className="text-lg leading-relaxed font-semibold text-blue-200">
              Integrated Learnings is that system—practical, evidence-led tutor matching designed to save time and protect confidence.
            </p>
          </div>

          <div className="text-center">
            <p className="text-slate-300 mb-6">Today, we've helped 250+ families get it right the first time. Our mission: <strong>eliminate tutor-shopping waste.</strong></p>
            <Button to="/tuition?section=about" variant="white" className="px-8 py-3 text-lg">
              How Premium Matching Works
            </Button>
          </div>
        </div>
      </Section>

      {/* 🎯 CASE STUDY */}
      <Section className="bg-slate-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-2">Case Study: Zara's Path</h2>
          <p className="text-slate-600">Secondary 3 student, A-Math struggling. Here's what happened.</p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl border border-red-200 p-6">
            <div className="text-center mb-4">
              <p className="text-5xl font-bold text-red-600">F9</p>
              <p className="text-sm text-slate-600">Starting Grade (Term 2)</p>
            </div>
            <h4 className="font-bold text-slate-900 mb-3">The Problem</h4>
            <ul className="text-sm text-slate-700 space-y-2">
              <li>• Weak algebra foundations</li>
              <li>• Exam anxiety affecting performance</li>
              <li>• Parents unsure which tutor to try</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="text-center mb-4">
              <p className="text-lg font-bold text-blue-600">Our Process</p>
              <p className="text-sm text-slate-600">Week 1</p>
            </div>
            <h4 className="font-bold text-slate-900 mb-3">Diagnostic Match</h4>
            <ul className="text-sm text-slate-700 space-y-2">
              <li>✓ Diagnosed weak algebra foundations (not carelessness)</li>
              <li>✓ Identified visual learning preference</li>
              <li>✓ Recognized exam anxiety pattern</li>
              <li>✓ Matched with Mr. Ren (specialist in anxiety + visual teaching)</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-green-300 p-6 border-2">
            <div className="text-center mb-4">
              <p className="text-5xl font-bold text-green-600">C6</p>
              <p className="text-sm text-slate-600">Week 12 (Final Exam)</p>
            </div>
            <h4 className="font-bold text-slate-900 mb-3">The Outcome</h4>
            <ul className="text-sm text-slate-700 space-y-2">
              <li>✓ From F9 to C6 (Sec 3 realistic jump)</li>
              <li>✓ Algebra fundamentals rebuilt</li>
              <li>✓ Exam confidence restored, anxiety managed</li>
              <li>✓ Momentum to push for B in Sec 4</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="font-bold text-slate-900 mb-2">What They Saved vs Trial-and-Error</p>
            <ul className="text-sm text-slate-700 space-y-1 text-left inline-block">
              <li>• Cycles of tutor-swaps over 1–2 months: avoided (time you can't buy back)</li>
              <li>• Confidence damage: avoided</li>
              <li>• First week match: momentum restored</li>
              <li>• Money matters, but time is priceless</li>
            </ul>
            <p className="text-sm text-slate-600 mt-6">This is why we exist. Time is the only resource you can't get back.</p>
          </div>
        </div>
      </Section>

      {/* SOS / Crisis Mode */}
      <div className="bg-red-50 border-y border-red-100 py-12">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
               <div className="flex items-center text-red-700 mb-2">
                 <AlertOctagon className="mr-2" />
                 <span className="font-bold uppercase tracking-wide">Exam Emergency?</span>
               </div>
               <h3 className="text-2xl font-extrabold text-primary">"Save My Grades" Ad-Hoc Sessions</h3>
               <p className="text-slate-700 max-w-2xl mt-2">
                 Exams in 2 weeks? Don't panic. We offer intensive, short-term ad-hoc rescue sessions to spot questions, clarify doubts, and stabilize grades.
               </p>
            </div>
            <Button to="/parents" className="bg-red-600 hover:bg-red-700 text-white border-0 shadow-lg shadow-red-200">
               🚨 Book Emergency Session Now
            </Button>
         </div>
      </div>

      {/* Services - Premium Cards */}
      <Section className="bg-white">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-50 text-secondary px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Our Expertise
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">Comprehensive Educational Services</h2>
          <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From foundational diagnostics to specialized programs—everything your child needs under one roof.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <Link key={service.id} to={service.link} className="group flex flex-col rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-100 bg-white hover:-translate-y-2">
              <div className="h-56 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 relative">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-8 flex-1 flex flex-col bg-white">
                <h3 className="text-2xl font-bold text-primary mb-3 group-hover:text-secondary transition">{service.title}</h3>
                <p className="text-slate-600 flex-1 leading-relaxed">{service.description}</p>
                <span className="mt-6 text-secondary font-bold text-sm flex items-center group-hover:gap-2 transition-all">
                  Explore Service <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* The Too Late Trap (Persuasion) */}
      <Section className="bg-slate-900 text-white rounded-3xl my-8">
         <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white">The "Too Late" Trap</h2>
            <p className="mt-4 text-xl text-slate-400">Most parents wait until exam year. Here is why that fails.</p>
         </div>
         <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
               <h3 className="text-2xl font-bold text-yellow-400 mb-4">Primary 5</h3>
               <p className="text-slate-300 leading-relaxed mb-4">
                 P5 is the "Killer Year". The weighted assessment difficulty spikes, introducing the full SA2 format. If your child struggles in P5, P6 is spent patching holes instead of refining skills.
               </p>
               <p className="font-bold text-white">Start tuition in P5 to build the runway for AL1.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
               <h3 className="text-2xl font-bold text-yellow-400 mb-4">Secondary 3</h3>
               <p className="text-slate-300 leading-relaxed mb-4">
                 The "Honeymoon is Over". Students jump from 4 subjects to 7-8. A-Math and Pure Sciences move fast. Gaps in Sec 3 topics (like Trigonometry or Mole Concept) are fatal for O-Levels.
               </p>
               <p className="font-bold text-white">Sec 3 Foundation determines O-Level L1R5.</p>
            </div>
         </div>
         <div className="text-center mt-12">
            <Button to="/parents" variant="white">Start Early - Contact Us</Button>
         </div>
      </Section>

      {/* Roadmap Snippet - No Image */}
      <Section className="bg-slate-50">
        <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-primary mb-6">Singapore Education Explained Clearly</h2>
            <p className="text-lg text-slate-600 mb-10">
              The path from PSLE to Tertiary education is complex. Use our new interactive Metro Map to navigate P4 Streaming, FSBB (G1/G2/G3), O-Levels, and Poly/JC Routes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
               <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <BookOpen className="w-10 h-10 text-secondary mb-4 mx-auto" />
                  <h4 className="font-bold text-primary mb-2">Primary Foundation</h4>
                  <p className="text-sm text-slate-500">P4 Streaming & PSLE (AL Scoring)</p>
               </div>
               <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <School className="w-10 h-10 text-secondary mb-4 mx-auto" />
                  <h4 className="font-bold text-primary mb-2">Secondary Strategy</h4>
                  <p className="text-sm text-slate-500">FSBB, G3/G2/G1 & O-Levels</p>
               </div>
               <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <GraduationCap className="w-10 h-10 text-secondary mb-4 mx-auto" />
                  <h4 className="font-bold text-primary mb-2">Tertiary Pathways</h4>
                  <p className="text-sm text-slate-500">JC vs Poly vs ITE Routes</p>
               </div>
            </div>
            
            <Button to="/roadmap">View Interactive Flow Map</Button>
        </div>
      </Section>

      {/* Why Us - Premium Version */}
      <Section className="bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <div className="inline-block bg-white border border-blue-200 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider mb-4 text-secondary">
                 The Integrated Learnings Difference
               </div>
               <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-6">Premium Tutor Matching, Done Right</h2>
               <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                 We don’t just list tutors. We run a premium diagnostic-driven matching service so parents can request the right tutor quickly—then we track progress with clarity.
               </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Premium Diagnostic Matching", desc: "Included when you request a tutor—no extra fees" },
                { title: "Singapore Education Expertise", desc: "FSBB/SBB, DSA, O-Level, PSLE pathway specialists" },
                { title: "Character-Vetted Tutors", desc: "80% rejection rate • Only qualified educators with proven track records" },
                { title: "Real-Time Dashboards", desc: "Parents see lesson schedules, progress reports, and payment history" },
                { title: "Strategic Academic Planning", desc: "DSA-Sec & DSA-JC portfolio guidance with timeline tracking" },
                { title: "Holistic Development", desc: "Holiday boot camps, skills training, and exam rescue sessions" },
                { title: "Transparent Communication", desc: "WhatsApp support, 4-hour response time, monthly parent reviews" },
                { title: "No Long-Term Lock-In", desc: "Flexible contracts, free tutor swap within 2 lessons, pause anytime" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all group">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4 flex-shrink-0 group-hover:bg-blue-200 transition">
                    <CheckCircle2 className="text-secondary" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1 group-hover:text-secondary transition">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </Section>

      {/* Integrated About Section */}
      <Section id="about" className="bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How Premium Matching Works</h2>
            <p className="text-lg text-slate-600">A diagnostic-first approach that gets you the right tutor without trial and error.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-sm border border-blue-100">
              <Microscope className="text-secondary mb-4" size={40} />
              <h3 className="text-lg font-bold text-primary mb-3">1. Diagnose the Real Issue</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We identify whether the struggle is conceptual gaps, exam anxiety, study habits, or learning style—so the match is precise.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-sm border border-blue-100">
              <Target className="text-secondary mb-4" size={40} />
              <h3 className="text-lg font-bold text-primary mb-3">2. Map the Learning Profile</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We assess learning preference, motivation level, and tutoring style fit to avoid mismatches from day one.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-sm border border-blue-100">
              <Users className="text-secondary mb-4" size={40} />
              <h3 className="text-lg font-bold text-primary mb-3">3. Match the Right Tutor</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We select from vetted educators by expertise and personality fit—because the right human connection matters.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-secondary/20 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-primary mb-3">Why Matching Matters</h3>
              <p className="text-slate-600">The real cost is time, confidence, and momentum lost from the wrong fit.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="text-secondary font-bold text-2xl flex-shrink-0">❌</div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Trial & Error</h4>
                  <ul className="text-slate-600 text-sm space-y-1 leading-relaxed">
                    <li>• Weeks lost to mismatched tutors</li>
                    <li>• Confidence drops and frustration builds</li>
                    <li>• Progress stalls while switching</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-green-600 font-bold text-2xl flex-shrink-0">✓</div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Premium Matching</h4>
                  <ul className="text-slate-600 text-sm space-y-1 leading-relaxed">
                    <li>• Diagnostic included with tutor request</li>
                    <li>• Precision match based on learning profile</li>
                    <li>• Fast replacement if the fit isn’t right</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Final CTA - Premium */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to transform your child's academic trajectory?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join Singapore families who trust diagnostic-driven learning.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button to="/parents" variant="white" className="w-full sm:w-auto text-lg px-10 py-5 shadow-2xl hover:scale-105 transition-transform">
              Request a Tutor →
            </Button>
            <Button to="/contact" className="w-full sm:w-auto text-lg px-10 py-5 bg-blue-800 hover:bg-blue-900 border-2 border-white/20 hover:scale-105 transition-transform">
              💬 Chat With Education Consultant
            </Button>
          </div>
          <p className="text-blue-200 text-sm mt-6">
            Premium diagnostic matching included
          </p>
        </div>
      </div>
      {/* FAQ Section */}
      <Section className="bg-slate-50">
        <h2 className="text-3xl font-bold text-primary text-center mb-12">Frequently Asked Questions</h2>
        
        <div className="max-w-3xl mx-auto">
          {/* Parent FAQs Only */}
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
            👨‍👩‍👧 Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {parentFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaqParent(openFaqParent === idx ? null : idx)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition font-bold text-slate-800 text-left"
                >
                  {faq.q}
                  <ChevronDown size={18} className={`transition ${openFaqParent === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaqParent === idx && (
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-slate-700 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Button to="/parents" className="w-full mt-8">Start Your Application →</Button>
        </div>
      </Section>

    </>
  );
};

export default TuitionHome;
