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
        {
          error:
            'SUPABASE_SERVICE_ROLE_KEY is not configured in Vercel Environment Variables. Please add SUPABASE_SERVICE_ROLE_KEY to your Vercel Project Settings -> Environment Variables.',
        },
        { status: 503 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (displayName || cleanEmail.split('@')[0]).trim();

    // 1. Attempt to create user with email_confirm = true so Supabase does NOT send rate-limited email
    const { data: userRecord, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: cleanName,
      },
    });

    if (createError) {
      const errStr = createError.message?.toLowerCase() || '';

      // If user is already registered (e.g. from an earlier unconfirmed registration attempt)
      if (errStr.includes('already registered') || errStr.includes('already exists')) {
        try {
          const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 100 });
          const existingUser = listData?.users?.find((u) => u.email?.toLowerCase() === cleanEmail);

          if (existingUser) {
            // Instantly confirm the unconfirmed account and update credentials!
            const { data: updatedRecord, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
              existingUser.id,
              {
                password,
                email_confirm: true,
                user_metadata: { display_name: cleanName },
              }
            );

            if (!updateErr && updatedRecord?.user) {
              await supabaseAdmin.from('profiles').upsert(
                {
                  id: updatedRecord.user.id,
                  display_name: cleanName,
                  email: cleanEmail,
                  role: cleanEmail === 'ayush@gmail.com' ? 'admin' : 'user',
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' }
              );

              return NextResponse.json({
                success: true,
                message: 'Account verified and updated successfully. Redirecting...',
                user: {
                  id: updatedRecord.user.id,
                  email: cleanEmail,
                  display_name: cleanName,
                },
              });
            }
          }
        } catch (lookupErr) {
          console.warn('Existing user update fallback failed:', lookupErr);
        }

        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in with your password, or use Reset Password.' },
          { status: 409 }
        );
      }

      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // 2. Ensure profile row exists in public.profiles
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
