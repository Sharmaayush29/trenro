'use client';

import React from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/store/demo-context';
import OutfitCard from '@/components/outfits/OutfitCard';
import { Heart, Compass, ArrowRight } from 'lucide-react';

export default function SavedOutfitsPage() {
  const { savedOutfitIds, outfits } = useDemoStore();

  const savedOutfits = savedOutfitIds
    .map((id) => outfits.find((o) => o.id === id))
    .filter(Boolean) as typeof outfits;

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-[#F5F1E8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#BD8B52]" /> Saved Wardrobe
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Your bookmarked outfits. Click the heart icon on any card to remove it from your favourites.
          </p>
        </div>

        <span className="px-3 py-1 bg-[#F5F1E8] rounded-full text-xs font-bold text-[#171717]">
          {savedOutfits.length} Outfits Saved
        </span>
      </div>

      {savedOutfits.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F5F1E8] text-[#BD8B52] flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#171717]">No Saved Outfits Yet</h3>
          <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed">
            Whenever you see an outfit you love, click the heart button to store it in your wardrobe.
          </p>
          <Link
            href="/outfits"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
            <Compass className="w-4 h-4" /> Discover Outfits
          </Link>
        </div>
      )}
    </div>
  );
}
