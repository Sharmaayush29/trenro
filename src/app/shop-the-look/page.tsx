'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/store/demo-context';
import { formatINR, calculateOutfitTotal } from '@/lib/utils/formatters';
import {
  ArrowRight,
  Sparkles,
  Heart,
  ExternalLink,
  Clock,
  Compass,
} from 'lucide-react';

export default function ShopTheLookPage() {
  const { outfits, isSaved, toggleSaveOutfit, logOutboundClick } = useDemoStore();
  const [mounted, setMounted] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<string>('All');

  useEffect(() => {
    setMounted(true);
  }, []);

  const occasions = ['All', 'College', 'Casual Date', 'Office', 'Weekend', 'Party'];

  const filtered = outfits.filter(
    (o) => o.published && (selectedOccasion === 'All' || o.occasion === selectedOccasion)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Editorial Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10 border border-[#BD8B52]/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Outfits</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight">
          Shop Head-to-Toe Looks
        </h1>
        <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
          Complete, intentional ensembles curated by TRENRO stylists. 
          Discover full outfit breakdowns with verified budget totals and direct links to each source retailer.
        </p>
      </div>

      {/* Occasion Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-[#E5E0D8]">
        {occasions.map((occ) => (
          <button
            key={occ}
            type="button"
            onClick={() => setSelectedOccasion(occ)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedOccasion === occ
                ? 'bg-[#171717] text-white shadow-md'
                : 'bg-white text-[#737373] border border-[#E5E0D8] hover:border-[#BD8B52]'
            }`}
          >
            {occ}
          </button>
        ))}
      </div>

      {/* Complete Outfit Rows */}
      {filtered.length > 0 ? (
        <div className="space-y-12">
          {filtered.map((outfit) => {
            const total = calculateOutfitTotal(outfit.products);
            const saved = mounted ? isSaved(outfit.id) : false;

            return (
              <div
                key={outfit.id}
                className="bg-white border border-[#E5E0D8] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 p-6 sm:p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Outfit Cover Column */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#F5F1E8] relative group shadow-md">
                      <img
                        src={outfit.cover_image_url}
                        alt={outfit.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#171717]/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/10">
                          {outfit.occasion}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleSaveOutfit(outfit.id)}
                        className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-colors ${
                          saved
                            ? 'bg-[#BD8B52] text-white shadow-md'
                            : 'bg-white/80 text-[#171717] hover:bg-white hover:text-red-500'
                        }`}
                        aria-label="Save outfit"
                      >
                        <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#BD8B52] font-black uppercase tracking-wider">
                          {outfit.style} Style
                        </span>
                        <span className="text-[#A3A3A3]">•</span>
                        <span className="text-[#737373]">{outfit.fit} Fit</span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
                        {outfit.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#737373] leading-relaxed line-clamp-2">
                        {outfit.description}
                      </p>

                      <div className="pt-2 flex items-center justify-between">
                        <Link
                          href={`/outfits/${outfit.slug}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#BD8B52] hover:underline uppercase tracking-wider"
                        >
                          Explore Look Details <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Individual Items & Outbound Links Column */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Ensemble Summary Card */}
                    <div className="p-5 bg-[#171717] rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                      <div>
                        <span className="text-[10px] text-[#BD8B52] uppercase tracking-[0.2em] font-bold block">
                          Estimated Look Total
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-white">
                          {formatINR(total)}
                        </span>
                        <span className="text-[11px] text-[#A3A3A3] block">
                          Includes {outfit.products?.length || 0} coordinated pieces from partner retailers
                        </span>
                      </div>

                      <Link
                        href={`/outfits/${outfit.slug}`}
                        className="w-full sm:w-auto px-6 py-3.5 bg-[#BD8B52] hover:bg-[#A3743E] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group whitespace-nowrap"
                      >
                        <Compass className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span>View Outfit Breakdown</span>
                      </Link>
                    </div>

                    {/* Garments List */}
                    <div className="space-y-3">
                      <span className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                        Individual Pieces in this Look
                      </span>

                      {outfit.products?.map((item, index) => {
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-4 p-3.5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-2xl hover:border-[#BD8B52]/60 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-16 h-20 object-cover rounded-xl bg-[#F5F1E8] flex-shrink-0"
                              />
                              <div className="space-y-1 min-w-0">
                                <span className="text-[9px] font-black text-[#BD8B52] uppercase tracking-wider bg-[#171717] px-2 py-0.5 rounded">
                                  {item.product.retailer_name} • {item.product.category}
                                </span>
                                <h4 className="text-xs font-bold text-[#171717] truncate max-w-[220px]">
                                  {item.product.name}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-black text-[#171717]">
                                    {formatINR(item.product.price_inr)}
                                  </span>
                                  {item.product.price_verified_at && (
                                    <span className="text-[10px] text-[#737373]">
                                      Verified {item.product.price_verified_at}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <a
                              href={item.product.product_url}
                              target="_blank"
                              rel="noopener noreferrer sponsored"
                              onClick={() => {
                                logOutboundClick(item.product.id, outfit.id, item.product.retailer_name, item.product.product_url);
                              }}
                              className="px-4 py-2 bg-[#171717] hover:bg-[#BD8B52] text-white text-[11px] font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 flex-shrink-0"
                            >
                              <span>Shop on {item.product.retailer_name}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 bg-white border border-[#E5E0D8] rounded-2xl text-center space-y-4">
          <p className="text-sm text-[#737373]">No outfits found for the selected occasion.</p>
        </div>
      )}
    </div>
  );
}
