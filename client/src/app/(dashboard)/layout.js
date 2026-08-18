'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  Leaf, LayoutDashboard, Package, ShoppingCart, Users,
  BarChart3, MapPin, LogOut, ChevronRight, Loader2, Bell,
  Settings, Sprout
} from 'lucide-react';

// ─── Role-based navigation config ─────────────────────────
const NAV = {
  shg_leader: [
    { href: '/shg', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/shg/products', label: 'My Products', icon: Package },
    { href: '/orders', label: 'Orders', icon: ShoppingCart },
  ],
  b2b_buyer: [
    { href: '/buyer', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/buyer/map', label: 'Find SHGs', icon: MapPin },
    { href: '/orders', label: 'My Orders', icon: ShoppingCart },
  ],
  ngo_admin: [
    { href: '/admin', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/shgs', label: 'SHG Clusters', icon: Users },
    { href: '/admin/orders', label: 'All Orders', icon: ShoppingCart },
  ],
};

const ROLE_BADGE = {
  shg_leader: { label: 'SHG Leader', color: 'badge-green' },
  b2b_buyer: { label: 'B2B Buyer', color: 'badge-amber' },
  ngo_admin: { label: 'NGO Admin', color: 'badge-blue' },
};

export default function DashboardLayout({ children }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-gradient flex items-center justify-center shadow-glow-green animate-pulse-slow">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <Loader2 className="w-5 h-5 text-brand-green-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navItems = NAV[user.role] || [];
  const badge = ROLE_BADGE[user.role];

  return (
    <div className="min-h-screen flex bg-surface-900">
      {/* ─── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-brand-green-900/20 bg-surface-800/60 backdrop-blur-xl">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-brand-green-900/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-gradient flex items-center justify-center shadow-glow-green">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-brand-green-50 text-sm">GraminLink</p>
              <p className="text-[9px] text-brand-green-700 uppercase tracking-widest">Y4D Foundation</p>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-brand-green-900/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-700 border border-brand-green-800/30 flex items-center justify-center text-brand-green-300 font-bold text-sm">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-green-50 truncate">{user.name}</p>
              <span className={`text-[10px] ${badge.color} mt-0.5 inline-flex`}>{badge.label}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={isActive ? 'nav-item-active' : 'nav-item'}
              >
                <Icon className="w-4 h-4" />
                {label}
                {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-green-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-brand-green-900/20 space-y-1">
          <button className="nav-item w-full text-left">
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button
            onClick={logout}
            id="sidebar-logout-btn"
            className="nav-item w-full text-left text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ─── Main Content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-brand-green-900/20 bg-surface-800/40 backdrop-blur-sm shrink-0">
          <div>
            <p className="text-sm text-gray-400">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-xl bg-surface-700 border border-brand-green-900/20 flex items-center justify-center text-gray-400 hover:text-brand-green-300 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-green-gradient flex items-center justify-center text-white font-bold text-sm shadow-glow-green">
              {user.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 bg-mesh">
          {children}
        </main>
      </div>
    </div>
  );
}
