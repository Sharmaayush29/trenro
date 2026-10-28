'use client';

import React from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/store/demo-context';
import OutfitCard from '@/components/outfits/OutfitCard';
import { formatINR, calculateOutfitTotal } from '@/lib/utils/formatters';
import {
  Heart,
  History,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Compass,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const { user, preferences, savedOutfitIds, recentlyViewedIds, outfits } = useDemoStore();

  // Profile completion calculation
  const hasSaved = savedOutfitIds.length > 0;
  const hasPrefs = preferences.preferred_styles.length > 0;
  const hasHistory = recentlyViewedIds.length > 0;
  const completionScore = 25 + (hasPrefs ? 25 : 0) + (hasSaved ? 25 : 0) + (hasHistory ? 25 : 0);

  // Recently viewed outfit objects
  const recentOutfits = recentlyViewedIds
    .map((id) => outfits.find((o) => o.id === id))
    .filter(Boolean) as typeof outfits;

  // Personalized Recommendations based on User Preferences
  const recommendedOutfits = outfits
    .filter((o) => {
      if (!o.published) return false;
      const total = calculateOutfitTotal(o.products);
      const budgetMatch = total <= (preferences.preferred_budget || 2500) * 1.25;
      const occasionMatch = preferences.preferred_occasions.some(
        (occ) => occ.toLowerCase() === o.occasion.toLowerCase()
      );
      const styleMatch = preferences.preferred_styles.some(
        (st) => st.toLowerCase() === o.style.toLowerCase()
      );
      return budgetMatch || occasionMatch || styleMatch;
    })
    .slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome & Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Completion Box */}
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-[#737373]">
            <span>Profile Completion</span>
            <span className="text-[#BD8B52] font-black">{completionScore}%</span>
          </div>
          <div className="w-full h-2 bg-[#F5F1E8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#BD8B52] transition-all duration-500"
              style={{ width: `${completionScore}%` }}
            />
          </div>
          <p className="text-[11px] text-[#737373]">
            {completionScore === 100
              ? 'All style preferences and favourites calibrated!'
              : 'Complete your preferences to unlock hyper-relevant outfits.'}
          </p>
        </div>

        {/* Saved Count Box */}
        <Link
          href="/dashboard/saved"
          className="bg-white border border-[#E5E0D8] hover:border-[#BD8B52] rounded-2xl p-5 shadow-sm transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">
              Saved Outfits
            </span>
            <Heart className="w-4 h-4 text-[#BD8B52]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-[#171717]">{savedOutfitIds.length}</span>
            <span className="text-xs text-[#BD8B52] block font-semibold group-hover:underline mt-1">
              View wardrobe →
            </span>
          </div>
        </Link>

        {/* Target Budget Box */}
        <Link
          href="/dashboard/preferences"
          className="bg-white border border-[#E5E0D8] hover:border-[#BD8B52] rounded-2xl p-5 shadow-sm transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#737373] uppercase tracking-wider">
              Preferred Budget
            </span>
            <Sliders className="w-4 h-4 text-[#BD8B52]" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-[#171717]">
              {formatINR(preferences.preferred_budget || 2500)}
            </span>
            <span className="text-xs text-[#BD8B52] block font-semibold group-hover:underline mt-1">
              Adjust preferences →
            </span>
          </div>
        </Link>
      </div>

      {/* Recommended for You */}
      <section className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-[#F5F1E8]">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#BD8B52] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Tailored Looks
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#171717] mt-0.5">
              Recommended for Your Style Profile
            </h2>
            <p className="text-xs text-[#737373]">
              Filtered based on your preferred styles ({preferences.preferred_styles.join(', ') || 'All'})
              and target budget {formatINR(preferences.preferred_budget || 2500)}.
            </p>
          </div>

          <Link
            href="/outfits"
            className="text-xs font-bold text-[#BD8B52] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            Explore All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendedOutfits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedOutfits.map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        ) : (
          <div className="p-10 text-center space-y-3 bg-[#FDFCFB] border border-[#E5E0D8] rounded-xl">
            <Sparkles className="w-6 h-6 text-[#BD8B52] mx-auto" />
            <h4 className="font-bold text-sm text-[#171717]">New Studio Looks Arriving Soon</h4>
            <p className="text-xs text-[#737373] max-w-sm mx-auto">
              Our studio team is preparing fresh seasonal drops. Curated looks matching your style profile will appear here automatically.
            </p>
          </div>
        )}
      </section>

      {/* Recently Viewed Strip */}
      {recentOutfits.length > 0 && (
        <section className="bg-white border border-[#E5E0D8] rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#171717] flex items-center gap-2">
              <History className="w-4 h-4 text-[#BD8B52]" /> Recently Visited Looks
            </h3>
            <Link
              href="/dashboard/history"
              className="text-xs text-[#BD8B52] hover:underline font-semibold"
            >
              View History ({recentOutfits.length})
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOutfits.slice(0, 3).map((outfit) => (
              <OutfitCard key={outfit.id} outfit={outfit} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
