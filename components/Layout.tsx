
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Phone } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const isActive = (path: string) => location.pathname === path;
  const isAdminPage = location.pathname === '/admin';

  if (isAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface font-sans text-slate-800">
      {/* Header */}
      <header className="fixed w-full z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 py-3">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3" onClick={() => setIsMenuOpen(false)}>
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-3 py-2 rounded-lg font-bold text-xl tracking-tight shadow-md">
                IL
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-xl text-primary tracking-tight leading-tight">Integrated Learnings</span>
                <p className="text-xs text-slate-500 -mt-1">Education Consultancy</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6 h-full">
              <Link to="/" className={`${isActive('/') ? 'text-secondary font-semibold' : 'text-slate-600'} hover:text-secondary transition text-sm`}>Home</Link>
              <Link to="/about" className={`${isActive('/about') ? 'text-secondary font-semibold' : 'text-slate-600'} hover:text-secondary transition text-sm`}>About</Link>
              <Link to="/pricing" className={`${isActive('/pricing') ? 'text-secondary font-semibold' : 'text-slate-600'} hover:text-secondary transition text-sm`}>Pricing</Link>

              {/* Dropdown with full height container to fix hover gap */}
              <div className="relative group h-full flex items-center">
                <button className="flex items-center text-slate-600 hover:text-secondary transition text-sm py-2">
                  Login <ChevronDown size={14} className="ml-1" />
                </button>
                {/* Dropdown Content */}
                <div className="absolute right-0 top-full pt-2 w-56 hidden group-hover:block z-50">
                  <div className="bg-white border border-slate-100 shadow-lg rounded-lg overflow-hidden">
                    <div className="px-4 py-2 bg-slate-50 font-bold text-xs text-slate-700 uppercase">Parents</div>
                    <Link to="/parents" className="block px-4 py-3 hover:bg-blue-50 text-sm text-slate-700 border-b border-slate-100">👨‍👩‍👧 Parent Dashboard</Link>
                    
                    <div className="px-4 py-2 bg-slate-50 font-bold text-xs text-slate-700 uppercase">Tutors</div>
                    <Link to="/tutors" className="block px-4 py-3 hover:bg-green-50 text-sm text-slate-700">🎓 Tutor Dashboard</Link>
                  </div>
                </div>
              </div>

              <Link to="/contact" className="bg-secondary hover:bg-blue-800 text-white px-5 py-2 rounded-full text-sm font-medium transition shadow-lg shadow-blue-900/20">
                Contact Us
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button className="md:hidden text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <button onClick={() => handleNav('/')} className="block w-full text-left py-2 font-medium text-slate-700">Home</button>
              <button onClick={() => handleNav('/about')} className="block w-full text-left py-2 font-medium text-slate-700">About Us</button>
              <hr className="border-slate-100" />
              <button onClick={() => handleNav('/parents')} className="block w-full text-left py-2 text-slate-600">Parent Login</button>
              <button onClick={() => handleNav('/tutors')} className="block w-full text-left py-2 text-slate-600">Tutor Login</button>
              <button onClick={() => handleNav('/contact')} className="block w-full text-center bg-secondary text-white py-3 rounded-lg font-medium mt-4">Contact Us</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-slate-300 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4">Integrated Learnings</h3>
            <p className="text-sm leading-relaxed mb-4 text-slate-400 max-w-sm">
              Singapore's premier education agency. We specialize in strategic academic planning, holistic development, and high-performance tuition matching.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Portals</h4>
            <ul className="space-y-2 text-sm">
               <li><Link to="/parents" className="hover:text-white transition">Parent / Student Login</Link></li>
               <li><Link to="/tutors" className="hover:text-white transition">Tutor Partner Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/policies" className="hover:text-white transition">Policies & Terms</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Integrated Learnings Singapore. All rights reserved.
          <div className="mt-2">
            WhatsApp: 9888 2675 | Email: manage.integrated.learnings@gmail.com
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a 
        href="https://wa.me/98882675" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 z-40 flex items-center font-bold"
      >
        <Phone size={20} className="mr-2 fill-current" />
        WhatsApp
      </a>
    </div>
  );
};
