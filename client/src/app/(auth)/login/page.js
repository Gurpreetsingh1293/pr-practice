'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Leaf, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-green-gradient items-center justify-center mb-4 shadow-glow-green">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-brand-green-50">Welcome back</h1>
          <p className="text-gray-400 mt-1 text-sm">Sign in to your GraminLink account</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-900/20 border border-red-800/30 text-red-400 text-sm mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="input-label" htmlFor="login-password">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              className="btn-primary w-full py-3 text-base"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Quick-fill demo credentials */}
          <div className="mt-6 pt-5 border-t border-brand-green-900/20">
            <p className="text-xs text-gray-500 text-center mb-3 uppercase tracking-wider">Demo Credentials</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { role: 'NGO Admin', email: 'admin@y4dfoundation.org', pass: 'Admin@1234', color: 'text-blue-400' },
                { role: 'SHG Leader', email: 'meena@shg-lalpur.org', pass: 'Shg@Leader1', color: 'text-brand-green-400' },
                { role: 'B2B Buyer', email: 'rajesh@urbanmart.in', pass: 'Buyer@1234', color: 'text-brand-amber-400' },
              ].map(({ role, email, pass, color }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setForm({ email, password: pass })}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-700/50 hover:bg-surface-600/60 transition-colors text-xs"
                >
                  <span className={`font-semibold ${color}`}>{role}</span>
                  <span className="text-gray-500">{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center mt-5 text-sm text-gray-500">
          New to GraminLink?{' '}
          <Link href="/register" className="text-brand-green-400 hover:text-brand-green-300 font-medium transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
