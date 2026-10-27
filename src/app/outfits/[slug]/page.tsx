'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/store/demo-context';
import { useCart, ClothingSize } from '@/lib/store/cart-context';
import ProductCard from '@/components/products/ProductCard';
import OutfitCard from '@/components/outfits/OutfitCard';
import { formatCurrencyINR, calculateOutfitTotal } from '@/lib/utils/formatters';
import {
  Heart,
  Share2,
  Sparkles,
  ArrowLeft,
  Info,
  Clock,
  ShoppingBag,
  RotateCcw,
  Truck,
  ShieldCheck,
  Play,
  Check,
} from 'lucide-react';

interface OutfitDetailPageProps {
  params: Promise<{ slug: string }>;
}

function OutfitDetailContent({ params }: OutfitDetailPageProps) {
  const { slug } = use(params);
  const { outfits, isSaved, toggleSaveOutfit, addRecentlyViewed } = useDemoStore();
  const { addEntireOutfit } = useCart();
  const [mounted, setMounted] = useState(false);
  const [activeMediaTab, setActiveMediaTab] = useState<'photo' | 'video'>('photo');
  const [selectedBundleSize, setSelectedBundleSize] = useState<ClothingSize>('M');
  const [bundleAdded, setBundleAdded] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const outfit = outfits.find((o) => o.slug === slug);
  const outfitId = outfit?.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (outfitId) {
      addRecentlyViewed(outfitId);
    }
  }, [outfitId]);

  if (!outfit) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#171717]">Outfit Not Found</h2>
        <p className="text-xs text-[#737373]">
          The outfit combination you are looking for may have been archived or unpublished.
        </p>
        <Link
          href="/outfits"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#BD8B52] text-white rounded-lg text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Browse Catalog
        </Link>
      </div>
    );
  }

  const saved = mounted ? isSaved(outfit.id) : false;
  const totalPrice = calculateOutfitTotal(outfit.products);
  const relatedOutfits = outfits
    .filter((o) => o.id !== outfit.id && (o.occasion === outfit.occasion || o.style === outfit.style))
    .slice(0, 3);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: outfit.title,
        text: `Check out this curated outfit breakdown on TRENRO: ${outfit.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Back to Catalog Breadcrumb */}
      <div>
        <Link
          href="/outfits"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#BD8B52] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover Outfits
        </Link>
      </div>

      {/* Main Outfit Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Outfit Photography & Video Showcase */}
        <div className="lg:col-span-5 space-y-4">
          {outfit.video_url && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveMediaTab('photo')}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeMediaTab === 'photo'
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'bg-[#F5F1E8] text-[#737373] hover:text-[#171717]'
                }`}
              >
                Editorial Photo
              </button>
              <button
                type="button"
                onClick={() => setActiveMediaTab('video')}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 ${
                  activeMediaTab === 'video'
                    ? 'bg-[#BD8B52] text-white shadow-sm'
                    : 'bg-[#F5F1E8] text-[#737373] hover:text-[#171717]'
                }`}
              >
                <Play className="w-3 h-3 fill-current" /> Runway Preview
              </button>
            </div>
          )}

          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-[#F5F1E8] border border-[#E5E0D8] shadow-md relative">
            {activeMediaTab === 'video' && outfit.video_url ? (
              <video
                src={outfit.video_url}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={outfit.cover_image_url}
                alt={outfit.title}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-[#171717]/85 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/10">
                {outfit.occasion}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Outfit Metadata & Total Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#BD8B52] font-bold uppercase tracking-wider">
                {outfit.style} Style
              </span>
              <span className="text-[#A3A3A3]">•</span>
              <span className="text-[#737373]">{outfit.fit} Fit</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
              {outfit.title}
            </h1>

            <p className="text-sm text-[#737373] leading-relaxed">
              {outfit.description}
            </p>
          </div>

          {/* Color Tags */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#737373] block">
              Color Palette:
            </span>
            <div className="flex flex-wrap gap-2">
              {outfit.colour_tags.map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-[#F5F1E8] border border-[#E5E0D8] rounded-full text-xs font-medium text-[#171717]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Calculated Look Total & Direct Add to Bag */}
          <div className="p-6 bg-[#171717] text-white rounded-2xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
              <div>
                <span className="text-[10px] text-[#BD8B52] uppercase tracking-[0.2em] font-bold block">
                  Complete Look Total
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {formatCurrencyINR(totalPrice)}
                </span>
              </div>

              <div className="text-right text-xs text-[#A3A3A3]">
                <span className="block font-semibold text-white">
                  {outfit.products?.length || 0} TRENRO Garments
                </span>
                <span className="text-[11px] text-[#15803D] font-bold">Free Express Shipping</span>
              </div>
            </div>

            {/* Bundle Size Selector & Add to Bag CTA */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A3A3A3] font-semibold">Select Bundle Size:</span>
                <div className="flex gap-1.5">
                  {(['S', 'M', 'L', 'XL', 'XXL'] as ClothingSize[]).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedBundleSize(sz)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all ${
                        selectedBundleSize === sz
                          ? 'bg-[#BD8B52] text-white border-[#BD8B52]'
                          : 'bg-[#262626] text-[#D4D4D4] border-[#404040] hover:border-[#BD8B52]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  addEntireOutfit(outfit, selectedBundleSize);
                  setBundleAdded(true);
                  setTimeout(() => setBundleAdded(false), 2000);
                }}
                className={`w-full py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 ${
                  bundleAdded
                    ? 'bg-[#15803D] text-white'
                    : 'bg-[#BD8B52] hover:bg-[#A8743D] text-white'
                }`}
              >
                {bundleAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Complete Look Added to Bag!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add Complete Look to Bag ({formatCurrencyINR(totalPrice)})</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons: Save & Share */}
            <div className="flex items-center gap-3 pt-1 border-t border-[#2A2A2A]">
              <button
                type="button"
                onClick={() => toggleSaveOutfit(outfit.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  saved
                    ? 'bg-[#262626] text-[#BD8B52] border border-[#BD8B52]'
                    : 'bg-[#262626] hover:bg-[#333] border border-[#404040] text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${saved ? 'fill-current text-[#BD8B52]' : ''}`} />
                {saved ? 'Saved in Wardrobe' : 'Save Look'}
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-4 py-2.5 bg-[#262626] hover:bg-[#333] border border-[#404040] text-[#D4D4D4] hover:text-white rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
                title="Share Outfit"
              >
                {shareCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* TRENRO Brand Promise Box */}
          <div className="p-5 bg-white rounded-2xl border border-[#E5E0D8] shadow-2xs space-y-3 text-xs text-[#525252]">
            <p className="font-bold text-[#171717] flex items-center gap-2 text-sm">
              <ShieldCheck className="w-4 h-4 text-[#BD8B52]" />
              The TRENRO Brand Promise
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed pt-1">
              <div className="flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-[#BD8B52] shrink-0 mt-0.5" />
                <span><strong>7-Day Doorstep Exchange:</strong> Size doesn’t fit? Our courier brings your replacement directly.</span>
              </div>
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-[#BD8B52] shrink-0 mt-0.5" />
                <span><strong>Dispatched in 24 Hours:</strong> Express air courier across India with real-time SMS tracking.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Products Breakdown */}
      <section className="space-y-6 pt-6 border-t border-[#E5E0D8]">
        <div>
          <span className="text-[#BD8B52] text-xs font-bold tracking-[0.2em] uppercase">
            Curated Outfit Breakdown
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#171717] mt-1">
            Garments & Accessories in this Look
          </h2>
          <p className="text-xs text-[#737373] mt-1">
            Choose your size and add individual pieces or the complete look directly to your shopping bag.
          </p>
        </div>

        {outfit.products && outfit.products.length > 0 ? (
          <div className="space-y-4">
            {outfit.products.map((item, index) => (
              <ProductCard
                key={index}
                product={item.product}
                outfitId={outfit.id}
                outfitTitle={outfit.title}
                showAlternativeOption={true}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-white border border-[#E5E0D8] rounded-xl text-center text-xs text-[#737373]">
            Product specifications currently unavailable.
          </div>
        )}
      </section>

      {/* Related Looks Suggestions */}
      {relatedOutfits.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-[#E5E0D8]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[#BD8B52] text-xs font-bold tracking-[0.2em] uppercase">
                Similar Aesthetics
              </span>
              <h2 className="text-2xl font-black text-[#171717] mt-1">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/outfits"
              className="text-xs font-bold text-[#BD8B52] hover:underline uppercase tracking-wider"
            >
              View More
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedOutfits.map((rel) => (
              <OutfitCard key={rel.id} outfit={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function OutfitDetailPage(props: OutfitDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#737373]">
          Loading outfit details...
        </div>
      }
    >
      <OutfitDetailContent {...props} />
    </Suspense>
  );
}
