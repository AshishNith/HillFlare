import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useAuthStore } from '../store/authStore';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      await apiService.requestOtp(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.verifyOtp(email, otp);
      setAuth(data.token, email);
      navigate('/app');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden w-1/2 bg-gradient-to-br from-hf-accent to-hf-accent/70 lg:flex lg:flex-col lg:justify-center lg:px-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-3xl bg-white/20 backdrop-blur" />
          <span className="text-4xl font-bold text-white">HillFlare</span>
        </div>
        <h1 className="mb-6 text-5xl font-bold text-white">
          Welcome to Your Campus Community
        </h1>
        <p className="text-xl text-white/90">
          Connect with classmates, find study partners, and discover meaningful relationships.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full items-center justify-center bg-hf-bg px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="mb-2 text-3xl font-bold text-hf-charcoal">
              {step === 'email' ? 'Sign In' : 'Verify OTP'}
            </h2>
            <p className="text-hf-muted">
              {step === 'email'
                ? 'Enter your college email to get started'
                : `We sent a code to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-hf-charcoal">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-2xl border border-hf-border bg-white px-4 py-3 text-hf-charcoal placeholder-hf-muted focus:border-hf-accent focus:outline-none"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-hf-accent px-6 py-4 font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Continue with Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-hf-charcoal">
                  6-Digit Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full rounded-2xl border border-hf-border bg-white px-4 py-3 text-center text-2xl font-semibold tracking-widest text-hf-charcoal placeholder-hf-muted focus:border-hf-accent focus:outline-none"
                  maxLength={6}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-hf-accent px-6 py-4 font-semibold text-white shadow-soft transition hover:shadow-glow disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </button>

              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full text-sm text-hf-muted hover:text-hf-accent"
              >
                ← Back to email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
