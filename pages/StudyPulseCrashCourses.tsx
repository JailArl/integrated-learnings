import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarCheck, CheckCircle2, Clock3, Flame, MessageSquare, Star } from 'lucide-react';

const StudyPulseCrashCourses: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#faf8f4] text-slate-900">
      <section className="relative overflow-hidden bg-[linear-gradient(150deg,#7f1d1d_0%,#9a3412_50%,#0f172a_100%)] px-4 pb-16 pt-20 text-white sm:px-6 lg:px-8 lg:pb-20">
        <div className="absolute inset-0 opacity-40" aria-hidden="true">
          <div className="absolute left-[-8%] top-10 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute right-[-8%] top-24 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-amber-200">
            <Flame size={14} /> June 2026 Intake · Limited Seats
          </p>
          <h1 className="mt-5 text-3xl font-black leading-tight sm:text-5xl">PSLE & O-Level Holiday Crash Courses</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
            Built for the last 2 weeks of June holidays. Half-day format: PSLE in the morning and O-Level in the afternoon,
            so both groups get focused attention without schedule clashes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="https://wa.me/6598882675?text=Hi%2C%20I%27d%20like%20to%20reserve%20a%20spot%20for%20the%20June%20Holiday%20Crash%20Course"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-7 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition hover:bg-amber-300"
            >
              Reserve a Spot via WhatsApp <ArrowRight size={15} className="ml-2" />
            </a>
            <Link
              to="/studypulse"
              className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20"
            >
              Back to StudyPulse
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-sky-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-sky-600">PSLE · P6</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">10-Session PSLE Morning Track</h2>
            <p className="mt-2 text-sm text-slate-600">Math + Science only. 5 half-day sessions per subject across the final 2 holiday weeks.</p>

            <div className="mt-5 space-y-2">
              <p className="flex items-start gap-2 text-sm text-slate-700"><CalendarCheck size={15} className="mt-0.5 text-sky-600" /> 16 - 25 June 2026 (last 2 holiday weeks)</p>
              <p className="flex items-start gap-2 text-sm text-slate-700"><BookOpen size={15} className="mt-0.5 text-sky-600" /> Math: 16,18,20,22,24 · Science: 17,19,21,23,25</p>
              <p className="flex items-start gap-2 text-sm text-slate-700"><Clock3 size={15} className="mt-0.5 text-sky-600" /> Morning 10am-1pm (PSLE track)</p>
            </div>

            <ul className="mt-5 space-y-2">
              {[
                'All materials provided (worksheets + past-year papers + summary notes)',
                'Max 6 students per class',
                'Exam-technique drills built into every morning block',
                'Post-course parent recap with next-step focus areas',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-sky-600" /> {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Pricing</p>
              <p className="mt-1 text-xl font-black text-slate-900">$320 / subject <span className="text-sm font-medium text-slate-500 line-through ml-2">$380</span></p>
              <p className="mt-1 text-xs text-slate-600">Early bird before 20 May. 5 half-days (15 hours) per subject. Materials included.</p>
            </div>
          </article>

          <article className="rounded-3xl border border-emerald-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">O-Level · Sec 4/5</p>
            <h2 className="mt-2 text-2xl font-black text-slate-900">O-Level Afternoon Track</h2>
            <p className="mt-2 text-sm text-slate-600">2 half-days per subject. Choose weak-topic subjects and we prepare tailored material packs before class.</p>

            <div className="mt-5 space-y-2">
              <p className="flex items-start gap-2 text-sm text-slate-700"><CalendarCheck size={15} className="mt-0.5 text-emerald-600" /> 16 - 25 June 2026 (last 2 holiday weeks)</p>
              <p className="flex items-start gap-2 text-sm text-slate-700"><Star size={15} className="mt-0.5 text-emerald-600" /> Physics (16-17) · Chemistry (18-19) · A Math (20-21) · E Math (22-23) · Clinic/Mock (24-25)</p>
              <p className="flex items-start gap-2 text-sm text-slate-700"><Clock3 size={15} className="mt-0.5 text-emerald-600" /> Afternoon 2pm-5pm (O-Level track)</p>
            </div>

            <ul className="mt-5 space-y-2">
              {[
                'Parents select weak topics first (topic-level customisation)',
                'Custom material packet prepared for each student',
                'Timed TYS-style drills under exam conditions',
                'Small group max 6 for targeted coaching',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" /> {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Pricing</p>
              <p className="mt-1 text-xl font-black text-slate-900">$280 / subject <span className="text-sm font-medium text-slate-500 line-through ml-2">$340</span></p>
              <p className="mt-1 text-xs text-slate-600">Early bird before 20 May. 2 half-days (6 hours) per subject. Materials included.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h3 className="text-center text-xl font-black text-slate-900 sm:text-2xl">Daily Operating Model (16 - 25 June)</h3>
          <p className="mt-2 text-center text-sm text-slate-600">Morning slot for PSLE, afternoon slot for O-Level. One classroom can run both tracks efficiently.</p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 font-bold">Date</th>
                  <th className="px-4 py-3 font-bold">10:00am - 1:00pm (PSLE)</th>
                  <th className="px-4 py-3 font-bold">2:00pm - 5:00pm (O-Level)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['16 Jun', 'Math', 'Physics'],
                  ['17 Jun', 'Science', 'Physics'],
                  ['18 Jun', 'Math', 'Chemistry'],
                  ['19 Jun', 'Science', 'Chemistry'],
                  ['20 Jun', 'Math', 'A Math'],
                  ['21 Jun', 'Science', 'A Math'],
                  ['22 Jun', 'Math', 'E Math'],
                  ['23 Jun', 'Science', 'E Math'],
                  ['24 Jun', 'Math', 'Weak-topic clinic'],
                  ['25 Jun', 'Science', 'Mock + correction clinic'],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-slate-100">
                    <td className="px-4 py-2.5 font-semibold text-slate-700">{row[0]}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row[1]}</td>
                    <td className="px-4 py-2.5 text-slate-600">{row[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Limited Seats</p>
            <p className="mt-1 text-sm text-slate-700">Only 6 students per class. First come, first served.</p>
          </div>
          <a
            href="https://wa.me/6598882675?text=Hi%2C%20I%27d%20like%20to%20reserve%20for%20PSLE%20or%20O-Level%20June%20Crash%20Course"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
          >
            <MessageSquare size={15} className="mr-2" /> Chat on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
};

export default StudyPulseCrashCourses;