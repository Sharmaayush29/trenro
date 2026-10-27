import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TEST_PRODUCTS, TEST_OUTFITS } from './test-fixtures';
import { calculateOutfitTotal, isAllowedRetailerUrl } from '../lib/utils/formatters';

describe('Affiliate Discovery & Outfit Total Arithmetic', () => {
  it('calculates outfit total accurately from product items', () => {
    const outfit = TEST_OUTFITS[0];
    const total = calculateOutfitTotal(outfit.products);
    const expected = outfit.products.reduce((sum, item) => sum + item.product.price_inr * item.quantity, 0);

    assert.equal(total, expected);
    assert.ok(total > 0);
  });

  it('verifies all outfit products link to allowed retailer domains', () => {
    TEST_OUTFITS.forEach((outfit) => {
      outfit.products.forEach((item) => {
        const isAllowed = isAllowedRetailerUrl(item.product.product_url);
        assert.equal(
          isAllowed,
          true,
          `Product ${item.product.name} must have a valid allowlisted retailer URL (got ${item.product.product_url})`
        );
      });
    });
  });

  it('verifies that each product has a verified retailer source name and positive price', () => {
    TEST_PRODUCTS.forEach((prod) => {
      assert.ok(prod.retailer_name.length > 0, `Product ${prod.name} must have a non-empty retailer name`);
      assert.ok(prod.price_inr > 0, `Product ${prod.name} must have a positive price`);
      assert.equal(prod.currency, 'INR');
    });
  });
});
