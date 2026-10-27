'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemoStore } from '@/lib/store/demo-context';
import { useCart } from '@/lib/store/cart-context';
import {
  LayoutDashboard,
  Heart,
  History,
  Sparkles,
  Settings,
  ShieldCheck,
  User,
  LogOut,
  ChevronRight,
  PackageCheck,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, savedOutfitIds, logout } = useDemoStore();
  const { orders } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    {
      name: 'Orders & Tracking',
      href: '/dashboard/orders',
      icon: PackageCheck,
      badge: mounted && orders.length > 0 ? orders.length : undefined,
    },
    {
      name: 'Saved Outfits',
      href: '/dashboard/saved',
      icon: Heart,
      badge: mounted && savedOutfitIds.length > 0 ? savedOutfitIds.length : undefined,
    },
    { name: 'Recently Viewed', href: '/dashboard/history', icon: History },
    { name: 'Style Preferences', href: '/dashboard/preferences', icon: Sparkles },
    { name: 'Account Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & User Welcome Banner */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#171717] text-[#BD8B52] flex items-center justify-center font-black text-lg border-2 border-[#BD8B52]">
            {mounted && user ? user.display_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-[#171717]">
                {mounted && user ? user.display_name : 'Guest Shopper'}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#BD8B52]/10 text-[#BD8B52] border border-[#BD8B52]/20">
                {mounted && user?.role === 'admin' ? 'Store Admin' : user ? 'Member' : 'Guest'}
              </span>
            </div>
            <p className="text-xs text-[#737373] mt-0.5">
              {mounted && user ? user.email : 'Sign in to sync your wardrobe across devices'}
            </p>
          </div>
        </div>

        {mounted && !user && (
          <Link
            href="/login?redirect=/dashboard"
            className="px-4 py-2 bg-[#BD8B52] hover:bg-[#A3743E] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <User className="w-4 h-4" />
            Sign In to Sync
          </Link>
        )}

        {mounted && user?.role === 'admin' && (
          <Link
            href="/admin"
            className="px-4 py-2 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-[#BD8B52]" />
            Switch to Admin Panel
          </Link>
        )}
      </div>

      {/* Grid Layout: Sidebar + Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <aside className="lg:col-span-3 bg-white border border-[#E5E0D8] rounded-2xl p-3 shadow-sm space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'text-[#555] hover:bg-[#F5F1E8] hover:text-[#171717]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-[#BD8B52]' : 'text-[#737373]'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      active ? 'bg-[#BD8B52] text-white' : 'bg-[#F5F1E8] text-[#171717]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-[#F5F1E8]">
            {mounted && !user ? (
              <Link
                href="/login?redirect=/dashboard"
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10 hover:bg-[#BD8B52]/20 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </aside>

        {/* Dynamic Main View */}
        <main className="lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}
