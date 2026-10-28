import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, getRazorpayConfig } from '@/lib/payments/razorpay';
import { createAdminClient, createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, couponCode, shippingAddress, orderReference } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order must contain at least one garment' },
        { status: 400 }
      );
    }

    // SERVER-SIDE PRICE CALCULATION — NEVER TRUST CLIENT-SUPPLIED TOTAL!
    let serverSubtotal = 0;
    const validatedItems = [];
    const supabase = createAdminClient() || (await createClient());

    for (const item of items) {
      let dbProduct: any = null;
      if (supabase) {
        const { data } = await supabase.from('products').select('*').eq('id', item.id).maybeSingle();
        dbProduct = data;
      }
      const unitPrice = dbProduct ? Number(dbProduct.price_inr) : Number(item.price_inr) || 1299;
      const quantity = Math.max(1, Math.min(10, Number(item.quantity) || 1));

      serverSubtotal += unitPrice * quantity;
      validatedItems.push({
        id: item.id,
        name: dbProduct?.name || item.name || 'TRENRO Garment',
        price_inr: unitPrice,
        quantity,
        size: item.size || 'M',
      });
    }

    // Dynamic server-side coupon validation
    let serverDiscount = 0;
    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCode = couponCode.toUpperCase().trim();
      try {
        const supabase = createAdminClient() || (await createClient());
        if (supabase) {
          const { data: coupon } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', cleanCode)
            .eq('is_active', true)
            .maybeSingle();

          if (coupon) {
            const now = new Date();
            const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
            const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;
            const meetsSubtotal = !coupon.min_order_subtotal || serverSubtotal >= Number(coupon.min_order_subtotal);
            const notExpired = (!startsAt || startsAt <= now) && (!expiresAt || expiresAt >= now);

            if (meetsSubtotal && notExpired) {
              if (coupon.discount_type === 'percentage') {
                serverDiscount = Math.round((serverSubtotal * Number(coupon.discount_value)) / 100);
                if (coupon.max_discount_cap && serverDiscount > Number(coupon.max_discount_cap)) {
                  serverDiscount = Number(coupon.max_discount_cap);
                }
              } else if (coupon.discount_type === 'fixed') {
                serverDiscount = Math.min(serverSubtotal, Math.round(Number(coupon.discount_value)));
              }
            }
          }
        }
      } catch {
        // Fallback safely with 0 discount if coupon lookup fails
        serverDiscount = 0;
      }
    }

    // Server-side shipping fee calculation (Complimentary over ₹999)
    const discountedTotal = Math.max(0, serverSubtotal - serverDiscount);
    const serverShippingFee = discountedTotal >= 999 ? 0 : 99;
    const serverFinalTotal = discountedTotal + serverShippingFee;

    const ref = orderReference || `TRN-${Math.floor(100000 + Math.random() * 900000)}`;

    const config = getRazorpayConfig();

    if (!config.isConfigured) {
      // Honest setup-required reporting
      return NextResponse.json({
        success: false,
        setupRequired: true,
        orderReference: ref,
        amountInINR: serverFinalTotal,
        subtotalINR: serverSubtotal,
        discountINR: serverDiscount,
        shippingFeeINR: serverShippingFee,
        message:
          'Razorpay payment provider is not configured with live credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable direct UPI and Card capture.',
      });
    }

    // Create payment order with official Razorpay API
    const result = await createRazorpayOrder({
      amountInINR: serverFinalTotal,
      orderReference: ref,
      customer: {
        name: shippingAddress?.full_name,
        email: shippingAddress?.email,
        phone: shippingAddress?.phone,
      },
      notes: {
        item_count: String(validatedItems.length),
      },
    });

    return NextResponse.json({
      ...result,
      orderReference: ref,
      subtotalINR: serverSubtotal,
      discountINR: serverDiscount,
      shippingFeeINR: serverShippingFee,
      totalAmountINR: serverFinalTotal,
    });
  } catch (error: any) {
    console.error('Create payment order error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error creating payment order' },
      { status: 500 }
    );
  }
}
