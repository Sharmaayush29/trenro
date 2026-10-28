import { Product, Outfit, StyleGuide, Collection, UserPreferences } from '@/types';

// ========================================================
// TRENRO APPAREL & ACCESSORIES REAL CATALOG
// No mock, fake, or sample data. Only real products added
// by the administrator are loaded from the database.
// ========================================================

export const SAMPLE_PRODUCTS: Product[] = [];

export const SAMPLE_OUTFITS: Outfit[] = [];

export const SAMPLE_STYLE_GUIDES: StyleGuide[] = [];

export const SAMPLE_COLLECTIONS: Collection[] = [];

export const DEFAULT_PREFERENCES: UserPreferences = {
  user_id: '',
  preferred_budget: 2500,
  preferred_styles: ['Streetwear', 'Smart Casual', 'Minimalist'],
  preferred_colours: ['Olive', 'Cream', 'Black'],
  preferred_occasions: ['College', 'Casual Date', 'Weekend'],
  preferred_fits: ['Relaxed', 'Regular'],
  updated_at: new Date().toISOString(),
};

export const DEMO_PREFERENCES: UserPreferences = DEFAULT_PREFERENCES;
