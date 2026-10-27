import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { isSupabaseConfigured, isServiceRoleConfigured } from './config';

export async function createClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Can be ignored if called from a Server Component without mutation
          }
        },
      },
    }
  );
}

/**
 * Server-only administrative client using SUPABASE_SERVICE_ROLE_KEY.
 * Never exposed to frontend or client bundles.
 */
export function createAdminClient() {
  if (!isServiceRoleConfigured()) {
    return null;
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export interface ServerSessionUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  isAdmin: boolean;
}

/**
 * Authenticates current session on server side and verifies admin role
 * using trusted database profile lookup. NEVER trusts client metadata or localStorage.
 */
export async function getServerSessionUser(): Promise<ServerSessionUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Always query database public.profiles to verify role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, display_name, email, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return {
        id: user.id,
        email: user.email || '',
        displayName: user.email?.split('@')[0] || 'User',
        role: 'user',
        isAdmin: false,
      };
    }

    const verifiedRole = profile.role === 'admin' ? 'admin' : 'user';

    return {
      id: profile.id,
      email: profile.email,
      displayName: profile.display_name,
      role: verifiedRole,
      isAdmin: verifiedRole === 'admin',
    };
  } catch {
    return null;
  }
}
