import { Outfit, OutfitProductItem } from '@/types';

/**
 * Format a number to Indian Rupee (INR) currency display (e.g., ₹1,499)
 */
export function formatINR(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatCurrencyINR = formatINR;

/**
 * Dynamically calculate total price from outfit products
 * Strictly avoids hardcoded total prices as required by specification
 */
export function calculateOutfitTotal(products?: OutfitProductItem[] | null): number {
  if (!products || !Array.isArray(products) || products.length === 0) {
    return 0;
  }
  return products.reduce((acc, item) => {
    const unitPrice = item.product?.price_inr || 0;
    const quantity = item.quantity || 1;
    return acc + unitPrice * quantity;
  }, 0);
}

/**
 * Strictly verifies if an outfit falls within a budget ceiling
 */
export function isWithinBudget(outfit: Outfit, maxBudget: number): boolean {
  const total = calculateOutfitTotal(outfit.products);
  return total <= maxBudget;
}

/**
 * Format date for fashion editorial publications
 */
export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Approved retailer domain allowlist for affiliate safety
 */
export const APPROVED_RETAILER_DOMAINS = [
  'myntra.com',
  'ajio.com',
  'snitch.co.in',
  'zara.com',
  'hm.com',
  'amazon.in',
  'thesouledstore.com',
  'westside.com',
  'bewakoof.com',
  'bonkerscorner.com',
  'superkicks.in',
  'vegnonveg.com',
  'urbanic.com',
  'marksandspencer.in',
];

/**
 * Verify whether an external outbound URL is from an approved retailer
 * Requires http/https protocol and exact domain or subdomain match.
 */
export function isAllowedRetailerUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  try {
    const parsed = new URL(urlStr.trim());
    if (parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    return APPROVED_RETAILER_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Validates internal redirect paths to prevent Open Redirect attacks.
 * Only allows relative paths starting with a single '/' and not '//' or containing protocols.
 */
export function isValidRedirectUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('/')) return false;
  if (trimmed.startsWith('//')) return false;
  if (trimmed.startsWith('/\\')) return false;
  if (trimmed.includes('://')) return false;
  return true;
}

/**
 * Returns a concise, honest price verification statement.
 */
export function getPriceFreshnessNote(priceVerifiedAt?: string | null): string {
  if (!priceVerifiedAt) {
    return 'Price not verified — check retailer site';
  }
  const formatted = formatDate(priceVerifiedAt);
  return `Price last checked: ${formatted}. Prices and availability may fluctuate; verify on the retailer's website.`;
}

