'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDemoStore } from '@/lib/store/demo-context';
import { useCart, ClothingSize } from '@/lib/store/cart-context';
import OutfitCard from '@/components/outfits/OutfitCard';
import { formatCurrencyINR, isWithinBudget } from '@/lib/utils/formatters';
import { Product } from '@/types';
import {
  ArrowRight,
  ShoppingBag,
  RotateCcw,
  Truck,
  ShieldCheck,
  Check,
  Sparkles,
  Layers,
  Tag,
  Compass,
  Ruler,
  ChevronRight,
  Mail,
} from 'lucide-react';

const CATEGORY_PILLARS = [
  {
    name: 'Heavyweight T-Shirts',
    categoryQuery: 'T-Shirt',
    gsm: '240 – 280 GSM',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    description: 'Combed Indian cotton jersey with drop-shoulder cut that never sags.',
    count: '6 Styles',
  },
  {
    name: 'Camp-Collar Shirts',
    categoryQuery: 'Shirt',
    gsm: 'Pure Flax Linen & Cotton',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
    description: 'Breathable resort weaves, cuban collars, and textured waffle knits.',
    count: '5 Styles',
  },
  {
    name: 'Gurkha & Chino Trousers',
    categoryQuery: 'Trousers',
    gsm: 'Tailored Suiting Twill',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
    description: 'Double forward pleats, side adjusters, and peach-finish straight drapes.',
    count: '4 Styles',
  },
  {
    name: 'Outerwear & Jackets',
    categoryQuery: 'Jacket',
    gsm: '14oz Raw Denim & Canvas',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
    description: 'Stone-washed vintage truckers, utility overshirts, and chore coats.',
    count: '3 Styles',
  },
];

