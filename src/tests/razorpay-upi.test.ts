import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { createRazorpayOrder, verifyRazorpaySignature, getRazorpayConfig } from '../lib/payments/razorpay';

describe('Razorpay UPI & Test Credentials Verification', () => {
  const TEST_KEY_ID = 'rzp_test_Tsqcg0c9dmwdyF';
  const TEST_KEY_SECRET = 'gdlfEur8jGFSS7dn10NhPewX';

  it('verifies Razorpay configuration identifies credentials correctly', () => {
    // Inject test credentials into process.env if not already present
    process.env.RAZORPAY_KEY_ID = TEST_KEY_ID;
    process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;

    const config = getRazorpayConfig();
    assert.equal(config.isConfigured, true);
    assert.equal(config.isSandbox, true);
    assert.equal(config.keyId, TEST_KEY_ID);
    assert.equal(config.keySecret, TEST_KEY_SECRET);
  });

  it('creates an authentic Razorpay order via the official API using test keys', async () => {
    process.env.RAZORPAY_KEY_ID = TEST_KEY_ID;
    process.env.RAZORPAY_KEY_SECRET = TEST_KEY_SECRET;

    const testRef = `TEST-${Date.now()}`;
    const result = await createRazorpayOrder({
      amountInINR: 1499,
      orderReference: testRef,
      customer: {
        name: 'TRENRO Test Customer',
        email: 'test@trenro.com',
        phone: '9876543210',
      },
      notes: {
        payment_channel: 'UPI',
      },
    });

    assert.equal(result.success, true, `Expected success but got error: ${result.error}`);
    assert.ok(result.orderId, 'Order ID must be returned by Razorpay');
    assert.ok(result.orderId?.startsWith('order_'), 'Razorpay order ID must start with "order_"');
    assert.equal(result.amountInINR, 1499);
    assert.equal(result.currency, 'INR');
    assert.equal(result.keyId, TEST_KEY_ID);
  });

  it('performs cryptographic HMAC-SHA256 signature verification for UPI capture', () => {
    const fakeOrderId = 'order_TsyPxOIlz2XeK7';
    const fakePaymentId = 'pay_TszAbc12345678';

    // Compute legitimate Razorpay signature: HMAC-SHA256(order_id + "|" + payment_id, secret)
    const expectedSignature = crypto
      .createHmac('sha256', TEST_KEY_SECRET)
      .update(`${fakeOrderId}|${fakePaymentId}`)
      .digest('hex');

    const verified = verifyRazorpaySignature({
      razorpayOrderId: fakeOrderId,
      razorpayPaymentId: fakePaymentId,
      razorpaySignature: expectedSignature,
      keySecret: TEST_KEY_SECRET,
    });

    assert.equal(verified, true, 'Valid signature must be verified successfully');

    // Tampered signature must fail
    const tampered = verifyRazorpaySignature({
      razorpayOrderId: fakeOrderId,
      razorpayPaymentId: fakePaymentId,
      razorpaySignature: 'tampered_invalid_signature_hex_1234567890abcdef',
      keySecret: TEST_KEY_SECRET,
    });

    assert.equal(tampered, false, 'Tampered signature must be rejected');
  });
});
