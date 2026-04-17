import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpTutor } from '../services/auth';
import { PageHeader, Section } from '../components/Components';
import { Mail, Lock, Phone, User, Calendar, UserCircle } from 'lucide-react';

export const TutorSignup: React.FC = () => {
  const navigate = useNavigate();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    setLoading(true);

    const result = await signUpTutor(
      formData.email,
      formData.password,
      {
        fullName: formData.fullName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
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
            <h2 className="mt-4 text-3xl font-black text-gray-900">Get Matched With Real Parent Requests</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Sign up to join our tutor network in Singapore. After profile review, you can browse matching cases and apply based on your subject strength and schedule.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-gray-700">
              <li>• Assignment alerts based on your profile</li>
              <li>• Choose the cases you want to take</li>
              <li>• Clear onboarding flow with document submission</li>
              <li>• Ongoing opportunities for primary to JC levels</li>
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
                <input
                  id="tutor-signup-password"
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'tutor-signup-password-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
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
                <input
                  id="tutor-signup-confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={fieldErrors.confirmPassword ? 'tutor-signup-confirm-password-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  required
                />
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
                {loading ? 'Creating Account...' : 'Create Account'}
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