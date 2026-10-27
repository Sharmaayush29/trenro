'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDemoStore } from '@/lib/store/demo-context';
import OutfitCard from '@/components/outfits/OutfitCard';
import { formatINR, calculateOutfitTotal, isWithinBudget } from '@/lib/utils/formatters';
import { Tag, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

function BudgetLooksContent() {
  const searchParams = useSearchParams();
  const maxParam = searchParams.get('max');
  const initialBudget = maxParam ? Number(maxParam) : 999;

  const [activeTier, setActiveTier] = useState<number>(initialBudget);
  const { outfits } = useDemoStore();

  const tiers = [
    {
      budget: 999,
      label: 'Under ₹999',
      tagline: 'College Budget Essentials',
      description: 'Solid tees and everyday trousers with verified sum totals strictly under ₹999.',
    },
    {
      budget: 1499,
      label: 'Under ₹1,499',
      tagline: 'Everyday Campus Smart',
      description: 'Textured waffle knits, relaxed utility totes, and versatile chinos under ₹1,499.',
    },
    {
      budget: 2499,
      label: 'Under ₹2,499',
      tagline: 'Date & Weekend Looks',
      description: 'Cuban collar shirts, linen blends, and jewelry accents under ₹2,499.',
    },
    {
      budget: 15000,
      label: 'Premium & Sartorial',
      tagline: 'Investment Ensembles',
      description: 'Pure linen tailoring, pleated gurkhas, and leather footwear ensembles.',
    },
  ];

  const currentTierInfo = tiers.find((t) => t.budget === activeTier) || tiers[0];

  // Strictly filter outfits where the sum of its product prices qualifies under activeTier
  const qualifyingOutfits = outfits.filter((outfit) => {
    if (!outfit.published) return false;
    const total = calculateOutfitTotal(outfit.products);
    if (activeTier === 999) return total <= 999;
    if (activeTier === 1499) return total <= 1499;
    if (activeTier === 2499) return total <= 2499;
    return total > 2499;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10 border border-[#BD8B52]/20">
          <Tag className="w-3.5 h-3.5" /> Budget Engineering
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight">
          Budget Looks: Verified Totals
        </h1>
        <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
          We treat these as target budget ranges backed by genuine product math. An outfit only
          qualifies for a budget tier if the sum of its recorded individual garment prices is within the limit.
        </p>
      </div>

      {/* Budget Tier Selector Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiers.map((tier) => (
          <button
            key={tier.budget}
            type="button"
            onClick={() => setActiveTier(tier.budget)}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTier === tier.budget
                ? 'border-[#BD8B52] bg-[#171717] text-white shadow-lg'
                : 'border-[#E5E0D8] bg-white text-[#171717] hover:border-[#BD8B52]/50 hover:bg-[#FDFBF7]'
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block ${
                activeTier === tier.budget ? 'text-[#D4A36A]' : 'text-[#BD8B52]'
              }`}
            >
              {tier.tagline}
            </span>
            <h3 className="text-lg font-black mt-0.5">{tier.label}</h3>
          </button>
        ))}
      </div>

      {/* Tier Explanation Banner */}
      <div className="p-4 bg-[#F5F1E8] border border-[#E5E0D8] rounded-xl flex items-center justify-between gap-4 text-xs">
        <div className="space-y-0.5">
          <span className="font-bold text-[#171717]">{currentTierInfo.label} Collection:</span>
          <p className="text-[#737373]">{currentTierInfo.description}</p>
        </div>
        <span className="font-bold text-[#171717] whitespace-nowrap bg-white px-3 py-1.5 rounded-lg border border-[#E5E0D8]">
          {qualifyingOutfits.length} Qualified Looks
        </span>
      </div>

      {/* Outfits Grid */}
      {qualifyingOutfits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {qualifyingOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded-2xl p-12 text-center text-xs text-[#737373]">
          No outfits currently meet this strict budget limit. Try selecting another budget tier above.
        </div>
      )}
    </div>
  );
}

export default function BudgetLooksPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading budget collections...</div>}>
      <BudgetLooksContent />
    </Suspense>
  );
}
