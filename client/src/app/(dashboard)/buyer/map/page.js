'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import GeoSearchPanel from '@/components/GeoSearchPanel';
import SHGClusterCard from '@/components/SHGClusterCard';
import RFQModal from '@/components/RFQModal';
import { MapPin, LayoutList, Map, Search, AlertCircle } from 'lucide-react';

export default function BuyerMapPage() {
  const [shgs, setSHGs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedSHG, setSelectedSHG] = useState(null);
  const [rfqOpen, setRFQOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchMeta, setSearchMeta] = useState(null);

  const handleSearch = useCallback(async ({ lng, lat, radius, category }) => {
    setLoading(true);
    setError('');
    setSHGs([]);
    setSearched(true);
    try {
      const params = new URLSearchParams({ lng, lat, radius });
      if (category) params.append('category', category);
      const res = await api.get(`/shg/nearby?${params.toString()}`);
      setSHGs(res.data.data);
      setSearchMeta(res.data.searchParams);
    } catch (err) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRFQ = (shg) => {
    setSelectedSHG(shg);
    setRFQOpen(true);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-brand-green-50 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-brand-green-500" />
          Find SHG Clusters
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Search verified rural SHG clusters within your delivery radius
        </p>
      </div>

      <div className="flex gap-6">
        {/* ─── Sidebar: Search Panel ──────────────────────── */}
        <div className="w-72 shrink-0">
          <GeoSearchPanel onSearch={handleSearch} loading={loading} />
        </div>

        {/* ─── Main: Results ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Results header */}
          {searched && (
            <div className="flex items-center justify-between mb-4">
              <div>
                {shgs.length > 0 ? (
                  <p className="text-sm text-gray-400">
                    Found <span className="font-semibold text-brand-green-300">{shgs.length} SHG clusters</span>
                    {searchMeta && ` within ${searchMeta.radius} km`}
                  </p>
                ) : (
                  !loading && !error && (
                    <p className="text-sm text-gray-500">No SHG clusters found in this area.</p>
                  )
                )}
              </div>
              {shgs.length > 0 && (
                <div className="flex items-center gap-1 bg-surface-700 rounded-xl p-1">
                  {[{ mode: 'list', icon: LayoutList }, { mode: 'grid', icon: Map }].map(({ mode, icon: Icon }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === mode ? 'bg-brand-green-700/60 text-brand-green-200' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-red-900/20 border border-red-800/30 text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-52 rounded-2xl" />
              ))}
            </div>
          )}

          {/* Results */}
          {!loading && shgs.length > 0 && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4'}>
              {shgs.map((shg) => (
                <SHGClusterCard
                  key={shg._id}
                  shg={shg}
                  onRequestQuote={handleRFQ}
                  selected={selectedSHG?._id === shg._id}
                />
              ))}
            </div>
          )}

          {/* Empty / initial state */}
          {!loading && !searched && (
            <div className="glass-card p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-brand-green-900/30 flex items-center justify-center mb-4">
                <Search className="w-7 h-7 text-gray-600" />
              </div>
              <h3 className="font-display font-semibold text-gray-400 mb-2">Search for SHG Clusters</h3>
              <p className="text-sm text-gray-600 max-w-xs">
                Enter your location and delivery radius on the left to discover verified rural producers near you.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ─── RFQ Modal ─────────────────────────────────────── */}
      <RFQModal
        shg={selectedSHG}
        isOpen={rfqOpen}
        onClose={() => { setRFQOpen(false); setSelectedSHG(null); }}
        onSuccess={() => alert('Your RFQ/Order was submitted successfully!')}
      />
    </div>
  );
}
