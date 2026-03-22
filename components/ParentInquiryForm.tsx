import React, { useState, useRef } from 'react';
import { CheckCircle2, Send, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { submitParentInquiry, ParentSubmissionData } from '../services/parentSubmissions';

// ─── Student Levels (grouped for optgroup) ───
const STUDENT_LEVELS = [
  { group: 'Primary', options: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'] },
  { group: 'Secondary', options: ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4', 'Secondary 5'] },
  { group: 'Junior College', options: ['JC 1', 'JC 2'] },
  { group: 'Other', options: ['Poly', 'ITE'] },
];

// ─── Subjects by Level Group ───
const PRIMARY_LOWER_SUBJECTS = [
  'English', 'Mathematics', 'Science', 'Chinese', 'Malay', 'Tamil',
];

const PRIMARY_UPPER_SUBJECTS = [
  'English', 'Mathematics', 'Science',
  'Chinese', 'Malay', 'Tamil',
  'Higher Chinese', 'Higher Malay', 'Higher Tamil',
];

const SECONDARY_SUBJECTS = [
  'English', 'Mathematics', 'Additional Mathematics',
  'Physics', 'Chemistry', 'Biology', 'Combined Science',
  'Chinese', 'Malay', 'Tamil', 'Higher Chinese', 'Higher Malay', 'Higher Tamil',
  'History', 'Geography', 'Literature', 'Social Studies',
  'Principles of Accounting', 'Art', 'Design & Technology',
  'Food & Nutrition', 'Computing',
];

const JC_SUBJECTS = [
  'General Paper', 'Mathematics', 'Further Mathematics',
  'Physics', 'Chemistry', 'Biology',
  'Economics', 'History', 'Geography', 'Literature',
  'Art', 'Computing', 'China Studies',
  'Chinese', 'Malay', 'Tamil',
];

const OTHER_SUBJECTS = [
  'English', 'Mathematics', 'Science',
  'Chinese', 'Malay', 'Tamil',
  'Physics', 'Chemistry', 'Biology',
  'Economics', 'Accounting',
];

// ─── Level Variant Helpers ───
type LevelGroup = 'primary_lower' | 'primary_upper' | 'secondary' | 'jc' | 'other';

const getLevelGroup = (studentLevel: string): LevelGroup => {
  if (['Primary 1', 'Primary 2', 'Primary 3'].includes(studentLevel)) return 'primary_lower';
  if (['Primary 4', 'Primary 5', 'Primary 6'].includes(studentLevel)) return 'primary_upper';
  if (studentLevel.startsWith('Secondary')) return 'secondary';
  if (studentLevel.startsWith('JC')) return 'jc';
  return 'other';
};

const getSubjectsForLevel = (studentLevel: string): string[] => {
  switch (getLevelGroup(studentLevel)) {
    case 'primary_lower': return PRIMARY_LOWER_SUBJECTS;
    case 'primary_upper': return PRIMARY_UPPER_SUBJECTS;
    case 'secondary': return SECONDARY_SUBJECTS;
    case 'jc': return JC_SUBJECTS;
    default: return OTHER_SUBJECTS;
  }
};

const LEVEL_VARIANTS: Record<LevelGroup, string[]> = {
  primary_lower: [],
  primary_upper: ['Standard', 'Foundation'],
  secondary: ['G3', 'G2', 'G1'],
  jc: ['H2', 'H1', 'H3'],
  other: [],
};

const DEFAULT_VARIANT: Record<LevelGroup, string> = {
  primary_lower: '',
  primary_upper: 'Standard',
  secondary: 'G3',
  jc: 'H2',
  other: '',
};

// ─── Tutor Types with Indicative Rates per Level Tier ───
// Tiers: lowerPri (P1-3), upperPri (P4-6), lowerSec (S1-2), upperSec (S3-5), jc, other (Poly/ITE)
type RateTier = { lowerPri: string; upperPri: string; lowerSec: string; upperSec: string; jc: string; other: string };

const TUTOR_TYPES: { value: string; label: string; desc: string; rates: RateTier | null }[] = [
  {
    value: 'undergraduate',
    label: 'Undergraduate Tutor',
    desc: 'Current uni students with strong academic results',
    rates: { lowerPri: '$20', upperPri: '$25', lowerSec: '$28', upperSec: '$30', jc: '$40', other: '$30' },
  },
  {
    value: 'part-time',
    label: 'Part-time Tutor',
    desc: 'Working professionals who tutor regularly',
    rates: { lowerPri: '$25', upperPri: '$30', lowerSec: '$35', upperSec: '$40', jc: '$55', other: '$40' },
  },
  {
    value: 'full-time',
    label: 'Full-time Tutor',
    desc: 'Dedicated career tutors with proven track records',
    rates: { lowerPri: '$35', upperPri: '$45', lowerSec: '$50', upperSec: '$55', jc: '$75', other: '$55' },
  },
  {
    value: 'ex-moe',
    label: 'Ex/Current MOE Teacher',
    desc: 'NIE-trained school teachers',
    rates: { lowerPri: '$50', upperPri: '$60', lowerSec: '$65', upperSec: '$70', jc: '$100', other: '$70' },
  },
  {
    value: 'no-preference',
    label: 'No Preference',
    desc: 'Let our advisor recommend the best fit',
    rates: null,
  },
];

const getRateTier = (studentLevel: string): keyof RateTier => {
  if (['Primary 1', 'Primary 2', 'Primary 3'].includes(studentLevel)) return 'lowerPri';
  if (studentLevel.startsWith('Primary')) return 'upperPri';
  if (['Secondary 1', 'Secondary 2'].includes(studentLevel)) return 'lowerSec';
  if (studentLevel.startsWith('Secondary')) return 'upperSec';
  if (studentLevel.startsWith('JC')) return 'jc';
  return 'other';
};

const getRateForLevel = (rates: RateTier | null, studentLevel: string): string => {
  if (!rates || !studentLevel) return '';
  return rates[getRateTier(studentLevel)];
};

// ─── Other Options ───
const MODES = [
  { value: 'home', label: 'Home-based (1-to-1)' },
  { value: 'online', label: 'Online Sessions' },
  { value: 'group', label: 'Small Group (2-4 students)' },
  { value: 'unsure', label: 'Not sure – need advice' },
];

const LESSON_SCHEDULES = [
  'Weekday after school (2pm–5pm)',
  'Weekday evening (6pm–9pm)',
  'Saturday morning',
  'Saturday afternoon',
  'Sunday',
  'Flexible – any day',
];

// ─── Subject Entry Type ───
interface SubjectEntry {
  name: string;
  variant: string;
}

// ═══════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════

const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes between submissions
const MIN_FILL_TIME_MS = 3000; // Reject if filled in under 3 seconds

const ParentInquiryForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);
  const submittingRef = useRef(false);
  const formLoadTime = useRef(Date.now());
  const [honeypot, setHoneypot] = useState('');

  // Form fields
  const [parentName, setParentName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [studentLevel, setStudentLevel] = useState('');
  const [preferredMode, setPreferredMode] = useState('home');
  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [learningNeeds, setLearningNeeds] = useState('');
  const [tutorType, setTutorType] = useState('');
  const [preferredSchedule, setPreferredSchedule] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Subject selection (internal, serialized on submit)
  const [selectedSubjects, setSelectedSubjects] = useState<SubjectEntry[]>([]);

  // Derived
  const levelGroup = getLevelGroup(studentLevel);
  const availableSubjects = studentLevel ? getSubjectsForLevel(studentLevel) : [];
  const variants = LEVEL_VARIANTS[levelGroup];
  const hasVariants = variants.length > 0;

  // ─── Handlers ───

  const handleStudentLevelChange = (newLevel: string) => {
    setStudentLevel(newLevel);
    const available = getSubjectsForLevel(newLevel);
    const newGroup = getLevelGroup(newLevel);
    setSelectedSubjects((prev) =>
      prev
        .filter((s) => available.includes(s.name))
        .map((s) => ({
          ...s,
          variant: LEVEL_VARIANTS[newGroup].length > 0 ? DEFAULT_VARIANT[newGroup] : '',
        })),
    );
  };

  const toggleSubject = (name: string) => {
    setSelectedSubjects((prev) => {
      if (prev.some((s) => s.name === name)) {
        return prev.filter((s) => s.name !== name);
      }
      return [...prev, { name, variant: DEFAULT_VARIANT[levelGroup] }];
    });
  };

  const updateSubjectVariant = (name: string, variant: string) => {
    setSelectedSubjects((prev) =>
      prev.map((s) => (s.name === name ? { ...s, variant } : s)),
    );
  };

  const handlePostalCodeChange = async (value: string) => {
    const clean = value.replace(/\D/g, '').slice(0, 6);
    setPostalCode(clean);

    if (clean.length === 6) {
      setAddressLoading(true);
      try {
        const res = await fetch(
          `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(clean)}&returnGeom=Y&getAddrDetails=Y`,
        );
        const data = await res.json();
        const match = data.results?.find((r: any) => r.POSTAL === clean);
        if (match) {
          const addr = (match.ADDRESS || '').replace(/\s*SINGAPORE\s*\d{6}\s*$/i, '').trim();
          setAddress(addr);
        }
      } catch {
        // Silent fail — user can enter address manually
      }
      setAddressLoading(false);
    }
  };

  const serializeSubjects = (): string[] =>
    selectedSubjects.map((s) => (s.variant ? `${s.name} (${s.variant})` : s.name));

  // ─── Validation ───

  const validate = (): string | null => {
    if (!parentName.trim()) return 'Your name is required.';
    if (!studentName.trim()) return "Student's name is required.";
    const phone = contactNumber.replace(/\s/g, '');
    if (!phone || !/^[89]\d{7}$/.test(phone))
      return 'Please enter a valid Singapore phone number (8 digits starting with 8 or 9).';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return 'Please enter a valid email address.';
    if (!studentLevel) return 'Student level is required.';
    if (selectedSubjects.length === 0) return 'Select at least one subject.';
    return null;
  };

  // ─── Submit ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setError('');

    // Anti-spam: honeypot
    if (honeypot) return;

    // Anti-spam: too fast (bot filled form instantly)
    if (Date.now() - formLoadTime.current < MIN_FILL_TIME_MS) {
      setError('Please take a moment to fill out the form properly.');
      return;
    }

    // Anti-spam: cooldown (10 min between submissions)
    const lastSubmit = localStorage.getItem('il_last_inquiry');
    if (lastSubmit && Date.now() - Number(lastSubmit) < COOLDOWN_MS) {
      setError('You have already submitted an inquiry recently. Please wait before submitting again.');
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    submittingRef.current = true;
    setLoading(true);

    const data: ParentSubmissionData = {
      parent_name: parentName.trim(),
      student_name: studentName.trim(),
      contact_number: contactNumber.replace(/\s/g, ''),
      email: email.trim(),
      student_level: studentLevel,
      subjects: serializeSubjects(),
      preferred_mode: preferredMode,
      postal_code: postalCode,
      address: address.trim(),
      learning_needs: learningNeeds.trim(),
      tutor_type: tutorType,
      preferred_schedule: preferredSchedule,
      additional_notes: additionalNotes.trim(),
    };

    const result = await submitParentInquiry(data);
    setLoading(false);

    if (!result.success) {
      submittingRef.current = false;
      setError(result.error || 'Something went wrong. Please try again.');
      return;
    }

    setSubmitted(true);
    localStorage.setItem('il_last_inquiry', String(Date.now()));
  };

  // ═══ SUBMITTED STATE ═══

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center md:p-12">
        <CheckCircle2 size={48} className="mx-auto mb-4 text-green-600" />
        <h3 className="text-2xl font-bold text-slate-900">Inquiry Submitted!</h3>
        <p className="mx-auto mt-3 max-w-md text-slate-600">
          We&rsquo;ve received your request and will be in touch within 1&ndash;2 business days to discuss your child&rsquo;s learning needs.
        </p>
        <a
          href="https://wa.me/6598882675"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <MessageCircle size={20} />
          Chat on WhatsApp for faster response
        </a>
        <a
          href="/tuition"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft size={16} />
          Return to Home
        </a>
      </div>
    );
  }

  // ═══ FORM ═══

  const inputClass =
    'w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Honeypot — hidden from humans, bots auto-fill it */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
        <label htmlFor="website_url">Leave this empty</label>
        <input
          type="text"
          id="website_url"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <p className="text-sm leading-relaxed text-slate-600">
        Tell us about your child&rsquo;s learning needs &mdash; our advisor will match them with the most suitable tutor within 2&ndash;3 business days.
      </p>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ─── Parent & Student Info ─── */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Your Name *</label>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            placeholder="e.g. Sarah Tan"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Contact Number *</label>
          <input
            type="tel"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="e.g. 9123 4567"
            className={inputClass}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email Address *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className={inputClass}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Student&rsquo;s Name *</label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="e.g. Ryan Tan"
            className={inputClass}
            required
          />
        </div>
      </div>

      {/* ─── Level & Format ─── */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Current Level *</label>
          <select
            value={studentLevel}
            onChange={(e) => handleStudentLevelChange(e.target.value)}
            className={inputClass}
            required
          >
            <option value="">Select level</option>
            {STUDENT_LEVELS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Preferred Learning Format</label>
          <select
            value={preferredMode}
            onChange={(e) => setPreferredMode(e.target.value)}
            className={inputClass}
          >
            {MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── Subjects with Level Variants ─── */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Subjects Needed *</label>
        {!studentLevel ? (
          <p className="mb-2 text-xs text-amber-600">Select a student level first to see relevant subjects.</p>
        ) : (
          <>
            {hasVariants && (
              <p className="mb-2 text-xs text-slate-500">
                {levelGroup === 'primary_upper' && 'Tap a subject, then set Standard or Foundation level below.'}
                {levelGroup === 'secondary' && 'Tap a subject, then set G1, G2, or G3 level below.'}
                {levelGroup === 'jc' && 'Tap a subject, then set H1, H2, or H3 level below.'}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {availableSubjects.map((subject) => {
                const isSelected = selectedSubjects.some((s) => s.name === subject);
                return (
                  <button
                    type="button"
                    key={subject}
                    onClick={() => toggleSubject(subject)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>

            {/* Level selectors for each selected subject */}
            {hasVariants && selectedSubjects.length > 0 && (
              <div className="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Subject Levels
                </p>
                {selectedSubjects.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                    <div className="flex gap-1">
                      {variants.map((v) => (
                        <button
                          type="button"
                          key={v}
                          onClick={() => updateSubjectVariant(entry.name, v)}
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                            entry.variant === v
                              ? 'bg-blue-600 text-white'
                              : 'border border-slate-300 bg-white text-slate-500 hover:border-blue-400'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Learning Needs (merged challenge + goals) ─── */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">
          What&rsquo;s happening with your child&rsquo;s learning?
        </label>
        <textarea
          value={learningNeeds}
          onChange={(e) => setLearningNeeds(e.target.value)}
          rows={4}
          placeholder="Tell us what your child is finding difficult and what you'd like to see improve.&#10;&#10;e.g. Struggling with A-Math topics since Sec 3, aiming to improve from C5 to B3 by O-Levels. Needs help with exam technique and confidence..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* ─── Tutor Type (replaces budget) ─── */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-700">Preferred Tutor Type</label>
        <div className="grid gap-2 sm:grid-cols-2">
          {TUTOR_TYPES.map((type) => {
            const rate = getRateForLevel(type.rates, studentLevel);
            const isSelected = tutorType === type.value;
            return (
              <button
                type="button"
                key={type.value}
                onClick={() => setTutorType(type.value)}
                className={`rounded-lg border-2 p-3 text-left transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                    {type.label}
                  </span>
                  {rate && (
                    <span className={`ml-2 whitespace-nowrap text-xs font-bold ${isSelected ? 'text-blue-600' : 'text-emerald-600'}`}>
                      from {rate}/hr
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{type.desc}</p>
              </button>
            );
          })}
        </div>
        {!studentLevel && (
          <p className="mt-1.5 text-xs text-slate-400">Select a student level above to see indicative rates.</p>
        )}
        <p className="mt-1.5 text-xs text-slate-400">Rates shown are indicative starting prices per hour and may vary.</p>
      </div>

      {/* ─── Location (Postal Code + Address) ─── */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Location</label>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="relative">
            <input
              type="text"
              value={postalCode}
              onChange={(e) => handlePostalCodeChange(e.target.value)}
              placeholder="Postal code (6 digits)"
              maxLength={6}
              inputMode="numeric"
              className={inputClass}
            />
            {addressLoading && (
              <Loader2
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-blue-500"
              />
            )}
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={postalCode.length === 6 ? 'Address (auto-filled — edit if needed)' : 'Or type your address / area'}
            className={inputClass}
          />
        </div>
      </div>

      {/* ─── Lesson Schedule ─── */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Preferred Lesson Schedule</label>
        <select
          value={preferredSchedule}
          onChange={(e) => setPreferredSchedule(e.target.value)}
          className={inputClass}
        >
          <option value="">When is your child available for lessons?</option>
          {LESSON_SCHEDULES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* ─── Additional Notes ─── */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700">Anything else we should know?</label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          rows={2}
          placeholder="e.g. Child prefers female tutor, has upcoming exam in May, needs bilingual tutor..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* ─── Submit ─── */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting...
          </span>
        ) : (
          <>
            <Send size={18} />
            Request Learning Assessment
          </>
        )}
      </button>

      <p className="text-center text-xs text-slate-500">
        No account needed. We&rsquo;ll reach out within 1&ndash;2 business days.
      </p>
    </form>
  );
};

export default ParentInquiryForm;
