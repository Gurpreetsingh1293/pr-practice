'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import {
  RevenuePerClusterChart,
  OrdersOverTimeChart,
  CategoryBreakdownChart,
  MilestoneDistributionChart,
} from '@/components/AnalyticsCharts';
import {
  BarChart3, Users, ShoppingCart, TrendingUp, IndianRupee,
  Heart, Loader2, CheckCircle, XCircle, Clock, AlertCircle, ChevronRight
} from 'lucide-react';

export default function AdminPage() {
  const [analytics, setAnalytics] = useState(null);
  const [shgs, setSHGs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/analytics'),
      api.get('/shg?verificationStatus=pending&limit=10'),
    ]).then(([analyticsRes, shgRes]) => {
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data);
      if (shgRes.status === 'fulfilled') setSHGs(shgRes.value.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id, status) => {
    setVerifying(id);
    try {
      await api.patch(`/admin/shg/${id}/verify`, {
        status,
        rejectionReason: status === 'rejected' ? 'Does not meet quality standards.' : undefined,
      });
      setSHGs(prev => prev.filter(s => s._id !== id));
    } catch {}
    finally { setVerifying(null); }
  };

  const overview = analytics?.overview;
  const charts = analytics?.charts;

  const statCards = [
    { label: 'Total Revenue', value: overview ? `₹${Math.round(overview.orders?.totalRevenue || 0).toLocaleString('en-IN')}` : '—', icon: IndianRupee, color: 'text-brand-amber-400' },
    { label: 'Total Orders', value: overview?.orders?.totalOrders ?? '—', icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'Verified SHGs', value: overview?.shgs?.find(s => s._id === 'approved')?.count ?? '—', icon: CheckCircle, color: 'text-brand-green-400' },
    { label: 'Pending Verification', value: overview?.shgs?.find(s => s._id === 'pending')?.count ?? '—', icon: Clock, color: 'text-brand-amber-400' },
    { label: 'Livelihoods Supported', value: overview?.livelihoodsSupported ?? '—', icon: Heart, color: 'text-red-400' },
    { label: 'Active Products', value: overview?.activeProducts ?? '—', icon: TrendingUp, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-brand-green-50 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-green-500" />
          NGO Admin Dashboard
        </h1>
        <p className="text-gray-400 text-sm mt-1">Y4D Foundation — Rural Impact Analytics & Cluster Management</p>
      </div>

      {/* ─── Stats Overview ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon className={`w-5 h-5 ${color}`} />
            <p className="text-2xl font-display font-bold text-brand-green-50">{loading ? '—' : value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* ─── Charts Row 1 ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="section-title text-base mb-1">Revenue per SHG Cluster</h2>
          <p className="text-xs text-gray-500 mb-4">Top 20 clusters by revenue generated</p>
          {loading ? <div className="skeleton h-64 rounded-xl" /> : <RevenuePerClusterChart data={charts?.revenuePerCluster || []} />}
        </div>
        <div className="glass-card p-5">
          <h2 className="section-title text-base mb-1">Orders Over Time</h2>
          <p className="text-xs text-gray-500 mb-4">Monthly order volume and revenue trend</p>
          {loading ? <div className="skeleton h-64 rounded-xl" /> : <OrdersOverTimeChart data={charts?.ordersOverTime || []} />}
        </div>
      </div>

      {/* ─── Charts Row 2 ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="section-title text-base mb-1">Product Category Breakdown</h2>
          <p className="text-xs text-gray-500 mb-4">Active product distribution by category</p>
          {loading ? <div className="skeleton h-64 rounded-xl" /> : <CategoryBreakdownChart data={charts?.categoryBreakdown || []} />}
        </div>
        <div className="glass-card p-5">
          <h2 className="section-title text-base mb-1">Orders by Milestone</h2>
          <p className="text-xs text-gray-500 mb-4">Current distribution across pipeline stages</p>
          {loading ? <div className="skeleton h-56 rounded-xl" /> : <MilestoneDistributionChart data={charts?.ordersByMilestone || []} />}
        </div>
      </div>

      {/* ─── Pending SHG Verification Queue ─────────────────── */}
      <div>
        <h2 className="section-title mb-4">
          <Clock className="w-5 h-5 text-brand-amber-400" />
          Pending Verification Queue
          {shgs.length > 0 && (
            <span className="badge badge-amber ml-2">{shgs.length}</span>
          )}
        </h2>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
        ) : shgs.length === 0 ? (
          <div className="glass-card p-10 text-center text-gray-500 text-sm">
            <CheckCircle className="w-8 h-8 text-brand-green-600 mx-auto mb-2" />
            All SHG profiles have been reviewed. No pending verifications.
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            {shgs.map((shg, i) => (
              <div
                key={shg._id}
                className={`flex items-center justify-between px-5 py-4 ${i > 0 ? 'border-t border-brand-green-900/20' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-green-100 text-sm">{shg.groupName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {shg.clusterName} · {shg.district}, {shg.state} · {shg.memberCount} members
                  </p>
                  {shg.userId && (
                    <p className="text-xs text-gray-500 mt-0.5">Leader: {shg.userId.name} ({shg.userId.email})</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => handleVerify(shg._id, 'approved')}
                    disabled={verifying === shg._id}
                    id={`approve-shg-${shg._id}`}
                    className="btn-primary py-1.5 px-3 text-xs"
                  >
                    {verifying === shg._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Approve
                  </button>
                  <button
                    onClick={() => handleVerify(shg._id, 'rejected')}
                    disabled={verifying === shg._id}
                    id={`reject-shg-${shg._id}`}
                    className="btn-secondary py-1.5 px-3 text-xs text-red-400 hover:text-red-300 hover:border-red-700/40"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
