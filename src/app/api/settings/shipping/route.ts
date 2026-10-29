import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/settings/store-settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({
      isFreeDeliveryForAll: settings.isFreeDeliveryForAll,
      freeDeliveryThreshold: settings.freeDeliveryThreshold,
      shippingFee: settings.shippingFee,
      codFee: settings.codFee,
      isLiveMode: settings.isLiveMode,
    });
  } catch (error: any) {
    return NextResponse.json(
      { isFreeDeliveryForAll: false, freeDeliveryThreshold: 999, shippingFee: 99, codFee: 0, isLiveMode: false },
      { status: 200 }
    );
  }
}
