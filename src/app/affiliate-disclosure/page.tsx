'use client';

import React from 'react';
import { ShieldCheck, CheckCircle2, Truck, RefreshCw, Lock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BrandGuaranteePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#BD8B52] uppercase tracking-[0.2em]">
          TRENRO Brand Promise
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight">
          Original Apparel & Store Guarantee
        </h1>
        <p className="text-xs text-[#737373]">Official TRENRO Brand Policy &bull; Direct-to-Consumer</p>
      </div>

      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-10 space-y-8 text-sm text-[#404040] leading-relaxed shadow-sm">
        {/* Core Summary Callout */}
        <div className="p-5 bg-[#F5F1E8] border border-[#E5E0D8] rounded-2xl flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-[#BD8B52] flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-[#171717] leading-relaxed">
            <p className="font-bold text-sm">Direct-to-Consumer Brand Commitment:</p>
            <p>
              TRENRO is an original Indian menswear clothing brand. We manufacture, design, and retail all TRENRO-branded apparel directly through our official online storefront. We are not an affiliate directory or third-party retailer marketplace.
            </p>
          </div>
        </div>

        {/* Section 1: Original Menswear */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#BD8B52]" /> 1. Proprietary Design & Custom Fabrics
          </h2>
          <p>
            Every TRENRO garment is engineered with bespoke fabric specifications, including our 240–280 GSM combed cotton tees, French linen resort shirts, and double-pleated Gurkha trousers. We maintain direct inventory in our warehouses across India.
          </p>
        </section>

        {/* Section 2: Transparent Pricing & Payments */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#BD8B52]" /> 2. Secure UPI & Doorstep Cash on Delivery
          </h2>
          <p>
            Transactions are calculated strictly on the server and processed with secure payment verification (Instant UPI, Cards, and zero-advance Cash on Delivery). We never inflate or fabricate MRPs.
          </p>
        </section>

        {/* Section 3: Doorstep Size Exchange */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#BD8B52]" /> 3. 7-Day Doorstep Size Exchange
          </h2>
          <p>
            If a garment size does not fit your silhouette cleanly, our courier picks up the garment directly from your doorstep and provides the replacement size with zero hassle.
          </p>
        </section>

        <div className="pt-4 border-t border-[#F5F1E8] flex flex-wrap gap-4">
          <Link
            href="/outfits"
            className="px-6 py-3 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-2"
          >
            Explore TRENRO Looks <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/shipping-and-returns"
            className="px-6 py-3 bg-[#F5F1E8] hover:bg-[#E5E0D8] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
          >
            Shipping & Exchange Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
