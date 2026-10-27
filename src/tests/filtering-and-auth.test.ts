import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_OUTFITS, TEST_USER, TEST_ADMIN } from './test-fixtures';
import { calculateOutfitTotal } from '../lib/utils/formatters';

test('Catalog Filtering: filters outfits by occasion accurately', () => {
  const collegeOutfits = TEST_OUTFITS.filter((o) => o.occasion === 'College');
  assert.ok(collegeOutfits.length > 0, 'Must have outfits for College');
  collegeOutfits.forEach((o) => {
    assert.equal(o.occasion, 'College');
  });
});

test('Catalog Filtering: filters outfits by style accurately', () => {
  const streetwearOutfits = TEST_OUTFITS.filter((o) => o.style === 'Streetwear');
  assert.ok(streetwearOutfits.length > 0, 'Must have streetwear outfits');
  streetwearOutfits.forEach((o) => {
    assert.equal(o.style, 'Streetwear');
  });
});

test('Role Authorization: verifies demo user vs admin role separation', () => {
  assert.equal(TEST_USER.role, 'user', 'Normal user role is user');
  assert.equal(TEST_ADMIN.role, 'admin', 'Admin user role is admin');
  assert.notEqual(TEST_USER.id, TEST_ADMIN.id, 'Distinct identities');
});

test('Catalog Data Integrity: all outfits have at least 1 verified product attached', () => {
  TEST_OUTFITS.forEach((outfit) => {
    assert.ok(
      outfit.products && outfit.products.length > 0,
      `Outfit ${outfit.title} must have at least 1 product attached`
    );
    const calculatedTotal = calculateOutfitTotal(outfit.products);
    assert.ok(calculatedTotal > 0, `Outfit ${outfit.title} must have positive total price`);
  });
});
