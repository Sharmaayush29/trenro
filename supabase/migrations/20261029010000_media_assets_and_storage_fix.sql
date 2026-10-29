-- ========================================================
-- TRENRO MEDIA ASSETS TABLE & STORAGE HARDENING
-- Creates dedicated table for storing photos & videos metadata
-- and ensures product-media bucket allows both images and videos
-- without Row Level Security policy errors.
-- ========================================================

-- 1. DEDICATED MEDIA ASSETS TABLE FOR PHOTOS & VIDEOS
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  mime_type TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  category TEXT DEFAULT 'product', -- 'product', 'outfit', 'style_guide', 'banner', 'general'
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON public.media_assets(media_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_created ON public.media_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_category ON public.media_assets(category);
CREATE INDEX IF NOT EXISTS idx_media_assets_product ON public.media_assets(product_id);

-- Enable Row Level Security
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view media assets
DROP POLICY IF EXISTS "Public can view media assets" ON public.media_assets;
CREATE POLICY "Public can view media assets"
  ON public.media_assets FOR SELECT
  USING (true);

-- Policy: Authenticated users, admins, and service_role can insert media
DROP POLICY IF EXISTS "Admins can insert media assets" ON public.media_assets;
CREATE POLICY "Admins can insert media assets"
  ON public.media_assets FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated' OR
    public.is_admin()
  );

-- Policy: Authenticated users, admins, and service_role can update media
DROP POLICY IF EXISTS "Admins can update media assets" ON public.media_assets;
CREATE POLICY "Admins can update media assets"
  ON public.media_assets FOR UPDATE
  USING (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated' OR
    public.is_admin()
  );

-- Policy: Authenticated users, admins, and service_role can delete media
DROP POLICY IF EXISTS "Admins can delete media assets" ON public.media_assets;
CREATE POLICY "Admins can delete media assets"
  ON public.media_assets FOR DELETE
  USING (
    auth.role() = 'service_role' OR
    auth.role() = 'authenticated' OR
    public.is_admin()
  );

-- 2. HARDEN PRODUCT-MEDIA STORAGE BUCKET FOR PHOTOS & VIDEOS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  true,
  104857600, -- 100MB
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-m4v'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-m4v'
  ];

-- Ensure RLS is active on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policy 1: Public Read
DROP POLICY IF EXISTS "Public can view product media" ON storage.objects;
CREATE POLICY "Public can view product media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-media');

-- Storage Policy 2: Insert (service_role, authenticated users, admins)
DROP POLICY IF EXISTS "Admins can upload product media" ON storage.objects;
CREATE POLICY "Admins can upload product media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-media' AND (
      auth.role() = 'service_role' OR
      auth.role() = 'authenticated' OR
      public.is_admin()
    )
  );

-- Storage Policy 3: Update
DROP POLICY IF EXISTS "Admins can update and delete product media" ON storage.objects;
CREATE POLICY "Admins can update and delete product media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-media' AND (
      auth.role() = 'service_role' OR
      auth.role() = 'authenticated' OR
      public.is_admin()
    )
  );

-- Storage Policy 4: Delete
DROP POLICY IF EXISTS "Admins can delete product media" ON storage.objects;
CREATE POLICY "Admins can delete product media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-media' AND (
      auth.role() = 'service_role' OR
      auth.role() = 'authenticated' OR
      public.is_admin()
    )
  );
