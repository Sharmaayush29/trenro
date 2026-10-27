'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Outfit } from '@/types';
import { formatINR, calculateOutfitTotal } from '@/lib/utils/formatters';
import { useDemoStore } from '@/lib/store/demo-context';
import { Heart, Sparkles, Layers, Play, Video } from 'lucide-react';

interface OutfitCardProps {
  outfit: Outfit;
  priority?: boolean;
}

export default function OutfitCard({ outfit, priority = false }: OutfitCardProps) {
  const { isSaved, toggleSaveOutfit } = useDemoStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const saved = mounted ? isSaved(outfit.id) : false;

  // Dynamic calculation of total price strictly from products
  const totalPrice = calculateOutfitTotal(outfit.products);
  const itemCount = outfit.products?.length || 0;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveOutfit(outfit.id);
  };

  return (
    <div className="group relative bg-white border border-[#E5E0D8] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Cover Image Area */}
      <Link href={`/outfits/${outfit.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-[#F5F1E8]">
        {/* Real Fashion Photo */}
        <img
          src={outfit.cover_image_url}
          alt={outfit.title}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
        />

        {/* Gradient overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#171717]/80 text-white backdrop-blur-md border border-white/10">
              {outfit.occasion}
            </span>
            {outfit.video_url && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BD8B52] text-white shadow-sm backdrop-blur-md">
                <Play className="w-2.5 h-2.5 fill-current" /> Video
              </span>
            )}
          </div>

          {/* Save Heart Button */}
          <button
            type="button"
            onClick={handleHeartClick}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md transition-all ${
              saved
                ? 'bg-[#BD8B52] text-white shadow-md scale-110'
                : 'bg-white/80 text-[#171717] hover:bg-white hover:text-red-500'
            }`}
            aria-label={saved ? 'Remove from favourites' : 'Save outfit to favourites'}
          >
            <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Bottom Floating Info on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#D4A36A] tracking-wider uppercase text-[10px]">
              {outfit.style} • {outfit.fit} Fit
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-white/90 bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
              <Layers className="w-3 h-3 text-[#BD8B52]" />
              {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'}
            </span>
          </div>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/outfits/${outfit.slug}`}>
            <h3 className="font-bold text-base text-[#171717] group-hover:text-[#BD8B52] transition-colors line-clamp-1">
              {outfit.title}
            </h3>
          </Link>
          <p className="text-xs text-[#737373] mt-1.5 line-clamp-2 leading-relaxed">
            {outfit.description}
          </p>
        </div>

        {/* Color Palette Tags & Dynamic Price */}
        <div className="mt-4 pt-3 border-t border-[#F5F1E8] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {outfit.colour_tags?.slice(0, 3).map((c, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-[#F5F1E8] text-[#555] rounded text-[10px] font-medium"
              >
                {c}
              </span>
            ))}
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#737373] block uppercase tracking-wider">
              Total Look
            </span>
            <span className="text-sm sm:text-base font-black text-[#171717]">
              {formatINR(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
