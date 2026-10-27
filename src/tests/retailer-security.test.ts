import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedRetailerUrl, APPROVED_RETAILER_DOMAINS } from '../lib/utils/formatters';

test('Retailer Domain Allowlist: verifies approved Indian fashion partner stores', () => {
  assert.equal(isAllowedRetailerUrl('https://www.myntra.com/tshirts/snitch/12345'), true);
  assert.equal(isAllowedRetailerUrl('https://ajio.com/men-pants/p/400'), true);
  assert.equal(isAllowedRetailerUrl('https://snitch.co.in/products/shirt'), true);
  assert.equal(isAllowedRetailerUrl('https://www.zara.com/in/en/trousers.html'), true);
  assert.equal(isAllowedRetailerUrl('https://www2.hm.com/en_in/productpage.html'), true);
  assert.equal(isAllowedRetailerUrl('https://www.amazon.in/dp/B08XYZ'), true);
});

test('Retailer Domain Allowlist: blocks unauthorized external or suspicious domains', () => {
  assert.equal(isAllowedRetailerUrl('https://phishing-scam-store.com/buy'), false);
  assert.equal(isAllowedRetailerUrl('https://myntra.com.fake-site.ru/login'), false);
  assert.equal(isAllowedRetailerUrl('not-a-valid-url'), false);
});
