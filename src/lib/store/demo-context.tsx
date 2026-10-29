'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Outfit,
  Product,
  StyleGuide,
  Collection,
  Profile,
  UserPreferences,
  OutboundClick,
} from '@/types';
import {
  DEFAULT_PREFERENCES,
} from '@/lib/data/mock-data';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { calculateOutfitTotal } from '@/lib/utils/formatters';

interface DemoContextType {
  isConfigured: boolean;
  isDemoMode: boolean;
  user: Profile | null;
  preferences: UserPreferences;
  savedOutfitIds: string[];
  recentlyViewedIds: string[];
  outfits: Outfit[];
  products: Product[];
  styleGuides: StyleGuide[];
  collections: Collection[];
  outboundClicks: OutboundClick[];
  // Auth methods
  setUserProfile: (profile: Profile | null) => void;
  logout: () => Promise<void>;
  // Favourites & History
  isSaved: (outfitId: string) => boolean;
  toggleSaveOutfit: (outfitId: string) => void;
  addRecentlyViewed: (outfitId: string) => void;
  clearRecentlyViewed: () => void;
  updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
  // Admin catalog actions
  addOutfit: (outfit: Omit<Outfit, 'id' | 'created_at' | 'updated_at' | 'total_price_inr'> & { total_price_inr?: number }) => Promise<boolean>;
  updateOutfit: (id: string, updates: Partial<Outfit>) => Promise<boolean>;
  deleteOutfit: (id: string) => Promise<boolean>;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addStyleGuide: (guide: Omit<StyleGuide, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
  updateStyleGuide: (id: string, updates: Partial<StyleGuide>) => Promise<boolean>;
  deleteStyleGuide: (id: string) => Promise<boolean>;
  logOutboundClick: (productId: string, outfitId?: string, retailerName?: string, targetUrl?: string) => Promise<void>;
  clearAllDemoItems: () => void;
  loadDemoSampleItems: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PREFS: 'trenro_user_preferences',
  SAVED: 'trenro_saved_outfits',
  HISTORY: 'trenro_recently_viewed',
};

export function DemoProvider({ children }: { children: ReactNode }) {
  const isConfigured = isSupabaseConfigured();
  const [isDemoMode] = useState<boolean>(!isConfigured);

  // Auth User State
  const [user, setUser] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [savedOutfitIds, setSavedOutfitIds] = useState<string[]>([]);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);
  
