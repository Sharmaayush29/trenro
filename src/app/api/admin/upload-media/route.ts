import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided for upload.' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files (JPEG, PNG, WebP) are permitted.' },
        { status: 400 }
      );
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed 15MB limit.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server database credentials are not configured.' },
        { status: 503 }
      );
    }

    // Ensure bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.some((b) => b.name === 'product-media')) {
      await supabaseAdmin.storage.createBucket('product-media', {
        public: true,
        fileSizeLimit: 52428800,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      });
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = `garments/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('product-media')
      .upload(cleanFileName, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '31536000',
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-media')
      .getPublicUrl(cleanFileName);

    return NextResponse.json({
      success: true,
      publicUrl,
      path: data.path,
    });
  } catch (err: any) {
    console.error('Admin upload handler exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process media upload.' },
      { status: 500 }
    );
  }
}
