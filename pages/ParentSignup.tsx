import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signUpParent } from '../services/auth';
import { PageHeader, Section } from '../components/Components';
import { Mail, Lock, Phone, User } from 'lucide-react';

export const ParentSignup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
  }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name as keyof typeof fieldErrors]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nextErrors: typeof fieldErrors = {};
    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!formData.email.includes('@')) {
      nextErrors.email = 'Enter a valid email address.';
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

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});

    setLoading(true);

    const result = await signUpParent(
      formData.email,
      formData.password,
      formData.fullName,
      formData.phone
    );

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Signup failed');
      return;
    }

    alert('Account created successfully! Welcome to Integrated Learnings.');
    navigate('/tuition/parents');
  };

  return (
    <div>
      <PageHeader 
        title="Create Your Parent Account" 
        subtitle="Start your journey to finding the perfect tutor for your child" 
      />
      
      <Section className="bg-gradient-to-br from-blue-50 to-slate-50 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-200">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Parent Signup</h2>
              <p className="text-gray-600">Quick signup - child details collected later</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-blue-600" />
                    Full Name *
                  </div>
                </label>
                <input
                  id="parent-signup-full-name"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.fullName}
                  aria-describedby={fieldErrors.fullName ? 'parent-signup-full-name-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                {fieldErrors.fullName && (
                  <p id="parent-signup-full-name-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-blue-600" />
                    Email Address *
                  </div>
                </label>
                <input
                  id="parent-signup-email"
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={fieldErrors.email ? 'parent-signup-email-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                {fieldErrors.email && (
                  <p id="parent-signup-email-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-blue-600" />
                    Password *
                  </div>
                </label>
                <input
                  id="parent-signup-password"
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'parent-signup-password-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters long</p>
                {fieldErrors.password && (
                  <p id="parent-signup-password-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Lock size={16} className="text-blue-600" />
                    Confirm Password *
                  </div>
                </label>
                <input
                  id="parent-signup-confirm-password"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={fieldErrors.confirmPassword ? 'parent-signup-confirm-password-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                {fieldErrors.confirmPassword && (
                  <p id="parent-signup-confirm-password-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-blue-600" />
                    Phone Number *
                  </div>
                </label>
                <input
                  id="parent-signup-phone"
                  type="tel"
                  name="phone"
                  placeholder="+65 XXXX XXXX"
                  value={formData.phone}
                  onChange={handleChange}
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={fieldErrors.phone ? 'parent-signup-phone-error' : undefined}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                />
                {fieldErrors.phone && (
                  <p id="parent-signup-phone-error" className="text-xs text-red-600 mt-1">
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-200 mt-6 ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                }`}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-gray-200 pt-6">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/parents/login" className="text-blue-600 font-semibold hover:text-blue-700">
                  Log In
                </Link>
              </p>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-gray-700">
                <strong>ℹ️ What's Next?</strong><br />
                After signup, you'll provide details about your child and tutoring needs. This helps us find the perfect match!
              </p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default ParentSignup;
