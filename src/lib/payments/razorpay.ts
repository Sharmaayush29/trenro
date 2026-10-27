import crypto from 'crypto';

export interface RazorpayConfig {
  keyId: string;
  keySecret: string;
  webhookSecret?: string;
  isConfigured: boolean;
  isSandbox: boolean;
}

export function getRazorpayConfig(): RazorpayConfig {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

  const isConfigured = Boolean(keyId && keySecret);
  const isSandbox = keyId.startsWith('rzp_test_');

  return {
    keyId,
    keySecret,
    webhookSecret,
    isConfigured,
    isSandbox,
  };
}

export interface CreateOrderParams {
  amountInINR: number;
  orderReference: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  success: boolean;
  orderId?: string;
  amountInINR: number;
  currency: string;
  keyId?: string;
  isSandbox: boolean;
  error?: string;
  setupRequired?: boolean;
}

/**
 * Server-side creation of a Razorpay Payment Order with official paise conversion
 */
export async function createRazorpayOrder(params: CreateOrderParams): Promise<PaymentOrderResult> {
  const config = getRazorpayConfig();

  if (!config.isConfigured) {
    return {
      success: false,
      amountInINR: params.amountInINR,
      currency: 'INR',
      isSandbox: true,
      setupRequired: true,
      error:
        'Razorpay credentials are not configured in environment (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET). Live checkout requires real credentials.',
    };
  }

  // Amount in paise (1 INR = 100 paise)
  const amountInPaise = Math.round(params.amountInINR * 100);

  try {
    const authHeader = Buffer.from(`${config.keyId}:${config.keySecret}`).toString('base64');

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: params.orderReference,
        notes: {
          brand: 'TRENRO',
          reference: params.orderReference,
          ...params.notes,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        success: false,
        amountInINR: params.amountInINR,
        currency: 'INR',
        isSandbox: config.isSandbox,
        error: errBody.error?.description || `Razorpay order creation failed with HTTP ${res.status}`,
      };
    }

    const orderData = await res.json();

    return {
      success: true,
      orderId: orderData.id,
      amountInINR: params.amountInINR,
      currency: 'INR',
      keyId: config.keyId,
      isSandbox: config.isSandbox,
    };
  } catch (err: any) {
    return {
      success: false,
      amountInINR: params.amountInINR,
      currency: 'INR',
      isSandbox: config.isSandbox,
      error: err.message || 'Network exception communicating with Razorpay payment service',
    };
  }
}

/**
 * Server-side verification of payment signature using HMAC-SHA256
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId?: string;
  orderId?: string;
  razorpayPaymentId?: string;
  paymentId?: string;
  razorpaySignature?: string;
  signature?: string;
  keySecret?: string;
}): boolean {
  const config = getRazorpayConfig();
  const secret = params.keySecret || config.keySecret;

  if (!secret) {
    console.error('Cannot verify payment signature: RAZORPAY_KEY_SECRET is missing.');
    return false;
  }

  const orderId = params.razorpayOrderId || params.orderId || '';
  const paymentId = params.razorpayPaymentId || params.paymentId || '';
  const signature = params.razorpaySignature || params.signature || '';

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const providedBuf = Buffer.from(signature, 'utf-8');
    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}

export const verifyRazorpaySignature = verifyPaymentSignature;

/**
 * Webhook signature verification with timing-safe comparison
 */
export function verifyWebhookSignature(
  paramsOrRawBody: { rawBody: string; signature: string; webhookSecret?: string } | string,
  maybeSignature?: string,
  maybeSecret?: string
): boolean {
  let rawBody: string;
  let signature: string;
  let webhookSecret: string | undefined;

  if (typeof paramsOrRawBody === 'string') {
    rawBody = paramsOrRawBody;
    signature = maybeSignature || '';
    webhookSecret = maybeSecret;
  } else {
    rawBody = paramsOrRawBody.rawBody;
    signature = paramsOrRawBody.signature;
    webhookSecret = paramsOrRawBody.webhookSecret;
  }

  const config = getRazorpayConfig();
  const secret = webhookSecret || config.webhookSecret;

  if (!secret) {
    console.error('RAZORPAY_WEBHOOK_SECRET is missing; cannot verify webhook signature.');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  try {
    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const providedBuf = Buffer.from(signature, 'utf-8');
    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch {
    return false;
  }
}
