'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Leaf, Eye, EyeOff, Loader2, AlertCircle, Users, ShoppingBag, Shield } from 'lucide-react';

const ROLES = [
  { value: 'shg_leader', label: 'SHG / Producer', icon: Users, desc: 'Sell products and track orders', color: 'border-brand-green-600 bg-brand-green-900/20' },
  { value: 'b2b_buyer', label: 'B2B Buyer', icon: ShoppingBag, desc: 'Source rural products in bulk', color: 'border-brand-amber-600 bg-brand-amber-900/20' },
  { value: 'ngo_admin', label: 'NGO Admin', icon: Shield, desc: 'Verify clusters, manage escrow', color: 'border-blue-600 bg-blue-900/20' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'b2b_buyer',
    phone: '',
    organization: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-green-gradient items-center justify-center mb-4 shadow-glow-green">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-brand-green-50">Join GraminLink</h1>
          <p className="text-gray-400 mt-1 text-sm">Connect rural producers with urban markets</p>
        </div>

        <div className="glass-card p-8">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-900/20 border border-red-800/30 text-red-400 text-sm mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ─── Role Picker ──────────────────────────────────── */}
          <div className="mb-6">
            <label className="input-label">I am a...</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(({ value, label, icon: Icon, desc, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm({ ...form, role: value })}
                  className={`p-3 rounded-xl border text-left transition-all duration-200
                    ${form.role === value ? color : 'border-brand-green-900/30 bg-surface-700/40 hover:bg-surface-700/70'}`}
                >
                  <Icon className={`w-4 h-4 mb-1.5 ${form.role === value ? 'text-brand-green-300' : 'text-gray-500'}`} />
                  <p className={`text-xs font-semibold ${form.role === value ? 'text-brand-green-100' : 'text-gray-400'}`}>{label}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="input-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  className="input-field"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="input-label" htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="input-label" htmlFor="reg-phone">Mobile Number</label>
                <input
                  id="reg-phone"
                  type="tel"
                  className="input-field"
                  placeholder="9876543210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="input-label" htmlFor="reg-org">
                  {form.role === 'shg_leader' ? 'SHG / Group Name' : 'Organization'}
                </label>
                <input
                  id="reg-org"
                  type="text"
                  className="input-field"
                  placeholder={form.role === 'shg_leader' ? 'Lalpur SHG' : 'Company name'}
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <label className="input-label" htmlFor="reg-pass">Password</label>
                <div className="relative">
                  <input
                    id="reg-pass"
                    type={showPass ? 'text' : 'password'}
                    className="input-field pr-12"
                    placeholder="Min. 8 chars, with uppercase & number"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              className="btn-primary w-full py-3 text-base"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-green-400 hover:text-brand-green-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
