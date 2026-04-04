import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { createMembership } from '../services/studyquest';

/* ═══════════════════════════════════════════
   StudyPulse — Minimal Signup
   Email + Password + Confirm + Google OAuth
   ═══════════════════════════════════════════ */

const StudyPulseSetup: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // If already signed in as parent, go to app
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.role === 'parent') {
        navigate('/studypulse/app', { replace: true });
      }
    });
  }, [navigate]);

  /* ── Email + Password sign-up ── */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!supabase) { setError('Authentication service is not configured.'); return; }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'parent' } },
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
          setError('An account with this email already exists. Please log in instead.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      const userId = data.user?.id;
      if (!userId) { setError('Signup failed. Please try again.'); setLoading(false); return; }

      // Create a free membership so the dashboard detects them
      await createMembership(userId, 'free', { email });

      navigate('/studypulse/app');
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    }
    setLoading(false);
  };

  /* ── Google OAuth ── */
  const handleGoogleSignup = async () => {
    if (!supabase) { setError('Authentication service is not configured.'); return; }
    setGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/studypulse/app`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (oauthError) setError(oauthError.message);
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
    }
    setGoogleLoading(false);
  };

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <Link to="/studypulse" className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
          <ArrowLeft size={15} /> Back to StudyPulse
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-black text-slate-900">Create Your Account</h1>
          <p className="mt-2 text-sm text-slate-500">Sign up in seconds. You&apos;ll set up your child&apos;s details next.</p>

          {error && <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>}

          {/* Google sign-up */}
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">or sign up with email</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Email + Password form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className={inputCls}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className={inputCls + ' pr-10'}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
              <input
                type={showPw ? 'text' : 'password'}
                className={inputCls}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create Account <ArrowRight size={16} className="ml-1.5" /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/studypulse/login" className="font-semibold text-blue-600 hover:text-blue-700">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPulseSetup;
