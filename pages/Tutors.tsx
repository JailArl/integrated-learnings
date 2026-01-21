import React, { useState } from 'react';

const Tutors: React.FC = () => {
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
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
             <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0A2540] mb-2">Application Received</h2>
          <p className="text-gray-600">Thank you! We will review your profile and contact you via WhatsApp if there are suitable assignments.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-[#F5F7FA] min-h-screen animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#0A2540] font-['Poppins']">Join Our Team</h1>
          <p className="mt-4 text-lg text-gray-600">
            Passionate about teaching? Join a network that values understanding the student first.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                  <input type="tel" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Highest Qualification</label>
                  <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]">
                    <option>A Levels / IB Diploma</option>
                    <option>Undergraduate</option>
                    <option>Bachelor's Degree</option>
                    <option>Master's Degree</option>
                    <option>PhD</option>
                    <option>NIE Trained Teacher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Subjects you teach</label>
                <input type="text" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">Levels you teach</label>
                 <div className="flex flex-wrap gap-4">
                   {['Lower Pri', 'Upper Pri', 'Lower Sec', 'Upper Sec', 'JC / IB', 'Uni'].map(lvl => (
                     <label key={lvl} className="inline-flex items-center">
                       <input type="checkbox" className="rounded border-gray-300 text-[#0A2540] focus:ring-[#4BA3C7]" />
                       <span className="ml-2 text-sm text-gray-600">{lvl}</span>
                     </label>
                   ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                   <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                   <input type="number" min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700">Online Only?</label>
                   <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]">
                     <option>No, I can travel</option>
                     <option>Yes, Online Only</option>
                   </select>
                </div>
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-gray-700">Areas you can travel to</label>
                  <input type="text" placeholder="e.g. North, Central, or specific MRTs" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]" />
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700">Teaching Style & Approach</label>
                  <textarea rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]"></textarea>
              </div>
              
               <div>
                  <label className="block text-sm font-medium text-gray-700">What kind of students do you work best with?</label>
                  <textarea rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-[#4BA3C7] focus:border-[#4BA3C7]"></textarea>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0A2540] hover:bg-[#4BA3C7] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4BA3C7] transition-colors">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutors;