'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/store/demo-context';
import { formatDate } from '@/lib/utils/formatters';
import { BookOpen, Search, Clock, ArrowRight, X } from 'lucide-react';

export default function StyleGuidesPage() {
  const { styleGuides, user } = useDemoStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Color Theory',
    'Fit & Proportion',
    'Student Style',
    'Occasion Dressing',
    'Workwear',
    'Capsule Wardrobe',
    'Budget Styling',
  ];

  const filteredGuides = styleGuides.filter((guide) => {
    if (!guide.published) return false;
    if (selectedCategory !== 'All' && guide.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        guide.title.toLowerCase().includes(q) ||
        guide.excerpt.toLowerCase().includes(q) ||
        guide.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10 border border-[#BD8B52]/20">
          <BookOpen className="w-3.5 h-3.5" /> Fashion Editorial Guides
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight">
          Style Guides & Sartorial Handbooks
        </h1>
        <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
          In-depth masterclasses on color harmony, proportions, campus capsule wardrobes, and
          demystifying dress codes for young Indian men.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-[#E5E0D8] rounded-xl p-4 shadow-sm space-y-4">
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides by topic (e.g. color wheel, capsule, fit)..."
            className="w-full pl-10 pr-8 py-2.5 bg-[#F5F1E8] border border-[#E5E0D8] rounded-lg text-xs text-[#171717] placeholder-[#737373] focus:bg-white focus:border-[#BD8B52] focus:outline-none"
          />
          <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-3 text-[#737373] hover:text-[#171717]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F5F1E8]">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#171717] text-white shadow-sm'
                  : 'bg-[#FDFBF7] text-[#737373] border border-[#E5E0D8] hover:border-[#BD8B52]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredGuides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/style-guides/${guide.slug}`}
              className="group bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div className="aspect-[16/10] overflow-hidden bg-[#F5F1E8] relative">
                <img
                  src={guide.cover_image_url}
                  alt={guide.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#171717]/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-md border border-white/10">
                  {guide.category}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-[#737373]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#A3A3A3]" /> {guide.read_time_minutes} min read
                    </span>
                    <span>•</span>
                    <span>{formatDate(guide.published_at)}</span>
                  </div>

                  <h3 className="font-bold text-lg text-[#171717] group-hover:text-[#BD8B52] transition-colors leading-snug">
                    {guide.title}
                  </h3>

                  <p className="text-xs text-[#737373] line-clamp-3 leading-relaxed">
                    {guide.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#F5F1E8] flex items-center justify-between text-xs text-[#171717] font-bold">
                  <span>Read Full Article</span>
                  <ArrowRight className="w-4 h-4 text-[#BD8B52] transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-12 sm:p-16 text-center space-y-4 max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#171717] text-[#BD8B52] border border-[#BD8B52]/30 flex items-center justify-center mx-auto shadow-md">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-[#BD8B52] block">
            TRENRO Editorial
          </span>
          <h3 className="text-2xl font-black text-[#171717]">
            {search.trim() ? 'No Matching Style Guides Found' : 'Sartorial Masterclasses In Preparation'}
          </h3>
          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-md mx-auto">
            {search.trim()
              ? 'Try widening your search terms or clearing selected categories to discover more guides.'
              : 'Our editorial stylists are writing foundational guides on color theory, proportions, and menswear styling. Check back soon or explore current trends.'}
          </p>
          {!search.trim() ? (
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/trends"
                className="px-6 py-3 bg-[#BD8B52] hover:bg-[#A3743E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                Explore Trends
              </Link>
              <Link
                href="/find-my-look"
                className="px-6 py-3 bg-[#171717] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                Style Finder Quiz
              </Link>
            </div>
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="px-5 py-2.5 bg-[#171717] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                Clear Search & Filters
              </button>
            </div>
          )}
          {user?.role === 'admin' && !search.trim() && (
            <div className="pt-4 border-t border-[#F5F1E8]">
              <Link
                href="/admin/style-guides"
                className="text-[11px] font-bold text-[#BD8B52] hover:underline inline-flex items-center gap-1"
              >
                Staff Portal: Compose Guide
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
