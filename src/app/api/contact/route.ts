import { NextResponse } from 'next/server';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

// Simple sliding window rate limiter: IP -> timestamps
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestHistory = new Map<string, number[]>();

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestHistory.get(clientIp) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestHistory.set(clientIp, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  ipRequestHistory.set(clientIp, validTimestamps);
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

    // Anti-spam Honeypot Check
    if (body.botField || body.honeypot || body.website) {
      return NextResponse.json({ error: 'Spam submission rejected.' }, { status: 400 });
    }

    // Extract client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : 'local';

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: 'Too many submissions from this connection. Please try again in a few minutes.' },
        { status: 429 }
      );
    }

    const { name, email, subject, message } = body;

    // Strict Field Validations
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters long.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !email ||
      typeof email !== 'string' ||
      email.trim().length > 255 ||
      !emailRegex.test(email.trim())
    ) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (
      !subject ||
      typeof subject !== 'string' ||
      subject.trim().length < 3 ||
      subject.trim().length > 200
    ) {
      return NextResponse.json(
        { error: 'Subject must be between 3 and 200 characters long.' },
        { status: 400 }
      );
    }

    if (
      !message ||
      typeof message !== 'string' ||
      message.trim().length < 10 ||
      message.trim().length > 5000
    ) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 5,000 characters long.' },
        { status: 400 }
      );
    }

    // Check database configuration
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          error:
            'Contact submission storage is currently unavailable because database credentials are not configured. Your message was not sent. Please email rasu29906@gmail.com directly.',
        },
        { status: 503 }
      );
    }

    // Attempt persistence via Admin client or Server client
    const supabaseAdmin = createAdminClient();
    const supabase = supabaseAdmin || (await createClient());

    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to initialize database client. Your message was not sent.' },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'pending',
      })
      .select('id')
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          error:
            'A database error occurred while saving your message. Your message was not saved. Please try again later.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for reaching out to TRENRO Customer Care. We have received your inquiry.',
        submissionId: data.id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: 'An unexpected server error occurred while processing your contact request.' },
      { status: 500 }
    );
  }
}
