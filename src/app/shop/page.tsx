'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useDemoStore } from '@/lib/store/demo-context';
import { useCart, ClothingSize } from '@/lib/store/cart-context';
import { formatCurrencyINR } from '@/lib/utils/formatters';
import { Product } from '@/types';
import {
  Filter,
  SlidersHorizontal,
  X,
  Search,
  ShoppingBag,
  Check,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'On Sale 🔥',
  'T-Shirt',
  'Shirt',
  'Trousers',
  'Jacket',
  'Footwear',
];

const ALL_SIZES: ClothingSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

function ShopCatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const { products } = useDemoStore();
  const { addToCart } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [selectedSizes, setSelectedSizes] = useState<ClothingSize[]>([]);
  const [priceRange, setPriceRange] = useState<'all' | 'under1000' | '1000-2000' | 'above2000'>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'name'>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  // Quick size selection per card
  const [cardSizes, setCardSizes] = useState<Record<string, ClothingSize>>({});

  const toggleSize = (size: ClothingSize) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleCardSizeSelect = (productId: string, size: ClothingSize) => {
    setCardSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleQuickAdd = (product: Product) => {
    const chosenSize = cardSizes[product.id] || (product.sizes?.[0] as ClothingSize) || 'M';
    addToCart(product, chosenSize, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Category & On Sale filter
      if (selectedCategory === 'On Sale 🔥' || selectedCategory === 'On Sale') {
        if (!prod.compare_at_price || prod.compare_at_price <= prod.price_inr) return false;
      } else if (selectedCategory !== 'All') {
        const prodCat = (prod.category || '').toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        if (!prodCat.includes(selCat)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = prod.name.toLowerCase().includes(q);
        const matchDesc = (prod.description || '').toLowerCase().includes(q);
        const matchCat = prod.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }

      // Size filter
      if (selectedSizes.length > 0) {
        const prodSizes = prod.sizes || ['S', 'M', 'L', 'XL'];
        const hasSize = selectedSizes.some((s) => prodSizes.includes(s));
        if (!hasSize) return false;
      }

      // Price filter
      if (priceRange === 'under1000' && prod.price_inr >= 1000) return false;
      if (priceRange === '1000-2000' && (prod.price_inr < 1000 || prod.price_inr > 2000)) return false;
      if (priceRange === 'above2000' && prod.price_inr <= 2000) return false;

      // In stock
      if (inStockOnly && prod.availability_status === 'out_of_stock') return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') return a.price_inr - b.price_inr;
      if (sortBy === 'price_high') return b.price_inr - a.price_inr;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, selectedCategory, searchQuery, selectedSizes, priceRange, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSelectedSizes([]);
    setPriceRange('all');
    setInStockOnly(false);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Editorial Header */}
      <div className="border-b border-[#E8E3D9] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#72785B]">
            TRENRO Menswear Collection
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight leading-none uppercase">
            The Apparel Archive
          </h1>
          <p className="text-sm text-[#737373] max-w-xl">
            Signature heavyweight cottons, relaxed camp-collars, and tailored silhouettes engineered for Indian climate and modern streetwear drape.
          </p>
        </div>

        {/* Category Pills Header */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#171717] text-[#F6F3ED] shadow-sm'
                  : 'bg-[#FFFFFF] text-[#525252] border border-[#E8E3D9] hover:border-[#171717]'
              }`}
            >
              {cat === 'All' ? 'All Garments' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Control Bar: Search, Filters Trigger, Count, Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#FFFFFF] border border-[#E8E3D9] p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by garment name, fabric, or style..."
              className="w-full pl-9 pr-4 py-2 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none focus:border-[#72785B]"
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#737373] hover:text-[#171717] font-semibold cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 px-4 py-2 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs font-bold text-[#171717] cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#72785B]" />
            Filters {selectedSizes.length > 0 && `(${selectedSizes.length})`}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#737373] uppercase hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs font-bold text-[#171717] focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured Collection</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name">Garment Name (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Desktop Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl p-6 space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-4 border-b border-[#F6F3ED]">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#171717] flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#72785B]" /> Filter Catalog
            </h3>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] font-bold uppercase tracking-wider text-[#72785B] hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Size Filter Matrix */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#171717] block">
              Menswear Size
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {ALL_SIZES.map((sz) => {
                const active = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#171717] text-white border-[#171717]'
                        : 'bg-[#F6F3ED] text-[#525252] border-[#E8E3D9] hover:border-[#171717]'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-[#F6F3ED]">
            <label className="text-xs font-bold uppercase tracking-wider text-[#171717] block">
              Price Bracket
            </label>
            <div className="space-y-2 text-xs text-[#525252]">
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under1000', label: 'Under ₹1,000' },
                { id: '1000-2000', label: '₹1,000 – ₹2,000' },
                { id: 'above2000', label: 'Above ₹2,000' },
              ].map((tier) => (
                <label key={tier.id} className="flex items-center gap-2 cursor-pointer hover:text-[#171717]">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={priceRange === tier.id}
                    onChange={() => setPriceRange(tier.id as any)}
                    className="accent-[#171717]"
                  />
                  <span>{tier.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div className="pt-4 border-t border-[#F6F3ED]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#171717]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="accent-[#72785B] rounded"
              />
              <span>In Stock Only (Ready to Dispatch)</span>
            </label>
          </div>

          {/* Trust Banner */}
          <div className="p-4 bg-[#F6F3ED] rounded-xl space-y-2 border border-[#E8E3D9] text-[11px] text-[#737373]">
            <div className="flex items-center gap-2 font-bold text-[#171717]">
              <RotateCcw className="w-3.5 h-3.5 text-[#72785B]" /> 7-Day Doorstep Trial
            </div>
            <p>Order your preferred size with total peace of mind. Doorstep exchange provided across India.</p>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs text-[#737373]">
            <span>
              Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'garment' : 'garments'}
            </span>
            {selectedCategory !== 'All' && (
              <span className="font-semibold text-[#171717]">
                Category: <strong>{selectedCategory}</strong>
              </span>
            )}
          </div>

          {products.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-3xl p-12 sm:p-16 text-center space-y-5">
              <div className="w-16 h-16 bg-[#F6F3ED] text-[#72785B] rounded-2xl flex items-center justify-center mx-auto border border-[#E8E3D9]">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#72785B]">
                  Inaugural Drop
                </span>
                <h3 className="text-2xl font-black text-[#171717] tracking-tight">
                  Collection In Final Preparation
                </h3>
                <p className="text-xs text-[#737373] leading-relaxed">
                  The TRENRO inaugural menswear collection is currently in final finishing at our studio atelier.
                  New heavyweight t-shirts, french linen shirts, and tailored trousers will be published here shortly.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/contact"
                  className="px-6 py-3 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Contact Client Concierge (rasu29906@gmail.com)
                </Link>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-[#F6F3ED] rounded-full flex items-center justify-center mx-auto text-[#737373]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#171717]">No garments match your filters</h3>
                <p className="text-xs text-[#737373] max-w-sm mx-auto">
                  Try clearing some filter options or reset to view all available pieces in our archive.
                </p>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-2.5 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => {
                const sizesList = (product.sizes as ClothingSize[]) || ALL_SIZES;
                const currentSelectedSize = cardSizes[product.id] || sizesList[0] || 'M';
                const isJustAdded = addedProductId === product.id;

                return (
                  <div
                    key={product.id}
                    className="group bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#171717] hover:shadow-lg transition-all duration-300"
                  >
                    <div>
                      {/* Product Image Frame */}
                      <Link href={`/products/${product.id}`} className="block relative aspect-fashion bg-[#F6F3ED] overflow-hidden">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          <span className="px-2.5 py-1 bg-[#171717]/90 backdrop-blur-xs text-[#F6F3ED] text-[9px] font-black uppercase tracking-wider rounded">
                            {product.category}
                          </span>
                        </div>
                        {product.compare_at_price && product.compare_at_price > product.price_inr && (
                          <div className="absolute top-3 right-3 px-2.5 py-1 bg-rose-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-sm">
                            {Math.round(((product.compare_at_price - product.price_inr) / product.compare_at_price) * 100)}% OFF
                          </div>
                        )}
                      </Link>

                      {/* Content Details */}
                      <div className="p-5 space-y-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#72785B]">
                            TRENRO Original
                          </span>
                          <Link href={`/products/${product.id}`}>
                            <h4 className="text-sm font-bold text-[#171717] leading-snug line-clamp-2 hover:text-[#72785B] transition-colors">
                              {product.name}
                            </h4>
                          </Link>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-base font-black text-[#171717]">
                            {formatCurrencyINR(product.price_inr)}
                          </span>
                          {product.compare_at_price && product.compare_at_price > product.price_inr && (
                            <>
                              <span className="text-xs text-[#737373] line-through font-medium">
                                {formatCurrencyINR(product.compare_at_price)}
                              </span>
                              <span className="text-[10px] font-bold text-rose-600">
                                ({Math.round(((product.compare_at_price - product.price_inr) / product.compare_at_price) * 100)}% OFF)
                              </span>
                            </>
                          )}
                        </div>

                        {/* Size Selection */}
                        <div className="pt-2 border-t border-[#F6F3ED] space-y-1.5">
                          <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">
                            Select Fit:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {sizesList.map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => handleCardSizeSelect(product.id, sz)}
                                className={`px-2 py-1 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                                  currentSelectedSize === sz
                                    ? 'bg-[#171717] text-white border-[#171717]'
                                    : 'bg-[#F6F3ED] text-[#525252] border-[#E8E3D9] hover:border-[#171717]'
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Add To Bag Action */}
                    <div className="p-5 pt-0">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                          isJustAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#171717] hover:bg-[#72785B] text-white'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-4 h-4" /> Added Size {currentSelectedSize}
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" /> Add to Bag ({currentSelectedSize})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-[#FFFFFF] h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E3D9]">
              <h3 className="font-bold text-sm text-[#171717] uppercase tracking-wider">
                Filter Menswear
              </h3>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-[#737373] hover:text-[#171717]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sizes */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#171717] block">
                Size
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {ALL_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => toggleSize(sz)}
                    className={`py-2 text-xs font-bold rounded-lg border ${
                      selectedSizes.includes(sz)
                        ? 'bg-[#171717] text-white border-[#171717]'
                        : 'bg-[#F6F3ED] text-[#525252] border-[#E8E3D9]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2 pt-4 border-t border-[#F6F3ED] text-xs">
              <label className="font-bold uppercase tracking-wider text-[#171717] block">
                Price
              </label>
              {[
                { id: 'all', label: 'All Prices' },
                { id: 'under1000', label: 'Under ₹1,000' },
                { id: '1000-2000', label: '₹1,000 – ₹2,000' },
                { id: 'above2000', label: 'Above ₹2,000' },
              ].map((tier) => (
                <label key={tier.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="mobilePriceRange"
                    checked={priceRange === tier.id}
                    onChange={() => setPriceRange(tier.id as any)}
                    className="accent-[#171717]"
                  />
                  <span>{tier.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#171717] text-white text-xs font-bold uppercase tracking-widest rounded-xl"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-[#737373]">
          Loading TRENRO garment archive...
        </div>
      }
    >
      <ShopCatalogContent />
    </Suspense>
  );
}
