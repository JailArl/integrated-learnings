import React, { useState } from 'react';

const Diagnostic: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
       <div className="bg-[#0A2540] text-white py-16">
         <div className="max-w-7xl mx-auto px-4 text-center">
           <h1 className="text-3xl md:text-5xl font-bold mb-4 font-['Poppins']">Diagnostic & Strategy Session</h1>
           <p className="text-lg text-[#4BA3C7] max-w-2xl mx-auto">Before we start tuition, let's figure out exactly what your child needs.</p>
         </div>
       </div>

       <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Info Section */}
         <div className="space-y-8">
           <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
             <h2 className="text-2xl font-bold text-[#0A2540] mb-4">What is it?</h2>
             <p className="text-gray-600">A standalone 1.5-hour session designed to evaluate your child's current standing, learning gaps, and learning style.</p>
           </div>

           <div>
             <h3 className="text-xl font-bold text-[#0A2540] mb-3">When to consider it?</h3>
             <ul className="list-disc list-inside space-y-2 text-gray-600">
               <li>Child works hard but sees no improvement.</li>
               <li>Unsure if the issue is concept, carelessness, or exam technique.</li>
               <li>Child has lost confidence in the subject.</li>
               <li>Preparing for a major exam (PSLE/O-Level/IB) and need a strategy.</li>
             </ul>
           </div>

           <div>
             <h3 className="text-xl font-bold text-[#0A2540] mb-3">What's included?</h3>
             <ul className="space-y-2 text-gray-600">
               <li className="flex items-start"><span className="text-[#4BA3C7] mr-2">✓</span> Written Assessment to test concepts.</li>
               <li className="flex items-start"><span className="text-[#4BA3C7] mr-2">✓</span> Verbal interview to understand thinking process.</li>
               <li className="flex items-start"><span className="text-[#4BA3C7] mr-2">✓</span> Analysis of past exam papers (if provided).</li>
               <li className="flex items-start"><span className="text-[#4BA3C7] mr-2">✓</span> A roadmap proposal for improvement.</li>
             </ul>
           </div>
           
           <div className="bg-blue-50 p-4 rounded border-l-4 border-[#4BA3C7]">
             <p className="text-sm text-[#0A2540]"><strong>Note:</strong> This session is optional. Fees are communicated upon inquiry.</p>
           </div>
         </div>

         {/* Form Section */}
         <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
            {submitted ? (
              <div className="text-center h-full flex flex-col justify-center">
                 <h3 className="text-2xl font-bold text-green-600 mb-4">Request Sent!</h3>
                 <p className="text-gray-600">We will be in touch shortly to arrange a time slot.</p>
                 <button onClick={() => setSubmitted(false)} className="mt-4 text-[#0A2540] underline">Back to form</button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-[#0A2540] mb-6 font-['Poppins']">Book a Session</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Parent Name</label>
                     <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                     <input type="tel" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Level</label>
                       <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">Subject</label>
                       <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Urgency</label>
                     <select className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                       <option>As soon as possible</option>
                       <option>Within 2 weeks</option>
                       <option>Next month</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Preferred Time Slots</label>
                     <input type="text" placeholder="e.g. Weekday evenings" className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700">Brief Description of Concerns</label>
                     <textarea rows={3} className="mt-1 block w-full border border-gray-300 rounded-md p-2"></textarea>
                   </div>
                   <button type="submit" className="w-full py-3 bg-[#0A2540] text-white rounded-md font-medium hover:bg-[#4BA3C7] transition-colors">
                     Confirm Booking Request
                   </button>
                </form>
              </>
            )}
         </div>
       </div>
    </div>
  );
};

export default Diagnostic;