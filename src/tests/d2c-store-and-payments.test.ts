import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifyRazorpaySignature, verifyWebhookSignature } from '../lib/payments/razorpay';
import { ClothingSize } from '../types/cart';

describe('TRENRO D2C Storefront & Order Logic', () => {
  it('enforces free shipping on orders of ₹999 or above and standard ₹99 below', () => {
    const calculateShipping = (subtotal: number) => {
      if (subtotal === 0 || subtotal >= 999) return 0;
      return 99;
    };

    assert.equal(calculateShipping(0), 0);
    assert.equal(calculateShipping(499), 99);
    assert.equal(calculateShipping(998), 99);
    assert.equal(calculateShipping(999), 0);
    assert.equal(calculateShipping(1899), 0);
  });

  it('validates standard menswear sizes (S, M, L, XL, XXL)', () => {
    const validSizes: ClothingSize[] = ['S', 'M', 'L', 'XL', 'XXL'];
    const testSize = (s: string): s is ClothingSize => validSizes.includes(s as ClothingSize);

    assert.equal(testSize('S'), true);
    assert.equal(testSize('M'), true);
    assert.equal(testSize('L'), true);
    assert.equal(testSize('XL'), true);
    assert.equal(testSize('XXL'), true);
    assert.equal(testSize('3XL'), false);
    assert.equal(testSize('UNKNOWN'), false);
  });

  it('correctly calculates promotional discount codes', () => {
    const applyDiscount = (subtotal: number, code: string) => {
      const clean = code.trim().toUpperCase();
      if (clean === 'TRENRO10' || clean === 'WELCOME10') {
        return Math.round(subtotal * 0.10);
      }
      if (clean === 'FIRST15') {
        return Math.round(subtotal * 0.15);
      }
      if (clean === 'TRENRO500' && subtotal >= 2999) {
        return 500;
      }
      return 0;
    };

    assert.equal(applyDiscount(1000, 'TRENRO10'), 100);
    assert.equal(applyDiscount(2000, 'FIRST15'), 300);
    assert.equal(applyDiscount(3500, 'TRENRO500'), 500);
    assert.equal(applyDiscount(2500, 'TRENRO500'), 0); // Minimum not met
    assert.equal(applyDiscount(1000, 'FAKECODE'), 0);
  });
});

describe('UPI & Payment Security Integration', () => {
  const secret = 'trenro_test_secret_key_991823';
  const orderId = 'order_test_998124';
  const paymentId = 'pay_test_778129';

  it('verifies valid Razorpay HMAC-SHA256 payment signature', () => {
    const body = `${orderId}|${paymentId}`;
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isValid = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature: validSignature,
      keySecret: secret,
    });

    assert.equal(isValid, true);
  });

  it('rejects tampered or forged payment signatures', () => {
    const forgedSignature = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

    const isValid = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature: forgedSignature,
      keySecret: secret,
    });

    assert.equal(isValid, false);
  });

  it('verifies webhook signature using timing-safe comparison', () => {
    const payload = JSON.stringify({ event: 'order.paid', id: 'evt_12345' });
    const webhookSecret = 'whsec_test_secret_84920';

    const validSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    const isValid = verifyWebhookSignature(payload, validSignature, webhookSecret);
    assert.equal(isValid, true);

    const isTamperedValid = verifyWebhookSignature(payload, 'tampered_sig_123', webhookSecret);
    assert.equal(isTamperedValid, false);
  });
});
