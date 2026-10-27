'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OutfitCatalog from '@/components/outfits/OutfitCatalog';
import { Compass, Sparkles } from 'lucide-react';

function OutfitsContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const occasion = searchParams.get('occasion') || '';
  const max = searchParams.get('max') ? Number(searchParams.get('max')) : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10 border border-[#BD8B52]/20">
          <Compass className="w-3.5 h-3.5" /> Curated Outfits Catalog
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight">
          Discover Men's Outfits
        </h1>
        <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
          Filter verified head-to-toe looks by target budget, occasion, silhouette fit, and color
          palette. Every outfit total is calculated dynamically from real product listings.
        </p>
      </div>

      {/* Interactive Catalog Component */}
      <OutfitCatalog
        initialSearch={search}
        initialOccasion={occasion}
        initialMaxBudget={max}
      />
    </div>
  );
}

export default function OutfitsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-[#737373]">
          Loading outfits catalog...
        </div>
      }
    >
      <OutfitsContent />
    </Suspense>
  );
}
