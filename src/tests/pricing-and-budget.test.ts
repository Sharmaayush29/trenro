import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateOutfitTotal, isWithinBudget, formatINR } from '../lib/utils/formatters';
import { Outfit, OutfitProductItem, Product } from '../types';

test('Price Calculation: calculates exact sum of garment prices', () => {
  const dummyProduct1: Product = {
    id: 'p1',
    name: 'Waffle Tee',
    category: 'T-Shirt',
    retailer_name: 'Snitch',
    product_url: 'https://snitch.co.in/p1',
    image_url: 'https://example.com/p1.jpg',
    price_inr: 799,
    currency: 'INR',
    availability_status: 'in_stock',
    price_verified_at: '2026-10-24T00:00:00Z',
    created_at: '2026-10-24T00:00:00Z',
    updated_at: '2026-10-24T00:00:00Z',
  };

  const dummyProduct2: Product = {
    id: 'p2',
    name: 'Utility Cargos',
    category: 'Cargo',
    retailer_name: 'Ajio',
    product_url: 'https://ajio.com/p2',
    image_url: 'https://example.com/p2.jpg',
    price_inr: 1199,
    currency: 'INR',
    availability_status: 'in_stock',
    price_verified_at: '2026-10-24T00:00:00Z',
    created_at: '2026-10-24T00:00:00Z',
    updated_at: '2026-10-24T00:00:00Z',
  };

  const items: OutfitProductItem[] = [
    { product_id: 'p1', quantity: 1, product: dummyProduct1 },
    { product_id: 'p2', quantity: 1, product: dummyProduct2 },
  ];

  const total = calculateOutfitTotal(items);
  assert.equal(total, 1998, 'Sum must equal 799 + 1199 = 1998');
});

test('Price Calculation: handles empty or null items safely returning 0', () => {
  assert.equal(calculateOutfitTotal(null), 0);
  assert.equal(calculateOutfitTotal([]), 0);
  assert.equal(calculateOutfitTotal(undefined), 0);
});

test('Budget Qualifier: strictly rejects outfits exceeding budget ceiling', () => {
  const testOutfit: Outfit = {
    id: 'outfit-test',
    title: 'Test Outfit',
    slug: 'test-outfit',
    description: 'Description',
    cover_image_url: 'https://example.com/img.jpg',
    occasion: 'College',
    style: 'Streetwear',
    fit: 'Relaxed',
    colour_tags: ['Black'],
    published: true,
    created_at: '2026-10-24T00:00:00Z',
    updated_at: '2026-10-24T00:00:00Z',
    total_price_inr: 1499,
    products: [
      {
        product_id: 'p1',
        quantity: 1,
        product: {
          id: 'p1',
          name: 'Shirt',
          category: 'Shirt',
          retailer_name: 'Snitch',
          product_url: 'https://snitch.co.in/p1',
          image_url: 'https://example.com/p1.jpg',
          price_inr: 1299,
          currency: 'INR',
          availability_status: 'in_stock',
          price_verified_at: '2026-10-24T00:00:00Z',
          created_at: '2026-10-24T00:00:00Z',
          updated_at: '2026-10-24T00:00:00Z',
        },
      },
    ],
  };

  // 1299 is within 1500 but NOT within 999
  assert.equal(isWithinBudget(testOutfit, 1500), true);
  assert.equal(isWithinBudget(testOutfit, 999), false);
});

test('Currency Formatter: formats Indian Rupee correctly', () => {
  const formatted = formatINR(1499);
  assert.ok(formatted.includes('1,499') || formatted.includes('₹'), 'Formatted string contains INR value');
});
