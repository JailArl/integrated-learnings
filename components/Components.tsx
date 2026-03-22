import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Section: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = "", id }) => (
  <section id={id} className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto ${className}`}>
    {children}
  </section>
);

export const Button: React.FC<{ 
  to?: string; 
  onClick?: () => void; 
  variant?: 'primary' | 'outline' | 'white'; 
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}> = ({ to, onClick, variant = 'primary', children, className = "", disabled }) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition duration-200 text-base shadow-sm";
  const variants = {
    primary: "bg-secondary text-white hover:bg-blue-800 shadow-blue-900/20",
    outline: "border-2 border-secondary text-secondary hover:bg-blue-50",
    white: "bg-white text-primary hover:bg-slate-100"
  };

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

  const combinedClasses = `${baseStyles} ${variants[variant]} ${className} ${disabledStyles}`;

  if (to && !disabled) return <Link to={to} className={combinedClasses}>{children}</Link>;
  return <button onClick={onClick} disabled={disabled} className={combinedClasses}>{children}</button>;
};

export const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
    <h3 className="text-xl font-bold text-primary mb-4">{title}</h3>
    <div className="text-slate-600 space-y-2">
      {children}
    </div>
  </div>
);

export const PageHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="bg-primary text-white py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">{title}</h1>
      {subtitle && <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  </div>
);

export const RoadmapCard: React.FC<{ id: string; title: string }> = ({ id, title }) => (
  <Link to={`/tuition/roadmap/${id}`} className="group block bg-white border border-slate-200 rounded-lg p-6 hover:shadow-md hover:border-secondary transition text-center h-full flex items-center justify-center flex-col">
    <span className="font-semibold text-lg text-slate-800 group-hover:text-secondary transition">{title}</span>
    <span className="mt-2 text-sm text-slate-400 opacity-0 group-hover:opacity-100 transition flex items-center">
      Learn More <ChevronRight size={14} className="ml-1" />
    </span>
  </Link>
);