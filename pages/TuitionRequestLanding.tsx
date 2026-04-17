import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Search } from 'lucide-react';
import ParentInquiryForm from '../components/ParentInquiryForm';

const TuitionRequestLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="bg-[linear-gradient(150deg,#0f172a_0%,#1e293b_55%,#0b3b2e_100%)] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/tuition"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 transition hover:text-white"
          >
            <ArrowLeft size={16} /> Back to Tuition Home
          </Link>
          <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                Parent Request Form
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">Find the Right Tutor Faster</h1>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                Tell us your child&apos;s level, subject, and goals. We&apos;ll match you with a vetted tutor aligned to your needs.
              </p>
              <ul className="mt-6 space-y-2">
                {[
                  'Matched by subject and teaching style',
                  'Transparent indicative rates',
                  'Switch anytime, no lock-in',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                    <CheckCircle size={15} className="mt-0.5 shrink-0 text-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
                <Search size={20} />
              </div>
              <p className="mt-3 text-sm text-slate-200">
                Average completion time: around 2-3 minutes. We will contact you after receiving the form.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <ParentInquiryForm />
          </div>
        </div>
      </section>
    </div>
  );
};

export default TuitionRequestLanding;