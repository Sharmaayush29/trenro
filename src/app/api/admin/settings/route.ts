import { NextRequest, NextResponse } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/settings/store-settings';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

async function verifyAdminAuth() {
  const supabase = await createClient();
  if (!supabase) return { authorized: false, error: 'Database unavailable' };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { authorized: false, error: 'Unauthorized' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { authorized: false, error: 'Admin access required' };
  }

  return { authorized: true };
}

export async function GET() {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await req.json();
    const {
      isFreeDeliveryForAll,
      freeDeliveryThreshold,
      shippingFee,
      codFee,
      isLiveMode,
      liveKeyId,
      liveKeySecret,
    } = body;

    const updates: Record<string, any> = {};

    if (typeof isFreeDeliveryForAll === 'boolean') {
      updates.isFreeDeliveryForAll = isFreeDeliveryForAll;
    }
    if (typeof freeDeliveryThreshold === 'number' && freeDeliveryThreshold >= 0) {
      updates.freeDeliveryThreshold = freeDeliveryThreshold;
    }
    if (typeof shippingFee === 'number' && shippingFee >= 0) {
      updates.shippingFee = shippingFee;
    }
    if (typeof codFee === 'number' && codFee >= 0) {
      updates.codFee = codFee;
    }
    if (typeof isLiveMode === 'boolean') {
      updates.isLiveMode = isLiveMode;
    }
    if (typeof liveKeyId === 'string') {
      updates.liveKeyId = liveKeyId.trim();
    }
    if (typeof liveKeySecret === 'string') {
      updates.liveKeySecret = liveKeySecret.trim();
    }

    const updated = await updateStoreSettings(updates);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}
