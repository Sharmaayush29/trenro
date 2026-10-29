import { createAdminClient, createClient } from '@/lib/supabase/server';

export interface StoreSettings {
  isFreeDeliveryForAll: boolean; // True = Free Delivery on ALL orders (0 delivery charge)
  freeDeliveryThreshold: number; // Free delivery for orders at or above this amount (e.g. 999 INR)
  shippingFee: number;           // Standard delivery fee for orders below threshold (e.g. 99 INR)
  codFee: number;                // Additional COD surcharge (0 = free COD)
  isLiveMode: boolean;           // true = live real transactions, false = test sandbox
  liveKeyId?: string;            // rzp_live_...
  liveKeySecret?: string;        // production secret
  updated_at?: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  isFreeDeliveryForAll: false,
  freeDeliveryThreshold: 999,
  shippingFee: 99,
  codFee: 0,
  isLiveMode: false,
  liveKeyId: '',
  liveKeySecret: '',
  updated_at: new Date().toISOString(),
};

/**
 * Standard calculation for shipping fee across client, cart, and server order validation
 */
export function calculateShippingFee(
  subtotal: number,
  settings: Pick<StoreSettings, 'isFreeDeliveryForAll' | 'freeDeliveryThreshold' | 'shippingFee' | 'codFee'>,
  paymentMethod?: string
): number {
  if (subtotal <= 0) return 0;
  if (settings.isFreeDeliveryForAll) {
    return paymentMethod === 'cod' ? (settings.codFee || 0) : 0;
  }
  const baseFee = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.shippingFee;
  const codExtra = paymentMethod === 'cod' ? (settings.codFee || 0) : 0;
  return baseFee + codExtra;
}

// In-memory cache for fast server-side responses
let cachedSettings: StoreSettings | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds

/**
 * Fetch current store settings from Supabase SYS_STORE_SETTINGS record
 */
export async function getStoreSettings(): Promise<StoreSettings> {
  const now = Date.now();
  if (cachedSettings && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  try {
    const supabase = createAdminClient() || (await createClient());
    if (!supabase) {
      return DEFAULT_STORE_SETTINGS;
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('name, min_order_subtotal, discount_value, updated_at')
      .eq('code', 'SYS_STORE_SETTINGS')
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_STORE_SETTINGS;
    }

    let parsedConfig: Partial<StoreSettings> = {};
    try {
      if (data.name && data.name.startsWith('{')) {
        parsedConfig = JSON.parse(data.name);
      }
    } catch {
      // Ignore JSON parse error and fallback to columns
    }

    const settings: StoreSettings = {
      isFreeDeliveryForAll: Boolean(parsedConfig.isFreeDeliveryForAll),
      freeDeliveryThreshold:
        typeof parsedConfig.freeDeliveryThreshold === 'number'
          ? parsedConfig.freeDeliveryThreshold
          : Number(data.min_order_subtotal) || DEFAULT_STORE_SETTINGS.freeDeliveryThreshold,
      shippingFee:
        typeof parsedConfig.shippingFee === 'number'
          ? parsedConfig.shippingFee
          : Number(data.discount_value) || DEFAULT_STORE_SETTINGS.shippingFee,
      codFee: typeof parsedConfig.codFee === 'number' ? parsedConfig.codFee : 0,
      isLiveMode: Boolean(parsedConfig.isLiveMode),
      liveKeyId: parsedConfig.liveKeyId || process.env.RAZORPAY_LIVE_KEY_ID || '',
      liveKeySecret: parsedConfig.liveKeySecret || process.env.RAZORPAY_LIVE_KEY_SECRET || '',
      updated_at: data.updated_at || new Date().toISOString(),
    };

    cachedSettings = settings;
    lastCacheTime = now;
    return settings;
  } catch (err) {
    console.warn('Failed to load store settings from Supabase, using defaults:', err);
    return DEFAULT_STORE_SETTINGS;
  }
}

/**
 * Update store settings in Supabase SYS_STORE_SETTINGS record
 */
export async function updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const current = await getStoreSettings();

  const nextSettings: StoreSettings = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const supabase = createAdminClient() || (await createClient());
  if (supabase) {
    const payload = {
      code: 'SYS_STORE_SETTINGS',
      name: JSON.stringify(nextSettings),
      discount_type: 'fixed',
      discount_value: nextSettings.shippingFee,
      min_order_subtotal: nextSettings.freeDeliveryThreshold,
      is_active: false, // Inactive so it cannot be used as a promotional coupon
      updated_at: nextSettings.updated_at,
    };

    const { error } = await supabase.from('coupons').upsert(payload, { onConflict: 'code' });
    if (error) {
      console.error('Error persisting store settings to Supabase:', error);
      throw new Error(`Failed to save settings: ${error.message}`);
    }
  }

  cachedSettings = nextSettings;
  lastCacheTime = Date.now();
  return nextSettings;
}
