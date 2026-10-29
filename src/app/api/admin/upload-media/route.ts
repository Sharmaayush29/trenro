import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'product';
    const customTitle = (formData.get('title') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No media file provided for upload.' }, { status: 400 });
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: 'Only photos (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, QuickTime) are permitted.' },
        { status: 400 }
      );
    }

    // 50MB limit for Supabase standard storage
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 50MB limit (Selected file: ${(file.size / (1024 * 1024)).toFixed(1)}MB).` },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server database credentials are not configured. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in Vercel environment variables.' },
        { status: 503 }
      );
    }

    // Ensure 'product-media' bucket exists with both image and video mime types
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    if (!buckets?.some((b) => b.name === 'product-media')) {
      await supabaseAdmin.storage.createBucket('product-media', {
        public: true,
        fileSizeLimit: 104857600,
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/webp',
          'image/gif',
          'image/avif',
          'video/mp4',
          'video/webm',
          'video/quicktime',
          'video/ogg',
        ],
      });
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'jpg');
    const folder = isVideo ? 'videos' : 'garments';
    const cleanFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error: uploadError } = await supabaseAdmin.storage
      .from('product-media')
      .upload(cleanFileName, buffer, {
        contentType: file.type || (isVideo ? 'video/mp4' : 'image/jpeg'),
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

    // Save record into dedicated public.media_assets table
    let savedMediaAsset = null;
    try {
      const title = customTitle.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const { data: insertedAsset } = await supabaseAdmin
        .from('media_assets')
        .insert({
          title,
          file_name: cleanFileName,
          media_type: isVideo ? 'video' : 'image',
          url: publicUrl,
          mime_type: file.type,
          file_size: file.size,
          category,
        })
        .select()
        .single();

      savedMediaAsset = insertedAsset;
    } catch (dbErr) {
      // Non-fatal if table not yet migrated, storage upload still succeeds
      console.warn('Note: media_assets table insert skipped or pending migration:', dbErr);
    }

    return NextResponse.json({
      success: true,
      publicUrl,
      path: data.path,
      mediaType: isVideo ? 'video' : 'image',
      fileName: file.name,
      fileSize: file.size,
      asset: savedMediaAsset,
    });
  } catch (err: any) {
    console.error('Admin upload handler exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process media upload.' },
      { status: 500 }
    );
  }
}
