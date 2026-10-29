import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server database credentials are not configured.' },
        { status: 503 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, products: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server database credentials are not configured.' },
        { status: 503 }
      );
    }

    const payload = await req.json();

    if (!payload.name || !payload.price_inr) {
      return NextResponse.json({ error: 'Product name and price are required.' }, { status: 400 });
    }

    // Build base insert payload
    const insertData: Record<string, any> = {
      name: payload.name.trim(),
      category: payload.category || 'Outerwear',
      retailer_name: payload.retailer_name || 'TRENRO Official',
      product_url: payload.product_url || `/products/${(payload.slug || payload.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      image_url: payload.image_url,
      images: Array.isArray(payload.images) && payload.images.length > 0 ? payload.images : [payload.image_url],
      video_url: payload.video_url || null,
      description: payload.description || '',
      price_inr: Number(payload.price_inr),
      compare_at_price: payload.compare_at_price ? Number(payload.compare_at_price) : null,
      cost_price: payload.cost_price ? Number(payload.cost_price) : null,
      currency: payload.currency || 'INR',
      stock_quantity: payload.stock_quantity ?? 45,
      sku: payload.sku || `TRN-${(payload.category || 'GEN').substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      sizes: Array.isArray(payload.sizes) && payload.sizes.length > 0 ? payload.sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(payload.colors) && payload.colors.length > 0 ? payload.colors : ['Default'],
      published: payload.published ?? true,
      availability_status: payload.availability_status || 'in_stock',
      price_verified_at: new Date().toISOString(),
    };

    // Include slug and sub_category if present
    if (payload.slug) insertData.slug = payload.slug.trim();
    if (payload.sub_category) insertData.sub_category = payload.sub_category.trim();

    // 1. First attempt to insert with all fields
    let { data, error } = await supabaseAdmin.from('products').insert(insertData).select().single();

    // 2. If remote database schema lacks 'slug' or 'sub_category' columns (PGRST204)
    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('column'))) {
      const cleanData = { ...insertData };
      delete cleanData.slug;
      delete cleanData.sub_category;

      const retry = await supabaseAdmin.from('products').insert(cleanData).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Server product insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error('Admin product POST exception:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create product' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server database credentials are not configured.' },
        { status: 503 }
      );
    }

    const { id, ...updates } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required for update.' }, { status: 400 });
    }

    const updatePayload: Record<string, any> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabaseAdmin
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    // Fallback if missing schema columns
    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache'))) {
      const cleanUpdates = { ...updatePayload };
      delete cleanUpdates.slug;
      delete cleanUpdates.sub_category;

      const retry = await supabaseAdmin
        .from('products')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: data });
  } catch (err: any) {
    console.error('Admin product PUT exception:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server database credentials are not configured.' },
        { status: 503 }
      );
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required for deletion.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Garment deleted.' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to delete product' }, { status: 500 });
  }
}
