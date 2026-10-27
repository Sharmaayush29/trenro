-- ========================================================
-- TRENRO D2C COMMERCE, INVENTORY, ORDERS & PAYMENTS SCHEMA
-- Converts platform to full Direct-to-Consumer Menswear Brand
-- ========================================================

-- 1. ADD D2C COMMERCE COLUMNS TO PRODUCTS TABLE
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS brand TEXT NOT NULL DEFAULT 'TRENRO',
  ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  ADD COLUMN IF NOT EXISTS colors TEXT[] DEFAULT ARRAY['Default'],
  ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 50 CHECK (stock_quantity >= 0),
  ADD COLUMN IF NOT EXISTS sku TEXT,
  ADD COLUMN IF NOT EXISTS compare_at_price INTEGER CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  ADD COLUMN IF NOT EXISTS cost_price INTEGER CHECK (cost_price IS NULL OR cost_price >= 0),
  ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Update products RLS to allow public to view only published products unless admin
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
CREATE POLICY "Published products viewable by everyone"
  ON public.products FOR SELECT
  USING (published = true OR public.is_admin());

-- 2. CREATE ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled')),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  shipping INTEGER NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_pincode TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'cod', 'card')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'captured', 'failed', 'refunded')),
  provider_payment_id TEXT,
  provider_order_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy customer order queries and reference lookup
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 3. CREATE ORDER ITEMS TABLE (Snapshot of garments purchased)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_inr INTEGER NOT NULL CHECK (unit_price_inr >= 0),
  total_price_inr INTEGER NOT NULL CHECK (total_price_inr >= 0),
  product_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 4. CREATE PAYMENTS & UPI TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT NOT NULL,
  provider_payment_id TEXT,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
  method TEXT,
  vpa TEXT,
  error_code TEXT,
  error_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_order_id ON public.payments(provider_order_id);

-- 5. CREATE ADMIN AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- 6. ROW LEVEL SECURITY POLICIES FOR ORDERS, ITEMS, PAYMENTS & AUDIT LOGS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Orders RLS:
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (
    auth.uid() = user_id 
    OR customer_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    OR public.is_admin()
  );

-- Admins can update orders (e.g. status transition)
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Authenticated users or guest checkout via service role can insert orders
CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL OR public.is_admin());

-- Order Items RLS:
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "Users or service can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND (o.user_id = auth.uid() OR auth.uid() IS NULL OR public.is_admin())
    )
  );

-- Payments RLS:
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

-- Audit Logs RLS:
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_logs FOR INSERT
  WITH CHECK (public.is_admin());
