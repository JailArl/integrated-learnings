import React, { useState } from 'react';

const Parents: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#F5F7FA] px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center animate-fade-in">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0A2540] mb-2">Request Received!</h2>
          <p className="text-gray-600">Thank you. We will contact you via WhatsApp soon to discuss the best tutor match for your child.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="mt-6 text-[#4BA3C7] hover:underline"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#F5F7FA] min-h-screen animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#0A2540] font-['Poppins']">Request a Tutor</h1>
          <p className="mt-4 text-lg text-gray-600">
            Tell us about your child's needs. We hand-pick tutors based on your specific requirements.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">Parent Name</label>
                  <input type="text" required id="parentName" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
                </div>
                <div>
                  <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                  <input type="tel" required id="whatsapp" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
                </div>
                <div>
                  <label htmlFor="childName" className="block text-sm font-medium text-gray-700">Child Name</label>
                  <input type="text" required id="childName" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
                </div>
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700">Level</label>
                  <select id="level" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]">
                    <option>Primary 3</option>
                    <option>Primary 4</option>
                    <option>Primary 5</option>
                    <option>Primary 6</option>
                    <option>Secondary 1</option>
                    <option>Secondary 2</option>
                    <option>Secondary 3</option>
                    <option>Secondary 4/5</option>
                    <option>IB MYP</option>
                    <option>IB DP</option>
                    <option>Others</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="subjects" className="block text-sm font-medium text-gray-700">Subject(s)</label>
                <input type="text" required placeholder="e.g., Math, Science, English" id="subjects" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                 <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location / Area</label>
                  <input type="text" required placeholder="e.g., Tampines, Clementi" id="location" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
                 </div>
                 <div>
                  <label htmlFor="timing" className="block text-sm font-medium text-gray-700">Preferred Days & Times</label>
                  <input type="text" required placeholder="e.g., Sat mornings, Wed evenings" id="timing" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
                 </div>
              </div>

              {/* Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Child's Situation (Check all that apply)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Weak foundation', 'Careless mistakes', 'Afraid of subject', 'Hates subject', 'Low confidence', 'Easily distracted', 'Special learning needs'].map(item => (
                    <label key={item} className="inline-flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-[#0A2540] focus:ring-[#4BA3C7]" />
                      <span className="ml-2 text-sm text-gray-600">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['Pass', 'Improve to B', 'Aim A', 'Improve confidence', 'Strengthen foundation'].map(item => (
                    <label key={item} className="inline-flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-[#0A2540] focus:ring-[#4BA3C7]" />
                      <span className="ml-2 text-sm text-gray-600">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Additional Notes</label>
                <textarea id="notes" rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]"></textarea>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0A2540] hover:bg-[#4BA3C7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4BA3C7] transition-colors">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parents;