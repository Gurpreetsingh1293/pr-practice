'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { ShoppingCart, ArrowRight, Loader2, Filter, ChevronDown } from 'lucide-react';

const MILESTONES = ['', 'PLACED', 'RAW_MATERIAL', 'IN_PRODUCTION', 'PACKED', 'DISPATCHED', 'DELIVERED', 'FUNDS_RELEASED', 'CANCELLED'];

const MILESTONE_BADGE = {
  PLACED: 'badge-gray', RAW_MATERIAL: 'badge-purple', IN_PRODUCTION: 'badge-blue',
  PACKED: 'badge-amber', DISPATCHED: 'badge-blue', DELIVERED: 'badge-green',
  FUNDS_RELEASED: 'badge-green', CANCELLED: 'badge-red',
};

const MILESTONE_LABEL = {
  PLACED: 'Placed', RAW_MATERIAL: 'Raw Material', IN_PRODUCTION: 'In Production',
  PACKED: 'Packed & QC', DISPATCHED: 'Dispatched', DELIVERED: 'Delivered',
  FUNDS_RELEASED: 'Settled', CANCELLED: 'Cancelled',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (filter) params.append('milestone', filter);
    api.get(`/orders?${params.toString()}`)
      .then(res => { setOrders(res.data.data); setMeta({ total: res.data.total, totalPages: res.data.totalPages }); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter, page]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl font-display font-bold text-brand-green-50 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-brand-green-500" />
          Orders
        </h1>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <div className="relative">
            <select
              id="order-milestone-filter"
              className="input-field pr-8 text-xs py-2 appearance-none cursor-pointer"
              value={filter}
              onChange={e => { setFilter(e.target.value); setPage(1); }}
            >
              {MILESTONES.map(m => <option key={m} value={m}>{m ? MILESTONE_LABEL[m] : 'All Stages'}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 px-5 py-3 bg-surface-700/60 border-b border-brand-green-900/20">
          {['Order #', 'Product', 'SHG / Seller', 'Amount', 'Status'].map(h => (
            <p key={h} className="text-xs font-semibold text-brand-green-400 uppercase tracking-wider">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-brand-green-500 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No orders found.</div>
        ) : (
          orders.map((order) => (
            <Link
              href={`/orders/${order._id}`}
              key={order._id}
              className="grid grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 px-5 py-4 items-center
                         border-t border-brand-green-900/20 hover:bg-surface-700/30 transition-colors"
            >
              <div>
                <p className="text-sm font-mono font-semibold text-brand-green-200">{order.orderNumber}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                </p>
              </div>
              <p className="text-sm text-gray-300 truncate">{order.productBatchId?.productName || '—'}</p>
              <p className="text-sm text-gray-400 truncate">{order.shgProfileId?.groupName || '—'}</p>
              <p className="font-semibold text-brand-amber-400 text-sm whitespace-nowrap">
                ₹{order.totalAmount?.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-2">
                <span className={MILESTONE_BADGE[order.currentMilestone] || 'badge-gray'}>
                  {MILESTONE_LABEL[order.currentMilestone] || order.currentMilestone}
                </span>
                <ArrowRight className="w-4 h-4 text-gray-600" />
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="btn-secondary px-4 py-2 text-xs disabled:opacity-30">← Prev</button>
          <span className="text-sm text-gray-400">Page {page} of {meta.totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= meta.totalPages} className="btn-secondary px-4 py-2 text-xs disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  );
}
