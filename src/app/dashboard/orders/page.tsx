'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Package,
  Truck,
  RotateCcw,
  ArrowRight,
  Clock,
  CheckCircle2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { formatCurrencyINR } from '@/lib/utils/formatters';

export default function CustomerOrdersPage() {
  const { orders } = useCart();

  return (
    <div className="space-y-8">
      <div className="border-b border-[#E5E0D8] pb-5">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#BD8B52]">
          Customer Account
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-[#171717] mt-1">
          My TRENRO Orders ({orders.length})
        </h2>
        <p className="text-xs text-[#737373] mt-1">
          Track shipments, review past garment purchases, and request doorstep size exchanges.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-10 sm:p-14 text-center space-y-5 max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 bg-[#F5F1E8] rounded-full flex items-center justify-center mx-auto text-[#737373]">
            <Package className="w-8 h-8 stroke-1" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-[#171717]">No Orders Placed Yet</h3>
            <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed">
              When you purchase TRENRO menswear, your shipments, tracking references, and doorstep exchange options will appear right here.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/outfits"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Explore Men’s Wear</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 hover:border-[#BD8B52]/50 transition-colors"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F5F1E8] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-[#BD8B52]">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs text-[#A3A3A3]">•</span>
                      <span className="text-xs text-[#737373] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#BD8B52]" /> {formattedDate}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-[#171717]">
                      Total: {formatCurrencyINR(order.total)}{' '}
                      <span className="font-normal text-[#737373]">
                        ({order.items.length} {order.items.length === 1 ? 'garment' : 'garments'})
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[#15803D]/10 text-[#15803D] text-xs font-bold">
                      {order.status}
                    </span>
                    <Link
                      href={`/order-success/${order.orderNumber}`}
                      className="text-xs text-[#BD8B52] font-bold hover:underline inline-flex items-center gap-1"
                    >
                      Receipt <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="divide-y divide-[#F5F1E8]">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center gap-4">
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
                          Size: <span className="font-semibold text-[#171717]">{item.size}</span> • Quantity: {item.quantity}
                        </p>
                        <p className="text-[10px] text-[#BD8B52] mt-0.5">TRENRO Direct Atelier</p>
                      </div>
                      <span className="text-xs font-extrabold text-[#171717]">
                        {formatCurrencyINR(item.product.price_inr * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery and Exchange footer */}
                <div className="bg-[#FAF8F5] border border-[#E5E0D8] rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#525252]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#BD8B52] shrink-0" />
                    <span>
                      Delivering to: <strong className="text-[#171717]">{order.customer.fullName}</strong> ({order.customer.city}, {order.customer.pincode})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#737373]">
                    <RotateCcw className="w-3.5 h-3.5 text-[#BD8B52]" />
                    <span>7-Day Doorstep Exchange Eligible</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

