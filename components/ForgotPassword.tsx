import React, { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../services/supabase';

interface ForgotPasswordProps {
  onBack: () => void;
  userType: 'tutor' | 'parent';
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack, userType }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password?type=${userType}`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
      setEmail('');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Mail className="text-green-600" size={24} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-gray-600 mb-6">
          We've sent a password reset link to <strong>{email}</strong>. 
          Check your inbox and follow the link to reset your password.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          The link will expire in 24 hours. If you don't see the email, check your spam folder.
        </p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
        >
          <ArrowLeft size={18} />
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h2>
      <p className="text-gray-600 mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
};
