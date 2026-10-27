import { Product, Outfit, Profile } from '../types';

export const TEST_PRODUCTS: Product[] = [
  {
    id: 'test-prod-1',
    name: 'Waffle Knit Oversized Tee',
    category: 'T-Shirt',
    retailer_name: 'Snitch',
    brand: 'Snitch Originals',
    sizes: ['S', 'M', 'L', 'XL'],
    product_url: 'https://snitch.co.in/products/waffle-knit-tee',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    price_inr: 899,
    currency: 'INR',
    availability_status: 'in_stock',
    price_verified_at: '2026-10-25T10:00:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-25T10:00:00Z',
  },
  {
    id: 'test-prod-2',
    name: 'Relaxed Fit Utility Chinos',
    category: 'Pants',
    retailer_name: 'Myntra',
    brand: 'Roadster',
    sizes: ['30', '32', '34'],
    product_url: 'https://www.myntra.com/trousers/roadster/12345',
    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
    price_inr: 1499,
    currency: 'INR',
    availability_status: 'in_stock',
    price_verified_at: '2026-10-25T10:00:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-25T10:00:00Z',
  },
];

export const TEST_OUTFITS: Outfit[] = [
  {
    id: 'test-outfit-1',
    title: 'Campus Minimalist',
    slug: 'campus-minimalist',
    description: 'Clean college campus casual wear.',
    cover_image_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
    occasion: 'College',
    style: 'Streetwear',
    fit: 'Relaxed',
    colour_tags: ['Cream', 'Olive'],
    published: true,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-25T10:00:00Z',
    total_price_inr: 2398,
    products: [
      { product_id: 'test-prod-1', quantity: 1, product: TEST_PRODUCTS[0] },
      { product_id: 'test-prod-2', quantity: 1, product: TEST_PRODUCTS[1] },
    ],
  },
];

export const TEST_USER: Profile = {
  id: 'test-user-1',
  display_name: 'Test Visitor',
  email: 'visitor@example.com',
  role: 'user',
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-25T10:00:00Z',
};

export const TEST_ADMIN: Profile = {
  id: 'test-admin-1',
  display_name: 'Catalog Curator',
  email: 'curator@trenro.com',
  role: 'admin',
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-25T10:00:00Z',
};
