
import React, { useState } from 'react';
import { Section, Button } from '../components/Components';
import { SERVICES } from '../constants';
import { Link } from 'react-router-dom';
import { CheckCircle2, BookOpen, GraduationCap, School, ChevronDown, Star, TrendingUp, Users, Target, Zap } from 'lucide-react';

const TuitionHome: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How long does the matching process take?",
      a: "Usually 2-5 business days. We analyze your needs, screen candidates, and match the right tutor based on learning style and expertise."
    },
    {
      q: "What are the typical rates?",
      a: "Primary: $40-55/hr | Secondary: $50-75/hr | JC: $65-90/hr. One-to-one at your home. No upfront fees—pay per lesson."
    },
    {
      q: "What if the tutor isn't a good fit?",
      a: "Free tutor swap within the first 2 lessons, no questions asked. Your child's progress is our priority."
    },
    {
      q: "Can I cancel or pause lessons?",
      a: "Yes. Flexible monthly contracts. Pause or cancel with 1 week notice. No lock-in periods."
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 pt-24 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4">
              <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-400/30">
                Singapore's Education Consultancy
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Right Tutor.<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">First Time.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-2xl mx-auto">
              Diagnostic-driven matching that pairs students with vetted educators based on learning needs, not trial and error.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <Button to="/parents" className="px-8 py-4 text-base shadow-2xl shadow-blue-900/50 hover:scale-105 transition-transform">
                Request a Tutor
              </Button>
              <Button to="/tuition/pricing" variant="white" className="px-8 py-4 text-base shadow-xl hover:scale-105 transition-transform">
                View Pricing
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
              <span className="flex items-center"><CheckCircle2 size={14} className="mr-1 text-green-400" />Verified Tutors</span>
              <span className="flex items-center"><CheckCircle2 size={14} className="mr-1 text-green-400" />No Lock-In</span>
              <span className="flex items-center"><CheckCircle2 size={14} className="mr-1 text-green-400" />2-5 Day Match</span>
            </div>
          </div>
        </div>
      </div>

      {/* About Us */}
      <Section className="bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">About Integrated Learnings</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            We're an education consultancy specializing in personalized tutor matching for Singapore families. After witnessing countless students struggle with mismatched tutors—losing time, confidence, and momentum—we built a <strong>diagnostic-first matching system</strong> that identifies learning needs and pairs students with the right educator from day one.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <Target className="text-blue-600 mx-auto mb-3" size={32} />
              <h3 className="font-bold text-slate-900 mb-2">Our Approach</h3>
              <p className="text-sm text-slate-600">Diagnose learning gaps, map learning profiles, match with precision</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <Users className="text-blue-600 mx-auto mb-3" size={32} />
              <h3 className="font-bold text-slate-900 mb-2">Our Tutors</h3>
              <p className="text-sm text-slate-600">Verified educators with proven track records and character references</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <Zap className="text-blue-600 mx-auto mb-3" size={32} />
              <h3 className="font-bold text-slate-900 mb-2">Our Promise</h3>
              <p className="text-sm text-slate-600">Right tutor, first time—or we'll find you another</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Quick Results */}
      <Section className="bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">Real Results</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-green-200">
              <TrendingUp size={36} className="text-green-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-green-700 mb-1">+1.5 Grades</p>
              <p className="text-sm text-slate-600">Average improvement in 12 weeks</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-green-200">
              <Star size={36} className="text-green-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-green-700 mb-1">95%+</p>
              <p className="text-sm text-slate-600">Parent satisfaction rate</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-green-200">
              <Users size={36} className="text-green-600 mx-auto mb-3" />
              <p className="text-3xl font-bold text-green-700 mb-1">250+</p>
              <p className="text-sm text-slate-600">Families matched successfully</p>
            </div>
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section className="bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">How It Works</h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">A simple 3-step process designed to save you time and eliminate guesswork</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4">1</div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Submit Request</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tell us about your child's level, subjects, challenges, and goals. Takes 5 minutes.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4">2</div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">We Match</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Our team analyzes learning needs and matches you with a vetted tutor within 2-5 days.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4">3</div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Start Learning</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Tutor reaches out, schedules first lesson. Track progress via dashboard.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Services */}
      <Section className="bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Comprehensive educational support from Primary to JC level
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => (
            <Link key={service.id} to={service.link} className="group flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 bg-white hover:-translate-y-1">
              <div className="h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 relative">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition">{service.title}</h3>
                <p className="text-sm text-slate-600 flex-1 leading-relaxed">{service.description}</p>
                <span className="mt-4 text-blue-600 font-semibold text-sm flex items-center group-hover:gap-2 transition-all">
                  Learn More <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Education Roadmap */}
      <Section className="bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Singapore Education Roadmap</h2>
          <p className="text-lg text-slate-600 mb-10">
            Navigate PSLE, FSBB, O-Levels, and beyond with our interactive metro map
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <BookOpen className="w-10 h-10 text-blue-600 mb-3 mx-auto" />
              <h4 className="font-bold text-slate-900 mb-2">Primary</h4>
              <p className="text-sm text-slate-600">P4 Streaming & PSLE Strategy</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <School className="w-10 h-10 text-blue-600 mb-3 mx-auto" />
              <h4 className="font-bold text-slate-900 mb-2">Secondary</h4>
              <p className="text-sm text-slate-600">FSBB (G1/G2/G3) & O-Levels</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <GraduationCap className="w-10 h-10 text-blue-600 mb-3 mx-auto" />
              <h4 className="font-bold text-slate-900 mb-2">Tertiary</h4>
              <p className="text-sm text-slate-600">JC, Poly & ITE Pathways</p>
            </div>
          </div>
          
          <Button to="/tuition/roadmap">View Interactive Roadmap</Button>
        </div>
      </Section>

      {/* Why Choose Us */}
      <Section className="bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">Why Choose Us</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Diagnostic Matching", desc: "Included free—no trial and error, just precision matching" },
              { title: "Verified Tutors Only", desc: "Character-vetted educators with proven track records" },
              { title: "Flexible Contracts", desc: "No lock-in. Pause or cancel with 1 week notice" },
              { title: "Free Tutor Swap", desc: "Within first 2 lessons if the fit isn't right" },
              { title: "Real-Time Dashboard", desc: "Track lessons, progress reports, and payments" },
              { title: "Fast Response", desc: "Matching within 2-5 days, support within 4 hours" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start bg-slate-50 p-5 rounded-lg border border-slate-200">
                <CheckCircle2 className="text-blue-600 mr-3 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition font-semibold text-slate-800 text-left"
                >
                  <span className="text-sm md:text-base">{faq.q}</span>
                  <ChevronDown size={18} className={`transition flex-shrink-0 ml-4 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 text-slate-700 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find the Right Tutor?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join 250+ Singapore families who trust our diagnostic-driven matching
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button to="/parents" variant="white" className="text-base px-8 py-4 shadow-2xl hover:scale-105 transition-transform">
              Request a Tutor →
            </Button>
            <Button to="/tuition/contact" className="text-base px-8 py-4 bg-blue-800 hover:bg-blue-900 border-2 border-white/20 hover:scale-105 transition-transform">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TuitionHome;
