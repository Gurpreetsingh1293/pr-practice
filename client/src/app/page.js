import Link from 'next/link';
import { Leaf, ArrowRight, BarChart3, MapPin, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-mesh flex flex-col">
      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-brand-green-900/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-gradient flex items-center justify-center shadow-glow-green">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-lg text-brand-green-50">GraminLink</span>
            <p className="text-[10px] text-brand-green-600 font-medium tracking-wider">Y4D FOUNDATION</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm">Sign In</Link>
          <Link href="/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 animate-fade-in">
        <div className="badge badge-green mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green-400 animate-pulse-slow" />
          Powered by Y4D Foundation
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-bold text-gradient-hero mb-6 max-w-4xl leading-tight">
          Bridging Rural Artisans<br />with Urban Markets
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mb-10 leading-relaxed">
          GraminLink connects Self-Help Groups and rural micro-producers with B2B bulk buyers
          through geo-spatial matching, real-time inventory, and milestone-based escrow payments.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="btn-amber text-base px-8 py-3">
            Start Matching <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="btn-secondary text-base px-8 py-3">
            Sign In to Dashboard
          </Link>
        </div>

        {/* ─── Feature Cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 max-w-4xl w-full">
          {[
            {
              icon: MapPin,
              color: 'text-brand-green-400',
              title: 'Geo-Spatial Matching',
              desc: 'Find verified SHG clusters within your delivery radius using real-time location data.',
            },
            {
              icon: BarChart3,
              color: 'text-brand-amber-400',
              title: 'Milestone Tracking',
              desc: 'Track every order from raw material to delivery with signed-off milestone progression.',
            },
            {
              icon: Shield,
              color: 'text-blue-400',
              title: 'Escrow Protection',
              desc: 'Secure payments held in escrow until NGO-admin authorized delivery confirmation.',
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="glass-card-hover p-6 text-left animate-slide-up">
              <div className={`w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-brand-green-100 mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-brand-green-900/20 px-8 py-6 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} GraminLink · Y4D Foundation · Empowering Rural Livelihoods
      </footer>
    </main>
  );
}
