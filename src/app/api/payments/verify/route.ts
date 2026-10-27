import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature, getRazorpayConfig } from '@/lib/payments/razorpay';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const razorpayOrderId = body.razorpay_order_id || body.razorpayOrderId;
    const razorpayPaymentId = body.razorpay_payment_id || body.razorpayPaymentId;
    const razorpaySignature = body.razorpay_signature || body.razorpaySignature;
    const orderReference = body.order_reference || body.orderReference;

    const config = getRazorpayConfig();

    if (!config.isConfigured) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: 'Payment provider not configured on server.',
        },
        { status: 400 }
      );
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: 'Missing required Razorpay verification parameters (orderId, paymentId, signature).',
        },
        { status: 400 }
      );
    }

    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      console.warn('Fraud alert: Invalid Razorpay signature for order', razorpayOrderId);
      return NextResponse.json(
        {
          success: false,
          verified: false,
          error: 'Invalid payment signature. Verification failed.',
        },
        { status: 400 }
      );
    }

    // Persist to database if Supabase is connected
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin && orderReference) {
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: 'Paid',
          status: 'Confirmed',
          payment_id: razorpayPaymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('order_reference', orderReference);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId: razorpayPaymentId,
      orderReference,
      status: 'Paid',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
