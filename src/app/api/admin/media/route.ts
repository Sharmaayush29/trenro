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

    const { searchParams } = new URL(req.url);
    const mediaType = searchParams.get('type'); // 'image' | 'video' | null
    const search = searchParams.get('q');

    // 1. First attempt to query public.media_assets table
    let query = supabaseAdmin
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false });

    if (mediaType === 'image' || mediaType === 'video') {
      query = query.eq('media_type', mediaType);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: tableData, error: tableError } = await query;

    if (!tableError && tableData) {
      return NextResponse.json({
        success: true,
        source: 'table',
        media: tableData,
      });
    }

    // 2. Fallback: if table does not exist yet, list directly from storage bucket
    const { data: storageFiles, error: storageErr } = await supabaseAdmin.storage
      .from('product-media')
      .list('garments', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    const { data: videoFiles } = await supabaseAdmin.storage
      .from('product-media')
      .list('videos', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    const items: any[] = [];

    (storageFiles || []).forEach((f) => {
      if (f.name !== '.emptyFolderPlaceholder') {
        const { data } = supabaseAdmin.storage.from('product-media').getPublicUrl(`garments/${f.name}`);
        items.push({
          id: f.id || f.name,
          title: f.name,
          file_name: `garments/${f.name}`,
          media_type: 'image',
          url: data.publicUrl,
          file_size: f.metadata?.size || 0,
          mime_type: f.metadata?.mimetype || 'image/jpeg',
          created_at: f.created_at || new Date().toISOString(),
        });
      }
    });

    (videoFiles || []).forEach((f) => {
      if (f.name !== '.emptyFolderPlaceholder') {
        const { data } = supabaseAdmin.storage.from('product-media').getPublicUrl(`videos/${f.name}`);
        items.push({
          id: f.id || f.name,
          title: f.name,
          file_name: `videos/${f.name}`,
          media_type: 'video',
          url: data.publicUrl,
          file_size: f.metadata?.size || 0,
          mime_type: f.metadata?.mimetype || 'video/mp4',
          created_at: f.created_at || new Date().toISOString(),
        });
      }
    });

    return NextResponse.json({
      success: true,
      source: 'storage_fallback',
      media: items,
    });
  } catch (err: any) {
    console.error('Media list API error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to list media' }, { status: 500 });
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

    const { id, fileName } = await req.json();

    if (!id && !fileName) {
      return NextResponse.json({ error: 'Media ID or file name is required for deletion.' }, { status: 400 });
    }

    // Delete from public.media_assets table if ID provided
    if (id) {
      await supabaseAdmin.from('media_assets').delete().eq('id', id);
    }

    // Delete from Supabase Storage
    if (fileName) {
      await supabaseAdmin.storage.from('product-media').remove([fileName]);
    }

    return NextResponse.json({ success: true, message: 'Media asset deleted successfully.' });
  } catch (err: any) {
    console.error('Media delete API error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to delete media asset' }, { status: 500 });
  }
}
