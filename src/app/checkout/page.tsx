'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  QrCode,
  Banknote,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Tag,
  Lock,
} from 'lucide-react';
import { useCart, ClothingSize } from '@/lib/store/cart-context';
import { useDemoStore } from '@/lib/store/demo-context';
import { formatCurrencyINR } from '@/lib/utils/formatters';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useDemoStore();
  const {
    items,
    subtotal,
    shipping,
    discount,
    discountCode,
    applyDiscountCode,
    total,
    itemCount,
    placeOrder,
  } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  });

  // Pre-fill customer details from authenticated user profile
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.display_name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');
  const [upiId, setUpiId] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const indianStates = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
    'Himachal Pradesh', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = await applyDiscountCode(promoInput);
    if (res.success) {
      setPromoMessage({ type: 'success', text: res.message });
      setPromoInput('');
    } else {
      setPromoMessage({ type: 'error', text: res.message });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!user) {
      newErrors.auth = 'Please sign in or create an account before completing checkout.';
    }
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.phone.trim() || formData.phone.length < 10) newErrors.phone = '10-digit mobile number is required';
    if (!formData.address.trim()) newErrors.address = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim() || formData.pincode.length !== 6) newErrors.pincode = 'Valid 6-digit PIN code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 1. Cash on Delivery (COD) Flow
      if (paymentMethod === 'cod') {
        const newOrder = placeOrder(
          {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          'cod',
          {
            payment_status: 'Pending',
          }
        );

        if (newOrder) {
          router.push(`/order-success/${newOrder.orderNumber}`);
        }
        return;
      }

      // 2. Direct UPI or Card Flow with Razorpay
      const orderRef = `TRN-${Math.floor(100000 + Math.random() * 900000)}`;

      const createOrderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((it) => ({
            id: it.product.id,
            name: it.product.name,
            price_inr: it.product.price_inr,
            quantity: it.quantity,
            size: it.size,
          })),
          couponCode: discountCode || undefined,
          orderReference: orderRef,
          shippingAddress: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
        }),
      });

      const orderData = await createOrderRes.json();

      if (!createOrderRes.ok || !orderData.success) {
        setIsSubmitting(false);
        setErrors({
          payment:
            orderData.error ||
            orderData.message ||
            'Unable to initiate payment session. Please try again or select Cash on Delivery.',
        });
        return;
      }

      // Ensure Razorpay SDK is ready in browser
      if (typeof window === 'undefined' || !(window as any).Razorpay) {
        setIsSubmitting(false);
        setErrors({
          payment: 'Payment gateway SDK is loading. Please wait 2 seconds and try again.',
        });
        return;
      }

      const razorpayKey =
        orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_Tsqcg0c9dmwdyF';

      const options: any = {
        key: razorpayKey,
        amount: Math.round(orderData.amountInINR * 100),
        currency: 'INR',
        name: 'TRENRO',
        description: 'TRENRO Engineered Menswear Atelier Order',
        order_id: orderData.orderId,
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
          ...(paymentMethod === 'upi' ? { method: 'upi' } : paymentMethod === 'card' ? { method: 'card' } : {}),
          ...(paymentMethod === 'upi' && upiId.trim() ? { vpa: upiId.trim() } : {}),
        },
        notes: {
          order_reference: orderRef,
          brand: 'TRENRO',
          payment_channel: paymentMethod === 'upi' ? 'UPI' : 'Card',
        },
        theme: {
          color: '#171717',
        },
        handler: async function (response: any) {
          try {
            // Cryptographic server-side verification via HMAC-SHA256
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderReference: orderRef,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              const newOrder = placeOrder(
                {
                  fullName: formData.fullName,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  pincode: formData.pincode,
                },
                paymentMethod,
                {
                  payment_status: 'Paid',
                  payment_id: response.razorpay_payment_id,
                  order_reference: orderRef,
                }
              );

              if (newOrder) {
                router.push(`/order-success/${newOrder.orderNumber}`);
              }
            } else {
              setIsSubmitting(false);
              setErrors({
                payment:
                  verifyData.error ||
                  'Payment cryptographic verification failed. Your card was not charged. Please try again.',
              });
            }
          } catch (err: any) {
            setIsSubmitting(false);
            setErrors({
              payment: err.message || 'Payment verification failed. Please contact client concierge.',
            });
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        setIsSubmitting(false);
        setErrors({
          payment:
            resp.error?.description ||
            'Payment was declined or cancelled by the provider. Please try again.',
        });
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error(err);
      setIsSubmitting(false);
      setErrors({ payment: err.message || 'Failed to process checkout. Please try again.' });
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto text-[#737373] border border-[#E5E0D8]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-[#171717]">Your shopping bag is empty</h1>
          <p className="text-sm text-[#737373] max-w-md mx-auto">
            You don’t have any garments in your bag. Explore our menswear collection and choose your fit.
          </p>
        </div>
        <Link
          href="/outfits"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors shadow-md"
        >
          Explore Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Official Razorpay Checkout Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setRazorpayLoaded(true)}
      />

      {/* Page Header */}
      <div className="mb-8 border-b border-[#E5E0D8] pb-6">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#BD8B52]">
          Secure Direct Checkout
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight mt-1">
          Complete Your TRENRO Order
        </h1>
        <p className="text-xs text-[#737373] mt-1">
          Fast express shipping across India • 7-day doorstep size exchange guarantee
        </p>
      </div>

      {/* Authentication Guard Banner */}
      {!user && (
        <div className="bg-[#FAF8F5] border border-[#BD8B52]/40 rounded-2xl p-6 sm:p-7 shadow-xs mb-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-[#BD8B52]/10 text-[#BD8B52] flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-sm text-[#171717]">Sign In Required For Order Checkout</h3>
              <p className="text-xs text-[#737373] max-w-lg leading-relaxed">
                TRENRO requires an authenticated customer profile to protect order records, process delivery tracking, and ensure authentic garment exchange.
              </p>
            </div>
          </div>
          <Link
            href="/login?redirect=/checkout&reason=auth_required"
            className="px-6 py-3 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-xs shrink-0 flex items-center gap-2"
          >
            Sign In To Complete Order <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Payment Error Alert Banner */}
      {errors.payment && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 mb-8 text-xs text-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Payment Authorization Notice</p>
            <p className="leading-relaxed">{errors.payment}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Delivery & Payment Details */}
        <div className="lg:col-span-7 space-y-8">
          <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-8">
            {/* Step 1: Contact Information */}
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[#F5F1E8] pb-3">
                <span className="w-6 h-6 rounded-full bg-[#171717] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold text-[#171717]">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-[#171717]">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Ayush Sharma"
                    className={`w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border rounded-xl text-[#171717] focus:outline-hidden focus:border-[#BD8B52] ${
                      errors.fullName ? 'border-[#DC2626]' : 'border-[#E5E0D8]'
                    }`}
                  />
                  {errors.fullName && <p className="text-[10px] text-[#DC2626]">{errors.fullName}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717]">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="order-updates@example.com"
                    className={`w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border rounded-xl text-[#171717] focus:outline-hidden focus:border-[#BD8B52] ${
                      errors.email ? 'border-[#DC2626]' : 'border-[#E5E0D8]'
                    }`}
                  />
                  {errors.email && <p className="text-[10px] text-[#DC2626]">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717]">Phone Number (for SMS & Courier) *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    maxLength={10}
                    className={`w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border rounded-xl text-[#171717] focus:outline-hidden focus:border-[#BD8B52] ${
                      errors.phone ? 'border-[#DC2626]' : 'border-[#E5E0D8]'
                    }`}
                  />
                  {errors.phone && <p className="text-[10px] text-[#DC2626]">{errors.phone}</p>}
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address */}
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[#F5F1E8] pb-3">
                <span className="w-6 h-6 rounded-full bg-[#171717] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold text-[#171717]">Delivery Address</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-[#171717]">Street Address / House No. / Landmark *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Flat 402, Signature Residency, Link Road"
                    className={`w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border rounded-xl text-[#171717] focus:outline-hidden focus:border-[#BD8B52] ${
                      errors.address ? 'border-[#DC2626]' : 'border-[#E5E0D8]'
                    }`}
                  />
                  {errors.address && <p className="text-[10px] text-[#DC2626]">{errors.address}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717]">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Mumbai"
                    className={`w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border rounded-xl text-[#171717] focus:outline-hidden focus:border-[#BD8B52] ${
                      errors.city ? 'border-[#DC2626]' : 'border-[#E5E0D8]'
                    }`}
                  />
                  {errors.city && <p className="text-[10px] text-[#DC2626]">{errors.city}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#171717]">PIN Code *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="400001"
                    maxLength={6}
                    className={`w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border rounded-xl text-[#171717] focus:outline-hidden focus:border-[#BD8B52] ${
                      errors.pincode ? 'border-[#DC2626]' : 'border-[#E5E0D8]'
                    }`}
                  />
                  {errors.pincode && <p className="text-[10px] text-[#DC2626]">{errors.pincode}</p>}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-[#171717]">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 text-xs bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-[#171717] focus:outline-hidden focus:border-[#BD8B52]"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
              <div className="flex items-center gap-2.5 border-b border-[#F5F1E8] pb-3">
                <span className="w-6 h-6 rounded-full bg-[#171717] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-base font-bold text-[#171717]">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {/* Instant UPI */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-[#BD8B52] bg-[#FAF8F5] ring-1 ring-[#BD8B52]'
                      : 'border-[#E5E0D8] hover:border-[#CBD5E1]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="mt-1 accent-[#BD8B52]"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-[#BD8B52]" /> Instant UPI (Google Pay, PhonePe, Paytm, QR)
                      </span>
                      <span className="px-2 py-0.5 rounded-sm bg-[#15803D]/10 text-[#15803D] text-[10px] font-bold">
                        Fastest
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737373]">
                      Pay directly via any UPI app (Google Pay, PhonePe, Paytm, BHIM, CRED) or scan dynamic UPI QR code.
                    </p>
                    {paymentMethod === 'upi' && (
                      <div className="pt-2 space-y-1.5">
                        <input
                          type="text"
                          placeholder="UPI ID / VPA (optional, e.g. name@okhdfcbank)"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E5E0D8] rounded-xl text-[#171717] focus:outline-hidden focus:border-[#BD8B52]"
                        />
                        <p className="text-[10px] text-[#737373]">
                          Leave blank to choose app or scan QR directly on the secure Razorpay payment screen.
                        </p>
                        {errors.upi && <p className="text-[10px] text-[#DC2626] mt-1">{errors.upi}</p>}
                      </div>
                    )}
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#BD8B52] bg-[#FAF8F5] ring-1 ring-[#BD8B52]'
                      : 'border-[#E5E0D8] hover:border-[#CBD5E1]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="mt-1 accent-[#BD8B52]"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-[#BD8B52]" /> Cash On Delivery (COD)
                      </span>
                      <span className="px-2 py-0.5 rounded-sm bg-[#F5F1E8] text-[#171717] text-[10px] font-bold">
                        Zero Advance
                      </span>
                    </div>
                    <p className="text-[11px] text-[#737373]">
                      Pay in cash or scan QR when the courier delivers your package to your doorstep.
                    </p>
                  </div>
                </label>

                {/* Card / Netbanking */}
                <label
                  className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#BD8B52] bg-[#FAF8F5] ring-1 ring-[#BD8B52]'
                      : 'border-[#E5E0D8] hover:border-[#CBD5E1]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-1 accent-[#BD8B52]"
                  />
                  <div className="flex-1 space-y-1">
                    <span className="text-xs font-bold text-[#171717] flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#BD8B52]" /> Credit / Debit Card & Net Banking
                    </span>
                    <p className="text-[11px] text-[#737373]">
                      All major Indian cards supported (Visa, MasterCard, RuPay).
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Sticky Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#F5F1E8] pb-4">
              <h3 className="text-sm font-bold text-[#171717]">Order Summary ({itemCount} items)</h3>
              <Link href="/outfits" className="text-xs text-[#BD8B52] hover:underline font-semibold">
                Edit Bag
              </Link>
            </div>

            {/* Item list */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-xs">
                  <div className="relative w-14 h-16 bg-[#F5F1E8] rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-[#171717] truncate">{item.product.name}</h4>
                    <p className="text-[11px] text-[#737373]">
                      Size: <span className="font-semibold text-[#171717]">{item.size}</span> • Qty: {item.quantity}
                    </p>
                    <span className="font-extrabold text-[#171717] block mt-1">
                      {formatCurrencyINR(item.product.price_inr * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <form onSubmit={handleApplyPromo} className="space-y-1.5 pt-2 border-t border-[#F5F1E8]">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. TRENRO10)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl text-[#171717] uppercase focus:outline-hidden focus:border-[#BD8B52]"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F5F1E8] hover:bg-[#EAE4D6] text-[#171717] text-xs font-bold uppercase rounded-xl transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>
              {promoMessage && (
                <p
                  className={`text-[10px] font-semibold ${
                    promoMessage.type === 'success' ? 'text-[#15803D]' : 'text-[#DC2626]'
                  }`}
                >
                  {promoMessage.text}
                </p>
              )}
              {discountCode && (
                <p className="text-[10px] text-[#BD8B52] font-semibold">
                  Applied promo: {discountCode} (-{formatCurrencyINR(discount)})
                </p>
              )}
            </form>

            {/* Calculations */}
            <div className="space-y-2 text-xs text-[#525252] border-t border-[#F5F1E8] pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#171717]">{formatCurrencyINR(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#15803D] font-semibold">
                  <span>Discount</span>
                  <span>-{formatCurrencyINR(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="font-semibold text-[#171717]">
                  {shipping === 0 ? <span className="text-[#15803D] font-bold">FREE</span> : formatCurrencyINR(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-[#171717] pt-3 border-t border-[#E5E0D8]">
                <span>Total Amount</span>
                <span>{formatCurrencyINR(total)}</span>
              </div>
              <p className="text-[10px] text-[#737373]">All taxes included. Free doorstep exchange within 7 days.</p>
            </div>

            {/* Submit Order Button / Auth Gate */}
            {!user ? (
              <Link
                href="/login?redirect=/checkout&reason=auth_required"
                className="w-full py-4 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-center"
              >
                <Lock className="w-4 h-4 text-[#BD8B52]" />
                <span>Sign In To Complete Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Processing Authorization...</span>
                ) : (
                  <>
                    <span>
                      {paymentMethod === 'cod'
                        ? `Confirm Cash on Delivery Order (${formatCurrencyINR(total)})`
                        : paymentMethod === 'upi'
                        ? `Pay with Instant UPI (${formatCurrencyINR(total)})`
                        : `Pay with Card (${formatCurrencyINR(total)})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {/* Brand Assurances */}
            <div className="space-y-2.5 pt-3 border-t border-[#F5F1E8] text-[11px] text-[#737373]">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#BD8B52] shrink-0" />
                <span>Dispatches within 24 hours via Express Courier</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#BD8B52] shrink-0" />
                <span>Doorstep Size Exchange: Delivery rider brings your new size</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#BD8B52] shrink-0" />
                <span>Genuine TRENRO Apparel: 100% Cotton & Heavyweight Woven</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

