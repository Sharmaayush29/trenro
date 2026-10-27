'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Outfit } from '@/types';
import OutfitCard from './OutfitCard';
import { useDemoStore } from '@/lib/store/demo-context';
import { calculateOutfitTotal, formatINR } from '@/lib/utils/formatters';
import {
  Search,
  Filter,
  X,
  SlidersHorizontal,
  RotateCcw,
  Tag,
  Sparkles,
  ChevronDown,
  Plus,
} from 'lucide-react';

interface OutfitCatalogProps {
  initialSearch?: string;
  initialOccasion?: string;
  initialMaxBudget?: number;
}

export default function OutfitCatalog({
  initialSearch = '',
  initialOccasion = '',
  initialMaxBudget,
}: OutfitCatalogProps) {
  const { outfits, user } = useDemoStore();

  // Filters State
  const [search, setSearch] = useState(initialSearch);
  const [occasion, setOccasion] = useState(initialOccasion);
  const [style, setStyle] = useState('');
  const [fit, setFit] = useState('');
  const [colour, setColour] = useState('');
  const [maxBudget, setMaxBudget] = useState<number | ''>(initialMaxBudget || '');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'popular'>('popular');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter option lists
  const occasions = ['College', 'Casual Date', 'Office', 'Weekend', 'Party', 'Festive'];
  const styles = ['Streetwear', 'Minimalist', 'Smart Casual', 'Old Money', 'Casual'];
  const fits = ['Slim', 'Regular', 'Relaxed', 'Oversized'];
  const colours = ['Black', 'White', 'Olive', 'Cream', 'Khaki', 'Navy', 'Brown', 'Blue'];

  // Clear all filters
  const handleReset = () => {
    setSearch('');
    setOccasion('');
    setStyle('');
    setFit('');
    setColour('');
    setMaxBudget('');
    setSortBy('popular');
  };

  const hasActiveFilters = Boolean(
    search || occasion || style || fit || colour || maxBudget
  );

  // Real-time filtering algorithm
  const filteredOutfits = useMemo(() => {
    return outfits
      .filter((outfit) => {
        // Published check
        if (!outfit.published) return false;

        // Search check
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = outfit.title.toLowerCase().includes(q);
          const matchDesc = outfit.description.toLowerCase().includes(q);
          const matchOccasion = outfit.occasion.toLowerCase().includes(q);
          const matchStyle = outfit.style.toLowerCase().includes(q);
          const matchProducts = outfit.products?.some(
            (p) =>
              p.product?.name.toLowerCase().includes(q) ||
              p.product?.category.toLowerCase().includes(q)
          );
          if (!matchTitle && !matchDesc && !matchOccasion && !matchStyle && !matchProducts) {
            return false;
          }
        }

        // Occasion check
        if (occasion && outfit.occasion.toLowerCase() !== occasion.toLowerCase()) {
          return false;
        }

        // Style check
        if (style && outfit.style.toLowerCase() !== style.toLowerCase()) {
          return false;
        }

        // Fit check
        if (fit && outfit.fit.toLowerCase() !== fit.toLowerCase()) {
          return false;
        }

        // Colour check
        if (colour) {
          const hasColor = outfit.colour_tags.some(
            (c) => c.toLowerCase() === colour.toLowerCase()
          );
          if (!hasColor) return false;
        }

        // Dynamic price budget check
        if (maxBudget !== '') {
          const total = calculateOutfitTotal(outfit.products);
          if (total > Number(maxBudget)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = calculateOutfitTotal(a.products);
        const priceB = calculateOutfitTotal(b.products);

        if (sortBy === 'price_asc') return priceA - priceB;
        if (sortBy === 'price_desc') return priceB - priceA;
        if (sortBy === 'popular') return (b.likes_count || 0) - (a.likes_count || 0);
        // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [outfits, search, occasion, style, fit, colour, maxBudget, sortBy]);

  return (
    <div className="space-y-8">
      {/* Search & Sort Controls Bar */}
      <div className="bg-white border border-[#E5E0D8] rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shirts, linen, utility cargos, sneakers..."
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

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 bg-[#F5F1E8] text-[#171717] rounded-lg text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#BD8B52]" />
            Filters {hasActiveFilters && '(Active)'}
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737373] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#F5F1E8] border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#BD8B52]"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Outfit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar (Desktop) */}
        <aside
          className={`lg:block ${
            mobileFilterOpen ? 'block' : 'hidden'
          } bg-white border border-[#E5E0D8] rounded-xl p-6 space-y-6 h-fit shadow-sm`}
        >
          <div className="flex items-center justify-between pb-4 border-b border-[#F5F1E8]">
            <h3 className="font-bold text-sm text-[#171717] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#BD8B52]" /> Filter Catalog
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] text-[#BD8B52] hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Reset All
              </button>
            )}
          </div>

          {/* Max Budget Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
              Max Outfit Budget
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[1000, 1500, 2500, 5000].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setMaxBudget(maxBudget === b ? '' : b)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    maxBudget === b
                      ? 'border-[#BD8B52] bg-[#BD8B52] text-white font-bold'
                      : 'border-[#E5E0D8] bg-[#FDFBF7] text-[#555] hover:border-[#BD8B52]'
                  }`}
                >
                  Under {formatINR(b)}
                </button>
              ))}
            </div>
          </div>

          {/* Occasion Filter */}
          <div className="space-y-2 pt-2 border-t border-[#F5F1E8]">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
              Occasion
            </label>
            <div className="space-y-1">
              {occasions.map((occ) => (
                <button
                  key={occ}
                  type="button"
                  onClick={() => setOccasion(occasion === occ ? '' : occ)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    occasion === occ
                      ? 'bg-[#171717] text-white font-bold'
                      : 'text-[#555] hover:bg-[#F5F1E8]'
                  }`}
                >
                  <span>{occ}</span>
                  {occasion === occ && <span className="text-[#BD8B52]">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Style Filter */}
          <div className="space-y-2 pt-2 border-t border-[#F5F1E8]">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
              Style Persona
            </label>
            <div className="space-y-1">
              {styles.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(style === s ? '' : s)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    style === s
                      ? 'bg-[#171717] text-white font-bold'
                      : 'text-[#555] hover:bg-[#F5F1E8]'
                  }`}
                >
                  <span>{s}</span>
                  {style === s && <span className="text-[#BD8B52]">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Fit Filter */}
          <div className="space-y-2 pt-2 border-t border-[#F5F1E8]">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
              Fit & Cut
            </label>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {fits.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFit(fit === f ? '' : f)}
                  className={`py-1.5 px-2 rounded-lg border text-center transition-all ${
                    fit === f
                      ? 'border-[#BD8B52] bg-[#BD8B52] text-white font-bold'
                      : 'border-[#E5E0D8] bg-[#FDFBF7] text-[#555] hover:border-[#BD8B52]'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Colour Filter */}
          <div className="space-y-2 pt-2 border-t border-[#F5F1E8]">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
              Primary Colour
            </label>
            <div className="flex flex-wrap gap-1.5">
              {colours.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColour(colour === c ? '' : c)}
                  className={`px-2.5 py-1 rounded-full text-[11px] border transition-all ${
                    colour === c
                      ? 'bg-[#171717] text-white border-[#171717] font-semibold'
                      : 'bg-white text-[#737373] border-[#E5E0D8] hover:border-[#BD8B52]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Outfits Grid & Results Header */}
        <main className="lg:col-span-3 space-y-6">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>
              Showing <strong className="text-[#171717]">{filteredOutfits.length}</strong>{' '}
              {filteredOutfits.length === 1 ? 'outfit combination' : 'outfit combinations'}
            </span>
            {hasActiveFilters && (
              <span className="text-[#BD8B52] font-semibold">Filtered results</span>
            )}
          </div>

          {/* Outfits Grid */}
          {filteredOutfits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOutfits.map((outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          ) : outfits.length === 0 ? (
            /* Luxury Drop Announcement Empty State */
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-10 sm:p-14 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-[#171717] text-[#BD8B52] border border-[#BD8B52]/30 flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="w-7 h-7" />
              </div>
              <span className="text-[10px] font-black tracking-[0.25em] uppercase text-[#BD8B52] block">
                Curated Catalog
              </span>
              <h3 className="text-2xl font-black text-[#171717]">New Season Looks Dropping Shortly</h3>
              <p className="text-xs sm:text-sm text-[#737373] max-w-md mx-auto leading-relaxed">
                Our tailored menswear capsules are currently being assembled in our studio. Explore our garment archive or contact our customer care team for sizing recommendations.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/find-my-look"
                  className="px-6 py-3 bg-[#BD8B52] hover:bg-[#A3743E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Take Style Quiz
                </Link>
                <Link
                  href="/trends"
                  className="px-6 py-3 bg-[#171717] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md inline-flex items-center gap-2"
                >
                  Explore Trends
                </Link>
              </div>
              {user?.role === 'admin' && (
                <div className="pt-4 border-t border-[#F5F1E8]">
                  <Link
                    href="/admin/outfits"
                    className="text-[11px] font-bold text-[#BD8B52] hover:underline inline-flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Staff Portal: Add Look
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Filter Mismatch Empty State */
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F5F1E8] text-[#BD8B52] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#171717]">No outfits match your exact filters</h3>
              <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed">
                Try widening your budget range or clearing some style preferences to discover more verified looks.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 bg-[#BD8B52] hover:bg-[#A3743E] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