export default function HomePage() {
  const { products, outfits } = useDemoStore();
  const { addToCart } = useCart();

  const [cardSizes, setCardSizes] = useState<Record<string, ClothingSize>>({});
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // New season products (first 4)
  const newSeasonDrops = products.slice(0, 4);

  // Featured capsule outfits (first 3)
  const featuredLookbook = outfits.slice(0, 3);

  const handleCardSizeSelect = (productId: string, size: ClothingSize) => {
    setCardSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleQuickAdd = (product: Product) => {
    const chosenSize = cardSizes[product.id] || (product.sizes?.[0] as ClothingSize) || 'M';
    addToCart(product, chosenSize, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubmitted(false), 4000);
    }
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-20">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative bg-[#171717] text-[#F6F3ED] overflow-hidden py-20 sm:py-28 border-b border-[#2A2A2A]">
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute -top-24 right-1/4 w-[500px] h-[500px] bg-[#72785B] rounded-full blur-[140px]" />
          <div className="absolute bottom-0 left-12 w-[400px] h-[400px] bg-[#BD8B52]/30 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#262626] border border-[#72785B]/50 text-[#F6F3ED] text-[11px] font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-[#72785B] animate-pulse" />
                Original Menswear Atelier &bull; Autumn / Winter Drop
              </div>

              <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-[#FFFFFF] uppercase">
                WEAR THE TREND.{' '}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#F6F3ED] via-[#BD8B52] to-[#72785B]">
                  OWN THE LOOK.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-[#A3A3A3] max-w-xl leading-relaxed">
                Original contemporary menswear engineered for Indian climate and modern street drape. Heavyweight 240–280 GSM cottons, French flax linens, and tailored Gurkha silhouettes.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/shop"
                  className="px-8 py-4 bg-[#F6F3ED] hover:bg-[#FFFFFF] text-[#171717] text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2.5 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-[#72785B]" /> Shop New Drops
                </Link>

                <Link
                  href="/outfits"
                  className="px-8 py-4 bg-[#262626] hover:bg-[#333] border border-[#404040] text-[#F6F3ED] text-xs font-black uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                >
                  View Lookbook <ArrowRight className="w-4 h-4 text-[#72785B]" />
                </Link>
              </div>

              {/* Value Pillars */}
              <div className="pt-8 border-t border-[#2A2A2A] grid grid-cols-3 gap-6 text-xs text-[#A3A3A3]">
                <div>
                  <strong className="block text-white font-black text-sm sm:text-base">240–280 GSM</strong>
                  <span className="text-[11px]">Structured Heavy Cottons</span>
                </div>
                <div>
                  <strong className="block text-white font-black text-sm sm:text-base">Drop Shoulder</strong>
                  <span className="text-[11px]">Tailored Indian Proportions</span>
                </div>
                <div>
                  <strong className="block text-white font-black text-sm sm:text-base">7-Day Trial</strong>
                  <span className="text-[11px]">Doorstep Size Exchange</span>
                </div>
              </div>
            </div>

            {/* Right Hero Feature Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-fashion max-w-md mx-auto rounded-3xl overflow-hidden border border-[#333] shadow-2xl bg-[#262626]">
                <Image
                  src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&auto=format&fit=crop&q=80"
                  alt="TRENRO Menswear Campaign"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Floating Garment Spec Card */}
                <div className="absolute bottom-5 left-5 right-5 bg-[#171717]/95 backdrop-blur-md border border-white/10 p-5 rounded-2xl text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#BD8B52]">
                      Signature Silhouette
                    </span>
                    <span className="text-xs font-mono font-bold text-white">₹1,299</span>
                  </div>
                  <h4 className="text-sm font-bold text-white leading-snug">
                    TRENRO Relaxed Olive Cuban Collar Resort Shirt
                  </h4>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#A3A3A3]">
                    <span>Breathable Linen-Cotton Blend</span>
                    <Link href="/shop?category=Shirt" className="text-xs text-[#F6F3ED] font-bold hover:underline inline-flex items-center gap-1">
                      Shop Fit <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY PILLARS DISCOVERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E3D9] pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#72785B]">
              The Core Wardrobe
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#171717]">
              Crafted by Apparel Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-widest text-[#72785B] hover:text-[#171717] transition-colors inline-flex items-center gap-1.5"
          >
            View Complete Archive <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORY_PILLARS.map((col) => (
            <Link
              key={col.name}
              href={`/shop?category=${encodeURIComponent(col.categoryQuery)}`}
              className="group bg-[#FFFFFF] border border-[#E8E3D9] rounded-3xl overflow-hidden hover:border-[#171717] hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div className="relative aspect-fashion bg-[#F6F3ED] overflow-hidden">
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#171717]/85 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider rounded">
                  {col.gsm}
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs text-[#171717] text-[9px] font-bold uppercase tracking-wider rounded">
                  {col.count}
                </div>
              </div>

              <div className="p-5 space-y-1.5">
                <h3 className="font-bold text-base text-[#171717] group-hover:text-[#72785B] transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
                <div className="pt-2 flex items-center text-xs font-bold text-[#171717] group-hover:translate-x-1 transition-transform">
                  Browse Garments <ArrowRight className="w-3.5 h-3.5 ml-1 text-[#72785B]" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. NEW SEASON GARMENT DROPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E8E3D9] pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#72785B]">
              Fresh Off The Line
            </span>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#171717]">
              New Season Drops
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-widest text-[#72785B] hover:text-[#171717] transition-colors inline-flex items-center gap-1.5"
          >
            Explore All New Pieces <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {newSeasonDrops.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-3xl p-10 sm:p-14 text-center space-y-4">
            <div className="w-12 h-12 bg-[#F6F3ED] text-[#72785B] rounded-2xl flex items-center justify-center mx-auto border border-[#E8E3D9]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-black text-[#171717] tracking-tight">
                Inaugural Garments in Production
              </h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                Our core drops of 240–280 GSM heavyweight tees and camp-collar French linen shirts are being tailored.
                New pieces will appear here as soon as they are published by our studio team.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Inquire with Atelier <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newSeasonDrops.map((product) => {
            const sizesList = (product.sizes as ClothingSize[]) || ['S', 'M', 'L', 'XL'];
            const currentSelectedSize = cardSizes[product.id] || sizesList[0] || 'M';
            const isJustAdded = addedProductId === product.id;

            return (
              <div
                key={product.id}
                className="group bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#171717] hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <Link href={`/products/${product.id}`} className="block relative aspect-fashion bg-[#F6F3ED] overflow-hidden">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#171717]/90 text-white text-[9px] font-bold uppercase tracking-wider rounded">
                      {product.category}
                    </div>
                  </Link>

                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#72785B]">
                        TRENRO Atelier
                      </span>
                      <Link href={`/products/${product.id}`}>
                        <h4 className="text-sm font-bold text-[#171717] leading-snug line-clamp-2 hover:text-[#72785B] transition-colors">
                          {product.name}
                        </h4>
                      </Link>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-[#171717]">
                        {formatCurrencyINR(product.price_inr)}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price_inr && (
                        <span className="text-xs text-[#737373] line-through">
                          {formatCurrencyINR(product.compare_at_price)}
                        </span>
                      )}
                    </div>

                    {/* Quick Size Select */}
                    <div className="pt-2 border-t border-[#F6F3ED] space-y-1">
                      <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">
                        Fit Size:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {sizesList.map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleCardSizeSelect(product.id, sz)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                              currentSelectedSize === sz
                                ? 'bg-[#171717] text-white border-[#171717]'
                                : 'bg-[#F6F3ED] text-[#525252] border-[#E8E3D9]'
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

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
      </section>

      {/* 4. HEAD-TO-TOE CAPSULE LOOKBOOK */}
      <section className="bg-[#171717] text-[#F6F3ED] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#BD8B52]">
                Complete Capsule Wardrobes
              </span>
              <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                Curated Head-To-Toe Looks
              </h2>
            </div>
            <Link
              href="/outfits"
              className="text-xs font-bold uppercase tracking-widest text-[#BD8B52] hover:text-white transition-colors inline-flex items-center gap-1.5"
            >
              Browse Complete Lookbook <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredLookbook.length === 0 ? (
            <div className="bg-[#242424] border border-[#333] rounded-3xl p-10 text-center space-y-3">
              <span className="text-[10px] font-bold text-[#BD8B52] uppercase tracking-widest">Atelier Capsules</span>
              <h3 className="text-lg font-bold text-white">Lookbooks Curating Soon</h3>
              <p className="text-xs text-[#A3A3A3] max-w-md mx-auto leading-relaxed">
                Full-ensemble silhouette pairings and styling notes will be unveiled with our collection launch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredLookbook.map((outfit) => (
                <OutfitCard key={outfit.id} outfit={outfit} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. THE TRENRO CRAFTSMANSHIP & ATELIER STORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-3xl p-8 sm:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center shadow-xs">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#72785B]">
              The TRENRO Standard
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#171717] leading-tight">
              We Don't Make Flimsy Tees.<br />We Build Modern Uniforms.
            </h2>
            <p className="text-sm text-[#525252] leading-relaxed">
              Most fast-fashion garments sold in India shrink after the first wash, lose collar tension, and use featherweight 140 GSM polyester blends. TRENRO was born to solve this: crafting heavyweight 240–280 GSM combed Indian cottons, pure European flax linens, and tailored Gurkha waistbands that hold their shape.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="p-4 bg-[#F6F3ED] rounded-2xl border border-[#E8E3D9] space-y-1">
                <strong className="text-[#171717] font-bold block">Reinforced Double-Stitch Neckbands</strong>
                <p className="text-[#737373]">Engineered ribbed collars that stay crisp through 50+ wash cycles without sagging.</p>
              </div>
              <div className="p-4 bg-[#F6F3ED] rounded-2xl border border-[#E8E3D9] space-y-1">
                <strong className="text-[#171717] font-bold block">7-Day Doorstep Trial Guarantee</strong>
                <p className="text-[#737373]">Try the fit at home. If the drape isn't exact, we pick it up and swap the size at your door.</p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#171717] hover:text-[#72785B] transition-colors"
              >
                Read Our Story & Fabric Standards <ArrowRight className="w-3.5 h-3.5 text-[#72785B]" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 relative aspect-square rounded-2xl overflow-hidden border border-[#E8E3D9] bg-[#F6F3ED]">
            <Image
              src="https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=80"
              alt="TRENRO Atelier Tailoring"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
        </div>
      </section>

      {/* 6. NEWSLETTER & PRIVATE DROP ACCESS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#72785B]">
            Private Capsule Access
          </span>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-[#171717]">
            Be First In Line for Limited Batch Drops
          </h2>
          <p className="text-xs sm:text-sm text-[#737373] max-w-md mx-auto">
            We produce in small, considered batches to prevent excess. Receive private early access 24 hours before public launch.
          </p>
        </div>

        <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
          <div className="relative flex-1 w-full">
            <Mail className="w-4 h-4 text-[#737373] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] placeholder:text-[#737373] focus:outline-none focus:border-[#171717]"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            Join Drop List
          </button>
        </form>

        {newsletterSubmitted && (
          <p className="text-xs text-emerald-800 font-bold bg-emerald-50 py-2 px-4 rounded-xl inline-block border border-emerald-200">
            Thank you! You have been added to the TRENRO private drop list.
          </p>
        )}
      </section>

      {/* 7. D2C STORE PROMISE STRIP */}
      <section className="border-t border-[#E8E3D9] pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#E8E3D9] flex items-center justify-center shrink-0 text-[#72785B] shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#171717]">Complimentary Express Air Delivery</h4>
              <p className="text-xs text-[#737373]">Free tracked air courier across India on all orders over ₹999.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#E8E3D9] flex items-center justify-center shrink-0 text-[#72785B] shadow-xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#171717]">7-Day Doorstep Size Trial</h4>
              <p className="text-xs text-[#737373]">Hassle-free doorstep exchanges if you desire a different silhouette or fit.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFFFFF] border border-[#E8E3D9] flex items-center justify-center shrink-0 text-[#72785B] shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#171717]">Direct-to-Consumer Integrity</h4>
              <p className="text-xs text-[#737373]">No middlemen markups. Every rupee is invested in custom fabric weights and tailoring.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
