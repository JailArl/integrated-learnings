
import React, { useState, useEffect } from 'react';
import { PageHeader, Section, Button, Card } from '../components/Components';
import { Phone, Mail, Clock, Shield, FileText, AlertCircle, Users, DollarSign, Microscope, Target, BarChart3, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { POLICY_CONTENT, PRIVACY_POLICY_TEXT } from '../constants';
import { useSearchParams } from 'react-router-dom';

export const About: React.FC = () => (
  <>
    <PageHeader title="About Us" subtitle="We don't just teach. We engineer academic success." />
    
    <Section>
       <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
             <div className="inline-block bg-blue-100 text-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-4">Our Philosophy</div>
             <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6 leading-tight">Strategic Pedagogy over "Drilling"</h2>
             <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Integrated Learnings was founded to address a critical flaw in the Singapore tuition market: <strong>The lack of diagnosis.</strong>
             </p>
             <p className="text-slate-600 mb-8 leading-relaxed">
                Most agencies simply throw a tutor at a struggling student and hope for the best. We believe that <span className="text-secondary font-bold">hope is not a strategy</span>. 
                Without understanding <em>why</em> a child is losing marks—be it conceptual gaps, exam anxiety, or careless habits—endless drilling often does more harm than good.
             </p>
             <div className="flex gap-4">
                <Button to="/parents">Start with a Diagnosis</Button>
             </div>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-slate-50 w-32 h-32 rounded-bl-full -mr-8 -mt-8 z-0"></div>
             <div className="relative z-10 space-y-8">
               <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4 text-secondary shrink-0"><FileText size={24} /></div>
                  <div>
                     <h4 className="font-bold text-xl text-primary">The "Holistic" Reality</h4>
                     <p className="text-slate-600 mt-2 text-sm leading-relaxed">"Holistic doesn't mean ignoring grades. It means achieving grades without destroying the child's confidence."</p>
                  </div>
               </div>
               <div className="flex items-start">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4 text-secondary shrink-0"><Shield size={24} /></div>
                  <div>
                     <h4 className="font-bold text-xl text-primary">High-Performance Culture</h4>
                     <p className="text-slate-600 mt-2 text-sm leading-relaxed">We reject ~80% of tutor applicants. We only accept educators who understand the psychology of learning and can build "academic stamina".</p>
                  </div>
               </div>
             </div>
          </div>
       </div>
    </Section>

    <div className="bg-primary py-20 text-white relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
       
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">The Secret Weapon: <span className="text-blue-400">CLA</span></h2>
             <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
                The <strong className="text-white">Comprehensive Learning Assessment (CLA)</strong> is our signature diagnostic tool. 
                Think of it as a medical checkup for your child's academic health before we prescribe the medicine (Tuition).
             </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
             <div className="bg-white/10 p-8 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/15 transition">
                <Microscope className="text-blue-400 mb-4" size={40} />
                <h3 className="text-xl font-bold text-white mb-3">1. Identify Hidden Gaps</h3>
                <p className="text-slate-300">We pinpoint exactly which topics (e.g., P4 Fractions) are causing P6 failures. It's often not the current chapter that is the problem.</p>
             </div>
             <div className="bg-white/10 p-8 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/15 transition">
                <Target className="text-blue-400 mb-4" size={40} />
                <h3 className="text-xl font-bold text-white mb-3">2. Analyze Behavior</h3>
                <p className="text-slate-300">Is it a lack of knowledge, or a panic response during exams? We test for carelessness, anxiety, and time management issues.</p>
             </div>
             <div className="bg-white/10 p-8 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/15 transition">
                <BarChart3 className="text-blue-400 mb-4" size={40} />
                <h3 className="text-xl font-bold text-white mb-3">3. Build The Roadmap</h3>
                <p className="text-slate-300">You receive a concrete 6-month plan to bridge the gap before the major exams. No guesswork.</p>
             </div>
          </div>
          
          <div className="text-center">
             <Button to="/parents" variant="white" className="px-10 py-4 text-lg font-bold shadow-xl shadow-blue-900/50">Book a CLA Session ($80)</Button>
             <p className="text-xs text-slate-400 mt-4 tracking-wide uppercase">Available exclusively in the Parent Dashboard</p>
          </div>
       </div>
    </div>

    <Section>
        <div className="max-w-5xl mx-auto">
           <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-4">Why Parents Trust Integrated Learnings</h2>
              <p className="text-slate-500">We are not a mass-market agency. We are a boutique educational consultancy.</p>
           </div>
           
           <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="text-xl font-bold text-primary mb-3">Data-Driven Matching</h3>
                 <p className="text-slate-600 leading-relaxed">
                    We don't just match based on location. We match based on <strong className="text-secondary">Learning Style</strong>. 
                    An anxious student needs a nurturing mentor; a complacent student needs a strict strategist. 
                    We use the data from your signup profile to find the perfect fit.
                 </p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="text-xl font-bold text-primary mb-3">Long-Term Vision</h3>
                 <p className="text-slate-600 leading-relaxed">
                    We prepare students for the next stage, not just the next test. 
                    Our Primary tuition prepares for Secondary transition; our Secondary tuition builds the foundation for JC/Poly. 
                    We are always looking 3 years ahead.
                 </p>
              </div>
           </div>
           
           <div className="mt-16 text-center bg-slate-50 p-8 rounded-2xl border border-slate-200">
              <h3 className="text-2xl font-bold text-primary mb-4">Ready to fix the root cause?</h3>
              <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                 Stop wasting time on ineffective drilling. Let us diagnose the issue and match you with a tutor who can actually solve it.
              </p>
              <div className="flex justify-center gap-4">
                 <Button to="/parents">Get Started</Button>
                 <Button to="/contact" variant="outline">Speak to Consultant</Button>
              </div>
           </div>
        </div>
    </Section>
  </>
);

export const Policies: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'parents' | 'tutors'>('parents');

  useEffect(() => {
    if (searchParams.get('tab') === 'tutors') {
      setActiveTab('tutors');
    }
  }, [searchParams]);

  return (
    <>
      <PageHeader 
        title="Terms of Service & Policies" 
        subtitle="Transparent guidelines for Parents and Students." 
      />
      <Section>
        {activeTab === 'tutors' && (
          <div className="flex justify-center mb-16">
            <div className="bg-amber-100 p-2 rounded-lg inline-flex items-center text-amber-900 text-sm font-bold border border-amber-300">
              <AlertCircle size={16} className="mr-2" />
              Viewing Tutor Partner Policies. <button onClick={() => setActiveTab('parents')} className="underline ml-2">Switch back to Parent View</button>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          {activeTab === 'parents' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                 <h2 className="text-2xl font-bold text-primary">Client Service Agreement</h2>
                 <p className="text-slate-500 mt-2">Standard terms for engaging tuition services.</p>
              </div>

              <div className="grid gap-8">
                <Card title="Cancellations & Attendance">
                  <div className="flex items-start mb-4">
                    <AlertCircle className="text-amber-500 mr-3 flex-shrink-0 mt-1" />
                    <p className="text-sm text-slate-600 italic">
                      Consistent attendance is the #1 factor in academic improvement.
                    </p>
                  </div>
                  <ul className="space-y-4">
                    {POLICY_CONTENT.parents.cancellation.map((item, i) => (
                      <li key={i} className="flex items-start text-slate-700">
                        <span className="mr-3 text-secondary font-bold">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="Payments & Commitment">
                  <ul className="space-y-4">
                    {POLICY_CONTENT.parents.payments.map((item, i) => (
                      <li key={i} className="flex items-start text-slate-700">
                        <span className="mr-3 text-secondary font-bold">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="Privacy Policy (PDPA)">
                  <div className="flex items-center mb-4 text-secondary">
                    <Shield className="mr-2" size={20} />
                    <span className="font-bold">Your data is protected.</span>
                  </div>
                  <p className="text-slate-600 whitespace-pre-line text-sm leading-relaxed">
                    {PRIVACY_POLICY_TEXT}
                  </p>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'tutors' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg mb-8">
                 <div className="flex items-start">
                    <AlertCircle className="text-amber-600 mr-4 flex-shrink-0" />
                    <div>
                       <h3 className="font-bold text-amber-900">Partner Section</h3>
                       <p className="text-amber-800 text-sm mt-1">
                          The following terms apply <strong>strictly to registered tutors</strong>. 
                          If you are a parent, please <button onClick={() => setActiveTab('parents')} className="underline font-bold">switch to the Parent tab</button> to avoid confusion regarding fees.
                       </p>
                    </div>
                 </div>
               </div>

              <div className="grid gap-8">
                <Card title="Engagement Models">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                      <h4 className="font-bold text-primary mb-4 flex items-center">
                        <Users className="mr-2 text-secondary" size={18} /> Referral Model
                      </h4>
                      <ul className="space-y-3">
                        {POLICY_CONTENT.tutors.referral.map((item, i) => (
                          <li key={i} className="text-slate-600 text-sm list-disc list-inside">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                      <h4 className="font-bold text-primary mb-4 flex items-center">
                        <Shield className="mr-2 text-secondary" size={18} /> Managed Model
                      </h4>
                      <ul className="space-y-3">
                        {POLICY_CONTENT.tutors.managed.map((item, i) => (
                          <li key={i} className="text-slate-600 text-sm list-disc list-inside">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card title="Code of Conduct">
                   <p className="text-slate-600 mb-4">We hold our educators to the highest standard.</p>
                   <div className="space-y-4">
                      <div className="flex gap-4">
                         <Clock className="text-secondary shrink-0" />
                         <div>
                            <h5 className="font-bold text-slate-800">Punctuality</h5>
                            <p className="text-sm text-slate-600">Arrive 5-10 minutes early. Late arrival over 15mins without valid reason is grounds for immediate termination.</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <FileText className="text-secondary shrink-0" />
                         <div>
                            <h5 className="font-bold text-slate-800">Preparation</h5>
                            <p className="text-sm text-slate-600">You are expected to have a lesson plan. "Wing-ing it" is strictly prohibited.</p>
                         </div>
                      </div>
                   </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
};

export const TutorLanding: React.FC = () => (
  <>
    <div className="bg-slate-900 text-white pt-24 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
           <div className="inline-block bg-blue-600/30 text-blue-200 border border-blue-500/30 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-6">
              For Educators
           </div>
           <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
              Focus on Teaching.<br />
              <span className="text-blue-400">We'll Handle The Rest.</span>
           </h1>
           <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Join Singapore's most professional tuition network. Guaranteed lesson protection, automated billing, and a steady stream of serious students.
           </p>
           <Button to="/tutors" variant="white" className="px-10 py-4 text-lg shadow-xl">Apply as Partner Tutor</Button>
        </div>
    </div>

    <Section>
       <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-primary mb-4">Tired of the "Freelance Grind"?</h2>
          <p className="text-slate-500">The typical private tutor lifecycle is broken.</p>
       </div>
       <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition text-center">
             <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-red-500" size={32} />
             </div>
             <h4 className="font-bold text-lg text-slate-800 mb-2">Last-Minute Cancellations</h4>
             <p className="text-slate-600 text-sm">"Cher, can cancel today?" 1 hour before class. You lose income and time.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition text-center">
             <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="text-red-500" size={32} />
             </div>
             <h4 className="font-bold text-lg text-slate-800 mb-2">Chasing Payments</h4>
             <p className="text-slate-600 text-sm">Awkwardly reminding parents to PayNow you every month.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-red-100 shadow-sm hover:shadow-md transition text-center">
             <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-red-500" size={32} />
             </div>
             <h4 className="font-bold text-lg text-slate-800 mb-2">Unfiltered Clients</h4>
             <p className="text-slate-600 text-sm">Students who aren't serious, or parents who haggle over $5/hr.</p>
          </div>
       </div>
    </Section>

    <Section className="bg-slate-50 rounded-3xl">
       <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-primary mb-4">The "Managed Model" Advantage</h2>
             <p className="text-slate-500">We treat you like a professional, not a gig worker.</p>
          </div>

          <div className="space-y-8">
             <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <div className="bg-green-100 p-4 rounded-full text-green-600 shrink-0">
                   <Shield size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-primary mb-2">100% Lesson Protection</h3>
                   <p className="text-slate-600">If a parent cancels less than 24 hours in advance, <strong className="text-green-600">you still get paid</strong>. We enforce the policy so you don't have to be the "bad guy".</p>
                </div>
             </div>

             <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <div className="bg-blue-100 p-4 rounded-full text-blue-600 shrink-0">
                   <TrendingUp size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-primary mb-2">Automated Billing & Payouts</h3>
                   <p className="text-slate-600">Parents pay us via the platform. We pay you a consolidated salary by the 7th of every month. No more awkward payment texts.</p>
                </div>
             </div>

             <div className="flex flex-col md:flex-row gap-8 items-center bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <div className="bg-purple-100 p-4 rounded-full text-purple-600 shrink-0">
                   <CheckCircle2 size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-primary mb-2">Vetted High-Intent Students</h3>
                   <p className="text-slate-600">Our parents pay a premium for results. You get students who actually want to learn, matched to your teaching style.</p>
                </div>
             </div>
          </div>
       </div>
    </Section>

    <Section>
       <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-primary mb-12">Who we are looking for</h2>
          <div className="grid md:grid-cols-3 gap-8">
             <div className="p-6 border border-slate-200 rounded-xl">
                <div className="font-bold text-xl text-slate-800 mb-2">Full-Time Tutors</div>
                <p className="text-sm text-slate-500">Graduates with 2+ years experience. Deep knowledge of MOE syllabus.</p>
             </div>
             <div className="p-6 border border-slate-200 rounded-xl">
                <div className="font-bold text-xl text-slate-800 mb-2">MOE / Ex-MOE</div>
                <p className="text-sm text-slate-500">Current or former school teachers familiar with exam marking standards.</p>
             </div>
             <div className="p-6 border border-slate-200 rounded-xl">
                <div className="font-bold text-xl text-slate-800 mb-2">Specialists</div>
                <p className="text-sm text-slate-500">Experts in niche areas like O-Level Art, D&T, or Coding.</p>
             </div>
          </div>
          <div className="mt-12 bg-amber-50 p-6 rounded-lg border border-amber-200 inline-block text-left">
             <div className="flex items-start">
                <AlertCircle className="text-amber-600 mr-3 mt-1" />
                <div>
                   <h4 className="font-bold text-amber-900 text-sm">Strict Selection Process</h4>
                   <p className="text-amber-800 text-xs mt-1">We require a character assessment and scenario test during sign-up. We prioritize attitude over just paper qualifications.</p>
                </div>
             </div>
          </div>
       </div>
    </Section>

    <div className="bg-primary py-24 text-center">
       <h2 className="text-3xl font-bold text-white mb-6">Ready to upgrade your teaching career?</h2>
       <Button to="/tutors" variant="white" className="px-10 py-4 text-lg">Start Application</Button>
    </div>
  </>
);

export const CourseworkSupport: React.FC = () => (
  <>
    <PageHeader title="O-Level Coursework Support" subtitle="D&T and Art. The 70% weightage that makes or breaks the grade." />
    <Section>
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
          <h3 className="text-lg font-bold text-amber-900 mb-2">Critical for O-Levels</h3>
          <p className="text-amber-800">
            For O-Level D&T and Art, coursework is not homework—it is the exam. It requires consistent documentation over months. 
            Many students struggle not with creativity, but with the <strong>rigorous documentation</strong> required by Cambridge.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-primary mb-4">Design & Technology</h3>
          <ul className="space-y-2 text-slate-600 text-sm">
            <li>• Design Journal rigor</li>
            <li>• Sketching techniques</li>
            <li>• Artifact construction help</li>
            <li>• Time management</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-primary mb-4">Art (O-Level)</h3>
          <ul className="space-y-2 text-slate-600 text-sm">
            <li>• Prep work (SOVA)</li>
            <li>• Portfolio development</li>
            <li>• Medium experimentation</li>
            <li>• Final piece timeline</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-xl font-bold text-primary mb-4">Food & Consumer Ed</h3>
          <ul className="space-y-2 text-slate-600 text-sm">
            <li>• Coursework documentation</li>
            <li>• Nutrition analysis</li>
            <li>• Practical planning</li>
          </ul>
        </div>
      </div>
      
      <div className="text-center">
        <Button to="/parents">Sign Up for Coursework Support</Button>
      </div>
    </Section>
  </>
);

export const Contact: React.FC = () => (
  <>
    <PageHeader title="Contact Us" />
    <Section>
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-6">Get in Touch</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <Phone className="text-secondary mr-4 mt-1" />
              <div>
                <p className="font-bold">WhatsApp / Phone</p>
                <p className="text-slate-600">9888 2675</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="text-secondary mr-4 mt-1" />
              <div>
                <p className="font-bold">Email</p>
                <p className="text-slate-600">manage.integrated.learnings@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="text-secondary mr-4 mt-1" />
              <div>
                <p className="font-bold">Operating Hours</p>
                <p className="text-slate-600">Mon - Sun: 9am - 9pm</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-100">
          <h3 className="text-xl font-bold mb-4">Send us a message</h3>
          <form className="space-y-4">
            <input className="w-full border p-3 rounded-lg" placeholder="Name" />
            <input className="w-full border p-3 rounded-lg" placeholder="Phone Number" />
            <textarea className="w-full border p-3 rounded-lg h-32" placeholder="How can we help?" />
            <Button className="w-full">Send Message</Button>
          </form>
        </div>
      </div>
    </Section>
  </>
);

export const ExtraLearnings: React.FC = () => (
  <>
    <PageHeader title="Extra Learnings" subtitle="Developing skills beyond the classroom." />
    <Section>
      <p className="text-center text-lg text-slate-600 max-w-3xl mx-auto mb-16">
        Academic success is important, but character and life skills define the future. 
        Our Extra Learnings programs are designed to complement school work.
      </p>

      <div className="space-y-12">
        {[
          { 
            title: "AI & Coding", 
            subtitle: "Logic & Future Readiness",
            desc: "From Scratch for primary schoolers to Python for secondary students. We teach the logic behind the code, fostering problem-solving skills that translate to Math and Science.",
            img: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "Financial Literacy", 
            subtitle: "Value of Money",
            desc: "Teaching kids the difference between 'Price' and 'Value'. Concepts of saving, compound interest, and budgeting introduced in age-appropriate games.",
            img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop"
          },
          { 
            title: "Sports Coaching", 
            subtitle: "Basketball & Badminton",
            desc: "Dedicated coaching for Basketball and Badminton. We focus on court discipline, handling defeat, and the direct correlation between practice and improvement on the court.",
            img: "https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=800&auto=format&fit=crop"
          }
        ].map((item, i) => (
          <div key={i} className="flex flex-col md:flex-row gap-8 items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <div className="w-full md:w-1/3">
              <img src={item.img} alt={item.title} className="rounded-lg object-cover w-full h-48" />
            </div>
            <div className="w-full md:w-2/3">
              <h3 className="text-2xl font-bold text-primary">{item.title}</h3>
              <p className="text-secondary font-semibold mb-3">{item.subtitle}</p>
              <p className="text-slate-600 leading-relaxed mb-6">{item.desc}</p>
              <Button to="/parents">Sign Up Now</Button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  </>
);

export const HolidayPrograms: React.FC = () => (
  <>
    <PageHeader title="Holiday Programs" subtitle="Intensive boosts during school breaks." />
    <Section>
       <div className="grid md:grid-cols-2 gap-8">
         {[
           {
             title: "PSLE Intensive Bootcamp",
             time: "June & September Holidays",
             desc: "Focused drilling on open-ended Science questions and Math heuristics. 4 days x 4 hours."
           },
           {
             title: "O-Level Final Sprint",
             time: "September Holidays",
             desc: "TYS (Ten Year Series) intensive. Spotting trends and time management drills under exam conditions."
           },
           {
             title: "Sec 1 Head Start",
             time: "Nov/Dec Holidays",
             desc: "Bridging the gap between Primary and Secondary. Introduction to Algebra and Lab Safety."
           },
           {
             title: "DSA Portfolio Workshop",
             time: "March & June Holidays",
             desc: "For P5/P6 students. How to write a personal statement, interview etiquette, and portfolio compilation."
           },
           {
             title: "O-Level Coursework Clinic",
             time: "June Holidays",
             desc: "Dedicated studio time with tutors to rush coursework documentation and artifact building before submission."
           }
         ].map((prog, i) => (
           <div key={i} className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition">
             <div className="flex justify-between items-start mb-4">
               <h3 className="font-bold text-xl text-primary">{prog.title}</h3>
               <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">{prog.time}</span>
             </div>
             <p className="text-slate-600 mb-6">{prog.desc}</p>
             <Button to="/parents">Sign Up Now</Button>
           </div>
         ))}
       </div>
    </Section>
  </>
);
