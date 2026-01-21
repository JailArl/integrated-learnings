import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A2540] text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm">© Integrated Learnings 2025. All rights reserved.</p>
        </div>
        <div className="flex space-x-6 text-sm text-gray-300">
          <a href="#" className="hover:text-[#4BA3C7]">Privacy Policy</a>
          <a href="#" className="hover:text-[#4BA3C7]">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;