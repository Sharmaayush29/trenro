'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { formatCurrencyINR } from '@/lib/utils/formatters';
import { useCart, ClothingSize } from '@/lib/store/cart-context';
import { ShoppingBag, Check, ShieldCheck, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  outfitId?: string;
  outfitTitle?: string;
  showAlternativeOption?: boolean;
}

export default function ProductCard({
  product,
  outfitId,
  outfitTitle,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const availableSizes: ClothingSize[] = (product.sizes as ClothingSize[]) || ['S', 'M', 'L', 'XL', 'XXL'];
  const [selectedSize, setSelectedSize] = useState<ClothingSize>(availableSizes[0] || 'M');
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToBag = () => {
    addToCart(
      product,
      selectedSize,
      1,
      outfitId ? { id: outfitId, title: outfitTitle || 'Curated Look' } : undefined
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-5 md:items-center justify-between hover:border-[#BD8B52]/60 hover:shadow-lg transition-all duration-300">
      {/* Product Image & Info */}
      <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
        <div className="w-24 h-32 sm:w-28 sm:h-36 rounded-xl overflow-hidden bg-[#F5F1E8] shrink-0 relative group shadow-inner">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 96px, 112px"
          />
          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-[#171717]/85 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider rounded">
            {product.category}
          </span>
        </div>

        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wider uppercase bg-[#171717] text-[#BD8B52] border border-[#BD8B52]/30 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> TRENRO Atelier
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" /> In Stock • Ready to Dispatch
            </span>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-[#171717] leading-snug line-clamp-2">
            {product.name}
          </h4>

          {product.description && (
            <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Size Selector */}
          <div className="pt-1 flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#525252] uppercase tracking-wider">
              Size:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-md border transition-all ${
                    selectedSize === size
                      ? 'bg-[#171717] text-white border-[#171717] shadow-xs'
                      : 'bg-[#FAF8F5] text-[#525252] border-[#E5E0D8] hover:border-[#BD8B52]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Price & Add to Bag CTA */}
      <div className="flex sm:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#F5F1E8] shrink-0">
        <div className="text-left md:text-right">
          <span className="text-[10px] text-[#737373] uppercase tracking-wider block font-semibold">
            TRENRO Price
          </span>
          <span className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
            {formatCurrencyINR(product.price_inr)}
          </span>
          <span className="text-[10px] text-[#15803D] font-semibold block">
            Inclusive of all taxes
          </span>
        </div>

        <div>
          <button
            type="button"
            onClick={handleAddToBag}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm ${
              isAdded
                ? 'bg-[#15803D] text-white'
                : 'bg-[#171717] hover:bg-[#BD8B52] text-white'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#BD8B52]" />
                <span>Add to Bag ({selectedSize})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

