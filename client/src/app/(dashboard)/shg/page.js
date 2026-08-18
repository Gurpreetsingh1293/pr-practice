'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import ProductBatchTable from '@/components/ProductBatchTable';
import { Plus, Package, TrendingUp, ShoppingCart, Loader2, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const EMPTY_FORM = {
  productName: '', category: '', description: '', unitPrice: '',
  unit: 'kg', moq: '', currentStock: '', productionCapacity: '', leadTimeDays: '',
};

export default function SHGDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, productRes] = await Promise.allSettled([
        api.get('/shg/profile/me'),
        api.get('/products/my'),
      ]);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data.data.profile);
      if (productRes.status === 'fulfilled') setProducts(productRes.value.data.data);
    } catch { /* handled individually */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await api.post('/products', {
        ...form,
        unitPrice: parseFloat(form.unitPrice),
        moq: parseInt(form.moq),
        currentStock: parseInt(form.currentStock),
        productionCapacity: parseInt(form.productionCapacity),
        leadTimeDays: parseInt(form.leadTimeDays),
      });
      setSuccess('Product batch added successfully!');
      setShowModal(false);
      setForm(EMPTY_FORM);
      fetchData();
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product batch?')) return;
    await api.delete(`/products/${id}`);
    fetchData();
  };

  const stats = [
    { label: 'Active Products', value: products.filter(p => p.isActive).length, icon: Package, color: 'text-brand-green-400' },
    { label: 'Total Stock', value: products.reduce((a, p) => a + (p.currentStock || 0), 0), icon: TrendingUp, color: 'text-brand-amber-400' },
    { label: 'Total Orders', value: products.reduce((a, p) => a + (p.totalOrdersReceived || 0), 0), icon: ShoppingCart, color: 'text-blue-400' },
    { label: 'Group Members', value: profile?.memberCount || '-', icon: CheckCircle, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-green-50">
            Welcome, {user?.name?.split(' ')[0]}! 🌿
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {profile ? `${profile.groupName} · ${profile.district}, ${profile.state}` : 'Complete your SHG profile to get started'}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          id="add-product-btn"
          className="btn-primary"
          disabled={!profile || profile.verificationStatus !== 'approved'}
        >
          <Plus className="w-4 h-4" /> Add Product Batch
        </button>
      </div>

      {/* ─── Verification Alert ──────────────────────────────── */}
      {profile && profile.verificationStatus !== 'approved' && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          profile.verificationStatus === 'pending'
            ? 'bg-brand-amber-900/20 border-brand-amber-700/30'
            : 'bg-red-900/20 border-red-700/30'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 ${profile.verificationStatus === 'pending' ? 'text-brand-amber-400' : 'text-red-400'}`} />
          <p className="text-sm">
            {profile.verificationStatus === 'pending'
              ? 'Your SHG profile is pending verification by the Y4D admin. You can add products once approved.'
              : `Your profile was rejected: ${profile.rejectionReason || 'Please contact support.'}`}
          </p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-brand-green-900/20 border border-brand-green-700/30 text-brand-green-300 text-sm">
          <CheckCircle className="w-4 h-4" /> {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ─── Stats Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon className={`w-5 h-5 ${color}`} />
            <p className="text-2xl font-display font-bold text-brand-green-50">{loading ? '—' : value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* ─── Products Table ──────────────────────────────────── */}
      <div>
        <h2 className="section-title mb-4">
          <Package className="w-5 h-5 text-brand-green-500" />
          My Product Batches
        </h2>
        {loading ? (
          <div className="glass-card p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-brand-green-500 animate-spin" />
          </div>
        ) : (
          <ProductBatchTable
            data={products}
            onEdit={(p) => { setForm(p); setShowModal(true); }}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* ─── Add Product Modal ───────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass-card p-7 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-xl text-brand-green-50">Add Product Batch</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-surface-700 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-red-400 text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="input-label">Product Name</label>
                  <input className="input-field" placeholder="e.g. Madhubani Paintings A3" value={form.productName} onChange={e => setForm({...form, productName: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">Category</label>
                  <select className="input-field" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                    <option value="">Select...</option>
                    {['Handicrafts','Organic Produce','Processed Food','Textiles','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Unit</label>
                  <select className="input-field" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}>
                    {['kg','gram','litre','ml','piece','dozen','meter','bundle','box','bag'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Unit Price (₹)</label>
                  <input type="number" min="0.01" step="0.01" className="input-field" placeholder="350.00" value={form.unitPrice} onChange={e => setForm({...form, unitPrice: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">MOQ</label>
                  <input type="number" min="1" className="input-field" placeholder="50" value={form.moq} onChange={e => setForm({...form, moq: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">Current Stock</label>
                  <input type="number" min="0" className="input-field" value={form.currentStock} onChange={e => setForm({...form, currentStock: e.target.value})} required />
                </div>
                <div>
                  <label className="input-label">Production Capacity/mo</label>
                  <input type="number" min="0" className="input-field" value={form.productionCapacity} onChange={e => setForm({...form, productionCapacity: e.target.value})} required />
                </div>
                <div className="col-span-2">
                  <label className="input-label">Lead Time (days)</label>
                  <input type="number" min="1" className="input-field" placeholder="14" value={form.leadTimeDays} onChange={e => setForm({...form, leadTimeDays: e.target.value})} required />
                </div>
                <div className="col-span-2">
                  <label className="input-label">Description</label>
                  <textarea rows={3} className="input-field resize-none" placeholder="Describe your product..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" id="save-product-btn" className="btn-primary flex-1" disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
