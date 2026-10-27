'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  BookOpen,
  FolderKanban,
  BarChart3,
  ExternalLink,
  Package,
  CreditCard,
  Tag,
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Store Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Apparel Products CMS', href: '/admin/products', icon: ShoppingBag },
    { name: 'Coupons & Vouchers', href: '/admin/coupons', icon: Tag },
    { name: 'Customer Orders', href: '/admin/orders', icon: Package },
    { name: 'UPI & Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Curated Outfits', href: '/admin/outfits', icon: Layers },
    { name: 'Style Guides CMS', href: '/admin/style-guides', icon: BookOpen },
    { name: 'Collections', href: '/admin/collections', icon: FolderKanban },
    { name: 'Store Performance', href: '/admin/analytics', icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
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
          </Link>
        );
      })}

      <div className="pt-3 border-t border-[#F5F1E8] mt-2">
        <Link
          href="/outfits"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-[#737373] hover:text-[#171717] hover:bg-[#F5F1E8] transition-colors"
        >
          <span>View Public Catalog</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#BD8B52]" />
        </Link>
      </div>
    </aside>
  );
}
