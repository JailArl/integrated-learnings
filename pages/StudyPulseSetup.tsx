import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { createMembership, CHECKOUT_PLAN_OPTIONS, startPremiumCheckout, type CheckoutPlan } from '../services/studyquest';

/* ═══════════════════════════════════════════
   StudyPulse — Minimal Signup
   Email + Password + Confirm + Google OAuth
   ═══════════════════════════════════════════ */

const StudyPulseSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'free' | CheckoutPlan>('free');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    const isCheckoutPlan = CHECKOUT_PLAN_OPTIONS.some((option) => option.code === plan);
    setSelectedPlan(isCheckoutPlan ? (plan as CheckoutPlan) : 'free');
  }, [location.search]);

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
    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!supabase) { setError('Authentication service is not configured.'); return; }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'parent', full_name: fullName.trim() } },
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
      await createMembership(userId, 'free', { email, name: fullName.trim() });

      if (selectedPlan === 'free') {
        navigate('/studypulse/app');
        return;
      }

      const checkout = await startPremiumCheckout(selectedPlan);
      if (checkout.ok && checkout.url) {
        window.location.assign(checkout.url);
        return;
      }

      navigate('/studypulse/app?billing=setup_error', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    }
    setLoading(false);
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

          <div className="mt-6 rounded-2xl border border-slate-200 bg-stone-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Choose your start</p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => setSelectedPlan('free')}
                className={`rounded-xl border px-4 py-3 text-left transition ${selectedPlan === 'free' ? 'border-slate-900 bg-white shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-900">Free</span>
                  <span className="text-sm font-black text-slate-900">$0</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">Create your account first. Upgrade later from Billing anytime.</p>
              </button>

              {CHECKOUT_PLAN_OPTIONS.map((plan) => (
                <button
                  key={plan.code}
                  type="button"
                  onClick={() => setSelectedPlan(plan.code)}
                  className={`rounded-xl border px-4 py-3 text-left transition ${selectedPlan === plan.code ? 'border-amber-400 bg-amber-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-900">{plan.label}</span>
                    <span className="text-sm font-black text-slate-900">{plan.priceLabel}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Your Full Name</label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Sarah Tan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
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
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>{selectedPlan === 'free' ? 'Create Account' : 'Create Account & Continue to Payment'} <ArrowRight size={16} className="ml-1.5" /></>}
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
