'use client';

import { useState, useCallback } from 'react';
import { MapPin, Navigation, Sliders, Search, Loader2 } from 'lucide-react';

/**
 * GeoSearchPanel
 * Sidebar panel for B2B buyers to search SHG clusters by geo-radius.
 *
 * @param {function} onSearch - Called with { lng, lat, radius, category }
 * @param {boolean} loading - Loading state
 */
export default function GeoSearchPanel({ onSearch, loading = false }) {
  const [coords, setCoords] = useState({ lng: '', lat: '' });
  const [radius, setRadius] = useState(100);
  const [category, setCategory] = useState('');
  const [geoError, setGeoError] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);

  const CATEGORIES = ['', 'Handicrafts', 'Organic Produce', 'Processed Food', 'Textiles', 'Other'];

  // ─── Browser Geolocation ───────────────────────────────
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser.');
      return;
    }
    setDetectingLocation(true);
    setGeoError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lng: pos.coords.longitude.toFixed(5),
          lat: pos.coords.latitude.toFixed(5),
        });
        setDetectingLocation(false);
      },
      (err) => {
        setGeoError('Could not get location. Please enter manually.');
        setDetectingLocation(false);
      },
      { timeout: 8000 }
    );
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!coords.lng || !coords.lat) {
      setGeoError('Please enter or detect your location.');
      return;
    }
    setGeoError('');
    onSearch?.({
      lng: parseFloat(coords.lng),
      lat: parseFloat(coords.lat),
      radius,
      category: category || undefined,
    });
  };

  const POPULAR_LOCATIONS = [
    { label: 'Mumbai', lng: 72.8777, lat: 19.076 },
    { label: 'Delhi', lng: 77.1025, lat: 28.7041 },
    { label: 'Bengaluru', lng: 77.5946, lat: 12.9716 },
    { label: 'Patna', lng: 85.1376, lat: 25.5941 },
    { label: 'Lucknow', lng: 80.9462, lat: 26.8467 },
  ];

  return (
    <div className="glass-card p-5 space-y-5">
      {/* Header */}
      <div>
        <h3 className="section-title text-base">
          <MapPin className="w-4 h-4 text-brand-green-500" />
          Find Nearby SHGs
        </h3>
        <p className="text-xs text-gray-500 mt-1">Search SHG clusters within your delivery radius</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Location input */}
        <div>
          <label className="input-label">Your Location</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="number"
              step="0.00001"
              className="input-field text-xs"
              placeholder="Longitude"
              value={coords.lng}
              onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
              id="geo-longitude"
            />
            <input
              type="number"
              step="0.00001"
              className="input-field text-xs"
              placeholder="Latitude"
              value={coords.lat}
              onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
              id="geo-latitude"
            />
          </div>
          <button
            type="button"
            onClick={detectLocation}
            disabled={detectingLocation}
            className="btn-secondary w-full text-xs py-2"
            id="detect-location-btn"
          >
            {detectingLocation ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            {detectingLocation ? 'Detecting...' : 'Use My Location'}
          </button>
          {geoError && <p className="text-xs text-red-400 mt-1.5">{geoError}</p>}
        </div>

        {/* Quick location shortcuts */}
        <div>
          <label className="input-label">Quick Select City</label>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_LOCATIONS.map(({ label, lng, lat }) => (
              <button
                key={label}
                type="button"
                onClick={() => setCoords({ lng: String(lng), lat: String(lat) })}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors
                  ${coords.lng === String(lng)
                    ? 'bg-brand-green-700/60 text-brand-green-200 border border-brand-green-600/50'
                    : 'bg-surface-700/60 text-gray-400 hover:text-gray-200 hover:bg-surface-600'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Radius slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="input-label mb-0">
              <Sliders className="w-3.5 h-3.5 inline mr-1" />
              Search Radius
            </label>
            <span className="text-brand-green-300 font-semibold text-sm">{radius} km</span>
          </div>
          <input
            type="range"
            id="radius-slider"
            min={10}
            max={500}
            step={10}
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-green-500
              [&::-webkit-slider-thumb]:shadow-glow-green [&::-webkit-slider-thumb]:cursor-pointer"
            style={{ background: `linear-gradient(to right, #22c55e ${(radius - 10) / (500 - 10) * 100}%, #1a211a ${(radius - 10) / (500 - 10) * 100}%)` }}
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>10 km</span>
            <span>500 km</span>
          </div>
        </div>

        {/* Category filter */}
        <div>
          <label className="input-label" htmlFor="geo-category">Filter by Category</label>
          <select
            id="geo-category"
            className="input-field text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c || 'All Categories'}</option>
            ))}
          </select>
        </div>

        {/* Search button */}
        <button
          type="submit"
          id="geo-search-btn"
          className="btn-primary w-full"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? 'Searching...' : 'Search SHG Clusters'}
        </button>
      </form>
    </div>
  );
}
