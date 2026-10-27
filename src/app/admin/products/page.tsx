'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useDemoStore } from '@/lib/store/demo-context';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Product, ProductAvailability } from '@/types';
import { formatCurrencyINR } from '@/lib/utils/formatters';
import {
  ShoppingBag,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  X,
  AlertTriangle,
  Upload,
  Video,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Eye,
  EyeOff,
  PackageCheck,
  Tag,
  Layers,
  Check,
  CreditCard,
  Warehouse,
  Globe,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Copy,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Trousers',
  'Cargos',
  'Jackets',
  'Hoodies',
  'Co-ords',
  'Footwear',
];

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

type FormTab = 'basic' | 'media' | 'pricing' | 'variants' | 'inventory' | 'taxonomy' | 'seo';

export default function AdminProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, isConfigured } = useDemoStore();

  // Mode: 'table' or 'editor'
  const [viewMode, setViewMode] = useState<'table' | 'editor'>('table');
  const [activeTab, setActiveTab] = useState<FormTab>('basic');
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStockStatus, setSelectedStockStatus] = useState<string>('all');
  const [selectedPubStatus, setSelectedPubStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'stock'>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('T-Shirts');
  const [subCategory, setSubCategory] = useState('240 GSM Heavyweight');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('TRENRO');
  const [priceInr, setPriceInr] = useState<number>(1499);
  const [compareAtPrice, setCompareAtPrice] = useState<number>(2199);
  const [costPrice, setCostPrice] = useState<number>(650);
  const [stockQuantity, setStockQuantity] = useState<number>(50);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [colorsInput, setColorsInput] = useState('Charcoal Black, Sand Beige');
  const [published, setPublished] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState<ProductAvailability>('in_stock');
  const [imageUrl, setImageUrl] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // File Upload Refs
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const autoGenerateSlug = (val: string) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setIsDirty(true);
    if (!editingProdId) {
      const generated = autoGenerateSlug(val);
      setSlug(generated);
      setMetaTitle(`${val} | TRENRO Menswear`);
    }
  };

  const handleOpenCreate = () => {
    setEditingProdId(null);
    setName('');
    setSlug('');
    setCategory('T-Shirts');
    setSubCategory('240 GSM Heavyweight');
    setSku(`TRN-TSH-${Math.floor(100 + Math.random() * 900)}`);
    setBrand('TRENRO');
    setPriceInr(1499);
    setCompareAtPrice(2199);
    setCostPrice(650);
    setStockQuantity(50);
    setLowStockThreshold(10);
    setSizes(['S', 'M', 'L', 'XL']);
    setColorsInput('Charcoal Black, Sand Beige');
    setPublished(true);
    setAvailabilityStatus('in_stock');
    setImageUrl('');
    setAdditionalImages('');
    setVideoUrl('');
    setDescription('Engineered from 240 GSM 100% combed long-staple Indian cotton with ribbed collar and structured drop-shoulder drape.');
    setMetaTitle('New Season Apparel | TRENRO Menswear');
    setMetaDescription('Original TRENRO garment tailored with custom heavyweight fabrics and durable Indian fit architecture.');
    setIsDirty(false);
    setActiveTab('basic');
    setViewMode('editor');
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProdId(p.id);
    setName(p.name);
    setSlug(p.slug || autoGenerateSlug(p.name));
    setCategory(p.category);
    setSubCategory(p.sub_category || p.category);
    setSku(p.sku || `TRN-${p.category.substring(0, 3).toUpperCase()}-001`);
    setBrand(p.brand || 'TRENRO');
    setPriceInr(p.price_inr);
    setCompareAtPrice(p.compare_at_price || Math.round(p.price_inr * 1.4));
    setCostPrice(p.cost_price || Math.round(p.price_inr * 0.45));
    setStockQuantity(p.stock_quantity ?? 30);
    setLowStockThreshold(10);
    setSizes(p.sizes && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL']);
    setColorsInput(p.colors ? p.colors.join(', ') : 'Charcoal');
    setPublished(p.published ?? true);
    setAvailabilityStatus(p.availability_status);
    setImageUrl(p.image_url);
    setAdditionalImages(p.images && p.images.length > 1 ? p.images.slice(1).join('\n') : '');
    setVideoUrl(p.video_url || '');
    setDescription(p.description || '');
    setMetaTitle(`${p.name} | TRENRO Menswear`);
    setMetaDescription(p.description || `Original ${p.name} by TRENRO.`);
    setIsDirty(false);
    setActiveTab('basic');
    setViewMode('editor');
  };

  const handleCloseEditor = () => {
    if (isDirty) {
      if (!window.confirm('You have unsaved changes. Discard and return to catalog table?')) {
        return;
      }
    }
    setViewMode('table');
  };

  const toggleSize = (size: string) => {
    setIsDirty(true);
    setSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be less than 10MB.');
      return;
    }

    setIsUploadingMedia(true);
    try {
      if (isConfigured) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `garments/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('product-media')
            .upload(filePath, file, { cacheControl: '3600', upsert: false });

          if (uploadError) {
            console.error('Storage upload error:', uploadError);
            alert(`Storage upload error: ${uploadError.message}. Ensure the 'product-media' bucket exists in your Supabase project.`);
            return;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('product-media')
            .getPublicUrl(filePath);

          setImageUrl(publicUrl);
          setIsDirty(true);
          setFeedback({ type: 'success', message: 'Image uploaded to product-media storage successfully.' });
          setTimeout(() => setFeedback(null), 3000);
          return;
        }
      }

      alert('Database storage is not configured. Please configure your Supabase credentials in .env.local or enter a direct image URL.');
    } catch (err: any) {
      alert(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsUploadingMedia(false);
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
      }
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert('For performance, please host video clips on a CDN/streaming provider and enter the direct video URL.');
    }
  };

  const handleQuickTogglePublish = async (p: Product) => {
    const nextPublished = !p.published;
    try {
      const ok = await updateProduct(p.id, { published: nextPublished });
      if (ok) {
        setFeedback({
          type: 'success',
          message: `Garment "${p.name}" is now ${nextPublished ? 'Published' : 'Draft'}.`,
        });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update publication status.' });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleSaveProduct = async (shouldPublish?: boolean) => {
    if (!name.trim()) {
      alert('Product title is required.');
      setActiveTab('basic');
      return;
    }
    if (!imageUrl.trim()) {
      alert('Primary product image URL is required.');
      setActiveTab('media');
      return;
    }
    if (priceInr <= 0) {
      alert('Selling price must be greater than 0.');
      setActiveTab('pricing');
      return;
    }

    setIsSubmitting(true);

    const isPub = shouldPublish !== undefined ? shouldPublish : published;

    const parsedColors = colorsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const extraImages = additionalImages
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http') || u.startsWith('data:'));

    const allImages = [imageUrl, ...extraImages].filter(Boolean);

    const payload = {
      name: name.trim(),
      slug: slug.trim() || autoGenerateSlug(name),
      category,
      sub_category: subCategory.trim(),
      sku: sku.trim(),
      brand: brand.trim() || 'TRENRO',
      retailer_name: 'TRENRO Official',
      product_url: `/products/${slug.trim() || autoGenerateSlug(name)}`,
      price_inr: Number(priceInr),
      compare_at_price: compareAtPrice ? Number(compareAtPrice) : undefined,
      cost_price: costPrice ? Number(costPrice) : undefined,
      currency: 'INR',
      stock_quantity: Number(stockQuantity),
      sizes,
      colors: parsedColors,
      published: isPub,
      availability_status: stockQuantity > 0 ? availabilityStatus : ('out_of_stock' as ProductAvailability),
      image_url: imageUrl.trim(),
      images: allImages,
      video_url: videoUrl.trim() || undefined,
      description: description.trim(),
      price_verified_at: new Date().toISOString(),
    };

    try {
      if (editingProdId) {
        const ok = await updateProduct(editingProdId, payload);
        if (ok) {
          setFeedback({ type: 'success', message: `Garment "${name}" updated and saved to database.` });
          setIsDirty(false);
          setViewMode('table');
        } else {
          setFeedback({ type: 'error', message: 'Failed to update garment in database.' });
        }
      } else {
        const ok = await addProduct(payload);
        if (ok) {
          setFeedback({ type: 'success', message: `Garment "${name}" successfully created and saved.` });
          setIsDirty(false);
          setViewMode('table');
        } else {
          setFeedback({ type: 'error', message: 'Failed to create garment in database.' });
        }
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Database mutation failed. Please verify credentials.' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkPublish = async (status: boolean) => {
    for (const id of selectedIds) {
      await updateProduct(id, { published: status });
    }
    setFeedback({
      type: 'success',
      message: `${selectedIds.length} garments updated to ${status ? 'Published' : 'Draft'}.`,
    });
    setSelectedIds([]);
    setTimeout(() => setFeedback(null), 3000);
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSku = p.sku?.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchCat && !matchDesc) return false;
        }

        if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }

        if (selectedStockStatus !== 'all') {
          if (selectedStockStatus === 'in_stock' && p.availability_status !== 'in_stock') return false;
          if (selectedStockStatus === 'low_stock' && p.availability_status !== 'low_stock') return false;
          if (selectedStockStatus === 'out_of_stock' && p.availability_status !== 'out_of_stock') return false;
        }

        if (selectedPubStatus !== 'all') {
          if (selectedPubStatus === 'published' && !p.published) return false;
          if (selectedPubStatus === 'draft' && p.published) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price_inr - b.price_inr;
        if (sortBy === 'price_desc') return b.price_inr - a.price_inr;
        if (sortBy === 'stock') return (b.stock_quantity ?? 0) - (a.stock_quantity ?? 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, searchQuery, selectedCategory, selectedStockStatus, selectedPubStatus, sortBy]);

  // Paginated list
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Financial calculations
  const grossProfit = Math.max(0, priceInr - costPrice);
  const grossMarginPct = priceInr > 0 ? Math.round((grossProfit / priceInr) * 100) : 0;

  // -------------------------------------------------------------
  // RENDER: FULL-PAGE TABBED PRODUCT EDITOR
  // -------------------------------------------------------------
  if (viewMode === 'editor') {
    return (
      <div className="space-y-6 animate-fade-in pb-24">
        {/* Editor Top Navigation & Action Bar */}
        <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCloseEditor}
              className="p-2 text-[#737373] hover:text-[#171717] hover:bg-[#F6F3ED] rounded-xl transition-colors cursor-pointer"
              title="Return to Catalog Table"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#72785B]">
                  Apparel Editor
                </span>
                <span className="text-xs text-[#A3A3A3]">•</span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  published ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {published ? 'Published' : 'Draft'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#171717] tracking-tight truncate max-w-md">
                {editingProdId ? (name || 'Edit Garment') : (name || 'New TRENRO Garment')}
              </h2>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F6F3ED] rounded-xl border border-[#E8E3D9] text-xs">
              <span className="text-[#737373]">Gross Margin:</span>
              <strong className="text-[#171717] font-black">{grossMarginPct}%</strong>
              <span className="text-[10px] text-emerald-700 font-semibold">(+{formatCurrencyINR(grossProfit)})</span>
            </div>

            <button
              type="button"
              onClick={handleCloseEditor}
              className="px-4 py-2 border border-[#E8E3D9] hover:bg-[#F6F3ED] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveProduct(false)}
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#F6F3ED] hover:bg-[#E8E3D9] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveProduct(true)}
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Publish Garment
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form Tab Navigation Strip */}
        <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-2xl p-2 shadow-xs overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 min-w-max">
            {[
              { id: 'basic', label: '1. Basic Information', icon: Info, complete: Boolean(name && sku && category) },
              { id: 'media', label: '2. Images & Media', icon: Upload, complete: Boolean(imageUrl) },
              { id: 'pricing', label: '3. Pricing & Margins', icon: CreditCard, complete: priceInr > 0 },
              { id: 'variants', label: '4. Sizes & Colors', icon: Layers, complete: sizes.length > 0 },
              { id: 'inventory', label: '5. Inventory & Stock', icon: Warehouse, complete: stockQuantity >= 0 },
              { id: 'taxonomy', label: '6. Classification', icon: Tag, complete: Boolean(subCategory) },
              { id: 'seo', label: '7. SEO & Store Preview', icon: Globe, complete: Boolean(slug) },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as FormTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-[#F6F3ED] shadow-sm'
                      : 'text-[#525252] hover:bg-[#F6F3ED] hover:text-[#171717]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#72785B]' : 'text-[#737373]'}`} />
                  <span>{tab.label}</span>
                  {tab.complete && !isActive && (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="bg-[#FFFFFF] border border-[#E8E3D9] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-6 max-w-3xl animate-fade-in">
              <div className="border-b border-[#F6F3ED] pb-4 space-y-1">
                <h3 className="text-base font-black uppercase text-[#171717]">Basic Apparel Information</h3>
                <p className="text-xs text-[#737373]">Enter the canonical title, clothing classification, unique SKU, and description.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. 260 GSM Heavyweight Boxy Tee (Sand Beige)"
                    className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:border-[#72785B] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#737373]">Include colorway or signature fabric attribute in the title.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-[#171717] uppercase tracking-wider block">
                      Canonical URL Slug *
                    </label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => { setSlug(e.target.value); setIsDirty(true); }}
                      placeholder="e.g. 260-gsm-heavyweight-boxy-tee"
                      className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs font-mono text-[#171717] focus:bg-white focus:border-[#72785B] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#171717] uppercase tracking-wider block">
                      Internal Product SKU *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={(e) => { setSku(e.target.value); setIsDirty(true); }}
                        placeholder="e.g. TRN-TSH-842"
                        className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs font-mono font-bold text-[#171717] focus:bg-white focus:border-[#72785B] focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const catCode = category.substring(0, 3).toUpperCase();
                          setSku(`TRN-${catCode}-${Math.floor(100 + Math.random() * 900)}`);
                          setIsDirty(true);
                        }}
                        className="px-3 py-2 bg-[#F6F3ED] hover:bg-[#E8E3D9] rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#171717] shrink-0"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-[#171717] uppercase tracking-wider block">
                      Primary Clothing Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => { setCategory(e.target.value); setIsDirty(true); }}
                      className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs font-bold text-[#171717] focus:bg-white focus:outline-none cursor-pointer"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-[#171717] uppercase tracking-wider block">
                      Brand / Line
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => { setBrand(e.target.value); setIsDirty(true); }}
                      placeholder="TRENRO"
                      className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Product Description & Styling Notes
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => { setDescription(e.target.value); setIsDirty(true); }}
                    placeholder="Describe the fabric weight, GSM, silhouette drape, wash care, and pairing recommendations..."
                    className="w-full p-4 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] leading-relaxed focus:bg-white focus:border-[#72785B] focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] text-[#737373]">
                    <span>Suggested: 120–250 words for optimal SEO and customer clarity.</span>
                    <span>{description.length} characters</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGES & MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-6 max-w-4xl animate-fade-in">
              <div className="border-b border-[#F6F3ED] pb-4 space-y-1">
                <h3 className="text-base font-black uppercase text-[#171717]">Garment Media & Photography</h3>
                <p className="text-xs text-[#737373]">Manage high-resolution lookbook assets, multi-angle thumbnails, and video clips.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-7 space-y-5 text-xs">
                  {/* Primary Cover Image URL */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#171717] uppercase tracking-wider block">
                      Primary Cover Image URL *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        value={imageUrl}
                        onChange={(e) => { setImageUrl(e.target.value); setIsDirty(true); }}
                        placeholder="https://images.unsplash.com/... or data:image/..."
                        className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => imageFileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#F6F3ED] hover:bg-[#E8E3D9] border border-[#E8E3D9] rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5 shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload File
                      </button>
                    </div>
                    <input
                      ref={imageFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Additional Gallery Image URLs */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#171717] uppercase tracking-wider block">
                      Additional Gallery Image URLs (One Per Line)
                    </label>
                    <textarea
                      rows={3}
                      value={additionalImages}
                      onChange={(e) => { setAdditionalImages(e.target.value); setIsDirty(true); }}
                      placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2..."
                      className="w-full p-4 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs font-mono text-[#171717] leading-relaxed focus:bg-white focus:outline-none"
                    />
                    <span className="text-[10px] text-[#737373]">Provide front, side, collar detail, and back drape views.</span>
                  </div>

                  {/* Video URL */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-[#171717] uppercase tracking-wider block">
                      Garment Video Clip URL (MP4 / WebM)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={videoUrl}
                        onChange={(e) => { setVideoUrl(e.target.value); setIsDirty(true); }}
                        placeholder="https://assets.trenro.com/videos/garment-walk.mp4"
                        className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#F6F3ED] hover:bg-[#E8E3D9] border border-[#E8E3D9] rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#171717] flex items-center gap-1.5 shrink-0"
                      >
                        <Video className="w-3.5 h-3.5" /> Upload
                      </button>
                    </div>
                    <input
                      ref={videoFileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Live Media Preview Card */}
                <div className="md:col-span-5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-2xl p-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block">
                    Live Media Viewport
                  </span>
                  {imageUrl ? (
                    <div className="relative aspect-fashion rounded-xl overflow-hidden bg-white border border-[#E8E3D9] shadow-inner">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 text-white text-[9px] font-bold uppercase rounded">
                        Cover Preview
                      </span>
                    </div>
                  ) : (
                    <div className="aspect-fashion rounded-xl border border-dashed border-[#A3A3A3] flex items-center justify-center text-xs text-[#737373]">
                      No Image Configured
                    </div>
                  )}
                  {videoUrl && (
                    <div className="p-2 bg-white rounded-lg border border-[#E8E3D9] text-[10px] text-[#72785B] font-bold flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" /> Video attached & verified
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & MARGINS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6 max-w-3xl animate-fade-in">
              <div className="border-b border-[#F6F3ED] pb-4 space-y-1">
                <h3 className="text-base font-black uppercase text-[#171717]">Pricing Architecture & Margins</h3>
                <p className="text-xs text-[#737373]">Configure customer selling price, compare-at pricing, and internal production cost.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Customer Selling Price (INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={priceInr}
                    onChange={(e) => { setPriceInr(Number(e.target.value)); setIsDirty(true); }}
                    className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs font-black text-[#171717] focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-[#737373]">Amount charged at checkout.</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Compare-At Price (MRP)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={compareAtPrice}
                    onChange={(e) => { setCompareAtPrice(Number(e.target.value)); setIsDirty(true); }}
                    className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#737373] focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-[#737373]">Shown with a strike-through.</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Internal Cost Price (Staff Only)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={costPrice}
                    onChange={(e) => { setCostPrice(Number(e.target.value)); setIsDirty(true); }}
                    className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-[#737373]">Fabric + Cutting + Packaging cost.</span>
                </div>
              </div>

              {/* Real-time Profit & Margin Card */}
              <div className="p-6 bg-[#F6F3ED] border border-[#E8E3D9] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block">Gross Profit / Unit</span>
                  <p className="text-2xl font-black text-[#171717] mt-1">{formatCurrencyINR(grossProfit)}</p>
                  <span className="text-[10px] text-[#737373]">Selling - Production Cost</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block">Gross Margin %</span>
                  <p className="text-2xl font-black text-emerald-700 mt-1">{grossMarginPct}%</p>
                  <span className="text-[10px] text-[#737373]">Industry standard: 50%–70%</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] block">Inventory Asset Value</span>
                  <p className="text-2xl font-black text-[#171717] mt-1">{formatCurrencyINR(costPrice * stockQuantity)}</p>
                  <span className="text-[10px] text-[#737373]">{stockQuantity} units in stock</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SIZES & VARIANTS */}
          {activeTab === 'variants' && (
            <div className="space-y-6 max-w-3xl animate-fade-in">
              <div className="border-b border-[#F6F3ED] pb-4 space-y-1">
                <h3 className="text-base font-black uppercase text-[#171717]">Sizes, Fits & Colorways</h3>
                <p className="text-xs text-[#737373]">Toggle available garment sizes and define colorway options.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#171717] uppercase tracking-wider block">
                      Available Sizes *
                    </label>
                    <div className="flex gap-2 text-[10px]">
                      <button
                        type="button"
                        onClick={() => { setSizes(AVAILABLE_SIZES); setIsDirty(true); }}
                        className="text-[#72785B] font-bold hover:underline cursor-pointer"
                      >
                        Select All
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => { setSizes([]); setIsDirty(true); }}
                        className="text-[#737373] font-bold hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    {AVAILABLE_SIZES.map((sz) => {
                      const active = sizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`py-3 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                            active
                              ? 'bg-[#171717] text-white border-[#171717] shadow-sm'
                              : 'bg-[#F6F3ED] text-[#737373] border-[#E8E3D9] hover:border-[#171717]'
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Colorways (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={colorsInput}
                    onChange={(e) => { setColorsInput(e.target.value); setIsDirty(true); }}
                    placeholder="e.g. Charcoal Black, Sand Beige, Ecru Off-White"
                    className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {colorsInput.split(',').map((c, i) => {
                      const trimmed = c.trim();
                      if (!trimmed) return null;
                      return (
                        <span key={i} className="px-2.5 py-0.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded text-[10px] font-semibold text-[#171717]">
                          {trimmed}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INVENTORY & STOCK */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 max-w-3xl animate-fade-in">
              <div className="border-b border-[#F6F3ED] pb-4 space-y-1">
                <h3 className="text-base font-black uppercase text-[#171717]">Warehouse Inventory & Logistics</h3>
                <p className="text-xs text-[#737373]">Monitor units on hand and configure low-stock triggers.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Starting Stock Count (Units) *
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stockQuantity}
                    onChange={(e) => { setStockQuantity(Number(e.target.value)); setIsDirty(true); }}
                    className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs font-black text-[#171717] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Low-Stock Alert Ceiling
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={lowStockThreshold}
                    onChange={(e) => { setLowStockThreshold(Number(e.target.value)); setIsDirty(true); }}
                    className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:outline-none"
                  />
                  <span className="text-[10px] text-[#737373]">Warns admin when stock dips below this number.</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Catalog Availability Override
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'in_stock', label: 'In Stock', desc: 'Available for instant checkout' },
                    { id: 'low_stock', label: 'Low Stock', desc: 'Shows urgency badge' },
                    { id: 'out_of_stock', label: 'Out of Stock', desc: 'Disables Add to Bag' },
                  ].map((st) => (
                    <label
                      key={st.id}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        availabilityStatus === st.id
                          ? 'bg-[#171717] text-white border-[#171717]'
                          : 'bg-[#F6F3ED] text-[#171717] border-[#E8E3D9]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase">{st.label}</span>
                        <input
                          type="radio"
                          name="availabilityStatus"
                          checked={availabilityStatus === st.id}
                          onChange={() => { setAvailabilityStatus(st.id as ProductAvailability); setIsDirty(true); }}
                          className="accent-[#72785B]"
                        />
                      </div>
                      <span className={`text-[10px] mt-1 ${availabilityStatus === st.id ? 'text-[#D4A36A]' : 'text-[#737373]'}`}>
                        {st.desc}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: TAXONOMY & CLASSIFICATION */}
          {activeTab === 'taxonomy' && (
            <div className="space-y-6 max-w-3xl animate-fade-in">
              <div className="border-b border-[#F6F3ED] pb-4 space-y-1">
                <h3 className="text-base font-black uppercase text-[#171717]">Taxonomy & Merchandising</h3>
                <p className="text-xs text-[#737373]">Configure fabric classifications and subcategory filters.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Fabric / Style Subcategory
                  </label>
                  <input
                    type="text"
                    value={subCategory}
                    onChange={(e) => { setSubCategory(e.target.value); setIsDirty(true); }}
                    placeholder="e.g. 240 GSM Waffle Knit, French Linen, Pleated Suiting"
                    className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="p-4 bg-[#F6F3ED] border border-[#E8E3D9] rounded-2xl space-y-2 text-xs text-[#737373]">
                  <strong className="text-[#171717] block">TRENRO Standard Fabrics:</strong>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    <li>Heavyweight Tees: 240 GSM &bull; 260 GSM &bull; 280 GSM</li>
                    <li>Resort Shirts: 100% Pure Flax Linen &bull; Cotton-Linen Blend</li>
                    <li>Trousers: Gurkha Suiting Twill &bull; Peach-Finish Twill Chinos</li>
                    <li>Outerwear: 14oz Raw Ring-Spun Denim &bull; Cotton Duck Canvas</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SEO & STORE PREVIEW */}
          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-3xl animate-fade-in">
              <div className="border-b border-[#F6F3ED] pb-4 space-y-1">
                <h3 className="text-base font-black uppercase text-[#171717]">SEO & Storefront Preview</h3>
                <p className="text-xs text-[#737373]">Preview how this garment will appear to shoppers on Google and the storefront.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-4 bg-[#F6F3ED] border border-[#E8E3D9] rounded-2xl">
                  <div>
                    <strong className="font-bold text-xs uppercase text-[#171717] block">Publication Status</strong>
                    <span className="text-[11px] text-[#737373]">Published garments appear on the public storefront. Drafts are internal only.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setPublished(!published); setIsDirty(true); }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                      published ? 'bg-emerald-700 text-white' : 'bg-amber-600 text-white'
                    }`}
                  >
                    {published ? 'Published on Store' : 'Draft Only'}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    SEO Meta Title
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => { setMetaTitle(e.target.value); setIsDirty(true); }}
                    placeholder="e.g. 260 GSM Heavyweight Boxy Tee | TRENRO"
                    className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    SEO Meta Description
                  </label>
                  <textarea
                    rows={2}
                    value={metaDescription}
                    onChange={(e) => { setMetaDescription(e.target.value); setIsDirty(true); }}
                    placeholder="e.g. Buy authentic TRENRO heavyweight 260 GSM combed cotton tee with drop-shoulder cut..."
                    className="w-full p-4 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] leading-relaxed focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Google Search Snippet Preview */}
                <div className="p-4 bg-white border border-[#E8E3D9] rounded-xl space-y-1">
                  <span className="text-[10px] text-[#737373] uppercase font-bold tracking-wider">Search Engine Snippet</span>
                  <p className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer truncate">
                    {metaTitle || `${name} | TRENRO Menswear`}
                  </p>
                  <p className="text-[11px] text-emerald-800 font-mono">
                    https://trenro.com/products/{slug || 'apparel-slug'}
                  </p>
                  <p className="text-xs text-[#525252] line-clamp-2">
                    {metaDescription || description || 'Original TRENRO garment tailored with custom heavyweight fabrics and durable Indian fit architecture.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E8E3D9] p-4 shadow-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-xs text-[#737373] hidden sm:block">
              {isDirty ? (
                <span className="text-amber-700 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Unsaved changes in editor
                </span>
              ) : (
                <span>All values match latest persisted state.</span>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button
                type="button"
                onClick={handleCloseEditor}
                className="px-4 py-2.5 border border-[#E8E3D9] hover:bg-[#F6F3ED] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={() => handleSaveProduct(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-[#F6F3ED] hover:bg-[#E8E3D9] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveProduct(true)}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer shadow-md flex items-center gap-2"
              >
                {isSubmitting ? 'Saving...' : 'Publish to Store'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: CATALOG TABLE VIEW
  // -------------------------------------------------------------
  return (
    <div className="bg-white border border-[#E8E3D9] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F6F3ED]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#171717] tracking-tight">
              TRENRO Apparel Catalog CMS
            </h2>
            <span className="px-2.5 py-0.5 bg-[#72785B]/10 text-[#72785B] border border-[#72785B]/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
              {products.length} Garments
            </span>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Full-featured D2C product desk with size matrices, INR pricing, stock control, and cloud persistence.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Apparel
        </button>
      </div>

      {/* Storage & Persistence Status Banner */}
      <div className="p-3.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl flex items-center justify-between text-xs text-[#737373]">
        <div className="flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {isConfigured ? (
              <span className="font-semibold text-emerald-800">
                Connected to Supabase Database — Live cloud synchronization active.
              </span>
            ) : (
              <span>
                <strong className="text-[#171717]">Local Persistent Storage Active</strong> — Changes saved reliably to local storage cache and survive reload.
              </span>
            )}
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#A3A3A3] hidden sm:inline">
          D2C Commerce v3.0
        </span>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search and Filters Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input */}
        <div className="relative lg:col-span-2">
          <Search className="w-4 h-4 text-[#A3A3A3] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, SKU, or fabric..."
            className="w-full pl-9 pr-3 py-2 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs focus:bg-white focus:border-[#72785B] focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] cursor-pointer"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div>
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="w-full px-3 py-2 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] cursor-pointer"
          >
            <option value="all">All Inventory</option>
            <option value="in_stock">In Stock (10+)</option>
            <option value="low_stock">Low Stock (&lt;10)</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] cursor-pointer"
          >
            <option value="newest">Sort: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="stock">Stock Quantity</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl flex items-center justify-between text-xs animate-fade-in">
          <span className="font-bold text-[#171717]">
            {selectedIds.length} {selectedIds.length === 1 ? 'garment' : 'garments'} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkPublish(true)}
              className="px-3 py-1 bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-800"
            >
              Publish Selected
            </button>
            <button
              type="button"
              onClick={() => handleBulkPublish(false)}
              className="px-3 py-1 bg-[#171717] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#333]"
            >
              Draft Selected
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      {filteredProducts.length > 0 ? (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-[#E8E3D9] rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#E8E3D9] text-[#737373] uppercase font-bold text-[10px] tracking-wider">
                  <th className="py-3 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="accent-[#171717] rounded cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-3">Garment</th>
                  <th className="py-3 px-3">SKU & Category</th>
                  <th className="py-3 px-3">Selling Price (INR)</th>
                  <th className="py-3 px-3">Sizes</th>
                  <th className="py-3 px-3">Inventory</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F3ED]">
                {paginatedProducts.map((p) => {
                  const isPublished = p.published ?? true;
                  const isChecked = selectedIds.includes(p.id);

                  return (
                    <tr key={p.id} className="hover:bg-[#FDFBF7] transition-colors">
                      {/* Checkbox */}
                      <td className="py-3 px-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectOne(p.id)}
                          className="accent-[#171717] rounded cursor-pointer"
                        />
                      </td>

                      {/* Media & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-[#F6F3ED] border border-[#E8E3D9] shrink-0">
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            {p.video_url && (
                              <span className="absolute bottom-1 right-1 p-0.5 bg-black/80 rounded text-[#BD8B52]">
                                <Video className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#171717] block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-[#737373] font-mono">
                              /{p.slug || 'no-slug'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* SKU & Category */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[#171717] font-bold block">
                          {p.sku || 'N/A'}
                        </span>
                        <span className="text-[10px] text-[#72785B] font-semibold">
                          {p.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <span className="font-black text-[#171717] block">
                          {formatCurrencyINR(p.price_inr)}
                        </span>
                        {p.cost_price && (
                          <span className="text-[10px] text-[#737373]">
                            Cost: {formatCurrencyINR(p.cost_price)}
                          </span>
                        )}
                      </td>

                      {/* Sizes */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {(p.sizes || ['S', 'M', 'L']).map((sz) => (
                            <span
                              key={sz}
                              className="px-1.5 py-0.2 bg-[#F6F3ED] text-[#171717] rounded text-[9px] font-bold border border-[#E8E3D9]"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Inventory Count */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              (p.stock_quantity ?? 30) <= 0
                                ? 'bg-red-500'
                                : (p.stock_quantity ?? 30) < 10
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span className="font-bold text-[#171717]">{p.stock_quantity ?? 30} units</span>
                        </div>
                        <span className="text-[10px] text-[#737373] capitalize">
                          {p.availability_status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => handleQuickTogglePublish(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors border cursor-pointer ${
                            isPublished
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100'
                              : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                          }`}
                          title="Click to toggle publish status"
                        >
                          {isPublished ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" /> Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-600" /> Draft
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right space-x-1 whitespace-nowrap">
                        <Link
                          href={`/products/${p.id}`}
                          target="_blank"
                          className="p-1.5 text-[#555] hover:text-[#171717] hover:bg-[#F6F3ED] rounded-lg transition-colors inline-block"
                          title="View on Storefront"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-[#555] hover:text-[#72785B] hover:bg-[#F6F3ED] rounded-lg transition-colors cursor-pointer"
                          title="Edit in Full-Page Workspace"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(p.id)}
                          className="p-1.5 text-[#555] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Garment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs text-[#737373]">
            <span>
              Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
              <strong>{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</strong> of{' '}
              <strong>{filteredProducts.length}</strong> garments
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    currentPage === i + 1
                      ? 'bg-[#171717] text-white'
                      : 'bg-[#F6F3ED] text-[#171717] border border-[#E8E3D9]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-lg text-xs font-bold disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-[#737373] space-y-4 bg-[#F6F3ED] border border-[#E8E3D9] rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-white text-[#72785B] flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#171717]">No Matching Garments</h3>
          <p className="max-w-md mx-auto text-xs text-[#737373] leading-relaxed">
            No products match the selected filters. Adjust your search or add a new TRENRO garment to the catalog.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add First Garment
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#E8E3D9] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-base">Confirm Deletion</h4>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Are you sure you want to delete this garment listing from the catalog? This action will remove it from both database and local persistent storage.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-[#E8E3D9] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  await deleteProduct(id);
                  setFeedback({ type: 'success', message: 'Garment deleted from catalog.' });
                  setTimeout(() => setFeedback(null), 3000);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
