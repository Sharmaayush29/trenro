import { NextResponse } from 'next/server';
import { isAllowedRetailerUrl } from '@/lib/utils/formatters';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

// In-memory sliding window rate limiter for outbound click events: max 30 clicks / minute
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_CLICKS_PER_WINDOW = 30;
const clickHistory = new Map<string, number[]>();

function isClickRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const timestamps = clickHistory.get(clientIp) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_CLICKS_PER_WINDOW) {
    clickHistory.set(clientIp, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  clickHistory.set(clientIp, validTimestamps);
  return false;
}

export async function POST(request: Request) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload.' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : 'local';

    if (isClickRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many click tracking requests. Rate limited.' },
        { status: 429 }
      );
    }

    const { productId, outfitId, retailerName, targetUrl } = body;

    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
      return NextResponse.json({ error: 'Valid Product ID is required.' }, { status: 400 });
    }

    // Server-Side Strict Allowlist Domain Validation
    if (targetUrl) {
      if (typeof targetUrl !== 'string' || !isAllowedRetailerUrl(targetUrl)) {
        return NextResponse.json(
          { error: 'Outbound target URL is not in the approved retailer domain allowlist.' },
          { status: 403 }
        );
      }
    }

    const cleanRetailer = (retailerName && typeof retailerName === 'string')
      ? retailerName.trim().slice(0, 100)
      : 'Retailer';

    // If Supabase is configured, persist to database
    if (isSupabaseConfigured()) {
      const supabaseAdmin = createAdminClient();
      const supabase = supabaseAdmin || (await createClient());

      if (supabase) {
        const { data, error } = await supabase
          .from('outbound_clicks')
          .insert({
            product_id: productId,
            outfit_id: outfitId || null,
            retailer_name: cleanRetailer,
          })
          .select('id')
          .single();

        if (!error && data) {
          return NextResponse.json(
            {
              success: true,
              recorded: true,
              clickId: data.id,
            },
            { status: 200 }
          );
        }
      }
    }

    // In development / demo mode when database is unconfigured:
    // Report truthfully that the URL passed verification but event was not persisted
    return NextResponse.json(
      {
        success: true,
        recorded: false,
        reason: 'database_storage_unconfigured',
        approvedDomain: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to record outbound click.' },
      { status: 500 }
    );
  }
}
