import React, { useState } from 'react';
import { CheckCircle2, Send, MessageCircle } from 'lucide-react';
import { submitParentInquiry, ParentSubmissionData } from '../services/parentSubmissions';

const STUDENT_LEVELS = [
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  'Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4', 'Secondary 5',
  'JC 1', 'JC 2', 'Poly', 'ITE',
];

const SUBJECTS = [
  'English', 'Mathematics', 'Science', 'Chinese', 'Malay', 'Tamil',
  'Additional Mathematics', 'Elementary Mathematics', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Literature', 'Social Studies',
  'General Paper', 'Economics', 'Accounting',
];

const BUDGET_RANGES = [
  '$30 - $45/hr', '$45 - $60/hr', '$60 - $80/hr', '$80 - $100/hr', '$100+/hr', 'Discuss with advisor',
];

const MODES = [
  { value: 'home', label: 'Home Tuition (1-to-1)' },
  { value: 'online', label: 'Online Tuition' },
  { value: 'group', label: 'Small Group (2-4 students)' },
];

const CONTACT_TIMINGS = [
  'Weekday Morning (9am-12pm)',
  'Weekday Afternoon (12pm-5pm)',
  'Weekday Evening (5pm-9pm)',
  'Weekend Morning',
  'Weekend Afternoon',
  'Anytime',
];

const ParentInquiryForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ParentSubmissionData>({
    parent_name: '',
    contact_number: '',
    email: '',
    student_level: '',
    subjects: [],
    preferred_mode: 'home',
    location: '',
    budget_range: '',
    current_challenge: '',
    goals: '',
    preferred_contact_timing: '',
    additional_notes: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const validate = (): string | null => {
    if (!formData.parent_name.trim()) return 'Parent name is required.';
    if (!formData.contact_number.trim()) return 'Contact number is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Valid email is required.';
    if (!formData.student_level) return 'Student level is required.';
    if (formData.subjects.length === 0) return 'Select at least one subject.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const result = await submitParentInquiry(formData);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Something went wrong. Please try again.');
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center md:p-12">
        <CheckCircle2 size={48} className="mx-auto mb-4 text-green-600" />
        <h3 className="text-2xl font-bold text-slate-900">Inquiry Submitted!</h3>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          We've received your request and will be in touch within 1-2 business days to discuss your child's learning needs.
        </p>
        <a
          href="https://wa.me/98882675"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <MessageCircle size={20} />
          Chat on WhatsApp for faster response
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Your Name *</label>
          <input
            type="text"
            name="parent_name"
            value={formData.parent_name}
            onChange={handleChange}
            placeholder="e.g. Sarah Tan"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Contact Number *</label>
          <input
            type="tel"
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            placeholder="e.g. 9123 4567"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="your.email@example.com"
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          required
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Student Level *</label>
          <select
            name="student_level"
            value={formData.student_level}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            required
          >
            <option value="">Select level</option>
            {STUDENT_LEVELS.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Preferred Mode</label>
          <select
            name="preferred_mode"
            value={formData.preferred_mode}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            {MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>{mode.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Subjects Needed *</label>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((subject) => (
            <button
              type="button"
              key={subject}
              onClick={() => toggleSubject(subject)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                formData.subjects.includes(subject)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'border border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Location / Area</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Tampines, 520123"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Budget Range</label>
          <select
            name="budget_range"
            value={formData.budget_range}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            <option value="">Select budget</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Current Challenge</label>
        <textarea
          name="current_challenge"
          value={formData.current_challenge}
          onChange={handleChange}
          rows={3}
          placeholder="Describe what your child is struggling with, e.g. weak in problem sums, loses marks on careless mistakes..."
          className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Goals</label>
        <textarea
          name="goals"
          value={formData.goals}
          onChange={handleChange}
          rows={2}
          placeholder="What do you hope tuition will achieve? e.g. improve from B4 to A2 by end of year..."
          className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Preferred Contact Timing</label>
          <select
            name="preferred_contact_timing"
            value={formData.preferred_contact_timing}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          >
            <option value="">When shall we call?</option>
            {CONTACT_TIMINGS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Additional Notes</label>
          <input
            type="text"
            name="additional_notes"
            value={formData.additional_notes}
            onChange={handleChange}
            placeholder="Anything else we should know"
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Submitting...
          </span>
        ) : (
          <>
            <Send size={18} />
            Submit Inquiry – Get Matched Free
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        No account needed. We'll reach out within 1-2 business days.
      </p>
    </form>
  );
};

export default ParentInquiryForm;
