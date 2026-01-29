import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, BookOpen, Users } from 'lucide-react';

const MainLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900 flex flex-col text-white">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-5xl w-full relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
              Strategic Learning.<br />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">Measurable Excellence.</span>
            </h1>
            
            <p className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-slate-300 leading-relaxed font-light mb-8">
              Diagnostic-driven matching for academic success. From strategic educator pairing to long-term academic planning—we engineer results.
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center max-w-3xl mx-auto">
              <Link to="/tuition" className="flex-1">
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-2xl shadow-blue-900/50 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group">
                  For Families
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>

              <Link to="/enrichment" className="flex-1">
                <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 px-8 rounded-xl font-bold text-lg shadow-2xl shadow-emerald-900/50 hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group">
                  For Schools
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900 px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Vision */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <Zap className="w-12 h-12 text-blue-300 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Our Vision</h3>
              <p className="text-slate-200 leading-relaxed">
                Singapore's most trusted education consultancy—where diagnostic expertise meets human connection.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <BookOpen className="w-12 h-12 text-blue-300 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-slate-200 leading-relaxed">
                We eliminate guesswork from education. Every family gets diagnostic matching, the right tutor, and a clear path forward.
              </p>
            </div>

            {/* Values */}
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
              <Users className="w-12 h-12 text-blue-300 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">Our Values</h3>
              <p className="text-slate-200 leading-relaxed">
                Transparency. Excellence. Flexibility. We operate without long-term lock-ins, hidden fees, or false promises.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainLanding;
