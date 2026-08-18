'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { ShoppingCart, MapPin, TrendingUp, Package, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

const MILESTONE_COLORS = {
  PLACED: 'badge-gray', RAW_MATERIAL: 'badge-purple', IN_PRODUCTION: 'badge-blue',
  PACKED: 'badge-amber', DISPATCHED: 'badge-blue', DELIVERED: 'badge-green', FUNDS_RELEASED: 'badge-green', CANCELLED: 'badge-red',
};

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders?limit=5').then(res => setOrders(res.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-green-50">
            Hello, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {user?.organization || 'B2B Buyer'} — source authentic rural products directly from SHG clusters
          </p>
        </div>
        <Link href="/buyer/map" className="btn-amber">
          <MapPin className="w-4 h-4" /> Find SHG Clusters
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Orders', value: orders.filter(o => !['DELIVERED','FUNDS_RELEASED','CANCELLED'].includes(o.currentMilestone)).length, icon: ShoppingCart, color: 'text-brand-green-400' },
          { label: 'Delivered', value: orders.filter(o => o.currentMilestone === 'DELIVERED' || o.currentMilestone === 'FUNDS_RELEASED').length, icon: TrendingUp, color: 'text-brand-amber-400' },
          { label: 'Total Batches Sourced', value: orders.length, icon: Package, color: 'text-blue-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon className={`w-5 h-5 ${color}`} />
            <p className="text-2xl font-display font-bold text-brand-green-50">{loading ? '—' : value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title"><ShoppingCart className="w-5 h-5 text-brand-green-500" />Recent Orders</h2>
          <Link href="/orders" className="text-xs text-brand-green-400 hover:text-brand-green-300 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-gray-500 text-sm">No orders yet.</p>
            <Link href="/buyer/map" className="btn-primary mt-4 inline-flex">
              <MapPin className="w-4 h-4" /> Discover SHG Clusters
            </Link>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            {orders.map((order, i) => (
              <Link
                href={`/orders/${order._id}`}
                key={order._id}
                className={`flex items-center justify-between px-5 py-4 hover:bg-surface-700/40 transition-colors ${i > 0 ? 'border-t border-brand-green-900/20' : ''}`}
              >
                <div>
                  <p className="text-sm font-semibold text-brand-green-100">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.productBatchId?.productName} · {order.shgProfileId?.groupName}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-brand-amber-400 text-sm">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                  <span className={MILESTONE_COLORS[order.currentMilestone] || 'badge-gray'}>{order.currentMilestone}</span>
                  <ArrowRight className="w-4 h-4 text-gray-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
