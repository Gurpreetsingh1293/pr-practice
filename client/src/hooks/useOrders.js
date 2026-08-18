'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

/**
 * useOrders — fetches orders with optional filters, pagination, and role-scoping.
 *
 * @param {object} options
 * @param {string} options.milestone - Filter by milestone stage
 * @param {number} options.page - Current page
 * @param {number} options.limit - Items per page
 * @param {boolean} options.enabled - Whether to auto-fetch
 */
export function useOrders({ milestone = '', page = 1, limit = 20, enabled = true } = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 });

  const fetch = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit });
      if (milestone) params.append('milestone', milestone);
      const res = await api.get(`/orders?${params.toString()}`);
      setOrders(res.data.data);
      setMeta({ total: res.data.total, totalPages: res.data.totalPages });
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [enabled, milestone, page, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, loading, error, meta, refetch: fetch };
}

/**
 * useOrder — fetches a single order by ID.
 */
export function useOrder(id) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.data.order);
    } catch (err) {
      setError(err.message || 'Order not found');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  /**
   * advanceMilestone — calls PATCH /orders/:id/milestone
   */
  const advanceMilestone = async (nextStage, note) => {
    const res = await api.patch(`/orders/${id}/milestone`, { nextStage, note });
    setOrder(res.data.data.order);
    return res.data;
  };

  return { order, loading, error, refetch: fetch, advanceMilestone };
}
