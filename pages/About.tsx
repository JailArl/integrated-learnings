import React from 'react';

const About: React.FC = () => {
  return (
    <div className="animate-fade-in">
       <div className="relative bg-[#0A2540] py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl text-white font-bold font-['Poppins']">About Integrated Learnings</h1>
          </div>
       </div>

       <div className="max-w-5xl mx-auto px-4 py-16">
          <div className="mb-16">
             <h2 className="text-2xl font-bold text-[#0A2540] mb-6 font-['Poppins']">Our Story</h2>
             <p className="text-gray-600 text-lg leading-relaxed mb-6">
               Integrated Learnings was founded on the belief that tuition shouldn't just be about drilling past year papers. It should be about understanding how a child learns. 
               We started as a small solo practice and have grown into a network of like-minded educators who care deeply about student well-being as much as academic results.
             </p>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
             <div className="w-full md:w-1/3">
                <div className="aspect-w-3 aspect-h-4 rounded-lg overflow-hidden shadow-lg bg-gray-200">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=500&q=80" 
                    alt="Founder" 
                    className="object-cover w-full h-full" 
                  />
                </div>
             </div>
             <div className="w-full md:w-2/3">
                <h2 className="text-2xl font-bold text-[#0A2540] mb-4 font-['Poppins']">The Founder</h2>
                <p className="text-gray-600 mb-4">
                  With over 15 years of experience teaching students from PSLE to IB Diploma level, our founder has seen the entire spectrum of the Singapore education system.
                </p>
                <p className="text-gray-600 mb-4">
                  Her strength lies not just in content mastery, but in helping students who struggle with confidence, low attention span, or exam anxiety. She has successfully guided hundreds of students from failing grades to distinctions, but more importantly, helped them regain their love for learning.
                </p>
                <blockquote className="border-l-4 border-[#4BA3C7] pl-4 italic text-xl text-gray-700 my-6">
                  "Every child can improve when we stop forcing them to learn 'our way' and start understanding how they think."
                </blockquote>
             </div>
          </div>

          <div className="bg-[#F5F7FA] rounded-xl p-8">
             <h2 className="text-2xl font-bold text-[#0A2540] mb-6 text-center font-['Poppins']">Our Teaching Philosophy</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#4BA3C7] flex items-center justify-center text-white font-bold mt-1">1</div>
                  <p className="ml-4 text-gray-700"><strong>Diagnostics First:</strong> We don't guess. We assess gaps before rushing into the syllabus.</p>
               </div>
               <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#4BA3C7] flex items-center justify-center text-white font-bold mt-1">2</div>
                  <p className="ml-4 text-gray-700"><strong>Emotional Safety:</strong> Students must feel safe to make mistakes. That is how they learn.</p>
               </div>
               <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#4BA3C7] flex items-center justify-center text-white font-bold mt-1">3</div>
                  <p className="ml-4 text-gray-700"><strong>Customised Pace:</strong> Every student has a different speed. We adjust to them.</p>
               </div>
               <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-[#4BA3C7] flex items-center justify-center text-white font-bold mt-1">4</div>
                  <p className="ml-4 text-gray-700"><strong>Partnering Parents:</strong> We work with parents to create a supportive home environment.</p>
               </div>
             </div>
          </div>

          <div className="mt-16 text-center">
            <a
              href="https://wa.me/6598882675"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0A2540] hover:bg-[#4BA3C7] transition-colors"
            >
              Message us on WhatsApp
            </a>
          </div>
       </div>
    </div>
  );
};

export default About;