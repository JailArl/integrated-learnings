import React from 'react';
import { PageHeader, Section, Button } from '../components/Components';
import { PRICING_DATA } from '../constants';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  return (
    <>
      <PageHeader title="Clear Tuition Rates. Smarter Matching. No Hidden Fees." subtitle="We show typical tutor rates upfront, then recommend the right support based on your child's needs - not just tutor availability." />
      
      {/* Diagnostic Advisory Banner */}
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-2xl font-bold text-center text-slate-900 mb-6">How We Recommend the Right Support</h3>
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Step 1 */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-primary">1</div>
                <h4 className="font-bold text-slate-900 mb-2">Understand the child</h4>
                <p className="text-sm text-slate-600">A short discovery call helps us understand your child's level, subject needs, goals, gaps, personality, and schedule.</p>
              </div>
              
              {/* Step 2 */}
              <div className="bg-gradient-to-br from-secondary to-blue-700 rounded-xl border-2 border-secondary p-6 text-center text-white relative shadow-lg">
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h4 className="font-bold mb-2">Recommend the right path</h4>
                <p className="text-sm text-blue-100">We may suggest tutor matching, crash course, enrichment workshop, StudyPulse, or a suitable combination.</p>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-green-700">3</div>
                <h4 className="font-bold text-slate-900 mb-2">Start with clarity</h4>
                <p className="text-sm text-slate-600">We confirm tutor profile, rates, schedule, payment flow, and replacement policy before lessons begin.</p>
              </div>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <Button to="/tuition#parent-inquiry" className="w-full text-lg py-3">Start Learning Assessment</Button>
            </div>
          </div>
        </div>
      </div>

      <Section>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 text-center">Monthly Tuition Rates</h2>
        <p className="text-lg text-slate-600 mb-8 text-center max-w-3xl mx-auto">
          Our tutors set their own rates within market ranges. <strong>You pay only for completed lessons.</strong> No hidden fees, no upfront deposits.
        </p>
        
        <div className="space-y-12">
          {PRICING_DATA.map((tier, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="text-xl font-bold text-primary">{tier.category}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-white text-slate-800 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Level</th>
                      <th className="px-6 py-4">Part-Time Tutor</th>
                      <th className="px-6 py-4">Full-Time Tutor</th>
                      <th className="px-6 py-4">MOE / Ex-MOE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tier.rates.map((rate, j) => (
                      <tr key={j} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{rate.level}</td>
                        <td className="px-6 py-4">{rate.pt}</td>
                        <td className="px-6 py-4">{rate.ft}</td>
                        <td className="px-6 py-4 font-semibold text-secondary">{rate.moe}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 bg-blue-50/50 text-xs text-slate-500 space-y-1">
                <p>* Rates are per hour, one-to-one at your home or online.</p>
                <p>* Transport fees ($5-$15) may apply for home tuition.</p>
                <p>* Most lessons are 1.5-2 hours. Average weekly cost: $100-$250 depending on frequency.</p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Model Section */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">How Payment Works</h3>
            <ol className="space-y-3 text-sm text-green-800">
              <li><strong>1. Get assessed</strong> - We understand your child's needs and recommend the right learning path.</li>
              <li><strong>2. First 2 months: supported onboarding</strong> - Integrated Learnings stays involved during the early stage to monitor tutor fit, lesson flow, and parent feedback.</li>
              <li><strong>3. No long-term agency markup</strong> - After the onboarding period, parents pay the tutor directly unless additional support or replacement is needed.</li>
              <li><strong>4. Flexible and transparent</strong> - No lock-in contract. If the match is unsuitable early on, we will help arrange a replacement.</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Why This Model Works</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ <strong>Support During Onboarding:</strong> We stay involved in the first two months to improve fit and outcomes</li>
              <li>✓ <strong>Transparent Pricing:</strong> Know the hourly rate before committing</li>
              <li>✓ <strong>Long-Term Flexibility:</strong> Parents pay tutors directly after onboarding unless extra support is needed</li>
              <li>✓ <strong>Replacement Support:</strong> If the match does not work early on, we help arrange a replacement</li>
            </ul>
          </div>
        </div>

        {/* Supported Onboarding Section */}
        <div className="mt-12 bg-white border border-slate-200 rounded-2xl p-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Supported Onboarding, Not Just Matching</h3>
            <p className="text-slate-600">
              Many agencies introduce a tutor and step away. Integrated Learnings stays involved during the first two months to check whether the match is working, whether lessons are progressing, and whether parents need adjustments.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h4 className="font-bold text-slate-900 mb-2">Fit check</h4>
              <p className="text-sm text-slate-600">We monitor whether the tutor's teaching style suits the child.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h4 className="font-bold text-slate-900 mb-2">Parent feedback</h4>
              <p className="text-sm text-slate-600">We collect early feedback so issues can be addressed before they become bigger problems.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h4 className="font-bold text-slate-900 mb-2">Progress direction</h4>
              <p className="text-sm text-slate-600">We help ensure lessons are aligned with the child's current needs.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h4 className="font-bold text-slate-900 mb-2">Replacement support</h4>
              <p className="text-sm text-slate-600">If the match is unsuitable early on, we help arrange a replacement.</p>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-secondary to-blue-700 p-8 rounded-2xl text-white text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to Find the Right Learning Support?</h2>
           <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Tell us about your child's needs. We'll recommend whether tuition, crash course, enrichment, or monitoring support fits best.
           </p>
           <Link 
             to="/tuition#parent-inquiry"
             className="inline-block px-8 py-3 font-bold shadow-lg bg-white hover:bg-slate-100 text-secondary rounded-full transition"
           >
              Start Learning Assessment
           </Link>
        </div>
        
        {/* StudyPulse Cross-sell */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-8 text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Already have a tutor? Add progress visibility.</h3>
          <p className="text-sm text-slate-600 mb-4 max-w-xl mx-auto">
            StudyPulse helps parents track weekly study effort, check-ins, and exam preparation habits - even if the tutor is already arranged.
          </p>
          <Link 
            to="/studypulse"
            className="inline-block px-6 py-3 font-bold shadow bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-full transition text-sm"
          >
            Try StudyPulse Monitoring
          </Link>
        </div>
        
        {/* Simple Policy Link */}
        <div className="mt-12 text-center">
             <p className="text-slate-500 text-sm">Questions about our policies?</p>
             <Button to="/policies" variant="outline" className="mt-2 text-sm">View Parent Policies & Terms</Button>
        </div>
      </Section>
    </>
  );
};

export default Pricing;