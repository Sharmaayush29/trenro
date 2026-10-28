'use client';

import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Percent,
  Banknote,
  Calendar,
  X,
  Power,
  RefreshCw,
} from 'lucide-react';
import { Coupon } from '@/types';
import { formatCurrencyINR } from '@/lib/utils/formatters';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minSubtotal, setMinSubtotal] = useState<number>(999);
  const [maxDiscountCap, setMaxDiscountCap] = useState<string>('500');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [totalLimit, setTotalLimit] = useState<string>('100');
  const [isAutomatic, setIsAutomatic] = useState<boolean>(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (res.ok) {
        setCoupons(data.coupons || []);
        setTableMissing(!!data.tableMissing);
        if (data.tableMissing) {
          setFeedback(null);
        }
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to load coupons from database.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error connecting to coupon service.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: `Coupon status updated to ${!currentStatus ? 'Active' : 'Paused'}.`,
        });
        fetchCoupons();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to update status.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error updating coupon status.' });
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to permanently delete coupon "${couponCode}"?`)) return;

    try {
      const res = await fetch(`/api/coupons?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: `Coupon "${couponCode}" deleted.` });
        fetchCoupons();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to delete coupon.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error deleting coupon.' });
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        discount_type: discountType,
        discount_value: Number(discountValue),
        min_order_subtotal: Number(minSubtotal) || 0,
        max_discount_cap: maxDiscountCap ? Number(maxDiscountCap) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
        total_redemption_limit: totalLimit ? Number(totalLimit) : null,
        is_automatic: isAutomatic,
        is_active: true,
      };

      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({ type: 'success', message: `Coupon "${payload.code}" created successfully!` });
        setIsModalOpen(false);
        setCode('');
        setName('');
        setDiscountValue(10);
        setMinSubtotal(999);
        setMaxDiscountCap('');
        setExpiresAt('');
        fetchCoupons();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to create coupon.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error while creating coupon.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BD8B52]">
            Store Incentives & Promotions
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#171717] mt-0.5">
            Coupons & Vouchers CMS
          </h1>
          <p className="text-xs text-[#737373] mt-0.5">
            Manage genuine client incentives. No discounts apply automatically without explicit admin activation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCoupons}
            className="p-2.5 bg-[#F5F1E8] hover:bg-[#EAE4D6] text-[#171717] rounded-xl text-xs font-bold transition-colors cursor-pointer"
            title="Refresh coupons"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> Create Coupon
          </button>
        </div>
      </div>

      {/* Missing Table Activation Helper */}
      {tableMissing && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4 text-xs text-amber-900 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <strong className="text-sm font-bold block text-amber-950">
                Coupons Table Activation Required
              </strong>
              <p className="text-xs text-amber-800">
                To create and apply voucher codes, activate the coupons table in your Supabase SQL Editor. Click the button to copy the 1-click script.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const sql = `CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_subtotal NUMERIC NOT NULL DEFAULT 0,
  max_discount_cap NUMERIC,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  total_redemption_limit INTEGER,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  per_customer_limit INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_automatic BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());`;
                navigator.clipboard.writeText(sql);
                alert('Coupons SQL copied to clipboard! Paste it into your Supabase Dashboard SQL Editor.');
              }}
              className="px-4 py-2 bg-amber-900 hover:bg-amber-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider shrink-0 cursor-pointer shadow-sm transition-colors"
            >
              Copy SQL Script
            </button>
          </div>
        </div>
      )}

      {/* Feedback Alerts */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-70 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Coupons Table / Grid */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#737373]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#BD8B52] mb-2" />
            Loading promotional database...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-14 h-14 bg-[#FAF8F5] text-[#BD8B52] rounded-full flex items-center justify-center mx-auto border border-[#E5E0D8]">
              <Tag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-[#171717]">No Coupons Configured</h3>
              <p className="text-xs text-[#737373] max-w-sm mx-auto">
                No automatic or manual discount codes are currently running. Create your first voucher to offer promotional savings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Coupon
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E5E0D8] text-[10px] uppercase tracking-wider text-[#737373]">
                <tr>
                  <th className="py-3 px-4 font-bold">Voucher Code & Campaign</th>
                  <th className="py-3 px-4 font-bold">Discount Value</th>
                  <th className="py-3 px-4 font-bold">Minimum Order</th>
                  <th className="py-3 px-4 font-bold">Redemptions</th>
                  <th className="py-3 px-4 font-bold">Expiry Date</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F1E8]">
                {coupons.map((c) => {
                  const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
                  return (
                    <tr key={c.id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#171717] px-2 py-0.5 bg-[#F5F1E8] border border-[#E5E0D8] rounded-md">
                            {c.code}
                          </span>
                          {c.is_automatic && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-sm border border-blue-200">
                              Auto
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#737373] mt-0.5">{c.name}</p>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#171717]">
                        {c.discount_type === 'percentage'
                          ? `${c.discount_value}% OFF`
                          : formatCurrencyINR(c.discount_value)}
                        {c.max_discount_cap && (
                          <span className="text-[10px] text-[#737373] font-normal block">
                            Cap: {formatCurrencyINR(c.max_discount_cap)}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#525252]">
                        {c.min_order_subtotal > 0 ? formatCurrencyINR(c.min_order_subtotal) : 'No Minimum'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#525252]">
                        {c.current_redemptions}
                        {c.total_redemption_limit ? ` / ${c.total_redemption_limit}` : ' (Unlimited)'}
                      </td>
                      <td className="py-3.5 px-4 text-[#737373]">
                        {c.expires_at ? (
                          <span className={isExpired ? 'text-red-600 font-bold' : ''}>
                            {new Date(c.expires_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          'No Expiry'
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            !c.is_active
                              ? 'bg-gray-100 text-gray-700'
                              : isExpired
                              ? 'bg-red-50 text-red-700'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {!c.is_active ? 'Paused' : isExpired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(c.id, c.is_active)}
                            className="p-1.5 hover:bg-[#F5F1E8] rounded-lg text-[#737373] hover:text-[#171717] transition-colors cursor-pointer"
                            title={c.is_active ? 'Pause Coupon' : 'Activate Coupon'}
                          >
                            <Power className={`w-3.5 h-3.5 ${c.is_active ? 'text-emerald-600' : 'text-gray-400'}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(c.id, c.code)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-[#737373] hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#E5E0D8] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#F5F1E8] pb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#BD8B52]">
                  New Promotional Campaign
                </span>
                <h3 className="text-lg font-black text-[#171717]">Create Store Coupon</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-[#F5F1E8] rounded-xl text-[#737373] hover:text-[#171717] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                    placeholder="e.g. FESTIVE20"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl font-mono text-xs font-bold uppercase text-[#171717] focus:outline-hidden focus:border-[#BD8B52]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Inaugural Drop 20% Off"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs text-[#171717] focus:outline-hidden focus:border-[#BD8B52]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Discount Type
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs text-[#171717] focus:outline-hidden focus:border-[#BD8B52]"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed INR Discount (₹)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={discountType === 'percentage' ? 100 : 10000}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs font-bold text-[#171717] focus:outline-hidden focus:border-[#BD8B52]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Min Order Subtotal (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={minSubtotal}
                    onChange={(e) => setMinSubtotal(Number(e.target.value))}
                    placeholder="999"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs text-[#171717] focus:outline-hidden focus:border-[#BD8B52]"
                  />
                </div>

                {discountType === 'percentage' && (
                  <div className="space-y-1">
                    <label className="font-bold text-[#171717] uppercase tracking-wider block">
                      Max Cap (₹, Optional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={maxDiscountCap}
                      onChange={(e) => setMaxDiscountCap(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs text-[#171717] focus:outline-hidden focus:border-[#BD8B52]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs text-[#171717] focus:outline-hidden focus:border-[#BD8B52]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Total Redemption Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={totalLimit}
                    onChange={(e) => setTotalLimit(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-xs text-[#171717] focus:outline-hidden focus:border-[#BD8B52]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAutomatic}
                    onChange={(e) => setIsAutomatic(e.target.checked)}
                    className="w-4 h-4 rounded-sm accent-[#171717]"
                  />
                  <span className="font-semibold text-[#171717]">
                    Automatic Campaign (Auto-applied at checkout when eligible)
                  </span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#F5F1E8] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-[#FAF8F5] hover:bg-[#EAE4D6] text-[#171717] text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
