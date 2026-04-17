
import React, { useState, useEffect } from 'react';
import { PageHeader, Section, Button, Card } from '../components/Components';
import { Phone, Mail, Clock, Shield, FileText, AlertCircle, Users, DollarSign, Microscope, Target, BarChart3, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { POLICY_CONTENT, PRIVACY_POLICY_TEXT } from '../constants';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';

export const About: React.FC = () => (
  <div>
    <PageHeader title="About Us" subtitle="Find the right learning pathway for your child. Not through trial and error." />
    
    {/* Hero Problem Section */}
    <Section className="bg-gradient-to-br from-blue-50 to-white py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
            The Right Learning Path, From Day One.
          </h2>
          <p className="text-xl text-slate-600 mb-6 leading-relaxed">
            Parents lose precious time guessing what their child needs. 
            We diagnose the real issue and guide you to the right solution from the start.
          </p>
          <p className="text-lg text-slate-500">
            Our <strong className="text-secondary">Diagnostic-First Advisory</strong> removes guesswork. 
            One assessment, one clear recommendation, one path forward.
          </p>
        </div>

        {/* Logo & Credibility Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 text-white rounded-3xl shadow-2xl p-12 border border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="inline-block bg-white/5 border border-white/10 rounded-2xl p-6 shadow-inner md:flex-shrink-0">
              <img 
                src="/images/logo.png" 
                alt="Integrated Learnings logo" 
                className="h-28 md:h-32 w-auto object-contain"
              />
            </div>
            <div className="text-center md:text-left flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">Integrated Learnings</h3>
              <p className="text-slate-200 text-base leading-relaxed mb-4">
                Singapore's professional learning advisory. We help parents skip the guesswork and find the right learning support for their child.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                <span className="flex items-center text-slate-300"><CheckCircle2 size={16} className="mr-2 text-green-400" />Diagnostic-driven</span>
                <span className="flex items-center text-slate-300"><CheckCircle2 size={16} className="mr-2 text-green-400" />Parent-centric</span>
                <span className="flex items-center text-slate-300"><CheckCircle2 size={16} className="mr-2 text-green-400" />Verified educators</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
    
    {/* Premium Matching Section */}
    <Section>
       <div className="max-w-5xl mx-auto">
           <div className="text-center mb-12">
             <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How Our Advisory Works</h2>
             <p className="text-lg text-slate-600">A diagnostic-first approach that finds the right learning pathway without trial and error.</p>
           </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
             <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-sm border border-blue-100">
                <Microscope className="text-secondary mb-4" size={40} />
                <h3 className="text-lg font-bold text-primary mb-3">1. Pinpoint the Real Issue</h3>
               <p className="text-slate-600 text-sm leading-relaxed">
                 We run diagnostic tests to uncover why your child is struggling—is it conceptual gaps, exam anxiety, study habits, or something else? Understanding the root cause is everything.
               </p>
             </div>
             <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-sm border border-blue-100">
                <Target className="text-secondary mb-4" size={40} />
                <h3 className="text-lg font-bold text-primary mb-3">2. Map Their Learning Profile</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We assess learning style, motivation level, and tutoring preference. A shy student needs encouragement, not pressure. A complacent one needs accountability.
                </p>
             </div>
             <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-sm border border-blue-100">
                <Users className="text-secondary mb-4" size={40} />
                <h3 className="text-lg font-bold text-primary mb-3">3. Recommend the Right Path</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Based on our findings, we recommend the right learning approach — whether that's a matched educator, a study strategy, or enrichment support.
                </p>
             </div>
          </div>

          <div className="bg-slate-50 border-2 border-secondary/20 rounded-2xl p-8 md:p-12">
             <div className="text-center mb-8">
               <h3 className="text-2xl font-bold text-primary mb-3">Why Diagnosis Matters</h3>
               <p className="text-slate-600">The real cost is time, confidence, and momentum lost from the wrong approach.</p>
             </div>
             <div className="grid md:grid-cols-2 gap-8">
                <div className="flex gap-4">
                   <div className="text-secondary font-bold text-2xl flex-shrink-0">❌</div>
                   <div>
                       <h4 className="font-bold text-slate-800 mb-2">The Typical Path (Trial & Error)</h4>
                      <ul className="text-slate-600 text-sm space-y-1 leading-relaxed">
                         <li>• Try Tutor #1: Wrong teaching style (4 weeks wasted)</li>
                         <li>• Try Tutor #2: No chemistry with student (6 weeks wasted)</li>
                         <li>• Try Tutor #3: Finally works, but 3 months behind</li>
                         <li>• Momentum drops and confidence suffers</li>
                      </ul>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="text-green-600 font-bold text-2xl flex-shrink-0">✓</div>
                   <div>
                       <h4 className="font-bold text-slate-800 mb-2">Our Diagnostic Advisory Process</h4>
                      <ul className="text-slate-600 text-sm space-y-1 leading-relaxed">
                         <li>• Diagnostic session included with every inquiry</li>
                         <li>• Precision recommendation based on learning profile</li>
                         <li>• Fast replacement if the fit isn’t right</li>
                         <li>• Transparent, premium service with no hidden fees</li>
                      </ul>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </Section>

    <div className="bg-primary py-20 text-white relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
       
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
             <div className="inline-block bg-blue-400/20 border border-blue-400/30 px-4 py-2 rounded-full text-sm font-bold mb-6">
                Professional Advisory • By Request
             </div>
             <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Start Your Learning Assessment</h2>
             <p className="text-slate-200 text-lg leading-relaxed mb-6">
               We run a diagnostic, map the learning profile, and recommend the right pathway—so you skip trial and error.
             </p>
             <p className="text-blue-200 text-sm italic">
               Professional advisory included with every inquiry.
             </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-2xl mx-auto">
             <div className="bg-white/10 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                <Calendar className="text-blue-400 mb-3" size={32} />
                <h4 className="font-bold text-white mb-2">Timeline</h4>
                <p className="text-slate-300 text-sm">We typically recommend a pathway within 3–7 days after your inquiry is reviewed.</p>
             </div>
             <div className="bg-white/10 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                <Users className="text-blue-400 mb-3" size={32} />
                <h4 className="font-bold text-white mb-2">Who It’s For</h4>
                <div className="text-slate-300 text-sm space-y-2">
                  <p>Primary to JC/IB/IGCSE students who need the right learning guidance.</p>
                  <p className="text-slate-400 text-xs italic">We also support enrichment, specialised needs, and international students adapting to Singapore’s curriculum.</p>
                </div>
             </div>
          </div>

          <div className="text-center mb-8">
             <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg px-4 py-2 inline-block mb-6">
                <p className="text-amber-200 text-sm font-bold">
                  ✓ Diagnostic advisory included • Transparent process • No hidden fees
                </p>
             </div>
             <div>
                 <Button to="/tuition#parent-inquiry" variant="white" className="px-12 py-4 text-lg font-bold shadow-xl shadow-blue-900/50">
                   Get Learning Assessment
                   <span className="block text-xs font-normal mt-1">Free — no account needed</span>
                 </Button>
             </div>
          </div>

           <p className="text-center text-slate-400 text-xs mt-6">
             Inquiries reviewed within 48 hours
           </p>
       </div>
    </div>

    <Section>
       <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
             <h2 className="text-3xl font-bold text-primary mb-4">Why Parents Choose Integrated Learnings</h2>
             <p className="text-slate-600">We're not a tutoring marketplace. We're a partner in your child's academic journey.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
             <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-primary mb-3 flex items-center">
                  <Microscope size={24} className="mr-3 text-secondary" />
                  Diagnosis Before Drilling
                </h3>
                <p className="text-slate-600 leading-relaxed">
                   We never assume the problem. Subject knowledge gaps, exam anxiety, or careless mistakes—each needs a different approach. We find the root cause first.
                </p>
             </div>
             <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-primary mb-3 flex items-center">
                  <TrendingUp size={24} className="mr-3 text-secondary" />
                  Long-Term Planning
                </h3>
                <p className="text-slate-600 leading-relaxed">
                   We prepare students for the next milestone, not just the next test. Your child's learning plan follows a 2–3 year roadmap aligned to Singapore's education system.
                </p>
             </div>
             <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-primary mb-3 flex items-center">
                  <Shield size={24} className="mr-3 text-secondary" />
                  Vetted Educators
                </h3>
                <p className="text-slate-600 leading-relaxed">
                   Our educators are screened for subject expertise, teaching quality, and the soft skills that build student confidence. We reject those who don't meet our bar.
                </p>
             </div>
             <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-bold text-primary mb-3 flex items-center">
                  <Clock size={24} className="mr-3 text-secondary" />
                  Ongoing Support
                </h3>
                <p className="text-slate-600 leading-relaxed">
                   We don't disappear after the first lesson. We track progress, support both educator and student, and step in if adjustments are needed.
                </p>
             </div>
          </div>

           <div className="mt-16 text-center bg-gradient-to-r from-blue-50 to-slate-50 p-8 rounded-2xl border border-slate-200">
             <h3 className="text-2xl font-bold text-primary mb-4">Ready to Skip the Guesswork?</h3>
             <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
               A diagnostic-first approach is the fastest path to the right learning solution for your child.
             </p>
             <Button to="/tuition#parent-inquiry" className="px-10 py-3 font-bold text-lg">
               Get Learning Assessment
             </Button>
             <p className="text-xs text-slate-500 mt-3">Free — no account needed</p>
           </div>
       </div>
    </Section>

    <div className="bg-primary py-20 text-white relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
       
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-12">
             <div className="inline-block bg-blue-400/20 border border-blue-400/30 px-4 py-2 rounded-full text-sm font-bold mb-6">
                Professional Advisory • By Request
             </div>
             <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Start Your Learning Assessment</h2>
             <p className="text-slate-200 text-lg leading-relaxed mb-6">
               Your inquiry includes a diagnostic review, learning style analysis, and a personalised recommendation so we can guide you to the right pathway.
             </p>
             <p className="text-blue-200 text-sm italic">
               Professional advisory included with every inquiry.
             </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-2xl mx-auto">
             <div className="bg-white/10 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                <Calendar className="text-blue-400 mb-3" size={32} />
                <h4 className="font-bold text-white mb-2">Timeline</h4>
                <p className="text-slate-300 text-sm">We typically recommend a pathway within 3–7 days after your inquiry is reviewed.</p>
             </div>
             <div className="bg-white/10 p-6 rounded-xl border border-white/10 backdrop-blur-sm">
                <Users className="text-blue-400 mb-3" size={32} />
                <h4 className="font-bold text-white mb-2">Who It’s For</h4>
                <div className="text-slate-300 text-sm space-y-2">
                  <p>Primary to JC/IB/IGCSE students who need the right learning guidance.</p>
                  <p className="text-slate-400 text-xs italic">We also support enrichment, specialised needs, and international students adapting to Singapore’s curriculum.</p>
                </div>
             </div>
          </div>

          <div className="text-center mb-8">
             <div className="bg-amber-500/20 border border-amber-400/30 rounded-lg px-4 py-2 inline-block mb-6">
                 <p className="text-amber-200 text-sm font-bold">
                  ✓ Diagnostic advisory included • Transparent process • No hidden fees
                 </p>
             </div>
             <div>
                 <Button to="/tuition#parent-inquiry" variant="white" className="px-12 py-4 text-lg font-bold shadow-xl shadow-blue-900/50">
                   Get Learning Assessment
                   <span className="block text-xs font-normal mt-1">Free — no account needed</span>
                 </Button>
             </div>
          </div>

           <p className="text-center text-slate-400 text-xs mt-6">
             Inquiries reviewed within 48 hours
           </p>
       </div>
    </div>

    <Section>
      <div className="mt-20 pt-12 border-t border-slate-200">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">Singapore's Education Roadmap</h2>
          <p className="text-slate-600">Key milestones your child will face. We help families navigate them strategically.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-6">Primary Years</h3>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <h4 className="font-bold text-primary mb-2">P4 Subject-Based Banding</h4>
                <p className="text-sm text-slate-600">Students are recommended subject combinations based on exam performance. The right support helps prepare for this critical transition.</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                <h4 className="font-bold text-primary mb-2">PSLE (Primary School Leaving Exam)</h4>
                <p className="text-sm text-slate-600">The first standardized national exam. Learning support focuses on exam technique, time management, and confidence building.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-primary mb-6">Secondary Years</h3>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <h4 className="font-bold text-primary mb-2">Lower Secondary (Sec 1–2)</h4>
                <p className="text-sm text-slate-600">Foundation years. Subject difficulty increases significantly. Educators build strong fundamentals to prevent later struggles.</p>
              </div>
              <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
                <h4 className="font-bold text-primary mb-2">Upper Secondary (Sec 3–4) & O-Levels</h4>
                <p className="text-sm text-slate-600">Critical exam that determines polytechnic/JC eligibility. Focus shifts to exam strategy and subject mastery.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold text-primary mb-6">JC & Beyond</h3>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <h4 className="font-bold text-primary mb-2">Junior College (A-Levels)</h4>
                <p className="text-sm text-slate-600">Specialized path to university. Subject demand intensifies. Educators provide targeted support for A-Level subjects.</p>
              </div>
              <div className="bg-purple-50 p-5 rounded-lg border border-purple-200">
                <h4 className="font-bold text-primary mb-2">Polytechnic Path</h4>
                <p className="text-sm text-slate-600">3-year diploma with workplace learning. Educators help students succeed in practical, industry-focused education.</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-primary mb-6">DSA & Special Pathways</h3>
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-lg border border-slate-200">
                <h4 className="font-bold text-primary mb-2">Direct School Admission (DSA-Sec)</h4>
                <p className="text-sm text-slate-600">Talent-based entry to secondary school before PSLE results. Educators help develop subject expertise or skills for application.</p>
              </div>
              <div className="bg-green-50 p-5 rounded-lg border border-green-200">
                <h4 className="font-bold text-primary mb-2">Integrated Programme (IP)</h4>
                <p className="text-sm text-slate-600">Select schools combine O-Levels into a 6-year curriculum. Requires strategic planning and sustained excellence.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gradient-to-r from-secondary to-blue-700 p-8 rounded-2xl text-white text-center">
          <h3 className="text-2xl font-bold mb-3">Every Milestone Needs the Right Support</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto leading-relaxed">
            From PSLE to O-Levels to polytechnic—each transition is an opportunity to build momentum or lose it. 
            Our diagnostic matching ensures your child has consistent, expert support aligned to their needs.
          </p>
          <Button to="/tuition#parent-inquiry" variant="white" className="px-8 py-3 font-bold shadow-lg">
            Get Assessment (Worth $120 - Free)
          </Button>
          <p className="text-blue-200 text-xs mt-3">5-8 families accepted weekly</p>
        </div>
      </div>
    </Section>
  </div>
);

export const Policies: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'parents' | 'tutors'>('parents');
  const [acknowledged, setAcknowledged] = useState(false);

  const ackFlow = searchParams.get('ackFlow') === 'tutor-signup';
  const policyFlowState = (location.state as { pendingSignup?: unknown; returnTo?: string } | null) || null;
  const canContinueSignup = ackFlow && activeTab === 'tutors' && !!policyFlowState?.pendingSignup && !!policyFlowState?.returnTo;

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

        {canContinueSignup && (
          <div className="max-w-4xl mx-auto mb-8 rounded-xl border border-green-200 bg-green-50 p-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-green-800">Tutor Signup Policy Acknowledgement</h3>
            <p className="mt-2 text-sm text-slate-700">
              Please review the tutor policies below. To continue your account creation, acknowledge that you accept these terms, including the 25% service fee for the first 2 months of each assignment.
            </p>
            <label className="mt-4 flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              I have read and agree to the tutor policy terms.
            </label>
            <button
              onClick={() => {
                if (!acknowledged || !policyFlowState?.returnTo || !policyFlowState?.pendingSignup) return;
                navigate(`${policyFlowState.returnTo}?policyAck=1`, {
                  state: {
                    policyAck: true,
                    pendingSignup: policyFlowState.pendingSignup,
                  },
                });
              }}
              disabled={!acknowledged}
              className={`mt-4 inline-flex items-center rounded-lg px-4 py-2 text-sm font-bold transition ${
                acknowledged
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'cursor-not-allowed bg-green-200 text-green-800'
              }`}
            >
              Acknowledge & Continue Signup
            </button>
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

                <Card title="Materials & Resources">
                  <ul className="space-y-4">
                    {POLICY_CONTENT.parents.materials.map((item, i) => (
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
                <Card title="Referral Partnership Model">
                  <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-primary mb-4 flex items-center">
                      <Users className="mr-2 text-secondary" size={18} /> How It Works
                    </h4>
                    <ul className="space-y-3">
                      {POLICY_CONTENT.tutors.referral.map((item, i) => (
                        <li key={i} className="text-slate-600 text-sm flex items-start">
                          <span className="mr-3 text-secondary font-bold">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>

                <Card title="Code of Conduct">
                   <p className="text-slate-600 mb-4">We hold our educators to the highest standard.</p>
                   <div className="space-y-4">
                      <div className="flex gap-4">
                         <Clock className="text-secondary shrink-0" />
                         <div>
                            <h5 className="font-bold text-slate-800">Professionalism</h5>
                            <p className="text-sm text-slate-600">Punctual lessons, well-prepared content, and consistent communication with your student.</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <FileText className="text-secondary shrink-0" />
                         <div>
                            <h5 className="font-bold text-slate-800">Direct Communication</h5>
                            <p className="text-sm text-slate-600">Build a direct relationship with the parent and student. Agree on rates, schedule, and expectations upfront.</p>
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
              Join Singapore's most professional tuition network. Reliable lesson protection, automated billing, and a steady stream of serious students.
             </p>
             <Button to="/teach" variant="white" className="px-10 py-4 text-lg shadow-xl">Apply as Partner Tutor</Button>
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
                   <h3 className="text-xl font-bold text-primary mb-2">Simplified Payment Flow</h3>
                   <p className="text-slate-600">Month 1: Parents pay us the referral fee. Month 2 onwards: You collect directly from parents (we support you with payment reminders and templates). No middleman on ongoing fees.</p>
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
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">📌 For Secondary 4 Parents</h3>
          <p className="text-blue-800">
            This specialized support is tailored for students taking O-Level D&T, Art, or Food & Consumer Education. 
            If your child is in Secondary 4 and needs coursework guidance, this service is recommended for you.
          </p>
        </div>
      </div>

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
        <Button to="/tuition#parent-inquiry">Get Coursework Assessment</Button>
      </div>
    </Section>
  </>
);

export const Contact: React.FC = () => (
  <>
    <PageHeader title="Get Learning Guidance" subtitle="Professional advisory to help your child find the right learning pathway." />
    
    <Section>
      {/* Hero - Dual Audience Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-10 rounded-2xl shadow-xl relative overflow-hidden group hover:shadow-2xl transition h-full flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="text-4xl mb-4">👨‍👩‍👧</div>
            <h2 className="text-2xl font-bold mb-3">For Parents</h2>
            <p className="text-blue-100 mb-6 leading-relaxed">
              Request a tutor and we’ll run a diagnostic to match the right educator quickly—no trial and error.
            </p>
            <div className="mt-auto">
              <Button to="/tuition#parent-inquiry" variant="white" className="w-full group-hover:scale-105 transition">
                📋 Get Diagnostic Assessment
                <span className="block text-xs font-normal mt-1">Value $120 - Waived</span>
              </Button>
              <p className="text-xs text-blue-200 mt-3 text-center">Limited to 5-8 families per week</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white p-10 rounded-2xl shadow-xl relative overflow-hidden group hover:shadow-2xl transition h-full flex flex-col">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="text-4xl mb-4">🎓</div>
            <h2 className="text-2xl font-bold mb-3">For Educators</h2>
            <p className="text-green-100 mb-6 leading-relaxed">
              Join our curated educator network and get matched with families who value fit and outcomes.
            </p>
            <div className="mt-auto">
              <Button to="/tutors/signup" variant="white" className="w-full group-hover:scale-105 transition bg-white text-green-700 hover:bg-green-50">🎓 Join Educator Network</Button>
              <p className="text-xs text-green-200 mt-3 text-center">Flexible schedules • Verified families</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Contact Options */}
      <div className="mb-16">
        <h3 className="text-2xl font-bold text-primary text-center mb-8">How Would You Like to Connect?</h3>
        <div className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-white border-2 border-slate-200 p-6 rounded-xl text-center hover:border-secondary hover:shadow-md transition cursor-pointer h-full flex flex-col items-center">
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-3">
              <Phone className="text-secondary" size={24} />
            </div>
            <h4 className="font-bold text-sm text-primary mb-1">WhatsApp Chat</h4>
            <p className="text-xs text-slate-500 mb-3">Quick questions</p>
            <div className="mt-auto">
              <a href="https://wa.me/6598882675" className="text-secondary text-xs font-semibold hover:underline">Start Chat →</a>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 p-6 rounded-xl text-center hover:border-secondary hover:shadow-md transition cursor-pointer h-full flex flex-col items-center">
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-3">
              <Calendar className="text-secondary" size={24} />
            </div>
            <h4 className="font-bold text-sm text-primary mb-1">Book Call</h4>
            <p className="text-xs text-slate-500 mb-3">15-min consultation</p>
            <div className="mt-auto">
              <Button to="/tuition#parent-inquiry" variant="outline" className="text-xs py-1 px-3">View Times</Button>
            </div>
          </div>

          <div className="bg-white border-2 border-slate-200 p-6 rounded-xl text-center hover:border-secondary hover:shadow-md transition cursor-pointer h-full flex flex-col items-center">
            <div className="bg-blue-50 w-14 h-14 rounded-full flex items-center justify-center mb-3">
              <FileText className="text-secondary" size={24} />
            </div>
            <h4 className="font-bold text-sm text-primary mb-1">Learning Assessment Form</h4>
            <p className="text-xs text-slate-500 mb-3">Tell us your needs</p>
            <div className="mt-auto">
              <Button to="/tuition#parent-inquiry" variant="outline" className="text-xs py-1 px-3">Get Started</Button>
            </div>
          </div>

        </div>
      </div>

      {/* Response Time Transparency */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-16">
        <h3 className="text-xl font-bold text-primary text-center mb-6">Our Response Commitment</h3>
        <div className="max-w-3xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Learning Inquiries (Families)</span>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Within 24 hours</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-100">
              <span className="text-sm font-semibold text-slate-700">Educator Applications</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">Within 2–3 days</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-100">
              <span className="text-sm font-semibold text-slate-700">WhatsApp / Email</span>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Same day</span>
            </div>
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-100">
              <span className="text-sm font-semibold text-slate-700">School / Partnership Enquiries</span>
              <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">Within 5 business days</span>
            </div>
          </div>
          <p className="text-center text-xs text-slate-500 mt-4">*Business hours: Mon–Sun, 9am–9pm SGT. Responses may be slower on public holidays.</p>
        </div>
      </div>

      {/* Credibility without hard numbers */}
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-xl p-8 mb-16">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-primary mb-2">Why Parents Choose Us</h3>
          <p className="text-sm text-slate-600">Verified educators, curated guidance, transparent communication.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary mb-1">Verified</p>
            <p className="text-xs text-slate-600 uppercase tracking-wide">Educator Network</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary mb-1">Curated</p>
            <p className="text-xs text-slate-600 uppercase tracking-wide">Matches by Style</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary mb-1">Responsive</p>
            <p className="text-xs text-slate-600 uppercase tracking-wide">Consultant Support</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary mb-1">Transparent</p>
            <p className="text-xs text-slate-600 uppercase tracking-wide">Policy & Payments</p>
          </div>
        </div>
      </div>

      {/* Direct Contact */}
      <div className="border-t border-slate-200 pt-12">
        <h3 className="text-xl font-bold text-primary text-center mb-8">Prefer Direct Contact?</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center hover:shadow-md transition">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="text-secondary" size={28} />
            </div>
            <h4 className="font-bold text-primary mb-2">WhatsApp / Phone</h4>
            <p className="text-lg font-bold text-secondary mb-1">9888 2675</p>
            <p className="text-xs text-slate-500">Mon-Sun, 9am-9pm</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center hover:shadow-md transition">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="text-secondary" size={28} />
            </div>
            <h4 className="font-bold text-primary mb-2">Email</h4>
            <p className="text-sm font-semibold text-secondary mb-1 break-all">manage.integrated.learnings@gmail.com</p>
            <p className="text-xs text-slate-500">Response within 24hrs</p>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center hover:shadow-md transition">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-secondary" size={28} />
            </div>
            <h4 className="font-bold text-primary mb-2">Operating Hours</h4>
            <p className="text-sm font-semibold text-secondary mb-1">Mon - Sun</p>
            <p className="text-xs text-slate-500">9:00 AM - 9:00 PM SGT</p>
          </div>
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
              <Button to="/tuition#parent-inquiry">Get Started</Button>
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
             <Button to="/tuition#parent-inquiry">Get Started</Button>
           </div>
         ))}
       </div>
    </Section>
  </>
);

export const TutorRequest: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    level: '',
    subjects: [] as string[],
    classType: 'one-to-one', // one-to-one or group
    postalCode: '',
    address: '',
    needsCoursework: false,
    tutorGender: 'any',
    preferredExperience: 'any',
    teachingStyle: 'any',
    details: ''
  });
  const [formErrors, setFormErrors] = useState<{
    studentName?: string;
    level?: string;
    postalCode?: string;
    address?: string;
    subjects?: string;
  }>({});

  const handleSubjectToggle = (subject: string) => {
    const current = formData.subjects;
    if (current.includes(subject)) {
      setFormData({ ...formData, subjects: current.filter(s => s !== subject) });
    } else {
      setFormData({ ...formData, subjects: [...current, subject] });
    }
    if (formErrors.subjects) {
      setFormErrors({ ...formErrors, subjects: undefined });
    }
  };

  const subjects = [
    'English', 'Mathematics', 'Science',
    'Chinese', 'Malay', 'Tamil',
    'A-Math', 'Pure Physics', 'Pure Chemistry', 'Pure Biology',
    'Economics', 'History', 'Geography', 'Literature'
  ];

  const validateStepOne = () => {
    const nextErrors: typeof formErrors = {};
    if (!formData.studentName.trim()) {
      nextErrors.studentName = 'Student name is required.';
    }
    if (!formData.level) {
      nextErrors.level = 'Academic level is required.';
    }
    if (!formData.postalCode.trim()) {
      nextErrors.postalCode = 'Postal code is required.';
    } else if (!/^[0-9]{6}$/.test(formData.postalCode.trim())) {
      nextErrors.postalCode = 'Postal code must be 6 digits.';
    }
    if (!formData.address.trim()) {
      nextErrors.address = 'Address is required.';
    }
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateStepThree = () => {
    const nextErrors: typeof formErrors = {};
    if (formData.subjects.length === 0) {
      nextErrors.subjects = 'Select at least one subject.';
    }
    setFormErrors({ ...formErrors, ...nextErrors });
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateStepThree()) {
      return;
    }

    setSubmitSuccess(true);
  };

  return (
    <>
      <PageHeader 
        title="Submit Your Tutor Request" 
        subtitle="Tell us what you're looking for. We'll find the perfect match." 
      />
      <Section>
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-green-900 mb-2">Request submitted successfully!</h3>
              <p className="text-sm text-green-800">
                Our team will contact you within 24 hours to confirm the best tutor match.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button onClick={() => navigate('/tuition#parent-inquiry')} variant="outline" className="flex-1">
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => {
                    setSubmitSuccess(false);
                    setStep(1);
                    setFormErrors({});
                    setFormData({
                      studentName: '',
                      level: '',
                      subjects: [] as string[],
                      classType: 'one-to-one',
                      postalCode: '',
                      address: '',
                      needsCoursework: false,
                      tutorGender: 'any',
                      preferredExperience: 'any',
                      teachingStyle: 'any',
                      details: ''
                    });
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Submit Another Request
                </Button>
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center text-sm font-bold text-slate-400 mb-2">
              <span className={step >= 1 ? "text-secondary" : ""}>1. Student & Location</span>
              <span className={step >= 2 ? "text-secondary" : ""}>2. Preferences</span>
              <span className={step >= 3 ? "text-secondary" : ""}>3. Details</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-secondary transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-primary mb-6">Tutor Request Form</h2>

          {step === 1 && !submitSuccess && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-700 mb-4">About Your Child</h3>
              <div>
                <label className="block text-sm font-bold mb-1">Student Name *</label>
                <input 
                  id="tutor-request-student-name"
                  className="w-full border p-2 rounded"
                  placeholder="Student's Name"
                  value={formData.studentName}
                  onChange={(e) => {
                    setFormData({ ...formData, studentName: e.target.value });
                    if (formErrors.studentName) {
                      setFormErrors({ ...formErrors, studentName: undefined });
                    }
                  }}
                  aria-invalid={!!formErrors.studentName}
                  aria-describedby={formErrors.studentName ? 'tutor-request-student-name-error' : undefined}
                />
                {formErrors.studentName && (
                  <p id="tutor-request-student-name-error" className="text-xs text-red-600 mt-1">
                    {formErrors.studentName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Academic Level *</label>
                <select 
                  id="tutor-request-level"
                  className="w-full border p-2 rounded"
                  value={formData.level}
                  onChange={(e) => {
                    setFormData({ ...formData, level: e.target.value });
                    if (formErrors.level) {
                      setFormErrors({ ...formErrors, level: undefined });
                    }
                  }}
                  aria-invalid={!!formErrors.level}
                  aria-describedby={formErrors.level ? 'tutor-request-level-error' : undefined}
                >
                  <option value="">Select Level</option>
                  <option value="Primary 1-3">Primary 1-3</option>
                  <option value="Primary 4-6">Primary 4-6</option>
                  <option value="Secondary 1-2">Secondary 1-2</option>
                  <option value="Secondary 3-4 (O-Level)">Secondary 3-4 (O-Level)</option>
                  <option value="Junior College">Junior College</option>
                </select>
                {formErrors.level && (
                  <p id="tutor-request-level-error" className="text-xs text-red-600 mt-1">
                    {formErrors.level}
                  </p>
                )}
              </div>

              <hr className="my-6" />

              <h3 className="font-bold text-lg text-slate-700 mb-4">Location Details</h3>
              <div>
                <label className="block text-sm font-bold mb-1">Postal Code *</label>
                <input 
                  id="tutor-request-postal-code"
                  className="w-full border p-2 rounded"
                  placeholder="E.g. 560123"
                  value={formData.postalCode}
                  onChange={(e) => {
                    setFormData({ ...formData, postalCode: e.target.value });
                    if (formErrors.postalCode) {
                      setFormErrors({ ...formErrors, postalCode: undefined });
                    }
                  }}
                  maxLength={6}
                  aria-invalid={!!formErrors.postalCode}
                  aria-describedby={formErrors.postalCode ? 'tutor-request-postal-code-error' : undefined}
                />
                {formErrors.postalCode && (
                  <p id="tutor-request-postal-code-error" className="text-xs text-red-600 mt-1">
                    {formErrors.postalCode}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Full Address *</label>
                <textarea 
                  id="tutor-request-address"
                  className="w-full border p-2 rounded h-16" 
                  placeholder="Your home address (helps us find tutors nearby)"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (formErrors.address) {
                      setFormErrors({ ...formErrors, address: undefined });
                    }
                  }}
                  aria-invalid={!!formErrors.address}
                  aria-describedby={formErrors.address ? 'tutor-request-address-error' : undefined}
                />
                {formErrors.address && (
                  <p id="tutor-request-address-error" className="text-xs text-red-600 mt-1">
                    {formErrors.address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-3">Class Type *</label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-3 border border-secondary rounded-lg bg-blue-50 cursor-pointer">
                    <input
                      type="radio"
                      name="classType"
                      value="one-to-one"
                      checked={formData.classType === 'one-to-one'}
                      onChange={(e) => setFormData({...formData, classType: e.target.value})}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-bold text-secondary">One-to-One Tutoring (Recommended)</p>
                      <p className="text-sm text-slate-600">Personalized attention at your home or online</p>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed opacity-50">
                    <input
                      type="radio"
                      name="classType"
                      value="group"
                      disabled
                      className="mt-1"
                    />
                    <div>
                      <p className="font-bold text-slate-600">Group Classes (Coming Soon)</p>
                      <p className="text-sm text-slate-500">Will be available once we partner with tuition centers</p>
                    </div>
                  </label>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (validateStepOne()) {
                    setStep(2);
                  }
                }}
                className="w-full mt-6"
              >
                Next: Tutor Preferences
              </Button>
            </div>
          )}

          {step === 2 && !submitSuccess && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-700 mb-4">Tutor Preferences</h3>
              
              <div>
                <label className="block text-sm font-bold mb-1">Tutor Gender (Optional)</label>
                <select 
                  className="w-full border p-2 rounded"
                  value={formData.tutorGender}
                  onChange={(e) => setFormData({...formData, tutorGender: e.target.value})}
                >
                  <option value="any">No Preference</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Preferred Experience Level (Optional)</label>
                <select 
                  className="w-full border p-2 rounded"
                  value={formData.preferredExperience}
                  onChange={(e) => setFormData({...formData, preferredExperience: e.target.value})}
                >
                  <option value="any">No Preference</option>
                  <option value="fresh">Fresh Graduate (0-2 years)</option>
                  <option value="experienced">Experienced (2-5 years)</option>
                  <option value="expert">Expert (5+ years)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Teaching Style Preference (Optional)</label>
                <select 
                  className="w-full border p-2 rounded"
                  value={formData.teachingStyle}
                  onChange={(e) => setFormData({...formData, teachingStyle: e.target.value})}
                >
                  <option value="any">No Preference</option>
                  <option value="structured">Structured & Systematic</option>
                  <option value="flexible">Flexible & Adaptive</option>
                  <option value="strict">Strict & Disciplined</option>
                  <option value="caring">Caring & Supportive</option>
                </select>
              </div>

              <Button
                onClick={() => {
                  setFormErrors({});
                  setStep(3);
                }}
                className="w-full mt-6"
              >
                Next: Subjects & Details
              </Button>
            </div>
          )}

          {step === 3 && !submitSuccess && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-slate-700 mb-4">Subjects & Additional Notes</h3>
              
              <div>
                <label className="block text-sm font-bold mb-3">Subjects Needed (Select at least one) *</label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map(subject => (
                    <button
                      key={subject}
                      type="button"
                      onClick={() => handleSubjectToggle(subject)}
                      className={`p-2 text-sm rounded border text-left transition ${
                        formData.subjects.includes(subject) 
                          ? 'bg-secondary text-white border-secondary' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-secondary'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
                {formErrors.subjects && (
                  <p className="text-xs text-red-600 mt-2">{formErrors.subjects}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Additional Notes</label>
                <textarea 
                  className="w-full border p-2 rounded h-24" 
                  placeholder="E.g. specific weaknesses, learning pace, exam preparation, etc."
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                />
              </div>

              {/* Coursework Option */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needsCoursework}
                    onChange={(e) => setFormData({...formData, needsCoursework: e.target.checked})}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-bold text-amber-900">Need O-Level Coursework Help?</p>
                    <p className="text-sm text-amber-800">D&T, Art, or FCE coursework guidance (70% of final grade)</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button>
                <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">Submit Request</Button>
              </div>
            </div>
          )}
        </div>
      </Section>
    </>
  );
};

export const SpecializedRequest: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: '',
    details: ''
  });
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    serviceType?: string;
  }>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const serviceOptions = [
    'Holiday Programs (Head-start bootcamps & intensive revision)',
    'Extra Learnings (Coding, Financial Literacy, Skills)',
    'Exam Emergency Help (Last-minute intensive sessions)',
    'Subject Specialists (Niche subjects or advanced topics)',
    'Other (Please specify in details)'
  ];

  const handleSubmit = () => {
    const nextErrors: typeof fieldErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = 'Name is required.';
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!formData.email.includes('@')) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!formData.serviceType) {
      nextErrors.serviceType = 'Please select a service.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setSubmitSuccess(true);
  };

  return (
    <>
      <PageHeader 
        title="Request Specialized Services" 
        subtitle="Looking for something beyond standard tuition? We can help." 
      />
      <Section>
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          {submitSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-green-900 mb-2">Request submitted successfully!</h3>
              <p className="text-sm text-green-800">
                Our team will contact you within 24 hours with tailored recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button onClick={() => navigate('/tuition#parent-inquiry')} variant="outline" className="flex-1">
                  Go to Dashboard
                </Button>
                <Button
                  onClick={() => {
                    setSubmitSuccess(false);
                    setFieldErrors({});
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      serviceType: '',
                      details: ''
                    });
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Submit Another Request
                </Button>
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold text-primary mb-6">Specialized Services Request</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Your Name *</label>
              <input 
                id="specialized-request-name"
                className="w-full border p-2 rounded"
                placeholder="Parent's Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (fieldErrors.name) {
                    setFieldErrors({ ...fieldErrors, name: undefined });
                  }
                }}
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'specialized-request-name-error' : undefined}
              />
              {fieldErrors.name && (
                <p id="specialized-request-name-error" className="text-xs text-red-600 mt-1">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Email Address *</label>
              <input 
                type="email"
                id="specialized-request-email"
                className="w-full border p-2 rounded"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (fieldErrors.email) {
                    setFieldErrors({ ...fieldErrors, email: undefined });
                  }
                }}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? 'specialized-request-email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="specialized-request-email-error" className="text-xs text-red-600 mt-1">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Phone Number</label>
              <input 
                type="tel"
                className="w-full border p-2 rounded"
                placeholder="+65 XXXX XXXX"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">What Service Are You Looking For? *</label>
              <select 
                id="specialized-request-service"
                className="w-full border p-2 rounded"
                value={formData.serviceType}
                onChange={(e) => {
                  setFormData({ ...formData, serviceType: e.target.value });
                  if (fieldErrors.serviceType) {
                    setFieldErrors({ ...fieldErrors, serviceType: undefined });
                  }
                }}
                aria-invalid={!!fieldErrors.serviceType}
                aria-describedby={fieldErrors.serviceType ? 'specialized-request-service-error' : undefined}
              >
                <option value="">Select a Service</option>
                {serviceOptions.map((option, idx) => (
                  <option key={idx} value={option}>{option}</option>
                ))}
              </select>
              {fieldErrors.serviceType && (
                <p id="specialized-request-service-error" className="text-xs text-red-600 mt-1">
                  {fieldErrors.serviceType}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Tell Us More</label>
              <textarea 
                className="w-full border p-2 rounded h-24" 
                placeholder="Describe what you're looking for in detail. This helps us find the perfect solution for your needs."
                value={formData.details}
                onChange={(e) => setFormData({...formData, details: e.target.value})}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong> Our team will review your request and contact you within 24 hours with tailored recommendations and pricing.
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => navigate('/tuition#parent-inquiry')} variant="outline" className="flex-1">Back to Dashboard</Button>
              <Button onClick={handleSubmit} className="flex-1 bg-green-600 hover:bg-green-700">Submit Request</Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};
