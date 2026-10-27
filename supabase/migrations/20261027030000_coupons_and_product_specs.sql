-- ========================================================
-- TRENRO COUPONS, PRODUCT SPECIFICATIONS & PAYMENT INTEGRITY
-- Migration: 20261027030000_coupons_and_product_specs.sql
-- ========================================================

-- 1. EXTEND PRODUCTS TABLE FOR COMPLETE 4-5 IMAGE GALLERIES & SPECS
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS image_metadata JSONB DEFAULT '[]'::JSONB,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS fabric_composition TEXT,
  ADD COLUMN IF NOT EXISTS fit TEXT,
  ADD COLUMN IF NOT EXISTS care_instructions TEXT,
  ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL', 'XXL']::TEXT[],
  ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS compare_at_price INTEGER,
  ADD COLUMN IF NOT EXISTS cost_price INTEGER,
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_products_published_stock ON public.products(published, stock_quantity);

-- 2. CREATE COUPONS TABLE (ADMIN MANAGED, SERVER VALIDATED)
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_order_subtotal NUMERIC NOT NULL DEFAULT 0,
  max_discount_cap NUMERIC,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ,
  total_redemption_limit INTEGER,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  per_customer_limit INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_automatic BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active);

-- 3. CREATE COUPON REDEMPTIONS TABLE (ATOMIC USAGE TRACKING)
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_reference TEXT NOT NULL,
  discount_applied NUMERIC NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_id ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user_id ON public.coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_order_ref ON public.coupon_redemptions(order_reference);

-- 4. ROW LEVEL SECURITY (RLS) FOR COUPONS & REDEMPTIONS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Anyone can read active coupons to validate promo codes
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;
CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true);

-- Only verified admins can create, update, or delete coupons
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons"
  ON public.coupons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can view their own redemptions
DROP POLICY IF EXISTS "Users can view own coupon redemptions" ON public.coupon_redemptions;
CREATE POLICY "Users can view own coupon redemptions"
  ON public.coupon_redemptions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all redemptions
DROP POLICY IF EXISTS "Admins can view all coupon redemptions" ON public.coupon_redemptions;
CREATE POLICY "Admins can view all coupon redemptions"
  ON public.coupon_redemptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
