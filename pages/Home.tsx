
import React from 'react';
import { Section, Button } from '../components/Components';
import { SERVICES } from '../constants';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertOctagon, BookOpen, GraduationCap, School } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <>
      {/* Hero - Typography Driven (Premium Look) */}
      <div className="bg-primary pt-20 pb-24 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8">
            Personalised Learning.<br />
            <span className="text-secondary text-blue-400">Proven Results.</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-300">
            Academic Tuition • Coursework Guidance • Holiday Programs • Skills Training
          </p>
          <p className="mt-2 max-w-xl mx-auto text-slate-400">
            Guiding Singaporean students with strategic planning from Primary through to Tertiary education.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button to="/parents" className="px-8 py-4 text-lg">Parent Portal</Button>
            <Button to="/roadmap" variant="white" className="px-8 py-4 text-lg">Explore Education Roadmap</Button>
          </div>
        </div>
      </div>

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
               Book Emergency Slot
            </Button>
         </div>
      </div>

      {/* Services */}
      <Section className="bg-white">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-primary">Our Core Services</h2>
          <p className="mt-4 text-xl text-slate-500">Comprehensive support for every stage of the journey.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service) => (
            <Link key={service.id} to={service.link} className="group flex flex-col rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition border border-slate-100">
              <div className="h-56 overflow-hidden bg-slate-200">
                <img src={service.image} alt={service.title} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
              </div>
              <div className="p-6 flex-1 flex flex-col bg-white">
                <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-secondary transition">{service.title}</h3>
                <p className="text-slate-600 flex-1">{service.description}</p>
                <span className="mt-4 text-secondary font-semibold text-sm flex items-center">
                  Learn more &rarr;
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

      {/* Why Us - Text Only */}
      <Section>
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-extrabold text-primary mb-6">Why Integrated Learnings?</h2>
               <p className="text-xl text-slate-500">We go beyond simple tuition. We build academic careers.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
              {[
                "Comprehensive Learning Assessment (CLA)",
                "Specialised FSBB/SBB guidance",
                "O-Level Coursework specialists",
                "Tutors vetted for character & capability",
                "Clear progress tracking dashboards",
                "DSA-Sec & DSA-JC portfolio guidance",
                "Holistic holiday programs",
                "Strong parent communication culture"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <CheckCircle2 className="text-secondary mr-4 flex-shrink-0" size={24} />
                  <span className="text-slate-800 font-medium">{item}</span>
                </div>
              ))}
            </div>
        </div>
      </Section>

      {/* Final CTA for Parents */}
      <div className="bg-white py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-6">Start your child’s personalised learning journey today.</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button to="/parents" className="w-full sm:w-auto text-lg px-8">Parent Sign-Up</Button>
            <Button to="/contact" variant="outline" className="w-full sm:w-auto text-lg px-8">Contact Us</Button>
          </div>
        </div>
      </div>

      {/* Subtle Link for Educators at bottom */}
      <div className="bg-slate-50 py-12 text-center border-t border-slate-100">
         <p className="text-slate-500 text-sm mb-4">Are you a qualified educator looking for students?</p>
         <Link to="/teach" className="text-secondary font-bold hover:underline text-sm">Apply to join our Tutor Network &rarr;</Link>
      </div>
    </>
  );
};

export default Home;
