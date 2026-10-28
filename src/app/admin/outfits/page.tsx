'use client';

import React, { useState, useRef } from 'react';
import { useDemoStore } from '@/lib/store/demo-context';
import { Outfit, OutfitProductItem } from '@/types';
import { formatINR, calculateOutfitTotal } from '@/lib/utils/formatters';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  ShoppingBag,
  AlertTriangle,
  Upload,
  Video,
  Play,
  Film,
  Image as ImageIcon,
} from 'lucide-react';

export default function AdminOutfitsPage() {
  const { outfits, products, addOutfit, updateOutfit, deleteOutfit } = useDemoStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOutfitId, setEditingOutfitId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [occasion, setOccasion] = useState('College');
  const [style, setStyle] = useState('Streetwear');
  const [fit, setFit] = useState('Regular');
  const [colourTagsInput, setColourTagsInput] = useState('Black, White');
  const [published, setPublished] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // File Upload Refs
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Computed total budget from selected products
  const computedTotal = selectedProductIds.reduce((acc, pid) => {
    const prod = products.find((p) => p.id === pid);
    return acc + (prod?.price_inr || 0);
  }, 0);

  const handleOpenCreate = () => {
    setEditingOutfitId(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setCoverImageUrl('');
    setVideoUrl('');
    setOccasion('College');
    setStyle('Streetwear');
    setFit('Relaxed');
    setColourTagsInput('Black, White, Cream');
    setPublished(true);
    setSelectedProductIds([]);
    setModalOpen(true);
  };

  const handleOpenEdit = (outfit: Outfit) => {
    setEditingOutfitId(outfit.id);
    setTitle(outfit.title);
    setSlug(outfit.slug);
    setDescription(outfit.description);
    setCoverImageUrl(outfit.cover_image_url);
    setVideoUrl(outfit.video_url || '');
    setOccasion(outfit.occasion);
    setStyle(outfit.style);
    setFit(outfit.fit);
    setColourTagsInput(outfit.colour_tags.join(', '));
    setPublished(outfit.published);
    setSelectedProductIds(outfit.products?.map((p) => p.product_id) || []);
    setModalOpen(true);
  };

  const handleToggleProduct = (pid: string) => {
    if (selectedProductIds.includes(pid)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== pid));
    } else {
      setSelectedProductIds([...selectedProductIds, pid]);
    }
  };

  // Local Image File to Data URL
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Local Video File to Data URL
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setVideoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim()) {
      alert('Please fill out the title and slug');
      return;
    }

    const items: OutfitProductItem[] = selectedProductIds.map((pid) => {
      const prod = products.find((p) => p.id === pid)!;
      return {
        product_id: pid,
        quantity: 1,
        product: prod,
      };
    });

    const parsedTags = colourTagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingOutfitId) {
      updateOutfit(editingOutfitId, {
        title,
        slug,
        description,
        cover_image_url: coverImageUrl,
        video_url: videoUrl || undefined,
        occasion,
        style,
        fit,
        colour_tags: parsedTags,
        published,
        products: items,
      });
    } else {
      addOutfit({
        title,
        slug,
        description,
        cover_image_url: coverImageUrl,
        video_url: videoUrl || undefined,
        occasion,
        style,
        fit,
        colour_tags: parsedTags,
        published,
        products: items,
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F1E8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#BD8B52]" /> Outfit Catalog Management
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Add, edit, and organize complete looks with photo uploads, runway videos, and linked garments.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#BD8B52] hover:bg-[#A3743E] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create New Look
        </button>
      </div>

      {/* Outfits Table */}
      {outfits.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-[#737373] uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-3">Media</th>
                <th className="py-3 px-3">Title & Slug</th>
                <th className="py-3 px-3">Occasion</th>
                <th className="py-3 px-3">Style & Fit</th>
                <th className="py-3 px-3">Items</th>
                <th className="py-3 px-3">Total</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F1E8]">
              {outfits.map((outfit) => {
                const total = calculateOutfitTotal(outfit.products);
                return (
                  <tr key={outfit.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-3 px-3">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-[#F5F1E8] border border-[#E5E0D8]">
                        <img
                          src={outfit.cover_image_url}
                          alt={outfit.title}
                          className="w-full h-full object-cover"
                        />
                        {outfit.video_url && (
                          <span
                            className="absolute bottom-1 right-1 p-0.5 bg-black/80 rounded text-[#BD8B52]"
                            title="Has Runway Video"
                          >
                            <Video className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <h4 className="font-bold text-[#171717]">{outfit.title}</h4>
                      <span className="text-[10px] text-[#A3A3A3]">/{outfit.slug}</span>
                    </td>
                    <td className="py-3 px-3 text-[#555] font-medium">{outfit.occasion}</td>
                    <td className="py-3 px-3 text-[#555]">
                      {outfit.style} ({outfit.fit})
                    </td>
                    <td className="py-3 px-3 text-[#555]">{outfit.products?.length || 0} pieces</td>
                    <td className="py-3 px-3 font-bold text-[#171717]">{formatINR(total)}</td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => updateOutfit(outfit.id, { published: !outfit.published })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                          outfit.published
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        {outfit.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(outfit)}
                        className="p-1.5 text-[#555] hover:text-[#BD8B52] rounded transition-colors"
                        title="Edit Outfit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(outfit.id)}
                        className="p-1.5 text-[#555] hover:text-red-600 rounded transition-colors"
                        title="Delete Outfit"
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
      ) : (
        <div className="p-12 text-center text-xs text-[#737373] space-y-4 bg-[#FDFBF7] border border-[#E5E0D8] rounded-2xl">
          <div className="w-12 h-12 rounded-full bg-white text-[#BD8B52] flex items-center justify-center mx-auto shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#171717]">No Outfits in Store</h3>
          <p className="max-w-md mx-auto text-xs text-[#737373] leading-relaxed">
            Your storefront is clean. Create a new outfit with photos and videos or generate one instantly using the AI engine.
          </p>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 bg-[#BD8B52] hover:bg-[#A3743E] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create First Outfit
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-base">Delete Outfit</h4>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Are you sure you want to permanently remove this outfit from the catalog?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 border border-[#E5E0D8] rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOutfit(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3.5 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Outfit Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#F5F1E8]">
              <div>
                <h3 className="text-lg font-black text-[#171717]">
                  {editingOutfitId ? 'Edit Outfit' : 'Create New Head-to-Toe Outfit'}
                </h3>
                <span className="text-[11px] text-[#737373]">
                  Include photos, runway video, and pair individual garments.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-[#737373] hover:text-[#171717] font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Outfit Title
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingOutfitId) {
                        setSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)+/g, '')
                        );
                      }
                    }}
                    placeholder="e.g. Modern Cuban Collar & Cream Chinos"
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. modern-cuban-collar-cream-chinos"
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Editorial styling notes, proportion advice, fabric drape..."
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
              </div>

              {/* MEDIA SECTION: PHOTO & VIDEO */}
              <div className="p-4 bg-[#F5F1E8] border border-[#E5E0D8] rounded-2xl space-y-4">
                <span className="font-black text-[#171717] uppercase tracking-wider block text-xs">
                  📸 Look Media (Photo & Video)
                </span>

                {/* Photo Input & Local Upload */}
                <div className="space-y-2">
                  <label className="font-bold text-[#171717] flex items-center justify-between">
                    <span>Cover Photo URL or Local Upload</span>
                    <button
                      type="button"
                      onClick={() => imageFileInputRef.current?.click()}
                      className="text-[#BD8B52] hover:underline inline-flex items-center gap-1 font-bold"
                    >
                      <Upload className="w-3.5 h-3.5" /> Choose from Device
                    </button>
                  </label>
                  <input
                    type="file"
                    ref={imageFileInputRef}
                    onChange={handleImageFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <input
                    type="text"
                    required
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://... or choose file above"
                    className="w-full px-3 py-2 bg-white border border-[#E5E0D8] rounded-lg text-xs focus:border-[#BD8B52] focus:outline-none"
                  />

                  {/* Photo Preview */}
                  {coverImageUrl && (
                    <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-[#E5E0D8]">
                      <img
                        src={coverImageUrl}
                        alt="Cover Preview"
                        className="w-12 h-14 object-cover rounded"
                      />
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        ✓ Photo preview ready
                      </span>
                    </div>
                  )}
                </div>

                {/* Video Input & Local Upload */}
                <div className="space-y-2 pt-2 border-t border-[#E5E0D8]">
                  <label className="font-bold text-[#171717] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Video className="w-4 h-4 text-[#BD8B52]" /> Runway Video URL or Local Upload (Optional)
                    </span>
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="text-[#BD8B52] hover:underline inline-flex items-center gap-1 font-bold"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Video
                    </button>
                  </label>
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    onChange={handleVideoFileUpload}
                    accept="video/*"
                    className="hidden"
                  />
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="e.g. MP4 link, Mixkit, or choose file from device"
                    className="w-full px-3 py-2 bg-white border border-[#E5E0D8] rounded-lg text-xs focus:border-[#BD8B52] focus:outline-none"
                  />

                  {/* Video Preview */}
                  {videoUrl && (
                    <div className="space-y-1 p-2 bg-white rounded-lg border border-[#E5E0D8]">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-700">✓ Video clip attached</span>
                        <button
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="text-red-600 hover:underline"
                        >
                          Remove Video
                        </button>
                      </div>
                      <video
                        src={videoUrl}
                        controls
                        muted
                        className="w-full max-h-36 object-cover rounded-md bg-black"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Occasion, Style, Fit */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Occasion
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs"
                  >
                    <option value="College">College</option>
                    <option value="Casual Date">Casual Date</option>
                    <option value="Office">Office</option>
                    <option value="Weekend">Weekend</option>
                    <option value="Party">Party</option>
                    <option value="Festive">Festive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs"
                  >
                    <option value="Streetwear">Streetwear</option>
                    <option value="Minimalist">Minimalist</option>
                    <option value="Smart Casual">Smart Casual</option>
                    <option value="Old Money">Old Money</option>
                    <option value="Casual">Casual</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Fit
                  </label>
                  <select
                    value={fit}
                    onChange={(e) => setFit(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs"
                  >
                    <option value="Relaxed">Relaxed</option>
                    <option value="Oversized">Oversized</option>
                    <option value="Regular">Regular</option>
                    <option value="Slim">Slim</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Color Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={colourTagsInput}
                  onChange={(e) => setColourTagsInput(e.target.value)}
                  placeholder="Black, Cream, Olive"
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
              </div>

              {/* Product Association */}
              <div className="space-y-2 pt-2 border-t border-[#F5F1E8]">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Select Products in this Look ({selectedProductIds.length})
                  </label>
                  <span className="font-bold text-[#BD8B52]">
                    Total Look Price: {formatINR(computedTotal)}
                  </span>
                </div>

                {products.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1 border border-[#E5E0D8] rounded-xl p-2 bg-[#FDFBF7]">
                    {products.map((p) => {
                      const selected = selectedProductIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleProduct(p.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            selected
                              ? 'bg-[#BD8B52]/10 border border-[#BD8B52]'
                              : 'hover:bg-white border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => {}}
                              className="rounded text-[#BD8B52]"
                            />
                            <span className="font-bold text-[#171717]">{p.name}</span>
                            <span className="text-[10px] text-[#737373]">({p.category})</span>
                          </div>
                          <span className="font-bold">{formatINR(p.price_inr)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-[#F5F1E8] rounded-lg text-center text-xs text-[#737373]">
                    No garments in catalog yet. You can save this outfit now and add garments later in "Manage Products".
                  </div>
                )}
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="published-toggle"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded text-[#BD8B52]"
                />
                <label htmlFor="published-toggle" className="font-bold text-[#171717] cursor-pointer">
                  Publish to Public Storefront Immediately
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F5F1E8]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E0D8] rounded-lg text-xs font-semibold hover:bg-[#F5F1E8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#BD8B52] hover:bg-[#A3743E] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
                >
                  {editingOutfitId ? 'Save Changes' : 'Publish Outfit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
