'use client';

import React from 'react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#BD8B52] uppercase tracking-[0.2em]">
          Legal
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#171717]">Terms of Service</h1>
        <p className="text-xs text-[#737373]">Effective date: October 2026</p>
      </div>

      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-[#404040] leading-relaxed shadow-sm">
        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-[#171717]">1. Platform Nature</h2>
          <p>
            TRENRO provides fashion inspiration, outfit curation, and educational style guides.
            TRENRO is not an e-commerce merchant and does not process payments, fulfill orders, or
            handle returns for third-party products.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-[#171717]">2. External Merchant Transactions</h2>
          <p>
            When purchasing products linked from TRENRO, transactions are conducted entirely on the
            retailer's website (e.g., Myntra, Ajio, Snitch, Zara). Any customer service inquiries,
            shipping questions, or refunds must be addressed directly to the merchant from whom the
            product was purchased.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-[#171717]">3. Intellectual Property</h2>
          <p>
            The TRENRO name, monogram, wordmark, website code, and proprietary style guide texts are
            protected by copyright laws. Product imagery is the property of respective brands and
            licensed sources.
          </p>
        </section>
      </div>
    </div>
  );
}
