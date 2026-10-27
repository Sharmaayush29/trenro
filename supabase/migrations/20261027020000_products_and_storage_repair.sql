-- ========================================================
-- TRENRO PRODUCTS, SLUGS & STORAGE MEDIA MIGRATION
-- Fixes product management schema mismatches and sets up
-- dedicated Supabase Storage bucket for garment photography.
-- ========================================================

-- 1. ADD MISSING SLUG & SUB-CATEGORY COLUMNS TO PRODUCTS
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS sub_category TEXT DEFAULT 'Essential Drop',
  ALTER COLUMN retailer_name SET DEFAULT 'TRENRO',
  ALTER COLUMN product_url DROP NOT NULL;

-- Backfill slugs for any legacy rows missing a slug
UPDATE public.products
SET slug = lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'), '(^-|-$)', '', 'g'))
WHERE slug IS NULL OR slug = '';

-- Ensure slug is unique and indexed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_slug_key'
  ) THEN
    ALTER TABLE public.products ADD CONSTRAINT products_slug_key UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(published);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- 2. SETUP STORAGE BUCKET FOR PRODUCT MEDIA
-- Creates the 'product-media' bucket if it doesn't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-media',
  'product-media',
  true,
  10485760, -- 10MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'];

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public Read Access for product media
DROP POLICY IF EXISTS "Public can view product media" ON storage.objects;
CREATE POLICY "Public can view product media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-media');

-- Policy 2: Admin Upload Access
DROP POLICY IF EXISTS "Admins can upload product media" ON storage.objects;
CREATE POLICY "Admins can upload product media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-media' AND
    (public.is_admin() OR auth.role() = 'service_role')
  );

-- Policy 3: Admin Update/Delete Access
DROP POLICY IF EXISTS "Admins can update and delete product media" ON storage.objects;
CREATE POLICY "Admins can update and delete product media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-media' AND
    (public.is_admin() OR auth.role() = 'service_role')
  );

DROP POLICY IF EXISTS "Admins can delete product media" ON storage.objects;
CREATE POLICY "Admins can delete product media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-media' AND
    (public.is_admin() OR auth.role() = 'service_role')
  );

-- 3. PRODUCTS RLS HARDENING FOR D2C CLOTHING BRAND
-- Allow admins to insert, update, and delete products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can update products" ON public.products;
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.is_admin() OR auth.role() = 'service_role');

-- 4. SAFE DATABASE HEALTH CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.get_db_health()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  prod_count INTEGER;
  order_count INTEGER;
BEGIN
  SELECT count(*) INTO prod_count FROM public.products;
  SELECT count(*) INTO order_count FROM public.orders;

  RETURN json_build_object(
    'status', 'healthy',
    'timestamp', timezone('utc'::text, now()),
    'products_count', prod_count,
    'orders_count', order_count
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_db_health() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_db_health() TO anon;
GRANT EXECUTE ON FUNCTION public.get_db_health() TO service_role;
