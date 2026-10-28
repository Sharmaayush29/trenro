'use client';

import React, { useState, use, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, useRouter } from 'next/navigation';
import { useDemoStore } from '@/lib/store/demo-context';
import { useCart, ClothingSize } from '@/lib/store/cart-context';
import { formatCurrencyINR } from '@/lib/utils/formatters';
import {
  ShoppingBag,
  Check,
  RotateCcw,
  Truck,
  ShieldCheck,
  Ruler,
  ChevronRight,
  Minus,
  Plus,
  Play,
  Share2,
  X,
  HelpCircle,
  CreditCard,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

function ProductDetailContent({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { products, user } = useDemoStore();
  const { addToCart } = useCart();

  // Find product by id or slug
  const product = products.find((p) => p.id === id || p.slug === id);

  if (!product) {
    notFound();
  }

  const availableSizes: ClothingSize[] = (product.sizes as ClothingSize[]) || ['S', 'M', 'L', 'XL', 'XXL'];
  const [selectedSize, setSelectedSize] = useState<ClothingSize>(availableSizes[0] || 'M');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isAdded, setIsAdded] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Gallery view badges
  const viewLabels = ['Front', 'Back', 'Profile', 'Texture', 'Model Fit'];

  // Gallery images array
  const allImages = [
    product.image_url,
    ...(product.images || []),
  ].filter(Boolean);

  const activeImage = allImages[selectedImageIndex] || product.image_url;

  const handleAddToCart = () => {
    addToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, quantity);
    if (!user) {
      router.push('/login?redirect=/checkout&action=buy_now&reason=auth_required');
    } else {
      router.push('/checkout');
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Related products from same category or style
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === 'TRENRO'))
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#737373]">
        <Link href="/" className="hover:text-[#171717] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-[#A3A3A3]" />
        <Link href="/shop" className="hover:text-[#171717] transition-colors">Shop</Link>
        <ChevronRight className="w-3 h-3 text-[#A3A3A3]" />
        <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-[#171717] transition-colors">
          {product.category}
        </Link>
        <ChevronRight className="w-3 h-3 text-[#A3A3A3]" />
        <span className="font-semibold text-[#171717] truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4 items-start">
          {/* Thumbnails Rail */}
          {allImages.length > 1 && (
            <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[580px] w-full sm:w-20 shrink-0 scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#171717] shadow-sm'
                      : 'border-[#E8E3D9] opacity-70 hover:opacity-100 hover:border-[#72785B]'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - ${viewLabels[idx] || `View ${idx + 1}`}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur-xs">
                    {viewLabels[idx] || `View ${idx + 1}`}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Primary Main Viewport */}
          <div className="relative aspect-fashion w-full bg-[#F6F3ED] rounded-3xl overflow-hidden border border-[#E8E3D9] shadow-xs group">
            <Image
              src={activeImage}
              alt={product.name}
              fill
              priority
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5">
              <span className="px-3 py-1 bg-[#171717]/90 backdrop-blur-xs text-[#F6F3ED] text-[10px] font-black uppercase tracking-widest rounded-full">
                TRENRO Atelier
              </span>
              {product.compare_at_price && product.compare_at_price > product.price_inr && (
                <span className="px-3 py-1 bg-[#72785B] text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs">
                  {Math.round(((product.compare_at_price - product.price_inr) / product.compare_at_price) * 100)}% Discount
                </span>
              )}
            </div>

            {/* Video preview hint if exists */}
            {product.video_url && (
              <a
                href={product.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171717]/80 backdrop-blur-md text-white text-[11px] font-bold rounded-full hover:bg-[#171717] transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-[#BD8B52]" /> Watch Garment Silhouette Video
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Garment Information & Purchase Panel */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          {/* Header & Title */}
          <div className="space-y-2 border-b border-[#E8E3D9] pb-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#72785B]">
                {product.category} &bull; TRENRO Original
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="p-2 text-[#737373] hover:text-[#171717] transition-colors rounded-full hover:bg-[#F6F3ED] cursor-pointer"
                title="Share garment"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight leading-tight">
              {product.name}
            </h1>

            {product.sku && (
              <p className="text-xs font-mono text-[#737373]">SKU: {product.sku}</p>
            )}

            {/* Pricing */}
            <div className="pt-2 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl font-black text-[#171717]">
                {formatCurrencyINR(product.price_inr)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price_inr && (
                <>
                  <span className="text-base text-[#737373] line-through font-medium">
                    {formatCurrencyINR(product.compare_at_price)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                    {Math.round(((product.compare_at_price - product.price_inr) / product.compare_at_price) * 100)}% OFF
                  </span>
                  <span className="text-xs font-bold text-rose-700">
                    Save {formatCurrencyINR(product.compare_at_price - product.price_inr)}
                  </span>
                </>
              )}
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Inclusive of all taxes
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Color Details if specified */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#171717] block">
                Colorway:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                {product.colors.map((c, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-[#FFFFFF] border border-[#E8E3D9] rounded-lg font-semibold text-[#171717]"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sizing Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#171717]">
                Select Fit / Size:
              </span>
              <button
                type="button"
                onClick={() => setSizeChartOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#72785B] hover:text-[#171717] transition-colors cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" /> Size Guide & Measurements
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {availableSizes.map((sz) => {
                const active = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`py-3 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                      active
                        ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                        : 'bg-[#FFFFFF] text-[#171717] border-[#E8E3D9] hover:border-[#171717]'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

            {/* Quantity, Add to Bag & Buy Now Controls */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Counter */}
                <div className="flex items-center border border-[#E8E3D9] rounded-xl bg-[#FFFFFF] px-2 py-1.5 shadow-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 text-[#737373] hover:text-[#171717] disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-black text-[#171717]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="p-1.5 text-[#737373] hover:text-[#171717] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Bag CTA */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                    isAdded
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-[#FFFFFF] text-[#171717] border-[#171717] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Shopping Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> Add to Bag &bull; Size {selectedSize}
                    </>
                  )}
                </button>
              </div>

              {/* Express Buy Now CTA */}
              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-4 px-6 rounded-xl text-xs sm:text-sm font-black uppercase tracking-widest bg-[#171717] hover:bg-[#BD8B52] text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md hover:shadow-lg"
              >
                <CreditCard className="w-4 h-4 text-[#BD8B52]" />
                <span>Buy Now &bull; Express Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          {/* D2C Doorstep Guarantees */}
          <div className="p-5 bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl space-y-3 text-xs text-[#525252]">
            <div className="flex items-center gap-3">
              <RotateCcw className="w-4 h-4 text-[#72785B] shrink-0" />
              <span><strong>7-Day Doorstep Size Trial:</strong> If the fit isn't perfect, we arrange a pickup and doorstep exchange.</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="w-4 h-4 text-[#72785B] shrink-0" />
              <span><strong>Complimentary Air Shipping:</strong> Free express delivery on orders over ₹999 across India.</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-[#72785B] shrink-0" />
              <span><strong>Authentic Indian Long-Staple Cotton:</strong> Bio-washed, pre-shrunk, engineered to retain collar structure.</span>
            </div>
          </div>

          {/* Fabric & Care Specs Accordion */}
          <div className="border-t border-[#E8E3D9] pt-4 space-y-3 text-xs">
            <h4 className="font-bold text-[#171717] uppercase tracking-wider">Garment Specifications</h4>
            <div className="space-y-2 text-[#525252] text-[11px] leading-relaxed">
              <p>
                <strong className="text-[#171717]">Fabric & Composition:</strong>{' '}
                {product.fabric_composition || '100% Combed Heavyweight Indian Cotton (260–280 GSM)'}
              </p>
              <p>
                <strong className="text-[#171717]">Silhouette & Fit:</strong>{' '}
                {product.fit || 'Relaxed Boxy Atelier Cut — Engineered Shoulder Drop'}
              </p>
              <p>
                <strong className="text-[#171717]">Care Instructions:</strong>{' '}
                {product.care_instructions || 'Machine wash cold with like colors. Do not bleach. Dry flat in shade. Warm iron inside-out.'}
              </p>
              {product.description && (
                <p className="pt-1 text-[#737373] border-t border-[#F5F1E8]">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Capsule Pieces */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-[#E8E3D9] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight text-[#171717]">
              Complete The TRENRO Look
            </h3>
            <Link href="/shop" className="text-xs font-bold uppercase tracking-wider text-[#72785B] hover:underline">
              View Entire Archive
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl overflow-hidden hover:border-[#171717] transition-all group"
              >
                <Link href={`/products/${rel.id}`} className="block relative aspect-fashion bg-[#F6F3ED]">
                  <Image src={rel.image_url} alt={rel.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>
                <div className="p-4 space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#72785B]">{rel.category}</span>
                  <Link href={`/products/${rel.id}`}>
                    <h5 className="font-bold text-xs text-[#171717] line-clamp-1 hover:text-[#72785B]">{rel.name}</h5>
                  </Link>
                  <p className="font-black text-sm text-[#171717]">{formatCurrencyINR(rel.price_inr)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Size Chart Modal */}
      {sizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setSizeChartOpen(false)}
              className="absolute top-5 right-5 p-2 text-[#737373] hover:text-[#171717] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#72785B]">TRENRO Atelier Guide</span>
              <h3 className="text-xl font-black uppercase text-[#171717]">Garment Size & Fit Chart</h3>
              <p className="text-xs text-[#737373]">Measurements are taken garment laid flat. Designed with contemporary drop-shoulder drape.</p>
            </div>

            <div className="overflow-x-auto border border-[#E8E3D9] rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F6F3ED] border-b border-[#E8E3D9] font-bold text-[#171717] uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Size</th>
                    <th className="py-2.5 px-3">Chest (in)</th>
                    <th className="py-2.5 px-3">Length (in)</th>
                    <th className="py-2.5 px-3">Shoulder (in)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F6F3ED] text-[#525252]">
                  <tr><td className="py-2 px-3 font-bold text-[#171717]">S</td><td className="py-2 px-3">38 - 40"</td><td className="py-2 px-3">27.5"</td><td className="py-2 px-3">18.5"</td></tr>
                  <tr><td className="py-2 px-3 font-bold text-[#171717]">M</td><td className="py-2 px-3">40 - 42"</td><td className="py-2 px-3">28.5"</td><td className="py-2 px-3">19.5"</td></tr>
                  <tr><td className="py-2 px-3 font-bold text-[#171717]">L</td><td className="py-2 px-3">42 - 44"</td><td className="py-2 px-3">29.5"</td><td className="py-2 px-3">20.5"</td></tr>
                  <tr><td className="py-2 px-3 font-bold text-[#171717]">XL</td><td className="py-2 px-3">44 - 46"</td><td className="py-2 px-3">30.5"</td><td className="py-2 px-3">21.5"</td></tr>
                  <tr><td className="py-2 px-3 font-bold text-[#171717]">XXL</td><td className="py-2 px-3">46 - 48"</td><td className="py-2 px-3">31.5"</td><td className="py-2 px-3">22.5"</td></tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#F6F3ED] rounded-xl text-xs text-[#737373] space-y-1 border border-[#E8E3D9]">
              <p className="font-bold text-[#171717]">Between sizes?</p>
              <p>For a clean fitted look, order your standard size. For an authentic oversized streetwear drape, we recommend ordering one size up.</p>
            </div>

            <button
              type="button"
              onClick={() => setSizeChartOpen(false)}
              className="w-full py-3 bg-[#171717] text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
            >
              Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-[#737373]">
          Loading garment details...
        </div>
      }
    >
      <ProductDetailContent {...props} />
    </Suspense>
  );
}
