import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn, getCurrentUser, signUpStudent } from '../services/auth';
import { School, GamepadIcon, ArrowLeft } from 'lucide-react';

const EnrichmentLogin: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // If already logged in as student, redirect to game
  useEffect(() => {
    const check = async () => {
      const { user, role } = await getCurrentUser();
      if (user && role === 'student') {
        navigate('/enrichment/game', { replace: true });
      }
      setCheckingAuth(false);
    };
    check();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
      setLoading(false);
      return;
    }

    if (result.role !== 'student') {
      setError('This login is for enrichment students only. Please use the correct login page for your account type.');
      setLoading(false);
      return;
    }

    navigate('/enrichment/game', { replace: true });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!schoolCode.trim()) {
      setError('Please enter your school access code.');
      return;
    }

    setLoading(true);

    const result = await signUpStudent(email, password, {
      fullName,
      schoolCode: schoolCode.trim(),
    });

    if (!result.success) {
      setError(result.error || 'Signup failed');
      setLoading(false);
      return;
    }

    if (result.needsEmailVerification) {
      setError('');
      setMode('login');
      alert('Account created! Please check your email to verify, then log in.');
    } else {
      navigate('/enrichment/game', { replace: true });
    }
    setLoading(false);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link to="/enrichment" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Enrichment Program
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl mb-4">
              <GamepadIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'login' ? 'Student Login' : 'Create Student Account'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'login'
                ? 'Access the Financial Literacy Game'
                : 'Sign up with your school access code'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-green-500 outline-none text-sm"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    School Access Code
                  </label>
                  <div className="relative">
                    <School className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={schoolCode}
                      onChange={e => setSchoolCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-green-500 outline-none text-sm"
                      placeholder="Enter code from your school"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-green-500 outline-none text-sm"
                placeholder="your.email@school.edu.sg"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-green-500 outline-none text-sm"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Please wait...' : mode === 'login' ? 'Log In & Play' : 'Create Account'}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-gray-400 mt-4">
              Don't have an account? Click "Sign Up" above.
              <br />
              Your school must provide an access code.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrichmentLogin;
