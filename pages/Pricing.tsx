import React, { useState } from 'react';
import { PageHeader, Section, Button } from '../components/Components';
import { PRICING_DATA } from '../constants';
import { AlertCircle } from 'lucide-react';

const Pricing: React.FC = () => {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  // Check if user is logged in (in demo, we'll assume not logged in)
  const isLoggedIn = false;

  const handleRequestClick = () => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
    } else {
      window.location.href = '/#/request';
    }
  };
  return (
    <>
      <PageHeader title="Transparent Pricing" subtitle="Fair rates for quality education. No hidden fees, pay only for completed lessons." />
      
      {/* Diagnostic Matching Banner */}
      <div className="bg-gradient-to-br from-blue-50 to-slate-50 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-2xl font-bold text-center text-slate-900 mb-6">Our Diagnostic Matching Process</h3>
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {/* Step 1 */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 text-center">
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-primary">1</div>
                <h4 className="font-bold text-slate-900 mb-2">15-Min Discovery Call</h4>
                <p className="text-sm text-slate-600">Understand your child's needs, goals, and learning preferences</p>
              </div>
              
              {/* Step 2 */}
              <div className="bg-gradient-to-br from-secondary to-blue-700 rounded-xl border-2 border-secondary p-6 text-center text-white relative shadow-lg">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">OUR EDGE</div>
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h4 className="font-bold mb-2">Diagnostic Matching Call</h4>
                <p className="text-sm text-blue-100">30-min session to assess learning style, pace, and fit in real-time</p>
              </div>
              
              {/* Step 3 */}
              <div className="bg-white rounded-xl border-2 border-slate-200 p-6 text-center">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-green-700">3</div>
                <h4 className="font-bold text-slate-900 mb-2">Perfect Match</h4>
                <p className="text-sm text-slate-600">Based on compatibility data, not just profiles. Start paid lessons with confidence.</p>
              </div>
            </div>
            
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
              <p className="text-sm text-green-900 mb-4">
                <strong>Why this works:</strong> Other agencies match on paper. We match on compatibility. That's why our students improve faster and parents are more satisfied.
              </p>
              <Button onClick={handleRequestClick} className="w-full text-lg py-3">Start Tutor Request</Button>
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
              <li><strong>1. Get Matched</strong> - We run diagnostic matching and connect you with the best-fit tutor</li>
              <li><strong>2. First Month</strong> - You pay 50% of your first month's tuition to us as a matching fee</li>
              <li><strong>3. Month 2 Onwards</strong> - Pay tutor directly via PayNow/bank transfer. No intermediaries.</li>
              <li><strong>4. Flexible & Transparent</strong> - Cancel anytime with 1 week notice. No lock-in contracts.</li>
            </ol>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Why This Model Works</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✓ <strong>One-Time Fee Only:</strong> After Month 1, your tutor keeps 100% of payment</li>
              <li>✓ <strong>Transparent Pricing:</strong> Know the hourly rate before committing</li>
              <li>✓ <strong>Long-Term Stability:</strong> Tutors stay motivated (direct payment, no commissions)</li>
              <li>✓ <strong>Free Replacement:</strong> If the match doesn't work within first 2 lessons, swap for free</li>
            </ul>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-secondary to-blue-700 p-8 rounded-2xl text-white text-center">
           <h2 className="text-2xl font-bold mb-3">Ready to Find the Right Tutor?</h2>
           <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Submit your request now. We'll match your child with the best-fit tutor based on qualifications, experience, and teaching style.
           </p>
           <button 
             onClick={handleRequestClick}
             className="px-8 py-3 font-bold shadow-lg bg-white hover:bg-slate-100 text-secondary rounded-full transition"
           >
              📝 Submit Tutor Request →
           </button>
        </div>

        {/* Login Prompt Modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <button 
                onClick={() => setShowLoginPrompt(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
              
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <AlertCircle className="text-secondary" size={32} />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-primary text-center mb-3">Sign Up to Continue</h3>
              <p className="text-slate-600 text-center mb-6">
                Create a free account to submit your tutor request and track your matches in real-time.
              </p>
              
              <div className="space-y-3">
                <Button 
                  to="/parents" 
                  className="w-full bg-secondary hover:bg-blue-800 text-white font-bold py-3"
                >
                  Parent Sign-Up / Login
                </Button>
                
                <button 
                  onClick={() => setShowLoginPrompt(false)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Continue Browsing Pricing
                </button>
              </div>
              
              <p className="text-xs text-slate-500 text-center mt-4">
                It takes less than 2 minutes to sign up. Your child's learning journey starts here.
              </p>
            </div>
          </div>
        )}
        
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