'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { formatCurrencyINR } from '@/lib/utils/formatters';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    shipping,
    discount,
    discountCode,
    applyDiscountCode,
    total,
    itemCount,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isCartOpen) return null;

  const freeShippingThreshold = 999;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponInput.trim()) return;

    const res = await applyDiscountCode(couponInput);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E5E0D8] shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-[#E5E0D8] bg-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#171717] text-white flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 id="slide-over-title" className="text-base font-black tracking-tight text-[#171717]">
                  Shopping Bag
                </h2>
                <p className="text-xs text-[#737373]">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} in your order
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#737373] hover:text-[#171717] rounded-lg hover:bg-[#F5F1E8] transition-colors"
              aria-label="Close bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Meter */}
          <div className="bg-[#F5F1E8] px-5 py-3 border-b border-[#E5E0D8]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#171717] mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#BD8B52]" />
                {amountNeeded === 0 ? (
                  <span className="text-[#15803D] font-bold">You unlocked FREE Express Delivery!</span>
                ) : (
                  <span>Add <strong className="text-[#BD8B52]">{formatCurrencyINR(amountNeeded)}</strong> more for FREE Shipping</span>
                )}
              </span>
              <span className="text-[10px] text-[#737373] font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#E5E0D8] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#BD8B52] h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Bag Items Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F5F1E8] flex items-center justify-center text-[#737373]">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#171717]">Your bag is empty</h3>
                  <p className="text-xs text-[#737373] max-w-xs leading-relaxed">
                    Explore TRENRO’s engineered menswear collection—crafted for structured drape and everyday comfort.
                  </p>
                </div>
                <Link
                  href="/outfits"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                >
                  Explore Collection <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E5E0D8] rounded-xl p-3.5 flex gap-3.5 shadow-2xs hover:border-[#BD8B52]/40 transition-colors"
                >
                  <div className="relative w-20 h-24 bg-[#F5F1E8] rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-[#171717] line-clamp-2 leading-tight">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#A3A3A3] hover:text-[#DC2626] transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-[#F5F1E8] text-[10px] font-bold text-[#171717] uppercase tracking-wider">
                          Size: {item.size}
                        </span>
                        {item.outfitTitle && (
                          <span className="text-[10px] text-[#737373] truncate max-w-[140px]">
                            from {item.outfitTitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-extrabold text-[#171717]">
                        {formatCurrencyINR(item.product.price_inr * item.quantity)}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#E5E0D8] rounded-lg bg-[#FAF8F5] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-[#E5E0D8] text-[#525252] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#171717] min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-[#E5E0D8] text-[#525252] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer / Checkout Actions */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E5E0D8] bg-white space-y-4">
              {/* Promo Code Input */}
              <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#E5E0D8] rounded-lg text-[#171717] uppercase placeholder:normal-case placeholder:text-[#A3A3A3] focus:outline-hidden focus:border-[#BD8B52]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F5F1E8] hover:bg-[#EAE4D6] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shrink-0"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[10px] text-[#DC2626]">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-[#15803D] font-semibold">{couponSuccess}</p>}
                {discountCode && !couponSuccess && (
                  <p className="text-[10px] text-[#BD8B52] font-semibold">
                    Applied promo: {discountCode} (-{formatCurrencyINR(discount)})
                  </p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#525252] border-t border-[#F5F1E8] pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#171717]">{formatCurrencyINR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#15803D] font-semibold">
                    <span>Discount</span>
                    <span>-{formatCurrencyINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold text-[#171717]">
                    {shipping === 0 ? <span className="text-[#15803D] font-bold">FREE</span> : formatCurrencyINR(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-[#171717] pt-2 border-t border-[#E5E0D8]">
                  <span>Total Amount</span>
                  <span>{formatCurrencyINR(total)}</span>
                </div>
                <p className="text-[10px] text-[#737373]">Inclusive of all taxes & doorstep delivery</p>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Storefront Guarantees */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-[#737373]">
                <div className="flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-[#BD8B52]" />
                  <span>7-Day Doorstep Exchange</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#BD8B52]" />
                  <span>Cash on Delivery / UPI</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

