import React from 'react';
import { Link } from 'react-router-dom';
import { PageRoutes } from '../types';

const Services: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="bg-[#F5F7FA] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-[#0A2540] font-['Poppins']">Our Services</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            We offer flexible tuition options tailored to your logistical needs and your child's learning preference.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Service 1 */}
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:w-1/3">
            <img 
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80" 
              alt="Home Tuition" 
              className="h-full w-full object-cover" 
            />
          </div>
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-[#0A2540] mb-4">1-to-1 Home Tuition</h2>
            <p className="text-gray-600 mb-4">
              The classic, most effective method for personalised attention. A specialized tutor visits your home to work directly with your child, following a customized curriculum plan.
            </p>
            <ul className="list-disc list-inside text-gray-500 mb-6">
              <li>Convenience of your own home</li>
              <li>Full attention on your child's specific weaknesses</li>
              <li>Immediate feedback and correction</li>
            </ul>
          </div>
        </div>

        {/* Service 2 */}
        <div className="flex flex-col md:flex-row-reverse bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:w-1/3">
            <img 
              src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=600&q=80" 
              alt="Online Tuition" 
              className="h-full w-full object-cover" 
            />
          </div>
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-[#0A2540] mb-4">1-to-1 Online Tuition</h2>
            <p className="text-gray-600 mb-4">
              Perfect for busy schedules or students who prefer digital learning. We use interactive whiteboards and screen sharing to make lessons just as engaging as face-to-face.
            </p>
            <ul className="list-disc list-inside text-gray-500 mb-6">
              <li>Access the best tutors regardless of location</li>
              <li>Flexible scheduling</li>
              <li>Recorded lessons for revision (optional)</li>
            </ul>
          </div>
        </div>

        {/* Service 3 */}
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden">
           <div className="md:w-1/3">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80" 
              alt="Mini Group" 
              className="h-full w-full object-cover" 
            />
          </div>
          <div className="p-8 md:w-2/3 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-[#0A2540] mb-4">Mini-Group Tuition</h2>
            <p className="text-gray-600 mb-4">
              Small groups of 2-4 students. Ideal for students who thrive on peer interaction and healthy competition, at a more affordable rate.
            </p>
            <ul className="list-disc list-inside text-gray-500 mb-6">
              <li>Peer learning opportunities</li>
              <li>Lower cost per student</li>
              <li>Currently available for Math and Science (P3-Sec2)</li>
            </ul>
          </div>
        </div>

        {/* Service 4 */}
        <div className="bg-[#0A2540] text-white rounded-lg p-8 text-center">
           <h2 className="text-2xl font-bold mb-2">Online Bootcamps</h2>
           <p className="text-[#4BA3C7] font-bold mb-4">COMING SOON</p>
           <p className="text-gray-300 max-w-2xl mx-auto">
             Intensive holiday programs focusing on specific topics (e.g., "Mastering Algebra", "P6 Science Open-Ended Questions"). Stay tuned!
           </p>
        </div>

        <div className="text-center bg-blue-50 p-6 rounded-lg">
          <p className="text-[#0A2540] italic mb-6">
            "Fees depend on the level, subject, and the tutor's qualifications/experience."
          </p>
          <div className="flex justify-center gap-4">
            <Link to={PageRoutes.PARENTS} className="bg-[#0A2540] text-white px-6 py-3 rounded-md hover:bg-[#4BA3C7] transition-colors">
              Request a Tutor
            </Link>
            <Link to={PageRoutes.DIAGNOSTIC} className="bg-white border border-[#0A2540] text-[#0A2540] px-6 py-3 rounded-md hover:bg-gray-50 transition-colors">
              Book Diagnostic
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;