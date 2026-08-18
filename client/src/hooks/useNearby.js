'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';

/**
 * useNearby — geo-spatial SHG search hook.
 *
 * Usage:
 *   const { shgs, loading, error, search } = useNearby();
 *   search({ lng: 77.2, lat: 28.6, radius: 100, category: 'Handicrafts' });
 */
export function useNearby() {
  const [shgs, setSHGs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchMeta, setSearchMeta] = useState(null);

  const search = useCallback(async ({ lng, lat, radius = 100, category }) => {
    setLoading(true);
    setError(null);
    setSHGs([]);

    try {
      const params = new URLSearchParams({ lng, lat, radius });
      if (category) params.append('category', category);

      const res = await api.get(`/shg/nearby?${params.toString()}`);
      setSHGs(res.data.data);
      setSearchMeta(res.data.searchParams);
    } catch (err) {
      setError(err.message || 'Geo-search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setSHGs([]);
    setSearchMeta(null);
    setError(null);
  }, []);

  return { shgs, loading, error, searchMeta, search, clear };
}
