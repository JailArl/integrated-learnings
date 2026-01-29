import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { School, TrendingUp, Users, BookOpen, Award, Target, Brain, DollarSign, PieChart, Briefcase } from 'lucide-react';

const EnrichmentHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-6">
              <School className="w-5 h-5" />
              <span className="font-semibold">For Schools & Educational Institutions</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Financial Literacy Enrichment Program
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empower your students with essential life skills through our interactive simulation-based learning program. 
              Teach them to make the right choices at the right time.
            </p>
          </div>
        </div>
      </section>

      {/* Program Overview */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Program Overview</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Our enrichment program uses gamification to teach students about financial instruments, 
              decision-making, and real-world consequences. Through an engaging simulation game similar 
              to "Game of Life," students navigate various life scenarios and learn to make informed financial choices.
            </p>
            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
              <p className="text-gray-800 font-medium">
                <strong>Aligned with MOE's 21st Century Competencies Framework</strong> - 
                Developing responsible decision-making and financial literacy skills for future-ready students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Students Learn */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">What Students Learn</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="bg-green-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <DollarSign className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Stocks & Shares</h3>
                <p className="text-gray-600">
                  Understanding equity investments, risk vs. reward, and how the stock market works in simple terms.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="bg-blue-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Bonds & Fixed Income</h3>
                <p className="text-gray-600">
                  Learning about safer investment options, interest rates, and building stable financial foundations.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="bg-purple-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <PieChart className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">REITs & Property</h3>
                <p className="text-gray-600">
                  Exploring real estate investment trusts and understanding property as an investment vehicle.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="bg-orange-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Decision Making</h3>
                <p className="text-gray-600">
                  Making informed choices under pressure, evaluating trade-offs, and understanding consequences.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="bg-pink-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-7 h-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Critical Thinking</h3>
                <p className="text-gray-600">
                  Analyzing scenarios, weighing options, and developing strategic thinking skills for life.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="bg-yellow-100 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-7 h-7 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Long-term Planning</h3>
                <p className="text-gray-600">
                  Setting goals, understanding delayed gratification, and planning for future financial success.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">School Registration</h3>
              <p className="text-gray-600">
                Schools partner with us and receive unique access codes for their students.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Student Login</h3>
              <p className="text-gray-600">
                Students log in with their access codes and start the interactive simulation game.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Tracking</h3>
              <p className="text-gray-600">
                Teachers access dashboards to monitor student progress, decisions, and learning outcomes.
              </p>
            </div>
          </div>

          {/* Student Login Section */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-xl p-8 md:p-12 text-white text-center">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Students: Ready to Play?</h3>
            <p className="text-green-100 mb-6 text-lg">
              Enter your school-issued access code to begin your financial literacy journey
            </p>
            <Link to="/enrichment/login">
              <button className="bg-white text-green-600 hover:bg-green-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                Student Login
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits for Schools */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Why Partner With Us?</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <Award className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Engaging & Interactive</h3>
                <p className="text-gray-600">
                  Game-based learning keeps students motivated and engaged while teaching critical life skills.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <BookOpen className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Curriculum-Aligned</h3>
                <p className="text-gray-600">
                  Supports MOE's Character and Citizenship Education (CCE) and 21st Century Competencies.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-World Skills</h3>
                <p className="text-gray-600">
                  Students learn practical financial concepts they'll use throughout their lives.
                </p>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-lg">
                <Users className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Easy Implementation</h3>
                <p className="text-gray-600">
                  Simple setup, teacher dashboards, and full support from our team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Bring Financial Literacy to Your School</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join leading schools across Singapore in preparing students for real-world financial decisions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:schools@integratedlearnings.com.sg" 
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Contact Us for Partnership
            </a>
            <button 
              className="bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
              onClick={() => window.open('/enrichment-brochure.pdf', '_blank')}
            >
              Download Brochure
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            MOE-compliant educational program | Trusted by 50+ schools
          </p>
        </div>
      </section>
    </div>
  );
};

export default EnrichmentHome;