  // Real catalog items (defaults to empty array; never fake products)
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [styleGuides, setStyleGuides] = useState<StyleGuide[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [outboundClicks, setOutboundClicks] = useState<OutboundClick[]>([]);

  // Load from local storage on mount (Preferences & Saved Wardrobe only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Clean legacy insecure keys
      localStorage.removeItem('trenro_current_user');
      localStorage.removeItem('trenro_custom_products_v3');
      localStorage.removeItem('trenro_custom_outfits_v3');

      // Load Saved Outfits
      const storedSaved = localStorage.getItem(STORAGE_KEYS.SAVED);
      if (storedSaved) {
        setSavedOutfitIds(JSON.parse(storedSaved));
      }

      // Load History
      const storedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (storedHistory) {
        setRecentlyViewedIds(JSON.parse(storedHistory));
      }

      // Load Prefs
      const storedPrefs = localStorage.getItem(STORAGE_KEYS.PREFS);
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
      }
    } catch {
      // LocalStorage fallback
    }

    // If Supabase is configured, check live session & fetch real database catalog
    if (isConfigured) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        // Authenticated Session Verification
        const fetchUserProfile = async (userId: string, email?: string) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, display_name, email, role, avatar_url, created_at, updated_at')
              .eq('id', userId)
              .maybeSingle();

            if (profile) {
              setUser(profile);
            } else {
              setUser({
                id: userId,
                display_name: email?.split('@')[0] || 'User',
                email: email || '',
                role: email?.toLowerCase() === 'ayush@gmail.com' ? 'admin' : 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          } catch {
            setUser({
              id: userId,
              display_name: email?.split('@')[0] || 'User',
              email: email || '',
              role: email?.toLowerCase() === 'ayush@gmail.com' ? 'admin' : 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        };

        supabase.auth.getSession().then((res: any) => {
          const session = res?.data?.session;
          if (session?.user) {
            fetchUserProfile(session.user.id, session.user.email);
          } else {
            setUser(null);
          }
        });

        // Listen for auth state changes (sign in, sign out, token refresh)
        const { data: authListener } = supabase.auth.onAuthStateChange((event: any, session: any) => {
          if (session?.user) {
            fetchUserProfile(session.user.id, session.user.email);
          } else {
            setUser(null);
          }
        });

        // Load Live Products from Database
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .then(({ data, error }: { data: any; error: any }) => {
            if (!error && data) {
              setProducts(data);
            }
          });

        // Load Live Outfits from Database
        supabase
          .from('outfits')
          .select(`
            *,
            products:outfit_products(
              product_id,
              quantity,
              product:products(*)
            )
          `)
          .order('created_at', { ascending: false })
          .then(({ data, error }: { data: any; error: any }) => {
            if (!error && data) {
              const parsedOutfits: Outfit[] = data.map((o: any) => ({
                id: o.id,
                title: o.title,
                slug: o.slug,
                description: o.description,
                cover_image_url: o.cover_image_url,
                video_url: o.video_url || undefined,
                occasion: o.occasion,
                style: o.style,
                fit: o.fit,
                colour_tags: o.colour_tags || [],
                published: o.published,
                featured: o.featured || false,
                likes_count: o.likes_count || 0,
                total_price_inr: calculateOutfitTotal(o.products),
                created_at: o.created_at,
                updated_at: o.updated_at,
                products: (o.products || []).map((p: any) => ({
                  product_id: p.product_id,
                  quantity: p.quantity,
                  product: p.product,
                })),
              }));
              setOutfits(parsedOutfits);
            }
          });

        // Load Live Style Guides
        supabase
          .from('style_guides')
          .select('*')
          .order('published_at', { ascending: false })
          .then(({ data, error }: { data: any; error: any }) => {
            if (!error && data) {
              setStyleGuides(data);
            }
          });

        // Load Live Collections
        supabase
          .from('collections')
          .select('*')
          .order('display_order')
          .then(({ data, error }: { data: any; error: any }) => {
            if (!error && data) {
              setCollections(data);
            }
          });

        return () => {
          authListener?.subscription?.unsubscribe();
        };
      }
    }
  }, [isConfigured]);

  // Auth actions
  const setUserProfile = (profile: Profile | null) => {
    setUser(profile);
  };

  const logout = async () => {
    if (isConfigured) {
      const supabase = getSupabaseBrowserClient();
      await supabase?.auth.signOut();
    }
    setUser(null);
  };

  // Saved / Favourites
  const isSaved = useCallback(
    (outfitId: string) => savedOutfitIds.includes(outfitId),
    [savedOutfitIds]
  );

  const toggleSaveOutfit = (outfitId: string) => {
    setSavedOutfitIds((prev) => {
      const isAlreadySaved = prev.includes(outfitId);
      const next = isAlreadySaved ? prev.filter((id) => id !== outfitId) : [...prev, outfitId];

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(next));
        } catch {
          // ignore
        }
      }

      // If Supabase configured and logged in, sync with database
      if (isConfigured && user) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          if (isAlreadySaved) {
            supabase
              .from('saved_outfits')
              .delete()
              .eq('user_id', user.id)
              .eq('outfit_id', outfitId)
              .then();
          } else {
            supabase
              .from('saved_outfits')
              .insert({ user_id: user.id, outfit_id: outfitId })
              .then();
          }
        }
      }

      return next;
    });
  };

  const addRecentlyViewed = (outfitId: string) => {
    setRecentlyViewedIds((prev) => {
      const filtered = prev.filter((id) => id !== outfitId);
      const next = [outfitId, ...filtered].slice(0, 12);

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(next));
        } catch {
          // ignore
        }
      }

      return next;
    });
  };

  const clearRecentlyViewed = () => {
    setRecentlyViewedIds([]);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
      } catch {
        // ignore
      }
    }
  };

  const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...newPrefs };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(next));
        } catch {
          // ignore
        }
      }

      if (isConfigured && user) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          supabase
            .from('user_preferences')
            .upsert({
              user_id: user.id,
              preferred_budget: next.preferred_budget,
              preferred_styles: next.preferred_styles,
              preferred_colours: next.preferred_colours,
              preferred_occasions: next.preferred_occasions,
              preferred_fits: next.preferred_fits,
              updated_at: new Date().toISOString(),
            })
            .then();
        }
      }

      return next;
    });
  };

  // Admin Product Actions (Real Database Only — Never False Success)
  const addProduct = async (
    productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>
  ): Promise<boolean> => {
    if (!isConfigured) {
      throw new Error(
        'Database is not configured. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment to save products.'
      );
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      throw new Error('Supabase client failed to initialize.');
    }

    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const insertPayload = {
      name: productData.name.trim(),
      slug: slug.trim(),
      category: productData.category,
      sub_category: productData.sub_category || productData.category,
      brand: productData.brand || 'TRENRO',
      retailer_name: 'TRENRO Official',
      product_url: productData.product_url || `/products/${slug.trim()}`,
      image_url: productData.image_url,
      images: productData.images && productData.images.length > 0 ? productData.images : [productData.image_url],
      video_url: productData.video_url || null,
      description: productData.description || '',
      price_inr: productData.price_inr,
      compare_at_price: productData.compare_at_price || null,
      cost_price: productData.cost_price || null,
      currency: 'INR',
      stock_quantity: productData.stock_quantity ?? 45,
      sku: productData.sku || `TRN-${productData.category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      sizes: productData.sizes && productData.sizes.length > 0 ? productData.sizes : ['S', 'M', 'L', 'XL'],
      colors: productData.colors && productData.colors.length > 0 ? productData.colors : ['Default'],
      published: productData.published ?? true,
      availability_status: productData.availability_status || 'in_stock',
      price_verified_at: new Date().toISOString(),
    };

    // 1. Try server-side API first (bypasses RLS & handles missing schema columns automatically)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insertPayload),
      });
      const data = await res.json();
      if (res.ok && data.success && data.product) {
        setProducts((prev) => [data.product as Product, ...prev]);
        return true;
      }
    } catch {
      // Fallback to direct client
    }

    // 2. Client-side fallback with PGRST204 resilience
    let { data, error } = await supabase
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache'))) {
      const fallbackPayload: Record<string, any> = { ...insertPayload };
      delete fallbackPayload.slug;
      delete fallbackPayload.sub_category;

      const retry = await supabase
        .from('products')
        .insert(fallbackPayload)
        .select()
        .single();

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Supabase product insert error:', error);
      throw new Error(error.message || 'Database error occurred while adding product.');
    }

    if (!data) {
      throw new Error('Database did not return the created product record.');
    }

    setProducts((prev) => [data as Product, ...prev]);
    return true;
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
    if (!isConfigured) {
      throw new Error('Database is not configured. Updates cannot be persisted.');
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      throw new Error('Supabase client failed to initialize.');
    }

    // 1. Try server-side API first
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...data.product } : p))
        );
        return true;
      }
    } catch {
      // Fallback
    }

    // 2. Client-side fallback
    const updatePayload: Record<string, any> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error && (error.code === 'PGRST204' || error.message?.includes('schema cache'))) {
      const fallbackPayload: Record<string, any> = { ...updatePayload };
      delete fallbackPayload.slug;
      delete fallbackPayload.sub_category;

      const retry = await supabase
        .from('products')
        .update(fallbackPayload)
        .eq('id', id)
        .select()
        .single();

      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Supabase product update error:', error);
      throw new Error(error.message || 'Database error occurred while updating product.');
    }

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    );

    return true;
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    if (!isConfigured) {
      throw new Error('Database is not configured. Delete cannot be performed.');
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      throw new Error('Supabase client failed to initialize.');
    }

    try {
      const res = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        return true;
      }
    } catch {
      // Fallback
    }

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Supabase product delete error:', error);
      throw new Error(error.message || 'Database error occurred while deleting product.');
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  // Outfit actions
  const addOutfit = async (
    outfitData: Omit<Outfit, 'id' | 'created_at' | 'updated_at' | 'total_price_inr'> & { total_price_inr?: number }
  ): Promise<boolean> => {
    if (!isConfigured) {
      throw new Error('Database is not configured.');
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;

    const { data, error } = await supabase
      .from('outfits')
      .insert({
        title: outfitData.title,
        slug: outfitData.slug,
        description: outfitData.description,
        cover_image_url: outfitData.cover_image_url,
        video_url: outfitData.video_url,
        occasion: outfitData.occasion,
        style: outfitData.style,
        fit: outfitData.fit,
        colour_tags: outfitData.colour_tags,
        published: outfitData.published,
        featured: outfitData.featured,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create outfit');
    }

    return true;
  };

  const updateOutfit = async (id: string, updates: Partial<Outfit>): Promise<boolean> => {
    if (!isConfigured) throw new Error('Database is not configured.');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;

    const { error } = await supabase
      .from('outfits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  };

  const deleteOutfit = async (id: string): Promise<boolean> => {
    if (!isConfigured) throw new Error('Database is not configured.');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;

    const { error } = await supabase.from('outfits').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setOutfits((prev) => prev.filter((o) => o.id !== id));
    return true;
  };

  const addStyleGuide = async (guide: Omit<StyleGuide, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    if (!isConfigured) throw new Error('Database is not configured.');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;

    const { error } = await supabase.from('style_guides').insert(guide);
    if (error) throw new Error(error.message);
    return true;
  };

  const updateStyleGuide = async (id: string, updates: Partial<StyleGuide>): Promise<boolean> => {
    if (!isConfigured) throw new Error('Database is not configured.');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;

    const { error } = await supabase.from('style_guides').update(updates).eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  };

  const deleteStyleGuide = async (id: string): Promise<boolean> => {
    if (!isConfigured) throw new Error('Database is not configured.');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return false;

    const { error } = await supabase.from('style_guides').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setStyleGuides((prev) => prev.filter((g) => g.id !== id));
    return true;
  };

  const logOutboundClick = async () => {
    // No-op for direct-to-consumer brand
  };

  const clearAllDemoItems = () => {
    setProducts([]);
    setOutfits([]);
  };

  const loadDemoSampleItems = () => {
    // Explicitly empty for genuine clothing brand
    setProducts([]);
    setOutfits([]);
  };

  return (
    <DemoContext.Provider
      value={{
        isConfigured,
        isDemoMode,
        user,
        preferences,
        savedOutfitIds,
        recentlyViewedIds,
        outfits,
        products,
        styleGuides,
        collections,
        outboundClicks,
        setUserProfile,
        logout,
        isSaved,
        toggleSaveOutfit,
        addRecentlyViewed,
        clearRecentlyViewed,
        updatePreferences,
        addOutfit,
        updateOutfit,
        deleteOutfit,
        addProduct,
        updateProduct,
        deleteProduct,
        addStyleGuide,
        updateStyleGuide,
        deleteStyleGuide,
        logOutboundClick,
        clearAllDemoItems,
        loadDemoSampleItems,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoStore() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoStore must be used within a DemoProvider');
  }
  return context;
}
