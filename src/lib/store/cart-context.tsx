'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, Outfit } from '@/types';
import { ClothingSize, CartItem, Order, OrderCustomer } from '@/types/cart';

export type { ClothingSize, CartItem, Order, OrderCustomer };

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product, size?: ClothingSize, quantity?: number, outfitContext?: { id: string; title: string }) => void;
  addEntireOutfit: (outfit: Outfit, defaultSize?: ClothingSize) => void;
  addOutfitToCart: (outfit: Outfit, defaultSize?: ClothingSize) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  subtotal: number;
  shipping: number;
  discount: number;
  discountCode: string;
  applyDiscountCode: (code: string) => Promise<{ success: boolean; message: string; discountAmount?: number }>;
  removeDiscountCode: () => void;
  total: number;
  itemCount: number;
  orders: Order[];
  placeOrder: (
    customer: Order['customer'],
    paymentMethod: Order['paymentMethod'],
    paymentDetails?: {
      payment_status?: Order['payment_status'];
      payment_id?: string;
      order_reference?: string;
    }
  ) => Order | null;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  isCartOpen: false,
  setIsCartOpen: () => {},
  addToCart: () => {},
  addEntireOutfit: () => {},
  addOutfitToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  subtotal: 0,
  shipping: 0,
  discount: 0,
  discountCode: '',
  applyDiscountCode: async () => ({ success: false, message: 'Not initialized' }),
  removeDiscountCode: () => {},
  total: 0,
  itemCount: 0,
  orders: [],
  placeOrder: () => null,
  updateOrderStatus: () => {},
});

