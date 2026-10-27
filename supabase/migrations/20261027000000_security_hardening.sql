-- ========================================================
-- TRENRO SECURITY HARDENING MIGRATION
-- Row Level Security, Definer Functions, & Privacy Hardening
-- ========================================================

-- 1. HARDEN is_admin() FUNCTION WITH FIXED SEARCH PATH & EXECUTION PRIVILEGES
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

-- Restrict function execution permissions
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- 2. HARDEN USER REGISTRATION TRIGGER WITH FIXED SEARCH PATH & FORCED ROLE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Always enforce role = 'user' on signup regardless of user_metadata
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

-- Recreate trigger idempotently
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. PREVENT ROLE ESCALATION (BEFORE UPDATE TRIGGER ON PROFILES)
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Prevent normal users from altering role via direct update
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow only if current session role is service_role or admin
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

-- 4. HARDEN PROFILES ROW LEVEL SECURITY
-- Drop insecure policy that exposed all emails to public
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users may only view their own private profile (prevents email harvesting)
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can view profiles for account administration
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile (name, avatar) but not protected columns
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. HARDEN RELATION TABLE POLICIES (PREVENT UNPUBLISHED CONTENT LEAKS)
DROP POLICY IF EXISTS "Collection outfits viewable by everyone" ON public.collection_outfits;
DROP POLICY IF EXISTS "Published collection outfits viewable by everyone" ON public.collection_outfits;

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

DROP POLICY IF EXISTS "Outfit products are viewable by everyone" ON public.outfit_products;
DROP POLICY IF EXISTS "Published outfit products viewable by everyone" ON public.outfit_products;

CREATE POLICY "Published outfit products viewable by everyone"
  ON public.outfit_products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.outfits o
      WHERE o.id = outfit_id AND (o.published = true OR public.is_admin())
    )
  );

-- 6. HARDEN PUBLIC INSERT POLICIES (COLUMN CONSTRAINTS & SPAM PREVENTION)
DROP POLICY IF EXISTS "Public can log outbound click" ON public.outbound_clicks;
DROP POLICY IF EXISTS "Constrained public insert on outbound_clicks" ON public.outbound_clicks;

CREATE POLICY "Constrained public insert on outbound_clicks"
  ON public.outbound_clicks FOR INSERT
  WITH CHECK (
    product_id IS NOT NULL
    AND retailer_name IS NOT NULL
    AND length(retailer_name) >= 1
    AND length(retailer_name) <= 100
  );

DROP POLICY IF EXISTS "Public can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Constrained public insert on contact_submissions" ON public.contact_submissions;

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

-- 7. RESTRICT READ ACCESS ON SUBMISSIONS & ANALYTICS TO ADMINS ONLY
DROP POLICY IF EXISTS "Admins can view outbound clicks" ON public.outbound_clicks;
CREATE POLICY "Admins can view outbound clicks"
  ON public.outbound_clicks FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view contact submissions" ON public.contact_submissions;
CREATE POLICY "Admins can view contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (public.is_admin());

