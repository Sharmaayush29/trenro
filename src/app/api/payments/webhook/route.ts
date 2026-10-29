import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, getRazorpayConfig } from '@/lib/payments/razorpay';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    const rawBody = await req.text();

    const config = getRazorpayConfig();

    // If webhook secret is configured, strictly verify signature
    if (config.webhookSecret) {
      if (!signature) {
        return NextResponse.json(
          { error: 'Missing x-razorpay-signature header' },
          { status: 400 }
        );
      }

      const isValid = verifyWebhookSignature({
        rawBody,
        signature,
        webhookSecret: config.webhookSecret,
      });

      if (!isValid) {
        console.warn('Tampered webhook rejected: invalid Razorpay signature');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const event = payload?.event;
    const paymentEntity = payload?.payload?.payment?.entity;
    const orderEntity = payload?.payload?.order?.entity;

    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const razorpayPaymentId = paymentEntity?.id;
    const receiptRef = orderEntity?.receipt || paymentEntity?.notes?.reference;

    if (!razorpayOrderId && !receiptRef) {
      return NextResponse.json({ received: true, ignored: 'No order identifier found' });
    }

    if (isSupabaseConfigured()) {
      const supabase = createAdminClient() || (await createClient());

      if (supabase) {
        try {
          if (event === 'payment.captured' || event === 'order.paid') {
            // Idempotent update: mark order as captured
            await supabase
              .from('orders')
              .update({
                payment_status: 'captured',
                status: 'Confirmed',
                provider_payment_id: razorpayPaymentId,
                updated_at: new Date().toISOString(),
              })
              .or(`order_number.eq.${receiptRef},provider_order_id.eq.${razorpayOrderId}`);
          } else if (event === 'payment.failed') {
            await supabase
              .from('orders')
              .update({
                payment_status: 'failed',
                updated_at: new Date().toISOString(),
              })
              .or(`order_number.eq.${receiptRef},provider_order_id.eq.${razorpayOrderId}`);
          }
        } catch (dbErr) {
          console.warn('Non-fatal: webhook order update error:', dbErr);
        }
      }
    }

    return NextResponse.json({
      received: true,
      event,
      razorpayOrderId,
      status: 'processed',
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