const CART_STORAGE_KEY = 'trenro_cart_items_v2';
const ORDERS_STORAGE_KEY = 'trenro_orders_v2';
const DISCOUNT_STORAGE_KEY = 'trenro_discount_code_v2';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discount, setDiscount] = useState<number>(0);
  const [discountCode, setDiscountCode] = useState<string>('');
  const [couponMeta, setCouponMeta] = useState<{
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    cap?: number;
    minSubtotal?: number;
  } | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Hydrate from localStorage safely on client
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        }
      }
      const storedDiscount = localStorage.getItem(DISCOUNT_STORAGE_KEY);
      if (storedDiscount) {
        setDiscountCode(storedDiscount);
      }
    } catch {
      // LocalStorage not available or corrupted
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore quota/access errors
    }
  }, [items, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore quota/access errors
    }
  }, [orders, hasLoaded]);

  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(DISCOUNT_STORAGE_KEY, discountCode);
    } catch {
      // Ignore quota/access errors
    }
  }, [discountCode, hasLoaded]);

  // Subtotal calculation
  const subtotal = items.reduce((sum, item) => sum + item.product.price_inr * item.quantity, 0);

  // Complimentary express delivery above ₹999, else standard ₹99
  const shipping = subtotal === 0 || subtotal >= 999 ? 0 : 99;

  // Recalculate discount whenever subtotal or coupon meta changes
  useEffect(() => {
    if (!couponMeta) {
      setDiscount(0);
      return;
    }

    if (couponMeta.minSubtotal && subtotal < couponMeta.minSubtotal) {
      setDiscount(0);
      return;
    }

    let calculatedDiscount = 0;
    if (couponMeta.type === 'percentage') {
      calculatedDiscount = Math.round((subtotal * couponMeta.value) / 100);
      if (couponMeta.cap && calculatedDiscount > couponMeta.cap) {
        calculatedDiscount = couponMeta.cap;
      }
    } else if (couponMeta.type === 'fixed') {
      calculatedDiscount = Math.min(subtotal, Math.round(couponMeta.value));
    }

    setDiscount(calculatedDiscount);
  }, [subtotal, couponMeta]);

  const total = Math.max(0, subtotal - discount + shipping);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const addToCart = useCallback((
    product: Product,
    size: ClothingSize = 'M',
    quantity = 1,
    outfitContext?: { id: string; title: string }
  ) => {
    setItems((prev) => {
      const cartItemId = `${product.id}-${size}`;
      const existingIndex = prev.findIndex((i) => i.id === cartItemId);

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [
        ...prev,
        {
          id: cartItemId,
          product,
          size,
          quantity,
          outfitId: outfitContext?.id,
          outfitTitle: outfitContext?.title,
        },
      ];
    });

    setIsCartOpen(true);
  }, []);

  const addEntireOutfit = useCallback((outfit: Outfit, defaultSize: ClothingSize = 'M') => {
    if (!outfit.products || outfit.products.length === 0) return;

    setItems((prev) => {
      const updated = [...prev];

      for (const item of outfit.products) {
        const product = item.product;
        const cartItemId = `${product.id}-${defaultSize}`;
        const existingIndex = updated.findIndex((i) => i.id === cartItemId);

        if (existingIndex > -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + 1,
          };
        } else {
          updated.push({
            id: cartItemId,
            product,
            size: defaultSize,
            quantity: 1,
            outfitId: outfit.id,
            outfitTitle: outfit.title,
          });
        }
      }

      return updated;
    });

    setIsCartOpen(true);
  }, []);

  const addOutfitToCart = addEntireOutfit;

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.id !== itemId);
      }
      return prev.map((item) => (item.id === itemId ? { ...item, quantity } : item));
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountCode('');
    setDiscount(0);
    setCouponMeta(null);
  }, []);

  const removeDiscountCode = useCallback(() => {
    setDiscountCode('');
    setDiscount(0);
    setCouponMeta(null);
  }, []);

  const applyDiscountCode = useCallback(
    async (code: string): Promise<{ success: boolean; message: string; discountAmount?: number }> => {
      const clean = code.trim().toUpperCase();
      if (!clean) {
        removeDiscountCode();
        return { success: false, message: 'Please enter a coupon code.' };
      }

      try {
        const res = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: clean, subtotal }),
        });
        const data = await res.json();

        if (res.ok && data.valid) {
          setDiscount(data.discount_amount);
          setDiscountCode(data.code);
          setCouponMeta({
            code: data.code,
            type: data.discount_type || 'percentage',
            value: data.discount_value || 0,
            cap: data.max_discount_cap,
            minSubtotal: data.min_order_subtotal,
          });
          return {
            success: true,
            message: data.message || `Coupon "${data.code}" applied!`,
            discountAmount: data.discount_amount,
          };
        } else {
          removeDiscountCode();
          return {
            success: false,
            message: data.error || `Coupon code "${clean}" is invalid or expired.`,
          };
        }
      } catch {
        removeDiscountCode();
        return {
          success: false,
          message: 'Unable to validate coupon at this time. Please try again.',
        };
      }
    },
    [subtotal, removeDiscountCode]
  );

  const placeOrder = useCallback(
    (
      customer: Order['customer'],
      paymentMethod: Order['paymentMethod'],
      paymentDetails?: {
        payment_status?: Order['payment_status'];
        payment_id?: string;
        order_reference?: string;
      }
    ): Order | null => {
      if (items.length === 0) return null;

      const orderNumber = paymentDetails?.order_reference || `TRN-${Math.floor(100000 + Math.random() * 900000)}`;
      const nowIso = new Date().toISOString();

      const paymentMethodDisplay =
        paymentMethod === 'cod'
          ? 'Cash on Delivery (COD)'
          : paymentMethod === 'upi'
          ? 'Instant UPI (Razorpay)'
          : 'Credit / Debit Card (Razorpay)';

      // Payment status is Pending unless explicitly confirmed through cryptographic signature verification!
      const finalPaymentStatus = paymentDetails?.payment_status || 'Pending';

      const enrichedItems: CartItem[] = items.map((it) => ({
        ...it,
        name: it.product?.name || 'TRENRO Apparel',
        price_inr: it.product?.price_inr || 0,
        image_url: it.product?.image_url || '',
      }));

      const newOrder: Order = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}`,
        orderNumber,
        order_reference: orderNumber,
        items: enrichedItems,
        subtotal,
        subtotal_inr: subtotal,
        shipping,
        shipping_fee_inr: shipping,
        discount,
        discount_inr: discount,
        total,
        total_amount_inr: total,
        status: finalPaymentStatus === 'Paid' ? 'Confirmed' : 'Pending',
        createdAt: nowIso,
        created_at: nowIso,
        customer,
        shipping_address: {
          full_name: customer.fullName,
          email: customer.email,
          phone: customer.phone,
          address_line1: customer.address,
          city: customer.city,
          state: customer.state,
          postal_code: customer.pincode,
        },
        paymentMethod,
        payment_method: paymentMethodDisplay,
        payment_status: finalPaymentStatus,
        couponCode: discountCode || undefined,
        paymentId: paymentDetails?.payment_id,
      };

      setOrders((prev) => [newOrder, ...prev]);
      clearCart();

      return newOrder;
    },
    [items, subtotal, shipping, discount, total, discountCode, clearCart]
  );

  const updateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId || ord.orderNumber === orderId || ord.order_reference === orderId
          ? { ...ord, status }
          : ord
      )
    );
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        addEntireOutfit,
        addOutfitToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        shipping,
        discount,
        discountCode,
        applyDiscountCode,
        removeDiscountCode,
        total,
        itemCount,
        orders,
        placeOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export const useCartStore = useCart;
