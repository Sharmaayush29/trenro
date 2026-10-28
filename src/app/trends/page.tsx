'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/store/demo-context';
import OutfitCard from '@/components/outfits/OutfitCard';
import { Sparkles, Calendar, ArrowRight, Layers, Bookmark } from 'lucide-react';

export default function TrendsPage() {
  const { outfits } = useDemoStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const trendEssays = [
    {
      id: 'trend-1',
      category: 'Streetwear',
      title: 'Boxy Heavyweight Silhouettes & Utilitarian Pockets',
      publicationDate: 'October 20, 2026',
      excerpt:
        'Streetwear has shifted from loud brand logos to structural fabric density. 240+ GSM cotton drop-shoulder tees paired with multi-pocket cargo pants.',
      keyRules: [
        'Choose structure over cling: Heavyweight cotton holds boxy architectural lines',
        'Stack utility pockets: Tapered cargos prevent the lower leg from ballooning',
        'Ground with skate or retro court sneakers',
      ],
      matchingStyle: 'Streetwear',
    },
    {
      id: 'trend-2',
      category: 'Minimalism',
      title: 'Monochromatic Tactile Texturing',
      publicationDate: 'October 22, 2026',
      excerpt:
        'When wearing only black, grey, or ecru, texture becomes your color palette. Waffle knits, brushed cotton, and subtle ribbed fabrics replace loud graphics.',
      keyRules: [
        'Mix tactile surfaces: Pair knit cotton tops with structured twill chinos',
        'Keep branding minimal or non-existent',
        'Invest in immaculate clean footwear care',
      ],
      matchingStyle: 'Minimalist',
    },
    {
      id: 'trend-3',
      category: 'Smart Casual',
      title: 'The Open Cuban Collar Renaissance',
      publicationDate: 'October 24, 2026',
      excerpt:
        'The stiff dress shirt is taking a back seat to breathable, camp-collar and resort shirts worn unbuttoned over ribbed tank tops or plain crew-necks.',
      keyRules: [
        'Leave the top two buttons undone to elongate the neck',
        'Earth tones (olive, khaki, terracotta) shine with Indian wheatish skin tones',
        'Pair with pleated trousers or straight-leg chinos',
      ],
      matchingStyle: 'Smart Casual',
    },
    {
      id: 'trend-4',
      category: 'Old Money',
      title: 'Pleated Gurkha Tailoring & Summer Linens',
      publicationDate: 'October 19, 2026',
      excerpt:
        'Mediterranean tailoring elements like high-rise double-pleated trousers with built-in side adjusters deliver effortless vintage sophistication.',
      keyRules: [
        'High-waisted trousers visually elongate your leg-to-torso ratio',
        'No socks with loafers or espadrilles for relaxed Italian sprezzatura',
        'Linen wrinkles naturally—embrace the texture rather than over-ironing',
      ],
      matchingStyle: 'Old Money',
    },
  ];

  const filteredTrends =
    activeCategory === 'all'
      ? trendEssays
      : trendEssays.filter((t) => t.category.toLowerCase() === activeCategory.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10 border border-[#BD8B52]/20">
          <Sparkles className="w-3.5 h-3.5" /> Editorial Trend Reports
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight">
          Men's Fashion Trends & Silhouettes
        </h1>
        <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
          Editorial analyses of contemporary silhouettes, proportions, and styling habits.
          Dated observations based on verified street style and runway evolution.
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-[#E5E0D8]">
        {['All', 'Streetwear', 'Minimalism', 'Smart Casual', 'Old Money'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat.toLowerCase())}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeCategory === cat.toLowerCase()
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-white text-[#737373] border border-[#E5E0D8] hover:border-[#BD8B52]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trend Editorial Articles & Curated Looks */}
      <div className="space-y-16">
        {filteredTrends.map((trend) => {
          const curatedLooks = outfits
            .filter((o) => o.published && o.style === trend.matchingStyle)
            .slice(0, 3);

          return (
            <article
              key={trend.id}
              className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm p-6 sm:p-10 space-y-8"
            >
              {/* Essay Top Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center gap-3 text-xs text-[#737373]">
                    <span className="px-2.5 py-0.5 bg-[#BD8B52]/10 text-[#BD8B52] font-bold uppercase tracking-wider rounded">
                      {trend.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Published {trend.publicationDate}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">
                    {trend.title}
                  </h2>

                  <p className="text-sm text-[#737373] leading-relaxed">
                    {trend.excerpt}
                  </p>

                  <div className="pt-2 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#171717] block">
                      Core Editorial Styling Principles:
                    </span>
                    <ul className="space-y-1 text-xs text-[#555]">
                      {trend.keyRules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#BD8B52] font-bold">0{idx + 1}.</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#171717] p-6 sm:p-8 flex flex-col justify-between text-white border border-[#262626] shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono tracking-widest uppercase text-[#BD8B52]">
                        {trend.category}
                      </span>
                      <span className="text-[10px] font-bold tracking-widest text-[#737373] uppercase">
                        ESSAY 0{filteredTrends.indexOf(trend) + 1}
                      </span>
                    </div>
                    <div className="space-y-2 my-auto">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#BD8B52]">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h3 className="text-lg font-black tracking-tight uppercase leading-snug">
                        {trend.title}
                      </h3>
                      <p className="text-xs text-[#A3A3A3] line-clamp-2">
                        {trend.excerpt}
                      </p>
                    </div>
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#BD8B52] font-bold">
                      <span>TRENRO Editorial</span>
                      <span>Verified Silhouette</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Curated Outfits for this Trend */}
              {curatedLooks.length > 0 && (
                <div className="pt-8 border-t border-[#F5F1E8] space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                      Curated Outfits Matching this Trend
                    </h4>
                    <Link
                      href={`/outfits?style=${encodeURIComponent(trend.matchingStyle)}`}
                      className="text-xs text-[#BD8B52] hover:underline font-semibold"
                    >
                      View All {trend.matchingStyle} Looks →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {curatedLooks.map((outfit) => (
                      <OutfitCard key={outfit.id} outfit={outfit} />
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
