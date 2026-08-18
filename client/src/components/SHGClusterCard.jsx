'use client';

import { MapPin, Users, Star, Package, ChevronRight, BadgeCheck } from 'lucide-react';

const CATEGORY_COLORS = {
  Handicrafts: 'badge-amber',
  'Organic Produce': 'badge-green',
  'Processed Food': 'badge-blue',
  Textiles: 'badge-purple',
  Other: 'badge-gray',
};

/**
 * SHGClusterCard
 * Compact card displaying SHG cluster info in the buyer map/list view.
 *
 * @param {object} shg - SHG profile object
 * @param {function} onRequestQuote - Callback when buyer clicks "Request Quote"
 * @param {boolean} selected - Whether this card is currently selected
 */
export default function SHGClusterCard({ shg, onRequestQuote, selected = false }) {
  if (!shg) return null;

  const {
    groupName,
    clusterName,
    district,
    state,
    memberCount,
    primaryCategory,
    activeProductCount,
    distanceKm,
    rating,
    productBatches = [],
    _id,
  } = shg;

  return (
    <div
      className={`glass-card-hover p-5 cursor-pointer transition-all duration-200 ${
        selected ? 'border-brand-green-500/50 shadow-glow-green' : ''
      }`}
    >
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <h3 className="font-semibold text-brand-green-50 text-sm truncate">{groupName}</h3>
            <BadgeCheck className="w-3.5 h-3.5 text-brand-green-400 shrink-0" title="Verified" />
          </div>
          <p className="text-xs text-gray-400 truncate">{clusterName}</p>
        </div>

        {/* Distance badge */}
        {distanceKm !== undefined && (
          <span className="badge badge-green shrink-0">
            <MapPin className="w-3 h-3" />
            {distanceKm} km
          </span>
        )}
      </div>

      {/* ─── Location ───────────────────────────────────────── */}
      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
        <MapPin className="w-3 h-3 shrink-0" />
        {district}, {state}
      </div>

      {/* ─── Stats Row ──────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users className="w-3.5 h-3.5 text-brand-green-600" />
          {memberCount} members
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Package className="w-3.5 h-3.5 text-brand-amber-600" />
          {activeProductCount ?? productBatches.length} products
        </div>
        {rating?.average > 0 && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Star className="w-3.5 h-3.5 text-brand-amber-400 fill-brand-amber-400" />
            {rating.average.toFixed(1)}
            <span className="text-gray-600">({rating.count})</span>
          </div>
        )}
      </div>

      {/* ─── Category Badge ─────────────────────────────────── */}
      {primaryCategory && (
        <span className={CATEGORY_COLORS[primaryCategory] || 'badge-gray'}>
          {primaryCategory}
        </span>
      )}

      {/* ─── Product Preview ────────────────────────────────── */}
      {productBatches.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {productBatches.slice(0, 2).map((p) => (
            <div
              key={p._id}
              className="flex items-center justify-between text-xs bg-surface-700/50 rounded-lg px-3 py-1.5"
            >
              <span className="text-gray-300 truncate">{p.productName}</span>
              <span className="text-brand-amber-400 font-semibold ml-2 shrink-0">
                ₹{p.unitPrice}/{p.unit}
              </span>
            </div>
          ))}
          {productBatches.length > 2 && (
            <p className="text-xs text-gray-600 text-center">+{productBatches.length - 2} more</p>
          )}
        </div>
      )}

      {/* ─── CTA ────────────────────────────────────────────── */}
      <button
        onClick={() => onRequestQuote?.(shg)}
        id={`rfq-btn-${_id}`}
        className="btn-amber w-full mt-4 py-2 text-xs"
      >
        Request Quote <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
