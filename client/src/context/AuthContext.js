'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ─── Fetch current user on mount ──────────────────────────
  const fetchMe = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // ─── Register ─────────────────────────────────────────────
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    setUser(res.data.data.user);
    redirectByRole(res.data.data.user.role);
    return res.data;
  };

  // ─── Login ────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.data.user);
    redirectByRole(res.data.data.user.role);
    return res.data;
  };

  // ─── Logout ───────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  // ─── Role-based redirect ──────────────────────────────────
  const redirectByRole = (role) => {
    if (role === 'shg_leader') router.push('/shg');
    else if (role === 'b2b_buyer') router.push('/buyer');
    else if (role === 'ngo_admin') router.push('/admin');
    else router.push('/');
  };

  // ─── Role helpers ─────────────────────────────────────────
  const isSHGLeader = user?.role === 'shg_leader';
  const isBuyer = user?.role === 'b2b_buyer';
  const isAdmin = user?.role === 'ngo_admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isSHGLeader,
        isBuyer,
        isAdmin,
        login,
        logout,
        register,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

export default AuthContext;
