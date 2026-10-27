'use client';

import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      <div className="space-y-2">
        <span className="text-xs font-bold text-[#BD8B52] uppercase tracking-[0.2em]">
          Legal & Privacy
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#171717]">Privacy Policy</h1>
        <p className="text-xs text-[#737373]">Effective date: October 2026</p>
      </div>

      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-10 space-y-6 text-xs sm:text-sm text-[#404040] leading-relaxed shadow-sm">
        <p>
          At <strong>TRENRO</strong> ("we", "our", or "us"), we are committed to respecting your privacy.
          This Privacy Policy explains how we collect, use, and safeguard your data when using our men's
          fashion discovery platform.
        </p>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-[#171717]">1. Information We Collect</h2>
          <p>
            - <strong>Account & Preferences:</strong> When you register or save style preferences, we collect your display name, email address, preferred budget, occasion choices, and saved outfits.
          </p>
          <p>
            - <strong>Anonymous Analytics:</strong> We log clicks on retailer links to determine which outfits are popular. Outbound click logging records solely the product identifier and timestamp; no financial, card, or private payment data is ever handled by TRENRO.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-[#171717]">2. How We Use Information</h2>
          <p>
            Your information is used solely to personalize your dashboard, recommend looks aligned with
            your budget preferences, and maintain account security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-[#171717]">3. Row Level Security & Data Isolation</h2>
          <p>
            User preferences and saved items are protected by PostgreSQL Row Level Security (RLS).
            Users can access and edit only their own records.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base sm:text-lg font-bold text-[#171717]">4. Account Deletion</h2>
          <p>
            You may request complete erasure of your profile, preferences, and saved outfits at any time
            directly from your Account Settings page.
          </p>
        </section>
      </div>
    </div>
  );
}
