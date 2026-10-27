'use client';

import React, { use, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Calendar,
  MapPin,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { formatCurrencyINR } from '@/lib/utils/formatters';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

function OrderSuccessContent({ params }: PageProps) {
  const { orderId } = use(params);
  const { orders } = useCart();

  // Look up order in context by ID or orderNumber
  const order = orders.find(
    (o) => o.id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase()
  );

  // If page is refreshed or viewed via direct URL, provide a clean fallback with reference ID
  const displayOrderNumber = order ? order.orderNumber : (orderId.startsWith('TRN-') ? orderId : `TRN-${orderId.slice(0, 6).toUpperCase()}`);
  const orderDate = order ? new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header Banner */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-[#15803D]/10 text-[#15803D] rounded-full flex items-center justify-center mx-auto border border-[#15803D]/20">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#15803D]">
            Order Confirmed & Placed
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
            Thank You for Shopping TRENRO
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] max-w-md mx-auto">
            Your menswear pieces are being prepped at our atelier. We’ll notify you once dispatched.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-[#F5F1E8] border border-[#E5E0D8] px-4 py-2 rounded-xl text-xs font-bold text-[#171717]">
          <span>Order Reference:</span>
          <span className="font-mono text-[#BD8B52] text-sm tracking-wider">{displayOrderNumber}</span>
        </div>
      </div>

      {/* Progress Tracker Card */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1E8] pb-5">
          <div className="flex items-center gap-3">
            <PackageCheck className="w-6 h-6 text-[#BD8B52]" />
            <div>
              <p className="text-xs text-[#737373]">Estimated Doorstep Delivery</p>
              <h3 className="text-sm sm:text-base font-extrabold text-[#171717]">
                3 – 5 Business Days ({orderDate})
              </h3>
            </div>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#15803D]/10 text-[#15803D] text-xs font-bold">
            Status: {order ? order.status : 'Confirmed'}
          </span>
        </div>

        {/* Tracking Milestones */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center mx-auto text-xs font-bold">
              ✓
            </div>
            <p className="text-xs font-bold text-[#171717]">Order Placed</p>
            <p className="text-[10px] text-[#737373]">{orderDate}</p>
          </div>
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-full bg-[#BD8B52] text-white flex items-center justify-center mx-auto text-xs font-bold">
              2
            </div>
            <p className="text-xs font-bold text-[#171717]">Quality Check</p>
            <p className="text-[10px] text-[#737373]">Atelier Inspection</p>
          </div>
          <div className="space-y-1 opacity-50">
            <div className="w-8 h-8 rounded-full bg-[#E5E0D8] text-[#737373] flex items-center justify-center mx-auto text-xs font-bold">
              3
            </div>
            <p className="text-xs font-bold text-[#171717]">Dispatched</p>
            <p className="text-[10px] text-[#737373]">Air Express</p>
          </div>
          <div className="space-y-1 opacity-50">
            <div className="w-8 h-8 rounded-full bg-[#E5E0D8] text-[#737373] flex items-center justify-center mx-auto text-xs font-bold">
              4
            </div>
            <p className="text-xs font-bold text-[#171717]">Delivered</p>
            <p className="text-[10px] text-[#737373]">Doorstep Handover</p>
          </div>
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Address */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#171717] uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#BD8B52]" />
            <span>Shipping Address</span>
          </div>
          {order?.customer ? (
            <div className="text-xs text-[#525252] space-y-1 leading-relaxed">
              <p className="font-bold text-[#171717]">{order.customer.fullName}</p>
              <p>{order.customer.address}</p>
              <p>{order.customer.city}, {order.customer.state} - {order.customer.pincode}</p>
              <p className="pt-1 text-[#737373]">Phone: +91 {order.customer.phone}</p>
              <p className="text-[#737373]">Email: {order.customer.email}</p>
            </div>
          ) : (
            <p className="text-xs text-[#737373]">
              Address details saved on file with order reference #{displayOrderNumber}.
            </p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#171717] uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-[#BD8B52]" />
            <span>Payment Details</span>
          </div>
          <div className="text-xs text-[#525252] space-y-1.5 leading-relaxed">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold text-[#171717] uppercase">
                {order?.paymentMethod === 'cod'
                  ? 'Cash On Delivery'
                  : order?.paymentMethod === 'upi'
                  ? 'Instant UPI'
                  : 'Credit / Debit Card'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <span className="font-bold text-[#15803D]">
                {order?.paymentMethod === 'cod' ? 'Pay upon Doorstep Delivery' : 'Authorized'}
              </span>
            </div>
            {order && (
              <div className="pt-2 border-t border-[#F5F1E8] space-y-1">
                <div className="flex justify-between">
                  <span>Items Subtotal:</span>
                  <span>{formatCurrencyINR(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#15803D]">
                    <span>Coupon Savings:</span>
                    <span>-{formatCurrencyINR(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{order.shipping === 0 ? 'FREE' : formatCurrencyINR(order.shipping)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-[#171717] text-sm pt-1 border-t border-[#E5E0D8]">
                  <span>Total Amount:</span>
                  <span>{formatCurrencyINR(order.total)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ordered Garments */}
      {order?.items && order.items.length > 0 && (
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#171717] border-b border-[#F5F1E8] pb-3">
            Garments in this Shipment ({order.items.length})
          </h3>
          <div className="divide-y divide-[#F5F1E8]">
            {order.items.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center gap-4">
                <div className="relative w-14 h-18 bg-[#F5F1E8] rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={item.product.image_url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#171717] truncate">{item.product.name}</h4>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    Size: <span className="font-semibold text-[#171717]">{item.size}</span> • Qty: {item.quantity}
                  </p>
                  <p className="text-[10px] text-[#BD8B52] mt-0.5">Brand: TRENRO</p>
                </div>
                <span className="text-xs font-extrabold text-[#171717]">
                  {formatCurrencyINR(item.product.price_inr * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          href="/dashboard/orders"
          className="px-8 py-3.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors shadow-md inline-flex items-center gap-2"
        >
          View in My Orders <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/outfits"
          className="px-8 py-3.5 bg-[#F5F1E8] hover:bg-[#EAE4D6] text-[#171717] text-xs font-bold uppercase tracking-widest rounded-xl transition-colors inline-flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>

      {/* Doorstep Guarantee Footer */}
      <div className="border-t border-[#E5E0D8] pt-6 flex flex-wrap justify-center gap-8 text-xs text-[#737373]">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-4 h-4 text-[#BD8B52]" />
          <span>7-Day Doorstep Size Exchange</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#BD8B52]" />
          <span>Tracked Air Courier</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#BD8B52]" />
          <span>100% Genuine TRENRO Apparel</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#737373]">
          Loading order confirmation...
        </div>
      }
    >
      <OrderSuccessContent {...props} />
    </Suspense>
  );
}

