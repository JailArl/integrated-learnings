import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../services/auth';
import { Section } from '../components/Components';
import { ForgotPassword } from '../components/ForgotPassword';

export const TutorLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name as 'email' | 'password']) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nextErrors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required.';
    }
    if (!formData.password.trim()) {
      nextErrors.password = 'Password is required.';
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    const result = await signIn(formData.email, formData.password);

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Login failed');
      return;
    }

    if (result.role !== 'tutor') {
      setError('Invalid credentials for tutor login');
      return;
    }

    // Success - redirect to tutor dashboard
    navigate('/tutors');
  };

  return (
    <Section className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {showForgotPassword ? (
            <ForgotPassword onBack={() => setShowForgotPassword(false)} userType="tutor" />
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Login</h1>
              <p className="text-gray-600 mb-6">Access your account and view available cases</p>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email or Username
                  </label>
                  <input
                    id="tutor-login-email"
                    type="text"
                    name="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'tutor-login-email-error' : undefined}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {fieldErrors.email && (
                    <p id="tutor-login-email-error" className="text-xs text-red-600 mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="tutor-login-password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'tutor-login-password-error' : undefined}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {fieldErrors.password && (
                    <p id="tutor-login-password-error" className="text-xs text-red-600 mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 mt-2"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/tutors/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign up here
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </Section>
  );
};
