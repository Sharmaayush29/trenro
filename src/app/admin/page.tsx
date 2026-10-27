'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/store/demo-context';
import { useCartStore } from '@/lib/store/cart-context';
import { Order } from '@/types/cart';
import { formatINR, formatDate } from '@/lib/utils/formatters';
import {
  Layers,
  ShoppingBag,
  BookOpen,
  Plus,
  Trash2,
  RotateCcw,
  Video,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Package,
  CreditCard,
  ArrowRight,
  TrendingUp,
  Tag,
  Warehouse,
  Truck,
} from 'lucide-react';

export default function AdminOverviewPage() {
  const {
    outfits,
    products,
    styleGuides,
    clearAllDemoItems,
    loadDemoSampleItems,
    isConfigured,
  } = useDemoStore();

  const { orders } = useCartStore();

  const [notice, setNotice] = useState<string | null>(null);

  // Genuine Store Metrics
  const publishedProducts = products.filter((p) => p.published ?? true);
  const draftProducts = products.filter((p) => p.published === false);
  const lowStockProducts = products.filter(
    (p) => (p.stock_quantity ?? 50) < 10 && (p.stock_quantity ?? 50) > 0
  );
  const outOfStockProducts = products.filter(
    (p) => (p.stock_quantity ?? 50) <= 0 || p.availability_status === 'out_of_stock'
  );

  const publishedOutfits = outfits.filter((o) => o.published);
  const totalInventoryUnits = products.reduce((acc, p) => acc + (p.stock_quantity ?? 30), 0);

  const pendingOrders = orders.filter((o: Order) => o.status === 'Confirmed' || o.status === 'Processing');
  const deliveredOrders = orders.filter((o: Order) => o.status === 'Delivered');

  const handleClearCatalog = () => {
    if (window.confirm('Are you sure you want to clear all catalog items? The catalog will be completely empty.')) {
      clearAllDemoItems();
      setNotice('Store catalog has been cleared.');
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const handleSeedCatalog = () => {
    loadDemoSampleItems();
    setNotice('Standard TRENRO launch collection restored into catalog.');
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Notice Banner */}
      {notice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{notice}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Database Connection & Architecture Status */}
      <div className="p-4 bg-[#FDFBF7] border border-[#E5E0D8] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#BD8B52]/10 border border-[#BD8B52]/20 flex items-center justify-center text-[#BD8B52] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#171717] text-sm">
              TRENRO D2C Store Operations Console
            </h4>
            <p className="text-[#737373] text-[11px]">
              {isConfigured
                ? 'Active Database: Supabase PostgreSQL with strict Row Level Security (RLS).'
                : 'Local Persistent Storage Mode: Catalog edits & orders saved securely in persistent browser storage.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="px-3.5 py-2 bg-[#171717] hover:bg-[#BD8B52] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Add Garment
          </Link>
          <Link
            href="/admin/outfits"
            className="px-3.5 py-2 bg-white border border-[#E5E0D8] hover:border-[#BD8B52] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Create Look
          </Link>
        </div>
      </div>

      {/* Genuine Real-time Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Published Garments */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>Active Products</span>
            <ShoppingBag className="w-4 h-4 text-[#BD8B52]" />
          </div>
          <span className="text-2xl font-black text-[#171717]">{publishedProducts.length}</span>
          <span className="text-[10px] text-emerald-600 block">{draftProducts.length} in Draft</span>
        </div>

        {/* Curated Looks */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>Shop The Look</span>
            <Layers className="w-4 h-4 text-[#BD8B52]" />
          </div>
          <span className="text-2xl font-black text-[#171717]">{publishedOutfits.length}</span>
          <span className="text-[10px] text-[#737373] block">{outfits.length} Total Curations</span>
        </div>

        {/* Total Warehouse Stock */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>Total Inventory</span>
            <Warehouse className="w-4 h-4 text-[#BD8B52]" />
          </div>
          <span className="text-2xl font-black text-[#171717]">{totalInventoryUnits}</span>
          <span className="text-[10px] text-[#737373] block">Units in Stock</span>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>Stock Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${lowStockProducts.length > 0 ? 'text-amber-500' : 'text-[#A3A3A3]'}`} />
          </div>
          <span className="text-2xl font-black text-[#171717]">
            {lowStockProducts.length + outOfStockProducts.length}
          </span>
          <span className="text-[10px] text-amber-600 block">
            {lowStockProducts.length} Low, {outOfStockProducts.length} Out
          </span>
        </div>

        {/* Customer Orders */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>Active Orders</span>
            <Package className="w-4 h-4 text-[#BD8B52]" />
          </div>
          <span className="text-2xl font-black text-[#171717]">{orders.length}</span>
          <span className="text-[10px] text-emerald-600 block">{pendingOrders.length} Processing</span>
        </div>

        {/* Style Guides */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>Editorial Guides</span>
            <BookOpen className="w-4 h-4 text-[#BD8B52]" />
          </div>
          <span className="text-2xl font-black text-[#171717]">{styleGuides.length}</span>
          <span className="text-[10px] text-emerald-600 block">Published Articles</span>
        </div>
      </div>

      {/* Stock Attention Notice if any low stock exists */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                Inventory Attention Required
              </h4>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
            >
              Restock in Products CMS <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {[...lowStockProducts, ...outOfStockProducts].map((p) => (
              <span
                key={p.id}
                className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg text-[11px] font-medium text-amber-900 flex items-center gap-1.5"
              >
                <span>{p.name}</span>
                <span className="font-bold text-amber-700 bg-amber-100 px-1 rounded">
                  {p.stock_quantity ?? 0} left
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity: Garment Catalog & Customer Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5F1E8]">
            <h3 className="font-bold text-sm text-[#171717] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#BD8B52]" />
              Latest TRENRO Apparel ({products.length})
            </h3>
            <Link
              href="/admin/products"
              className="text-xs text-[#BD8B52] hover:underline font-bold uppercase tracking-wider"
            >
              All Products
            </Link>
          </div>

          <div className="space-y-3">
            {products.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl hover:bg-[#FDFBF7] border border-[#F5F1E8] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-12 rounded-lg bg-[#F5F1E8] overflow-hidden shrink-0 border border-[#E5E0D8]">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#171717] line-clamp-1">{p.name}</h4>
                    <span className="text-[10px] text-[#737373] block">
                      {p.category} &bull; {p.sku || 'TRN-SKU'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-[#171717] block">{formatINR(p.price_inr)}</span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {p.stock_quantity ?? 30} in stock
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Feed */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5F1E8]">
            <h3 className="font-bold text-sm text-[#171717] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#BD8B52]" />
              Recent Customer Orders ({orders.length})
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-[#BD8B52] hover:underline font-bold uppercase tracking-wider"
            >
              Order Desk
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order: Order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FDFBF7] border border-[#E5E0D8]"
                >
                  <div>
                    <span className="font-mono font-bold text-[#171717] block">
                      {order.order_reference || order.orderNumber}
                    </span>
                    <span className="text-[10px] text-[#737373] block">
                      {order.shipping_address?.full_name || order.customer?.fullName || 'Customer'} &bull; {order.items.length} items
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-[#171717] block">
                      {formatINR(order.total_amount_inr ?? order.total ?? 0)}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        order.status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#737373] space-y-2 bg-[#FDFBF7] rounded-xl border border-dashed border-[#E5E0D8]">
              <p className="font-semibold text-[#171717]">No Orders Recorded Yet</p>
              <p className="text-[11px] text-[#737373]">
                Orders placed through the D2C checkout with UPI, Card, or COD will appear here live.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Catalog Maintenance Utilities */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-[#E5E0D8] rounded-2xl shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-[#BD8B52]" />
          <span className="text-[#737373]">Store Catalog Administration</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClearCatalog}
            className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors flex items-center gap-1.5"
            title="Wipe store catalog to empty state"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All Items
          </button>

          <button
            type="button"
            onClick={handleSeedCatalog}
            className="px-3.5 py-2 text-xs font-semibold text-[#171717] hover:text-[#BD8B52] border border-[#E5E0D8] rounded-lg transition-colors flex items-center gap-1"
            title="Restore standard TRENRO launch collection"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restore Launch Archive
          </button>
        </div>
      </div>
    </div>
  );
}
