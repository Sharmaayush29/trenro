import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

// Authorization helper to ensure only admins can manage coupons
async function verifyAdminAuth() {
  if (!isSupabaseConfigured()) {
    return { authorized: false, error: 'Database credentials not configured.', status: 503 };
  }

  const supabase = await createClient();
  if (!supabase) {
    return { authorized: false, error: 'Database client unavailable.', status: 503 };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: 'Authentication required.', status: 401 };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { authorized: false, error: 'Forbidden: Admin privilege required.', status: 403 };
  }

  const supabaseAdmin = createAdminClient() || supabase;
  return { authorized: true, user, supabaseAdmin };
}

// GET: List all coupons
export async function GET() {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: coupons, error } = await auth.supabaseAdmin!
    .from('coupons')
    .select('*')
    .not('code', 'like', 'SYS_%')
    .order('created_at', { ascending: false });

  if (error) {
    if (error.message?.includes('schema cache') || error.message?.includes('does not exist')) {
      return NextResponse.json({ coupons: [], tableMissing: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupons: coupons || [], tableMissing: false });
}

// POST: Create a new coupon
export async function POST(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const {
      code,
      name,
      discount_type,
      discount_value,
      min_order_subtotal,
      max_discount_cap,
      starts_at,
      expires_at,
      total_redemption_limit,
      is_active,
      is_automatic,
    } = body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return NextResponse.json({ error: 'Valid coupon code is required.' }, { status: 400 });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Coupon name is required.' }, { status: 400 });
    }

    if (!['percentage', 'fixed'].includes(discount_type)) {
      return NextResponse.json({ error: 'Discount type must be percentage or fixed.' }, { status: 400 });
    }

    const numericValue = Number(discount_value);
    if (isNaN(numericValue) || numericValue <= 0) {
      return NextResponse.json({ error: 'Discount value must be greater than zero.' }, { status: 400 });
    }

    if (discount_type === 'percentage' && numericValue > 100) {
      return NextResponse.json({ error: 'Percentage discount cannot exceed 100%.' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

    const newCoupon = {
      code: cleanCode,
      name: name.trim(),
      discount_type,
      discount_value: numericValue,
      min_order_subtotal: Number(min_order_subtotal) || 0,
      max_discount_cap: max_discount_cap ? Number(max_discount_cap) : null,
      starts_at: starts_at ? new Date(starts_at).toISOString() : new Date().toISOString(),
      expires_at: expires_at ? new Date(expires_at).toISOString() : null,
      total_redemption_limit: total_redemption_limit ? Number(total_redemption_limit) : null,
      current_redemptions: 0,
      per_customer_limit: 1,
      is_active: is_active ?? true,
      is_automatic: is_automatic ?? false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await auth.supabaseAdmin!
      .from('coupons')
      .insert(newCoupon)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: `Coupon code "${cleanCode}" already exists.` }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coupon: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create coupon.' }, { status: 500 });
  }
}

// PATCH: Toggle active status or update coupon
export async function PATCH(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { id, is_active, name, discount_value, min_order_subtotal, max_discount_cap, expires_at } = body;

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required.' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof is_active === 'boolean') updates.is_active = is_active;
    if (name) updates.name = name.trim();
    if (discount_value !== undefined) updates.discount_value = Number(discount_value);
    if (min_order_subtotal !== undefined) updates.min_order_subtotal = Number(min_order_subtotal);
    if (max_discount_cap !== undefined) updates.max_discount_cap = max_discount_cap ? Number(max_discount_cap) : null;
    if (expires_at !== undefined) updates.expires_at = expires_at ? new Date(expires_at).toISOString() : null;

    const { data, error } = await auth.supabaseAdmin!
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ coupon: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update coupon.' }, { status: 500 });
  }
}

// DELETE: Remove coupon
export async function DELETE(request: Request) {
  const auth = await verifyAdminAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Coupon ID parameter required.' }, { status: 400 });
    }

    const { error } = await auth.supabaseAdmin!
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete coupon.' }, { status: 500 });
  }
}
