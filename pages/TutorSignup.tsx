import React, { useState } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { signUpTutor } from '../services/auth';
import { PageHeader, Section } from '../components/Components';
import { Mail, Lock, Phone, User, Calendar, UserCircle, Eye, EyeOff } from 'lucide-react';

type PendingTutorSignup = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
};

export const TutorSignup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
  }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const runSignup = async (payload: PendingTutorSignup) => {
    setLoading(true);
    const result = await signUpTutor(
      payload.email,
      payload.password,
      {
        fullName: payload.fullName,
        phone: payload.phone,
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
      }
    );

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Signup failed');
      return;
    }

    if (result.needsEmailVerification) {
      setSuccess('Account created. Please verify your email first, then log in to complete onboarding.');
      setTimeout(() => navigate('/tutors/login'), 1200);
      return;
    }

    setSuccess('Account created successfully. Redirecting you to onboarding...');
    setTimeout(() => navigate('/tutors/onboarding'), 500);
  };

  React.useEffect(() => {
    const shouldContinueFromPolicy = searchParams.get('policyAck') === '1';
    const state = location.state as { policyAck?: boolean; pendingSignup?: PendingTutorSignup } | null;

    if (!shouldContinueFromPolicy || !state?.policyAck || !state.pendingSignup) return;

    setError('');
    setSuccess('Policy acknowledged. Creating your account...');
    void runSignup(state.pendingSignup);
    navigate('/tutors/signup', { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, location.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    const value = e.target.value;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[e.target.name as keyof typeof fieldErrors]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const nextErrors: typeof fieldErrors = {};
    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!formData.email.includes('@')) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (!formData.dateOfBirth) {
      nextErrors.dateOfBirth = 'Date of birth is required.';
    }
    if (!formData.gender) {
      nextErrors.gender = 'Please select a gender.';
    }
    if (!formData.password) {
      nextErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }
    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!formData.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    }

    // Age validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        nextErrors.dateOfBirth = 'You must be at least 18 years old to register.';
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});

    const pendingSignup: PendingTutorSignup = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
    };

    navigate('/tuition/policies?tab=tutors&ackFlow=tutor-signup', {
      state: {
        pendingSignup,
        returnTo: '/tutors/signup',
      },
    });
  };

  return (
    <div>
      <PageHeader 
        title="Join Our Educator Network" 
        subtitle="Create your account and start connecting with students" 
      />
      
      <Section className="bg-gradient-to-br from-green-50 to-slate-50 py-12">
        <div className="max-w-5xl mx-auto grid gap-8 lg:grid-cols-[1fr,1.1fr]">
          <div className="rounded-2xl border border-green-200 bg-white p-7 shadow-sm">
            <p className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-green-700">
              For New Tutors
            </p>
            <h2 className="mt-4 text-3xl font-black text-gray-900">Keep More Earnings. Teach Better-Fit Students.</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Join our Singapore tutor network with a fee model and matching process designed to help you grow sustainable, high-quality assignments.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-gray-700">
              <li>• 25% service fee applies only for your first 2 months per assignment</li>
              <li>• Better-fit parent and student matching by subject, level, and teaching style</li>
              <li>• Less mismatch, smoother lessons, stronger retention</li>
              <li>• Assignment alerts and clear onboarding workflow</li>
            </ul>

            <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-600">How It Works</p>
              <ol className="mt-2 space-y-1.5 text-sm text-gray-700">
                <li>1. Create your account</li>
                <li>2. Complete onboarding and credentials</li>
                <li>3. Get reviewed and approved</li>
                <li>4. Start applying for matched assignments</li>
              </ol>
            </div>

            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-green-700">Why Tutors Choose Integrated Learnings</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-green-100 bg-white p-3">
                  <p className="text-xs font-bold text-gray-900">Our Approach</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-gray-700">
                    <li>• 25% fee for first 2 months, then you keep more</li>
                    <li>• Profile-based matching for stronger tutor-student fit</li>
                    <li>• You decide which assignments to accept</li>
                    <li>• Structured onboarding and case workflow</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-3">
                  <p className="text-xs font-bold text-gray-900">What This Means For You</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-gray-700">
                    <li>• Better lesson fit and smoother first sessions</li>
                    <li>• More consistent student retention potential</li>
                    <li>• Clear expectations before each assignment</li>
                    <li>• Less admin friction in your teaching workflow</li>
                  </ul>
                </div>
              </div>
              <p className="mt-3 text-xs text-green-800">
                Best fit for tutors who want structured matching, faster case handling, and long-term parent demand.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-amber-700">Key Tutor Policy Highlights</p>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-gray-700">
                <li>• Service fee: 25% during the first 2 months of each assignment.</li>
                <li>• Tutors must provide accurate profile details and credentials during onboarding.</li>
                <li>• Professional conduct and parent communication standards apply to all assignments.</li>
              </ul>
              <p className="mt-2 text-xs text-gray-600">
                Full terms are available at <Link to="/tuition/policies" className="font-semibold text-amber-700 underline hover:text-amber-800">Tutor Policies</Link>.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-200">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Educator Signup</h2>
                <p className="text-gray-600">Quick signup - complete profile after login</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-800 rounded-lg text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-green-600" />
                    Full Name *
                  </div>
                </label>
                <input
                  id="tutor-signup-full-name"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.fullName}
                  aria-describedby={fieldErrors.fullName ? 'tutor-signup-full-name-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
                {fieldErrors.fullName && (
                  <p id="tutor-signup-full-name-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-green-600" />
                    Email Address *
                  </div>
                </label>
                <input
                  id="tutor-signup-email"
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'tutor-signup-email-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
                {fieldErrors.email && (
                  <p id="tutor-signup-email-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-green-600" />
                    Date of Birth *
                  </div>
                </label>
                <input
                  id="tutor-signup-dob"
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  aria-invalid={!!fieldErrors.dateOfBirth}
                  aria-describedby={fieldErrors.dateOfBirth ? 'tutor-signup-dob-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 18 years old</p>
                {fieldErrors.dateOfBirth && (
                  <p id="tutor-signup-dob-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.dateOfBirth}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <UserCircle size={16} className="text-green-600" />
                    Gender *
                  </div>
                </label>
                <select
                  id="tutor-signup-gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.gender}
                  aria-describedby={fieldErrors.gender ? 'tutor-signup-gender-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {fieldErrors.gender && (
                  <p id="tutor-signup-gender-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.gender}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-green-600" />
                    Password *
                  </div>
                </label>
                <div className="relative">
                  <input
                    id="tutor-signup-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'tutor-signup-password-error' : undefined}
                    className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
                {fieldErrors.password && (
                  <p id="tutor-signup-password-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-green-600" />
                    Confirm Password *
                  </div>
                </label>
                <div className="relative">
                  <input
                    id="tutor-signup-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.confirmPassword}
                    aria-describedby={fieldErrors.confirmPassword ? 'tutor-signup-confirm-password-error' : undefined}
                    className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p id="tutor-signup-confirm-password-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-green-600" />
                    Phone Number *
                  </div>
                </label>
                <input
                  id="tutor-signup-phone"
                  type="tel"
                  name="phone"
                  placeholder="+65 XXXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? 'tutor-signup-phone-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
                {fieldErrors.phone && (
                  <p id="tutor-signup-phone-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 mt-6 ${
                  loading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account & Review Policies'}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-gray-200 pt-6">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/tutors/login" className="text-green-600 font-semibold hover:text-green-700">
                  Log In
                </Link>
              </p>
            </div>

            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs text-gray-700">
                <strong>ℹ️ What's Next?</strong><br />
                 After signup, you'll upload your photo, certificates, and complete a tutor questionnaire from your dashboard before accessing cases.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};