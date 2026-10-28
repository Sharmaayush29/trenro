import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database service is unavailable. Please check server configuration.' },
        { status: 503 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (displayName || cleanEmail.split('@')[0]).trim();

    // Create user with email_confirm = true so Supabase does NOT send an email
    // This completely bypasses the Supabase 3-emails/hour rate limit!
    const { data: userRecord, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: cleanName,
      },
    });

    if (createError) {
      if (createError.message?.toLowerCase().includes('already registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        );
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Ensure profile row exists in public.profiles
    if (userRecord?.user) {
      await supabaseAdmin.from('profiles').upsert(
        {
          id: userRecord.user.id,
          display_name: cleanName,
          email: cleanEmail,
          role: cleanEmail === 'ayush@gmail.com' ? 'admin' : 'user',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account created and verified instantly.',
      user: {
        id: userRecord.user.id,
        email: cleanEmail,
        display_name: cleanName,
      },
    });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to complete registration.' },
      { status: 500 }
    );
  }
}
