'use client';

import { useState } from 'react';
import { X, Loader2, AlertCircle, ShoppingBag, Package } from 'lucide-react';
import api from '@/lib/api';

/**
 * RFQModal
 * Slide-over modal for B2B buyer to submit an RFQ or direct purchase order.
 *
 * @param {object} shg - Selected SHG profile
 * @param {object|null} product - Pre-selected product batch (optional)
 * @param {boolean} isOpen - Visibility state
 * @param {function} onClose - Close callback
 * @param {function} onSuccess - Success callback after submission
 */
export default function RFQModal({ shg, product, isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    productBatchId: product?._id || '',
    quantity: product?.moq || 1,
    rfqNote: '',
    isRFQ: true,
    deliveryAddress: { city: '', state: '', pincode: '', street: '' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !shg) return null;

  const products = shg.productBatches || (product ? [product] : []);
  const selectedProduct = products.find((p) => p._id === form.productBatchId) || product;

  const estimatedTotal = selectedProduct
    ? (selectedProduct.unitPrice * form.quantity).toLocaleString('en-IN')
    : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/orders', {
        ...form,
        quantity: parseInt(form.quantity),
      });
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card p-7 animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag className="w-5 h-5 text-brand-amber-400" />
              <h2 className="font-display font-bold text-lg text-brand-green-50">
                {form.isRFQ ? 'Request for Quote' : 'Place Order'}
              </h2>
            </div>
            <p className="text-sm text-gray-400">from {shg.groupName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-700 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-900/20 border border-red-800/30 text-red-400 text-sm mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Order type toggle */}
          <div className="flex items-center gap-2 p-1 bg-surface-700 rounded-xl">
            {[{ val: true, label: 'RFQ (Negotiate)' }, { val: false, label: 'Direct Purchase' }].map(({ val, label }) => (
              <button
                key={String(val)}
                type="button"
                onClick={() => setForm({ ...form, isRFQ: val })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                  ${form.isRFQ === val
                    ? val ? 'bg-brand-amber-700/80 text-brand-amber-100' : 'bg-brand-green-700/80 text-brand-green-100'
                    : 'text-gray-400 hover:text-gray-200'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Product select */}
          {products.length > 1 && (
            <div>
              <label className="input-label">Select Product</label>
              <select
                id="rfq-product-select"
                className="input-field"
                value={form.productBatchId}
                onChange={(e) => setForm({ ...form, productBatchId: e.target.value })}
                required
              >
                <option value="">-- Choose a product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.productName} — ₹{p.unitPrice}/{p.unit} (MOQ: {p.moq})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Product info card */}
          {selectedProduct && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-700/60 border border-brand-green-900/20">
              <Package className="w-8 h-8 text-brand-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-green-100 truncate">{selectedProduct.productName}</p>
                <p className="text-xs text-gray-400">
                  MOQ: {selectedProduct.moq} {selectedProduct.unit} · Stock: {selectedProduct.currentStock} {selectedProduct.unit}
                </p>
              </div>
              <p className="text-brand-amber-400 font-bold text-sm ml-auto shrink-0">
                ₹{selectedProduct.unitPrice}/{selectedProduct.unit}
              </p>
            </div>
          )}

          {/* Quantity */}
          <div>
            <label className="input-label" htmlFor="rfq-quantity">
              Quantity ({selectedProduct?.unit || 'units'})
              {selectedProduct && <span className="text-gray-500 normal-case ml-1">(min. {selectedProduct.moq})</span>}
            </label>
            <input
              id="rfq-quantity"
              type="number"
              className="input-field"
              value={form.quantity}
              min={selectedProduct?.moq || 1}
              max={selectedProduct?.currentStock || undefined}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
            {estimatedTotal && !form.isRFQ && (
              <p className="text-xs text-brand-amber-400 mt-1">
                Estimated total: ₹{estimatedTotal}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="input-label" htmlFor="rfq-note">
              {form.isRFQ ? 'Negotiation Note / Requirements' : 'Order Instructions (Optional)'}
            </label>
            <textarea
              id="rfq-note"
              rows={3}
              className="input-field resize-none"
              placeholder={form.isRFQ ? 'E.g. Looking for monthly supply, can we negotiate bulk pricing?' : 'Special instructions...'}
              value={form.rfqNote}
              onChange={(e) => setForm({ ...form, rfqNote: e.target.value })}
            />
          </div>

          {/* Delivery address */}
          <div>
            <label className="input-label">Delivery Address</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                className="input-field col-span-2"
                placeholder="Street / Area"
                value={form.deliveryAddress.street}
                onChange={(e) => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, street: e.target.value } })}
              />
              <input
                type="text"
                className="input-field"
                placeholder="City *"
                value={form.deliveryAddress.city}
                onChange={(e) => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, city: e.target.value } })}
                required
                id="rfq-city"
              />
              <input
                type="text"
                className="input-field"
                placeholder="State *"
                value={form.deliveryAddress.state}
                onChange={(e) => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, state: e.target.value } })}
                required
              />
              <input
                type="text"
                className="input-field col-span-2"
                placeholder="Pincode *"
                value={form.deliveryAddress.pincode}
                onChange={(e) => setForm({ ...form, deliveryAddress: { ...form.deliveryAddress, pincode: e.target.value } })}
                required
                maxLength={6}
                pattern="\d{6}"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              type="submit"
              id="rfq-submit-btn"
              className="btn-amber flex-1"
              disabled={loading || !form.productBatchId}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : form.isRFQ ? 'Submit RFQ' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
