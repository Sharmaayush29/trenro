'use client';

import React, { useState } from 'react';
import { useDemoStore } from '@/lib/store/demo-context';
import { useCartStore } from '@/lib/store/cart-context';
import { Order } from '@/types/cart';
import { formatINR, formatDate } from '@/lib/utils/formatters';
import {
  BarChart3,
  ShoppingBag,
  Package,
  Layers,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  Warehouse,
  PieChart,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { products, outfits } = useDemoStore();
  const { orders } = useCartStore();

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7days' | '30days'>('30days');

  // Garment Category Breakdown
  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  // Pricing Distribution
  const under1500 = products.filter((p) => p.price_inr < 1500).length;
  const from1500to2500 = products.filter((p) => p.price_inr >= 1500 && p.price_inr <= 2500).length;
  const above2500 = products.filter((p) => p.price_inr > 2500).length;

  // Revenue from genuine paid orders
  const paidOrders = orders.filter((o: Order) => o.payment_status === 'Paid');
  const totalRevenueINR = paidOrders.reduce((acc: number, o: Order) => acc + (o.total_amount_inr ?? o.total ?? 0), 0);

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F1E8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#BD8B52]" /> Store Performance & Catalog Analytics
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Real metrics derived from live TRENRO catalog inventory and verified customer orders.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1.5 bg-[#F5F1E8] p-1 rounded-lg text-xs font-semibold">
          {(['today', '7days', '30days'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-md capitalize transition-colors ${
                selectedPeriod === period ? 'bg-white text-[#171717] shadow-sm font-bold' : 'text-[#737373]'
              }`}
            >
              {period === 'today' ? 'Today' : period === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Honesty & Data Integrity Banner */}
      <div className="p-4 bg-[#FDFBF7] border border-[#E5E0D8] rounded-xl text-xs text-[#737373] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-[#171717]">Authentic Store Operational Data</p>
          <p className="leading-relaxed">
            All metrics shown below reflect genuine catalog items and verified customer checkout records. In accordance with TRENRO brand standards, no fake revenue graphs, simulated conversions, or artificial review counts are displayed.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-xl space-y-1">
          <span className="text-xs font-bold text-[#737373] uppercase tracking-wider block">
            Garment Catalog Size
          </span>
          <p className="text-3xl font-black text-[#171717]">{products.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            {products.filter((p) => p.published ?? true).length} Published Garments
          </span>
        </div>

        <div className="p-5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-xl space-y-1">
          <span className="text-xs font-bold text-[#737373] uppercase tracking-wider block">
            Curated Outfits
          </span>
          <p className="text-3xl font-black text-[#171717]">{outfits.length}</p>
          <span className="text-[10px] text-[#BD8B52] font-semibold block">
            Shop The Look Head-to-Toe
          </span>
        </div>

        <div className="p-5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-xl space-y-1">
          <span className="text-xs font-bold text-[#737373] uppercase tracking-wider block">
            Customer Purchases
          </span>
          <p className="text-3xl font-black text-[#171717]">{orders.length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold block">
            {orders.filter((o: Order) => o.status === 'Delivered').length} Completed Shipments
          </span>
        </div>

        <div className="p-5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-xl space-y-1">
          <span className="text-xs font-bold text-[#737373] uppercase tracking-wider block">
            Settled UPI / Card Revenue
          </span>
          <p className="text-3xl font-black text-[#171717]">{formatINR(totalRevenueINR)}</p>
          <span className="text-[10px] text-[#737373] block">
            Excludes pending Cash on Delivery
          </span>
        </div>
      </div>

      {/* Grid: Category Breakdown & Price Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-6 bg-white border border-[#E5E0D8] rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#F5F1E8]">
            <h3 className="font-bold text-sm text-[#171717] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#BD8B52]" /> Catalog by Apparel Category
            </h3>
            <span className="text-[11px] text-[#737373]">{Object.keys(categoryCounts).length} Types</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / products.length) * 100) || 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold text-[#171717]">
                    <span>{cat}</span>
                    <span className="text-[#737373] font-normal">
                      {count} items ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#F5F1E8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#BD8B52] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Architecture */}
        <div className="p-6 bg-white border border-[#E5E0D8] rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#F5F1E8]">
            <h3 className="font-bold text-sm text-[#171717] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#BD8B52]" /> Retail Pricing Tiers (INR)
            </h3>
            <span className="text-[11px] text-[#737373]">Price Distribution</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#FDFBF7] border border-[#E5E0D8] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-[#171717] block">Everyday Essentials</span>
                <span className="text-[10px] text-[#737373]">Under ₹1,499 (Tees, Polos)</span>
              </div>
              <span className="text-base font-black text-[#171717]">{under1500} Garments</span>
            </div>

            <div className="p-3 bg-[#FDFBF7] border border-[#E5E0D8] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-[#171717] block">Core Contemporary</span>
                <span className="text-[10px] text-[#737373]">₹1,500 - ₹2,499 (Linen Shirts, Pleated Pants)</span>
              </div>
              <span className="text-base font-black text-[#171717]">{from1500to2500} Garments</span>
            </div>

            <div className="p-3 bg-[#FDFBF7] border border-[#E5E0D8] rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-[#171717] block">Signature & Outerwear</span>
                <span className="text-[10px] text-[#737373]">Above ₹2,500 (Jackets, Heavy Corduroy)</span>
              </div>
              <span className="text-base font-black text-[#171717]">{above2500} Garments</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
