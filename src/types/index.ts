export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  display_name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  user_id: string;
  preferred_budget: number;
  preferred_styles: string[];
  preferred_colours: string[];
  preferred_occasions: string[];
  preferred_fits: string[];
  updated_at: string;
}

export type ProductAvailability = 'in_stock' | 'low_stock' | 'out_of_stock' | 'unverified';

export interface Product {
  id: string;
  name: string;
  slug?: string;
  category: string;
  sub_category?: string;
  retailer_name: string;
  product_url: string;
  image_url: string;
  images?: string[];
  image_metadata?: ProductImageMeta[];
  video_url?: string;
  description?: string;
  fabric_composition?: string;
  fit?: string;
  care_instructions?: string;
  features?: string[];
  price_inr: number;
  compare_at_price?: number;
  cost_price?: number;
  currency: string;
  availability_status: ProductAvailability;
  stock_quantity?: number;
  sku?: string;
  published?: boolean;
  price_verified_at: string;
  affiliate_code?: string;
  created_at: string;
  updated_at: string;
  brand?: string;
  sizes?: string[];
  colors?: string[];
  // Lower cost alternative if verified
  alternative_for_id?: string;
  lower_cost_alternative?: Product;
}

export interface ProductImageMeta {
  url: string;
  view_type: 'front' | 'back' | 'side' | 'detail' | 'model';
  alt_text?: string;
}

export interface Coupon {
  id: string;
  code: string;
  name: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_subtotal: number;
  max_discount_cap?: number;
  starts_at: string;
  expires_at?: string;
  total_redemption_limit?: number;
  current_redemptions: number;
  per_customer_limit: number;
  is_active: boolean;
  is_automatic: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  discount_amount: number;
  message?: string;
  coupon?: Coupon;
}

export interface OutfitProductItem {
  product_id: string;
  quantity: number;
  product: Product;
}

export interface Outfit {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string;
  video_url?: string;
  additional_images?: string[];
  occasion: string;
  style: string;
  fit: string;
  colour_tags: string[];
  published: boolean;
  featured?: boolean;
  created_at: string;
  updated_at: string;
  products: OutfitProductItem[];
  // Calculated on the fly:
  total_price_inr: number;
  likes_count?: number;
}

export interface SavedOutfit {
  user_id: string;
  outfit_id: string;
  created_at: string;
  outfit?: Outfit;
}

export interface RecentlyViewedItem {
  id: string;
  user_id?: string;
  outfit_id: string;
  viewed_at: string;
  outfit?: Outfit;
}

export interface StyleGuide {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  author_name: string;
  read_time_minutes: number;
  published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  related_outfit_ids?: string[];
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  collection_type: 'budget' | 'occasion' | 'trend' | 'editorial';
  budget_min?: number;
  budget_max?: number;
  published: boolean;
  display_order: number;
  outfits?: Outfit[];
  created_at?: string;
  updated_at?: string;
}

export interface OutboundClick {
  id: string;
  product_id: string;
  outfit_id?: string;
  retailer_name: string;
  product_name?: string;
  target_url?: string;
  occurred_at: string;
  clicked_at?: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  status: 'pending' | 'reviewed';
}

export interface OutfitFilterState {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  occasion?: string;
  style?: string;
  fit?: string;
  colour?: string;
  category?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}
