import { NextResponse } from 'next/server';
import { isSupabaseConfigured, isServiceRoleConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const isConfigured = isSupabaseConfigured();
  const hasServiceRole = isServiceRoleConfigured();

  if (!isConfigured) {
    return NextResponse.json(
      {
        status: 'configuration_required',
        database: {
          connected: false,
          provider: 'Supabase (PostgreSQL)',
          message: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured.',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        {
          status: 'error',
          database: {
            connected: false,
            message: 'Failed to initialize database client.',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    // Ping products table (safe public query)
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        {
          status: 'degraded',
          database: {
            connected: false,
            message: 'Database is reachable but table verification failed. Please apply migrations.',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        database: {
          connected: true,
          provider: 'Supabase (PostgreSQL)',
          catalog_status: (count ?? 0) > 0 ? 'active' : 'awaiting_first_product',
          has_service_role: hasServiceRole,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        status: 'unreachable',
        database: {
          connected: false,
          message: 'Unable to establish database connection.',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
