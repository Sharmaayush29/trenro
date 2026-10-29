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

    // 50MB limit
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
        { error: 'Server database credentials are not configured.' },
        { status: 503 }
      );
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || (isVideo ? 'mp4' : 'webp');
    const folder = isVideo ? 'videos' : 'garments';
    const cleanFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Direct fast upload without redundant listBuckets pre-flight
    let { data, error: uploadError } = await supabaseAdmin.storage
      .from('product-media')
      .upload(cleanFileName, buffer, {
        contentType: file.type || (isVideo ? 'video/mp4' : 'image/webp'),
        cacheControl: '31536000',
        upsert: true,
      });

    // If bucket was missing, create bucket on-demand and retry
    if (uploadError && (uploadError.message?.includes('bucket') || (uploadError as any).statusCode === 404)) {
      await supabaseAdmin.storage.createBucket('product-media', {
        public: true,
        fileSizeLimit: 104857600,
        allowedMimeTypes: [
          'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif',
          'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg',
        ],
      });

      const retry = await supabaseAdmin.storage
        .from('product-media')
        .upload(cleanFileName, buffer, {
          contentType: file.type || (isVideo ? 'video/mp4' : 'image/webp'),
          cacheControl: '31536000',
          upsert: true,
        });

      data = retry.data;
      uploadError = retry.error;
    }

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('product-media')
      .getPublicUrl(cleanFileName);

    // Async record in media_assets without slowing down the client response
    const title = customTitle.trim() || file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    (async () => {
      try {
        await supabaseAdmin.from('media_assets').insert({
          title,
          file_name: cleanFileName,
          media_type: isVideo ? 'video' : 'image',
          url: publicUrl,
          mime_type: file.type,
          file_size: file.size,
          category,
        });
      } catch (err) {
        console.warn('media_assets background record notice:', err);
      }
    })();

    return NextResponse.json({
      success: true,
      publicUrl,
      path: data?.path || cleanFileName,
      mediaType: isVideo ? 'video' : 'image',
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (err: any) {
    console.error('Admin upload handler exception:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to process media upload.' },
      { status: 500 }
    );
  }
}
