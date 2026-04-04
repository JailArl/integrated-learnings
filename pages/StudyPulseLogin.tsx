import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Loader2, Mail, ArrowRight, Lock } from 'lucide-react';
import { supabase } from '../services/supabase';
import { createMembership } from '../services/studyquest';

/* ═══════════════════════════════════════════
   StudyPulse Parent Login
   /studypulse/login
   ═══════════════════════════════════════════ */

const StudyPulseLogin: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'forgot' | 'forgot-sent'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [googleLoading, setGoogleLoading] = useState(false);

  // If already signed in as a parent, redirect
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.role === 'parent') {
        navigate('/studypulse/app', { replace: true });
      }
    });
  }, [navigate]);

  /* ── Google OAuth ── */
  const handleGoogleLogin = async () => {
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

  /* ── Login handler ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) errs.email = 'Email is required.';
    if (!password.trim()) errs.password = 'Password is required.';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }
    setFieldErrors({});

    if (!supabase) { setError('Authentication service is not configured.'); return; }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError(signInError.message === 'Invalid login credentials'
        ? 'Invalid email or password. If you signed up recently, use the last 8 digits of your WhatsApp number as your password — or reset it below.'
        : signInError.message);
      return;
    }

    navigate('/studypulse/app');
  };

  /* ── Forgot password handler ── */
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setFieldErrors({ email: 'Email is required.' }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setFieldErrors({ email: 'Enter a valid email.' }); return; }
    setFieldErrors({});

    if (!supabase) { setError('Authentication service is not configured.'); return; }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password?type=parent`,
    });
    setLoading(false);

    if (resetError) { setError(resetError.message); return; }
    setMode('forgot-sent');
  };

  const inputCls = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

  /* ── Forgot-sent confirmation ── */
  if (mode === 'forgot-sent') {
    return (
      <Shell>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
            <Mail size={26} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Check Your Email</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            We&apos;ve sent a password reset link to <strong className="text-slate-900">{email}</strong>.
            Check your inbox (and spam folder) and click the link.
          </p>
          <p className="mt-2 text-xs text-slate-400">The link expires in 24 hours.</p>
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={15} /> Back to Login
          </button>
        </div>
      </Shell>
    );
  }

  /* ── Forgot password form ── */
  if (mode === 'forgot') {
    return (
      <Shell>
        <button
          onClick={() => { setMode('login'); setError(''); setFieldErrors({}); }}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <h1 className="text-2xl font-black text-slate-900">Reset Your Password</h1>
        <p className="mt-2 text-sm text-slate-500">Enter the email you signed up with and we&apos;ll send a reset link.</p>

        {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleForgot} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              className={inputCls}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors({}); }}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      </Shell>
    );
  }

  /* ── Login form ── */
  return (
    <Shell>
      <h1 className="text-2xl font-black text-slate-900">Parent Login</h1>
      <p className="mt-2 text-sm text-slate-500">Sign in to your StudyPulse dashboard.</p>

      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Google sign-in */}
      <button
        onClick={handleGoogleLogin}
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

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className={inputCls}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setFieldErrors({}); }}
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              className={inputCls + ' pr-10'}
              placeholder="Your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors({}); }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
        </div>

        <div className="flex items-center justify-between">
          <button type="button" onClick={() => { setMode('forgot'); setError(''); setFieldErrors({}); }} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <>Sign In <ArrowRight size={16} className="ml-1.5" /></>}
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-slate-50 p-4 text-center">
        <p className="text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/studypulse/setup" className="font-semibold text-blue-600 hover:text-blue-700">
            Sign up free
          </Link>
        </p>

      </div>
    </Shell>
  );
};

/* ── Layout shell ── */
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
    <div className="w-full max-w-md">
      <Link to="/studypulse" className="mb-8 flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700">
        <ArrowLeft size={15} /> Back to StudyPulse
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  </div>
);

export default StudyPulseLogin;
