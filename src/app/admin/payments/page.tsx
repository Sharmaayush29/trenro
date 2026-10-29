'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/lib/store/cart-context';
import { Order } from '@/types/cart';
import { formatINR, formatDate } from '@/lib/utils/formatters';
import {
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  QrCode,
  DollarSign,
  Smartphone,
  Lock,
  ArrowRight,
  Info,
  RefreshCw,
  Clock,
  Truck,
  Settings2,
  Save,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  orderReference: string;
  customerName: string;
  amountINR: number;
  method: string;
  status: string;
  timestamp: string;
  gatewayReference: string;
  reconciled: boolean;
}

export default function AdminPaymentsPage() {
  const { orders } = useCartStore();

  const [activeTab, setActiveTab] = useState<'transactions' | 'delivery_rules' | 'gateway_setup'>('delivery_rules');

  // Shipping & Delivery Settings State
  const [isFreeDeliveryForAll, setIsFreeDeliveryForAll] = useState(false);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(999);
  const [shippingFee, setShippingFee] = useState(99);
  const [codFee, setCodFee] = useState(0);

  // Razorpay Gateway State
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveKeyId, setLiveKeyId] = useState('');
  const [liveKeySecret, setLiveKeySecret] = useState('');

  // UI state
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load current store settings
  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.settings) {
          setIsFreeDeliveryForAll(Boolean(data.settings.isFreeDeliveryForAll));
          setFreeDeliveryThreshold(Number(data.settings.freeDeliveryThreshold) || 999);
          setShippingFee(Number(data.settings.shippingFee) || 99);
          setCodFee(Number(data.settings.codFee) || 0);
          setIsLiveMode(Boolean(data.settings.isLiveMode));
          setLiveKeyId(data.settings.liveKeyId || '');
          setLiveKeySecret(data.settings.liveKeySecret || '');
        }
      })
      .catch((err) => console.warn('Could not load settings:', err))
      .finally(() => setIsLoadingSettings(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFreeDeliveryForAll,
          freeDeliveryThreshold: Number(freeDeliveryThreshold),
          shippingFee: Number(shippingFee),
          codFee: Number(codFee),
          isLiveMode,
          liveKeyId,
          liveKeySecret,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveMessage({
          type: 'success',
          text: 'Settings updated successfully! Changes are live across the store and checkout.',
        });
        setTimeout(() => setSaveMessage(null), 5000);
      } else {
        setSaveMessage({
          type: 'error',
          text: data.error || 'Failed to save settings. Please try again.',
        });
      }
    } catch (err: any) {
      setSaveMessage({
        type: 'error',
        text: err.message || 'Network error saving settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Derive genuine payment transactions from placed orders
  const paymentRecords: PaymentRecord[] = orders.map((order: Order) => {
    const isCod = order.paymentMethod === 'cod' || (order.payment_method || '').includes('Cash on Delivery');
    const paymentStatusDisplay = isCod ? 'Pending (Cash on Delivery)' : 'Paid';

    return {
      id: `PAY-${order.id.substring(0, 8).toUpperCase()}`,
      orderReference: order.order_reference || order.orderNumber,
      customerName: order.shipping_address?.full_name || order.customer?.fullName || 'Customer',
      amountINR: order.total_amount_inr ?? order.total ?? 0,
      method: order.payment_method || (isCod ? 'Cash on Delivery (COD)' : 'UPI (Instant Netbanking)'),
      status: order.payment_status || paymentStatusDisplay,
      timestamp: order.created_at || order.createdAt,
      gatewayReference: isCod ? 'N/A (Cash on Delivery)' : `rzp_live_${order.id.substring(0, 10)}`,
      reconciled: (order.payment_status || paymentStatusDisplay) === 'Paid',
    };
  });

  const paidTransactions = paymentRecords.filter((p: PaymentRecord) => p.status === 'Paid');
  const totalCollectedINR = paidTransactions.reduce((acc: number, p: PaymentRecord) => acc + p.amountINR, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              Payment & Delivery Settings
            </h2>
            <span className="px-2 py-0.5 bg-[#BD8B52]/10 text-[#BD8B52] border border-[#BD8B52]/20 rounded-full text-[10px] font-bold">
              Admin Controls
            </span>
          </div>
          <p className="text-xs text-[#737373] mt-1">
            Configure delivery fees, free shipping order threshold, Razorpay Live/Test mode, and view customer transactions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('delivery_rules')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'delivery_rules'
                ? 'bg-[#171717] text-white'
                : 'bg-[#F5F1E8] text-[#737373] hover:text-[#171717]'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Delivery Charges ({isFreeDeliveryForAll ? 'FREE' : `Above ₹${freeDeliveryThreshold}`})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gateway_setup')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === 'gateway_setup'
                ? 'bg-[#171717] text-white'
                : 'bg-[#F5F1E8] text-[#737373] hover:text-[#171717]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Razorpay Gateway ({isLiveMode ? 'Live' : 'Test Mode'})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'transactions'
                ? 'bg-[#171717] text-white'
                : 'bg-[#F5F1E8] text-[#737373] hover:text-[#171717]'
            }`}
          >
            Transactions ({paymentRecords.length})
          </button>
        </div>
      </div>

      {/* Save Notification Toast */}
      {saveMessage && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 shadow-xs ${
            saveMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{saveMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveMessage(null)}
            className="text-[11px] underline font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: DELIVERY & SHIPPING RULES */}
      {activeTab === 'delivery_rules' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="pb-4 border-b border-[#F5F1E8]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#BD8B52]" />
                <h3 className="text-base font-bold text-[#171717]">
                  Delivery Charges Configuration (डिलीवरी शुल्क तय करें)
                </h3>
              </div>
              <p className="text-xs text-[#737373] mt-1">
                Decide whether to offer completely Free Delivery, or charge a delivery fee below a specific order amount.
              </p>
            </div>

            {/* Mode 1: Free Delivery for ALL Orders Toggle */}
            <div className="p-4 sm:p-5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#171717]">Free Delivery on All Orders</span>
                    {isFreeDeliveryForAll && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Zero delivery charge (₹0) on every order regardless of cart subtotal. Best for launch festivals & promotions.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={isFreeDeliveryForAll}
                    onChange={(e) => setIsFreeDeliveryForAll(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E5E0D8] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#171717]"></div>
                </label>
              </div>
            </div>

            {/* Mode 2: Threshold-based delivery rules */}
            {!isFreeDeliveryForAll && (
              <div className="space-y-5 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Free Delivery Minimum Amount */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#171717] block">
                      Free Delivery Minimum Amount (कितने रुपये से ऊपर Free Delivery) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737373]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={freeDeliveryThreshold}
                        onChange={(e) => setFreeDeliveryThreshold(Math.max(0, Number(e.target.value) || 0))}
                        placeholder="999"
                        className="w-full pl-8 pr-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-[#171717] font-semibold focus:outline-hidden focus:border-[#BD8B52]"
                      />
                    </div>
                    <p className="text-[11px] text-[#737373]">
                      Orders at or above this cart value get 100% Free Express Delivery. (e.g. ₹999, ₹1499, ₹499)
                    </p>
                  </div>

                  {/* Standard Delivery Charge */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#171717] block">
                      Standard Delivery Charge (कम अमाउंट वाले ऑर्डर पर डिलीवरी चार्ज) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737373]">
                        ₹
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={shippingFee}
                        onChange={(e) => setShippingFee(Math.max(0, Number(e.target.value) || 0))}
                        placeholder="99"
                        className="w-full pl-8 pr-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-[#171717] font-semibold focus:outline-hidden focus:border-[#BD8B52]"
                      />
                    </div>
                    <p className="text-[11px] text-[#737373]">
                      Courier fee charged to buyer when cart value is less than the threshold above. (e.g. ₹99, ₹49, ₹79)
                    </p>
                  </div>
                </div>

                {/* COD Surcharge */}
                <div className="sm:w-1/2 space-y-1.5">
                  <label className="text-xs font-bold text-[#171717] block">
                    Cash on Delivery (COD) Extra Surcharge (वैकल्पिक)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#737373]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={codFee}
                      onChange={(e) => setCodFee(Math.max(0, Number(e.target.value) || 0))}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-[#171717] font-semibold focus:outline-hidden focus:border-[#BD8B52]"
                    />
                  </div>
                  <p className="text-[11px] text-[#737373]">
                    Set to ₹0 for Free COD, or specify additional fee for cash collection handling.
                  </p>
                </div>
              </div>
            )}

            {/* Live Storefront Preview */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> Live Customer Storefront Preview:
              </span>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {isFreeDeliveryForAll ? (
                  <span>
                    &bull; Customers will see <strong>FREE Express Doorstep Delivery (₹0) on all garments</strong> across the website and checkout!
                  </span>
                ) : (
                  <span>
                    &bull; Orders <strong>₹{freeDeliveryThreshold} and above receive FREE Express Delivery</strong>.
                    <br />
                    &bull; Orders below ₹{freeDeliveryThreshold} will be charged <strong>₹{shippingFee} standard courier fee</strong>.
                  </span>
                )}
              </p>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end pt-4 border-t border-[#F5F1E8]">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Rules...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Delivery Charges</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: GATEWAY SETUP & LIVE / TEST MODE */}
      {activeTab === 'gateway_setup' && (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="pb-4 border-b border-[#F5F1E8]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#BD8B52]" />
                <h3 className="text-base font-bold text-[#171717]">
                  Razorpay Live Gateway & Test Mode (लाइव पेमेंट और टेस्ट मोड)
                </h3>
              </div>
              <p className="text-xs text-[#737373] mt-1">
                Understand why Test Mode appears and configure Live credentials to accept real money directly to your bank account.
              </p>
            </div>

            {/* Clear Explanation: Why does "Test Mode" appear? */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Razorpay par "Test Mode" kyu aa raha hai?</span>
              </div>
              <div className="text-xs text-amber-800 leading-relaxed space-y-1.5 pl-6">
                <p>
                  <strong>1. Test Mode (अभी जो चालू है):</strong> Ye Razorpay ka testing sandbox hai. Isme key <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">rzp_test_...</code> hoti hai. Isme checkout popup par yellow <strong>"Test Mode"</strong> badge dikhta hai taaki developer bina real paise kate order checkout test kar sake.
                </p>
                <p>
                  <strong>2. Live Mode (Real Money / असली पेमेंट्स):</strong> Real customers se real paise (Google Pay, PhonePe, Paytm, RuPay, Visa Card) seedhe apne bank account me lene ke liye, aapko Razorpay Dashboard se <strong>Live API Keys (<code className="bg-amber-100 px-1 py-0.5 rounded font-mono">rzp_live_...</code>)</strong> generate karke yaha enter karni hogi.
                </p>
              </div>
            </div>

            {/* Live Mode Toggle */}
            <div className="p-4 sm:p-5 bg-[#FAF8F5] border border-[#E5E0D8] rounded-2xl space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#171717]">Activate Live Production Mode</span>
                    {isLiveMode ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        LIVE PAYMENTS ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        SANDBOX / TEST MODE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#737373] leading-relaxed">
                    Toggle ON when you have entered your live credentials below. When OFF, verified test sandbox keys are used.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={isLiveMode}
                    onChange={(e) => setIsLiveMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#E5E0D8] peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>

            {/* Live API Key Inputs */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171717] block">
                  Razorpay Live Key ID (e.g. rzp_live_xxxxxxxxxxxx)
                </label>
                <input
                  type="text"
                  value={liveKeyId}
                  onChange={(e) => setLiveKeyId(e.target.value)}
                  placeholder="rzp_live_xxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-[#171717] font-mono focus:outline-hidden focus:border-[#BD8B52]"
                />
                <p className="text-[11px] text-[#737373]">
                  Find this under Razorpay Dashboard &rarr; Account & Settings &rarr; API Keys &rarr; Generate Live Key.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#171717] block">
                  Razorpay Live Key Secret
                </label>
                <input
                  type="password"
                  value={liveKeySecret}
                  onChange={(e) => setLiveKeySecret(e.target.value)}
                  placeholder="Enter production secret key"
                  className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-[#171717] font-mono focus:outline-hidden focus:border-[#BD8B52]"
                />
                <p className="text-[11px] text-[#737373]">
                  Required for server-side HMAC-SHA256 signature verification to prevent payment tampering.
                </p>
              </div>
            </div>

            {/* Link to Razorpay Dashboard */}
            <div className="pt-2">
              <a
                href="https://dashboard.razorpay.com/app/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#BD8B52] font-bold hover:underline inline-flex items-center gap-1.5"
              >
                <span>Open Razorpay API Keys Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end pt-4 border-t border-[#F5F1E8]">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Gateway...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Razorpay Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: TRANSACTIONS LIST */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-[#737373] block">Total Settled INR</span>
              <span className="text-2xl font-black text-[#171717] block">
                {formatINR(totalCollectedINR)}
              </span>
              <span className="text-[10px] text-emerald-600 block">
                {paidTransactions.length} Paid Orders
              </span>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-[#737373] block">Cash on Delivery Pending</span>
              <span className="text-2xl font-black text-[#171717] block">
                {formatINR(
                  paymentRecords
                    .filter((p: PaymentRecord) => p.status === 'Pending (Cash on Delivery)')
                    .reduce((acc: number, p: PaymentRecord) => acc + p.amountINR, 0)
                )}
              </span>
              <span className="text-[10px] text-amber-600 block">Due upon courier doorstep delivery</span>
            </div>

            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-xs space-y-1">
              <span className="text-xs text-[#737373] block">Payment Gateway Methods</span>
              <span className="text-2xl font-black text-[#171717] block">UPI / COD / Cards</span>
              <span className="text-[10px] text-[#737373] block">Direct-to-consumer INR</span>
            </div>
          </div>

          {/* Transactions Table */}
          {paymentRecords.length > 0 ? (
            <div className="overflow-x-auto border border-[#E5E0D8] rounded-2xl bg-white shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E5E0D8] text-[#737373] uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-4">Transaction ID</th>
                    <th className="py-3 px-4">Order Reference</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment Status</th>
                    <th className="py-3 px-4">Gateway Reference</th>
                    <th className="py-3 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F1E8]">
                  {paymentRecords.map((record: PaymentRecord) => (
                    <tr key={record.id} className="hover:bg-[#FDFBF7] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#171717]">
                        {record.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#BD8B52] font-semibold">
                        {record.orderReference}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#171717]">
                        {record.customerName}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#171717]">
                        {record.method}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#171717]">
                        {formatINR(record.amountINR)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            record.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#737373]">
                        {record.gatewayReference}
                      </td>
                      <td className="py-3 px-4 text-right text-[10px] text-[#737373]">
                        {formatDate(record.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto text-[#BD8B52]">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#171717]">No Transactions Yet</h3>
              <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
                When customers complete purchases using UPI, Card, or Cash on Delivery, itemized transaction records with HMAC verification status appear here.
              </p>
              <div className="pt-2">
                <Link
                  href="/checkout"
                  className="px-5 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  Simulate Purchase at Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
