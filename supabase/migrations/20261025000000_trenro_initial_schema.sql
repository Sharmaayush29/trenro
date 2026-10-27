-- ========================================================
-- TRENRO DATABASE SCHEMA MIGRATION
-- Men's Fashion Discovery Platform
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. USER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_budget INTEGER DEFAULT 2500,
  preferred_styles TEXT[] DEFAULT ARRAY['Smart Casual', 'Streetwear'],
  preferred_colours TEXT[] DEFAULT ARRAY['Black', 'White', 'Olive'],
  preferred_occasions TEXT[] DEFAULT ARRAY['College', 'Casual Date'],
  preferred_fits TEXT[] DEFAULT ARRAY['Relaxed', 'Regular'],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PRODUCTS CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  retailer_name TEXT NOT NULL,
  product_url TEXT NOT NULL,
  image_url TEXT NOT NULL,
  price_inr INTEGER NOT NULL CHECK (price_inr >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  availability_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'low_stock', 'out_of_stock', 'unverified')),
  price_verified_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  affiliate_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. OUTFITS TABLE
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  occasion TEXT NOT NULL,
  style TEXT NOT NULL,
  fit TEXT NOT NULL,
  colour_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  published BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  likes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. OUTFIT PRODUCTS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.outfit_products (
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  PRIMARY KEY (outfit_id, product_id)
);

-- 6. SAVED OUTFITS (User Favourites)
CREATE TABLE IF NOT EXISTS public.saved_outfits (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, outfit_id)
);

-- 7. RECENTLY VIEWED (Viewing History)
CREATE TABLE IF NOT EXISTS public.recently_viewed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, outfit_id)
);

-- 8. STYLE GUIDES (Editorial Articles)
CREATE TABLE IF NOT EXISTS public.style_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  author_name TEXT NOT NULL DEFAULT 'TRENRO Editorial',
  read_time_minutes INTEGER NOT NULL DEFAULT 5,
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. COLLECTIONS (Budget & Occasion Curations)
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  collection_type TEXT NOT NULL CHECK (collection_type IN ('budget', 'occasion', 'trend', 'editorial')),
  budget_min INTEGER,
  budget_max INTEGER,
  published BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. COLLECTION OUTFITS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS public.collection_outfits (
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES public.outfits(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (collection_id, outfit_id)
);

-- 11. OUTBOUND CLICKS (Affiliate Tracking, No PII Stored)
CREATE TABLE IF NOT EXISTS public.outbound_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE SET NULL,
  retailer_name TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. CONTACT SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ========================================================
-- INDEXES FOR FAST FILTERING & SEARCH
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_outfits_slug ON public.outfits(slug);
CREATE INDEX IF NOT EXISTS idx_outfits_occasion ON public.outfits(occasion);
CREATE INDEX IF NOT EXISTS idx_outfits_style ON public.outfits(style);
CREATE INDEX IF NOT EXISTS idx_outfits_fit ON public.outfits(fit);
CREATE INDEX IF NOT EXISTS idx_outfits_published ON public.outfits(published);

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_retailer ON public.products(retailer_name);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price_inr);

CREATE INDEX IF NOT EXISTS idx_saved_outfits_user ON public.saved_outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_style_guides_slug ON public.style_guides(slug);
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_product ON public.outbound_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_outbound_clicks_occurred ON public.outbound_clicks(occurred_at);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.style_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- Prevent role escalation trigger
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Role modification is restricted to database administrators.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- Profiles policies (privacy preserved: users view only own record; admins view all)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Preferences policies
CREATE POLICY "Users can manage own preferences"
  ON public.user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Outfits policies
CREATE POLICY "Published outfits are viewable by everyone"
  ON public.outfits FOR SELECT
  USING (published = true OR public.is_admin());

CREATE POLICY "Admins can insert outfits"
  ON public.outfits FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update outfits"
  ON public.outfits FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete outfits"
  ON public.outfits FOR DELETE
  USING (public.is_admin());

-- Products policies
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Outfit Products policies (only published outfits or admin)
CREATE POLICY "Published outfit products viewable by everyone"
  ON public.outfit_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.outfits o
      WHERE o.id = outfit_id AND (o.published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage outfit products"
  ON public.outfit_products FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Saved outfits policies
CREATE POLICY "Users can view own saved outfits"
  ON public.saved_outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save outfits"
  ON public.saved_outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved outfits"
  ON public.saved_outfits FOR DELETE
  USING (auth.uid() = user_id);

-- Recently viewed policies
CREATE POLICY "Users can view own recently viewed"
  ON public.recently_viewed FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own recently viewed"
  ON public.recently_viewed FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Style guides policies
CREATE POLICY "Published style guides are viewable by everyone"
  ON public.style_guides FOR SELECT
  USING (published = true OR public.is_admin());

CREATE POLICY "Admins can manage style guides"
  ON public.style_guides FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Collections policies
CREATE POLICY "Published collections viewable by everyone"
  ON public.collections FOR SELECT
  USING (published = true OR public.is_admin());

CREATE POLICY "Admins can manage collections"
  ON public.collections FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Collection outfits policies (protects unpublished outfits from leaking)
CREATE POLICY "Published collection outfits viewable by everyone"
  ON public.collection_outfits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND (c.published = true OR public.is_admin())
    )
    AND EXISTS (
      SELECT 1 FROM public.outfits o
      WHERE o.id = outfit_id AND (o.published = true OR public.is_admin())
    )
  );

CREATE POLICY "Admins can manage collection outfits"
  ON public.collection_outfits FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Outbound clicks (Constrained anonymous logging, only admins can view analytics)
CREATE POLICY "Constrained public insert on outbound_clicks"
  ON public.outbound_clicks FOR INSERT
  WITH CHECK (
    product_id IS NOT NULL
    AND retailer_name IS NOT NULL
    AND length(retailer_name) >= 1
    AND length(retailer_name) <= 100
  );

CREATE POLICY "Admins can view outbound clicks"
  ON public.outbound_clicks FOR SELECT
  USING (public.is_admin());

-- Contact submissions (Constrained public submission, only admins can read)
CREATE POLICY "Constrained public insert on contact_submissions"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (
    length(name) >= 2 AND length(name) <= 100
    AND length(email) >= 5 AND length(email) <= 255
    AND email LIKE '%@%.%'
    AND length(subject) >= 3 AND length(subject) <= 200
    AND length(message) >= 10 AND length(message) <= 5000
    AND status = 'pending'
  );

CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (public.is_admin());

-- ========================================================
-- AUTOMATIC PROFILE CREATION TRIGGER (Hardened)
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email,
    'user'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

