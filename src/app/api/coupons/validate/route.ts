import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawCode = body?.code;
    const subtotal = Number(body?.subtotal) || 0;

    if (!rawCode || typeof rawCode !== 'string' || !rawCode.trim()) {
      return NextResponse.json(
        { valid: false, error: 'Please enter a coupon code.' },
        { status: 400 }
      );
    }

    if (subtotal <= 0) {
      return NextResponse.json(
        { valid: false, error: 'Cart subtotal must be greater than zero to apply a coupon.' },
        { status: 400 }
      );
    }

    const code = rawCode.trim().toUpperCase();

    // Check if Supabase database is connected
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Coupon validation service is offline because database credentials are not configured.',
        },
        { status: 503 }
      );
    }

    const supabase = createAdminClient() || (await createClient());
    if (!supabase) {
      return NextResponse.json(
        { valid: false, error: 'Database service unavailable.' },
        { status: 503 }
      );
    }

    // Query active coupon from public.coupons table
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { valid: false, error: 'Database query failed while validating coupon.' },
        { status: 500 }
      );
    }

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: `Coupon code "${code}" is invalid or does not exist.` },
        { status: 404 }
      );
    }

    const now = new Date();

    // 1. Check start date
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return NextResponse.json(
        { valid: false, error: `Coupon "${code}" is not active yet.` },
        { status: 400 }
      );
    }

    // 2. Check expiration date
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return NextResponse.json(
        { valid: false, error: `Coupon "${code}" has expired.` },
        { status: 400 }
      );
    }

    // 3. Check minimum order subtotal
    if (coupon.min_order_subtotal && subtotal < Number(coupon.min_order_subtotal)) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order subtotal of ₹${coupon.min_order_subtotal} required to apply this coupon.`,
        },
        { status: 400 }
      );
    }

    // 4. Check total redemption limit
    if (
      coupon.total_redemption_limit &&
      Number(coupon.current_redemptions) >= Number(coupon.total_redemption_limit)
    ) {
      return NextResponse.json(
        { valid: false, error: `Coupon "${code}" has reached its maximum total redemption limit.` },
        { status: 400 }
      );
    }

    // 5. Calculate verified discount amount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.round((subtotal * Number(coupon.discount_value)) / 100);
      if (coupon.max_discount_cap && discountAmount > Number(coupon.max_discount_cap)) {
        discountAmount = Number(coupon.max_discount_cap);
      }
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = Math.min(subtotal, Math.round(Number(coupon.discount_value)));
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      name: coupon.name,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
      discount_amount: discountAmount,
      message: `Coupon "${coupon.code}" applied: ₹${discountAmount} savings!`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { valid: false, error: err.message || 'Internal error validating coupon.' },
      { status: 500 }
    );
  }
}
