import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, getActiveRazorpayConfig } from '@/lib/payments/razorpay';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getStoreSettings, calculateShippingFee } from '@/lib/settings/store-settings';

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

    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    for (const item of items) {
      let dbProduct: any = null;
      if (supabase && typeof item.id === 'string' && UUID_REGEX.test(item.id)) {
        try {
          const { data } = await supabase.from('products').select('*').eq('id', item.id).maybeSingle();
          dbProduct = data;
        } catch {
          // Non-fatal, use client provided details
        }
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

    // Server-side shipping fee calculation based on Admin Store Settings
    const storeSettings = await getStoreSettings();
    const discountedTotal = Math.max(0, serverSubtotal - serverDiscount);
    const serverShippingFee = calculateShippingFee(discountedTotal, storeSettings);
    const serverFinalTotal = discountedTotal + serverShippingFee;

    const ref = orderReference || `TRN-${Math.floor(100000 + Math.random() * 900000)}`;

    const config = await getActiveRazorpayConfig();

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
        name: shippingAddress?.full_name || shippingAddress?.fullName,
        email: shippingAddress?.email,
        phone: shippingAddress?.phone,
      },
      notes: {
        item_count: String(validatedItems.length),
      },
    });

    // Optionally pre-persist order to Supabase orders table
    if (result.success && supabase) {
      try {
        const { data: insertedOrder } = await supabase
          .from('orders')
          .insert({
            order_number: ref,
            subtotal: serverSubtotal,
            shipping: serverShippingFee,
            discount: serverDiscount,
            total: serverFinalTotal,
            customer_name: shippingAddress?.full_name || shippingAddress?.fullName || 'Guest Customer',
            customer_email: shippingAddress?.email || 'guest@trenro.atelier',
            customer_phone: shippingAddress?.phone || '0000000000',
            shipping_address: shippingAddress?.address || shippingAddress?.address_line1 || 'Address',
            shipping_city: shippingAddress?.city || 'City',
            shipping_state: shippingAddress?.state || 'State',
            shipping_pincode: shippingAddress?.pincode || shippingAddress?.postal_code || '000000',
            payment_method: 'upi',
            payment_status: 'pending',
            provider_order_id: result.orderId,
            notes: couponCode ? `Coupon applied: ${couponCode}` : undefined,
          })
          .select('id')
          .maybeSingle();

        if (insertedOrder?.id && validatedItems.length > 0) {
          const itemsPayload = validatedItems.map((v) => ({
            order_id: insertedOrder.id,
            product_id: UUID_REGEX.test(v.id) ? v.id : undefined,
            product_name: v.name,
            size: v.size,
            quantity: v.quantity,
            unit_price: v.price_inr,
            total_price: v.price_inr * v.quantity,
          }));
          await supabase.from('order_items').insert(itemsPayload);
        }
      } catch (dbErr) {
        console.warn('Non-fatal: could not pre-create order row in Supabase:', dbErr);
      }
    }

    return NextResponse.json({
      ...result,
      keyId: result.keyId || config.keyId,
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
