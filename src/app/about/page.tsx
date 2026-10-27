'use client';

import React from 'react';
import Link from 'next/link';
import TrenroLogo from '@/components/brand/TrenroLogo';
import { Target, ArrowRight, HeartHandshake, Compass, Layers, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Editorial Title */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-[#BD8B52] uppercase tracking-[0.2em]">
          About TRENRO
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight">
          Contemporary Menswear Engineered for Modern India.
        </h1>
        <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
          &ldquo;WEAR THE TREND. OWN THE LOOK.&rdquo; Born from the conviction that modern Indian men deserve structured drape, premium heavyweight cotton, and timeless silhouettes without exorbitant markups.
        </p>
      </div>

      {/* Brand Monogram Feature Box */}
      <div className="bg-[#171717] rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl border border-[#2E2E2E]">
        <TrenroLogo variant="light" size="xl" showTagline={true} />
        <p className="text-sm sm:text-base text-[#D4D4D4] max-w-2xl mx-auto leading-relaxed">
          Most men don&apos;t lack interest in dressing well—they lack clothing built with true attention to fabric weight, collar structure, and silhouette proportions. Flimsy fabrics and inconsistent fits ruin what should be effortless daily confidence. TRENRO creates original menswear garments designed to hold their boxy drape wash after wash, paired into head-to-toe looks that you can add directly to your bag.
        </p>
      </div>

      {/* 3 Brand Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#BD8B52]/10 text-[#BD8B52] flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171717]">Engineered Fabric Weights</h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            From 240–280 GSM combed cotton tees that drape cleanly without clinging, to French linen resort shirts and pleated Gurkha trousers, every piece is built for longevity and structure.
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#BD8B52]/10 text-[#BD8B52] flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171717]">Shop The Look Architecture</h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            Instead of forcing you to guess how a shirt pairs with trousers, our editorial team styles complete head-to-toe looks. Select your sizes and add the complete ensemble to your bag in one click.
          </p>
        </div>

        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 space-y-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#BD8B52]/10 text-[#BD8B52] flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171717]">7-Day Doorstep Exchange</h3>
          <p className="text-xs text-[#737373] leading-relaxed">
            Shopping online shouldn&apos;t carry size anxiety. If any garment doesn&apos;t fit your silhouette cleanly, our doorstep courier picks it up and provides your preferred size with zero friction.
          </p>
        </div>
      </div>

      {/* Direct-to-Consumer Storefront Assurance */}
      <div className="bg-[#FDFBF7] border border-[#E5E0D8] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-sm text-[#171717]">Direct-to-Consumer Brand Store</h4>
          </div>
          <p className="text-xs text-[#525252] leading-relaxed">
            All TRENRO apparel is stocked in our domestic fulfillment hubs and dispatched within 24 hours. We offer complimentary express courier for orders over ₹999, secure Instant UPI, and genuine Cash on Delivery.
          </p>
        </div>
        <Link
          href="/shipping-and-returns"
          className="px-5 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors whitespace-nowrap"
        >
          View Shipping & Returns
        </Link>
      </div>

      {/* CTA Box */}
      <div className="text-center pt-8 border-t border-[#E5E0D8] space-y-4">
        <h3 className="text-xl font-bold text-[#171717]">Ready to elevate your daily wardrobe?</h3>
        <div className="flex justify-center gap-4">
          <Link
            href="/outfits"
            className="px-6 py-3 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-2"
          >
            Explore Curated Looks <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/style-guide"
            className="px-6 py-3 bg-[#F5F1E8] hover:bg-[#EAE4D6] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            Read Style Guides
          </Link>
        </div>
      </div>
    </div>
  );
}
