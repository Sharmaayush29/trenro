-- ========================================================
-- TRENRO DATABASE SEED SCRIPT
-- Realistic Sample Data for Men's Fashion Discovery
-- ========================================================

-- Insert Sample Products
INSERT INTO public.products (id, name, category, retailer_name, product_url, image_url, price_inr, availability_status, price_verified_at, affiliate_code)
VALUES
('00000000-0000-0000-0000-000000000001', 'Textured Waffle Knit Oversized T-Shirt', 'T-Shirt', 'Snitch', 'https://snitch.co.in/products/textured-waffle-knit-tee-cream', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', 799, 'in_stock', NOW(), 'TRN-SNTC-01'),
('00000000-0000-0000-0000-000000000002', 'Relaxed Fit Olive Cuban Collar Shirt', 'Shirt', 'Ajio', 'https://www.ajio.com/men-olive-cuban-collar-shirt/p/4650192', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80', 899, 'in_stock', NOW(), 'TRN-AJIO-02'),
('00000000-0000-0000-0000-000000000003', 'Pure Linen Camp-Collar Shirt in Ecru', 'Shirt', 'Zara', 'https://www.zara.com/in/en/pure-linen-camp-collar-shirt-p03876400.html', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&auto=format&fit=crop&q=80', 2990, 'in_stock', NOW(), 'TRN-ZARA-03'),
('00000000-0000-0000-0000-000000000004', 'Heavyweight 240 GSM Boxy Drop-Shoulder Tee', 'T-Shirt', 'The Souled Store', 'https://www.thesouledstore.com/product/heavyweight-boxy-black-tee', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80', 649, 'in_stock', NOW(), 'TRN-TSS-04'),
('00000000-0000-0000-0000-000000000005', 'Vintage Wash Denim Trucker Jacket', 'Jacket', 'Myntra', 'https://www.myntra.com/jackets/roadster/men-vintage-wash-denim-jacket/1948202', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80', 1499, 'in_stock', NOW(), 'TRN-MYNT-05'),
('00000000-0000-0000-0000-000000000006', 'Smart Cotton Oxford Button-Down Shirt (White)', 'Shirt', 'Westside', 'https://www.westside.com/products/wes-casuals-white-oxford-shirt-300892', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=800&auto=format&fit=crop&q=80', 1199, 'in_stock', NOW(), 'TRN-WEST-06'),
('00000000-0000-0000-0000-000000000007', 'Pleated Wide-Leg Trousers in Charcoal Grey', 'Trousers', 'Zara', 'https://www.zara.com/in/en/pleated-wide-leg-trousers-p08062401.html', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80', 2990, 'in_stock', NOW(), 'TRN-ZARA-11'),
('00000000-0000-0000-0000-000000000008', 'Straight-Fit Cotton Chinos in Cream/Beige', 'Trousers', 'Myntra', 'https://www.myntra.com/trousers/highlander/men-cream-cotton-chinos/1849204', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80', 899, 'in_stock', NOW(), 'TRN-MYNT-13'),
('00000000-0000-0000-0000-000000000009', 'Minimalist All-White Low-Top Leather Sneakers', 'Footwear', 'Ajio', 'https://www.ajio.com/men-white-minimal-low-top-sneakers/p/4619382', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&auto=format&fit=crop&q=80', 1499, 'in_stock', NOW(), 'TRN-AJIO-19'),
('00000000-0000-0000-0000-000000000010', 'Stainless Steel Cuban Link Silver Chain (3mm)', 'Accessories', 'Snitch', 'https://snitch.co.in/products/silver-cuban-chain-3mm', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80', 499, 'in_stock', NOW(), 'TRN-SNTC-26'),
('00000000-0000-0000-0000-000000000011', 'Solid Cotton Crew-Neck T-Shirt (White)', 'T-Shirt', 'Ajio', 'https://www.ajio.com/men-white-crew-neck-tshirt/p/4601928', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80', 399, 'in_stock', NOW(), 'TRN-AJIO-31'),
('00000000-0000-0000-0000-000000000012', 'Classic Black Regular Fit Chino Pants', 'Trousers', 'Ajio', 'https://www.ajio.com/men-black-straight-chinos/p/4609182', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&auto=format&fit=crop&q=80', 599, 'in_stock', NOW(), 'TRN-AJIO-32')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Outfits
INSERT INTO public.outfits (id, title, slug, description, cover_image_url, occasion, style, fit, colour_tags, published, featured, likes_count)
VALUES
('10000000-0000-0000-0000-000000000001', 'The Clean Minimalist Daily', 'the-clean-minimalist-daily', 'A masterclass in effortless everyday styling. An ultra-breathable solid white tee paired with tapered black chinos.', 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=1000&auto=format&fit=crop&q=80', 'College', 'Minimalist', 'Regular', ARRAY['White', 'Black', 'Monochrome'], true, true, 242),
('10000000-0000-0000-0000-000000000002', 'Olive Cuban Collar & Off-White Chinos', 'olive-cuban-collar-and-off-white-chinos', 'The quintessential relaxed date look. Open collar Cuban shirt with crisp cream chinos and silver chain.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&auto=format&fit=crop&q=80', 'Casual Date', 'Smart Casual', 'Relaxed', ARRAY['Olive', 'Cream', 'Earthy'], true, true, 512)
ON CONFLICT (id) DO NOTHING;

-- Link Outfit Products
INSERT INTO public.outfit_products (outfit_id, product_id, quantity)
VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000011', 1),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000012', 1),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 1),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000008', 1),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 1)
ON CONFLICT (outfit_id, product_id) DO NOTHING;

-- Insert Style Guides
INSERT INTO public.style_guides (id, title, slug, excerpt, content, cover_image_url, category, author_name, read_time_minutes, published)
VALUES
('20000000-0000-0000-0000-000000000001', 'The Ultimate Color Wheel: Matching Shirts & Trousers Effortlessly', 'color-wheel-matching-shirts-and-trousers', 'Never stand before your closet wondering if your outfit clashes again. Master the 60-30-10 rule.', 'Editorial content on color balance and combinations...', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&auto=format&fit=crop&q=80', 'Color Theory', 'Antigravity Editorial', 6, true)
ON CONFLICT (id) DO NOTHING;
