'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import MilestoneTracker from '@/components/MilestoneTracker';
import {
  ArrowLeft, Package, MapPin, Truck,
  Loader2, AlertCircle, CheckCircle, Shield
} from 'lucide-react';
import Link from 'next/link';

const NEXT_STAGE = {
  PLACED:        { shg_leader: 'RAW_MATERIAL',   ngo_admin: 'RAW_MATERIAL',   b2b_buyer: null },
  RAW_MATERIAL:  { shg_leader: 'IN_PRODUCTION',  ngo_admin: 'IN_PRODUCTION',  b2b_buyer: null },
  IN_PRODUCTION: { shg_leader: 'PACKED',         ngo_admin: 'PACKED',         b2b_buyer: null },
  PACKED:        { shg_leader: 'DISPATCHED',     ngo_admin: 'DISPATCHED',     b2b_buyer: null },
  DISPATCHED:    { shg_leader: null,             ngo_admin: 'DELIVERED',      b2b_buyer: 'DELIVERED' },
  DELIVERED:     { shg_leader: null,             ngo_admin: 'FUNDS_RELEASED', b2b_buyer: null },
  FUNDS_RELEASED: {},
  CANCELLED: {},
};

const STAGE_ACTION_LABEL = {
  RAW_MATERIAL:   'Mark Raw Material Acquired',
  IN_PRODUCTION:  'Mark In Production',
  PACKED:         'Mark Packed & QC Done',
  DISPATCHED:     'Mark Dispatched',
  DELIVERED:      'Confirm Delivery',
  FUNDS_RELEASED: 'Release Escrow Funds',
};

export default function OrderDetailClient({ id }) {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data.order);
    } catch {
      setError('Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleMilestone = async (nextStage) => {
    setError(''); setSuccess(''); setTransitioning(true);
    try {
      await api.patch(`/orders/${id}/milestone`, { nextStage, note });
      setSuccess(`Order advanced to: ${nextStage.replace(/_/g, ' ')}`);
      setNote('');
      fetchOrder();
    } catch (err) {
      setError(err.message || 'Transition failed.');
    } finally {
      setTransitioning(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-brand-green-500 animate-spin" />
    </div>
  );

  if (error && !order) return (
    <div className="glass-card p-12 flex flex-col items-center gap-3">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-gray-400">{error}</p>
      <Link href="/orders" className="btn-secondary text-sm">← Back to Orders</Link>
    </div>
  );

  const nextStage = NEXT_STAGE[order?.currentMilestone]?.[user?.role];
  const isCancelled = order?.currentMilestone === 'CANCELLED';
  const isTerminal = ['FUNDS_RELEASED', 'CANCELLED'].includes(order?.currentMilestone);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-brand-green-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-green-50">Order {order?.orderNumber}</h1>
          <p className="text-gray-400 text-sm mt-1">
            Placed on {order?.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }) : '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {order?.isRFQ && <span className="badge badge-amber">RFQ</span>}
          <span className={`badge ${isCancelled ? 'badge-red' : isTerminal ? 'badge-green' : 'badge-blue'}`}>
            {order?.currentMilestone?.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-900/20 border border-red-800/30 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-green-900/20 border border-brand-green-700/30 text-brand-green-300 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />{success}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="col-span-2 space-y-5">
          {/* Product Info */}
          <div className="glass-card p-5">
            <h2 className="section-title text-base mb-4"><Package className="w-4 h-4 text-brand-green-500" />Product Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs mb-1">Product</p><p className="text-brand-green-100 font-medium">{order?.productBatchId?.productName}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Category</p><p className="text-gray-300">{order?.productBatchId?.category}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Quantity</p><p className="text-gray-300">{order?.quantity} {order?.productBatchId?.unit}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Unit Price</p><p className="text-brand-amber-400 font-semibold">₹{order?.unitPrice}/{order?.productBatchId?.unit}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Total Amount</p><p className="text-brand-amber-400 font-bold text-lg">₹{order?.totalAmount?.toLocaleString('en-IN')}</p></div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Escrow Status</p>
                <span className={`badge ${order?.escrowStatus === 'released' ? 'badge-green' : order?.escrowStatus === 'held' ? 'badge-amber' : 'badge-gray'}`}>
                  {order?.escrowStatus}
                </span>
              </div>
            </div>
          </div>

          {/* SHG Info */}
          <div className="glass-card p-5">
            <h2 className="section-title text-base mb-4"><MapPin className="w-4 h-4 text-brand-green-500" />SHG / Seller</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 text-xs mb-1">Group Name</p><p className="text-brand-green-100 font-medium">{order?.shgProfileId?.groupName}</p></div>
              <div><p className="text-gray-500 text-xs mb-1">Location</p><p className="text-gray-300">{order?.shgProfileId?.district}, {order?.shgProfileId?.state}</p></div>
            </div>
          </div>

          {/* Delivery */}
          <div className="glass-card p-5">
            <h2 className="section-title text-base mb-4"><Truck className="w-4 h-4 text-brand-green-500" />Delivery</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Delivery Address</p>
                <p className="text-gray-300">
                  {order?.deliveryAddress?.street && `${order.deliveryAddress.street}, `}
                  {order?.deliveryAddress?.city}, {order?.deliveryAddress?.state} — {order?.deliveryAddress?.pincode}
                </p>
              </div>
              {order?.trackingId && (
                <div><p className="text-gray-500 text-xs mb-1">Tracking ID</p><p className="text-brand-green-300 font-mono">{order.trackingId}</p></div>
              )}
              {order?.expectedDeliveryDate && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Expected Delivery</p>
                  <p className="text-gray-300">{new Date(order.expectedDeliveryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                </div>
              )}
            </div>
          </div>

          {/* Milestone advance */}
          {!isTerminal && nextStage && (
            <div className="glass-card p-5 border-brand-green-700/30">
              <h2 className="section-title text-base mb-4">
                <CheckCircle className="w-4 h-4 text-brand-amber-400" />Advance Milestone
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="input-label" htmlFor="milestone-note">Add Note (optional)</label>
                  <textarea
                    id="milestone-note"
                    rows={2}
                    className="input-field resize-none text-sm"
                    placeholder="e.g. Packed in 5 boxes, QC approved..."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => handleMilestone(nextStage)}
                  disabled={transitioning}
                  id="advance-milestone-btn"
                  className={nextStage === 'FUNDS_RELEASED' ? 'btn-primary w-full' : 'btn-amber w-full'}
                >
                  {transitioning
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : nextStage === 'FUNDS_RELEASED'
                      ? <Shield className="w-4 h-4" />
                      : <CheckCircle className="w-4 h-4" />}
                  {transitioning ? 'Processing...' : STAGE_ACTION_LABEL[nextStage] || `Move to ${nextStage}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Milestone Tracker */}
        <div className="col-span-1">
          <div className="glass-card p-5 sticky top-4">
            <h2 className="section-title text-base mb-5">Order Progress</h2>
            <MilestoneTracker
              currentMilestone={order?.currentMilestone}
              milestoneHistory={order?.milestoneHistory || []}
              cancelled={order?.currentMilestone === 'CANCELLED'}
              cancellationReason={order?.cancellationReason}
              cancelledAt={order?.cancelledAt}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
