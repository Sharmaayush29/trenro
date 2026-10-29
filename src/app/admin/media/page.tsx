'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  Video,
  Copy,
  Check,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  Film,
  AlertCircle,
  Database,
  Layers,
} from 'lucide-react';

interface MediaAsset {
  id: string;
  title: string;
  file_name: string;
  media_type: 'image' | 'video';
  url: string;
  mime_type: string;
  file_size: number;
  category?: string;
  created_at: string;
}

export default function AdminMediaLibraryPage() {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('product');
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<MediaAsset | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const typeParam = filterType === 'all' ? '' : `?type=${filterType}`;
      const searchParam = searchQuery ? `${typeParam ? '&' : '?'}q=${encodeURIComponent(searchQuery)}` : '';
      const res = await fetch(`/api/admin/media${typeParam}${searchParam}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.media)) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error('Failed to load media assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [filterType]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgressMsg(`Uploading ${i + 1} of ${files.length}: ${file.name}...`);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', selectedCategory);

        const res = await fetch('/api/admin/upload-media', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Upload failed');
        }
        successCount++;
      } catch (err: any) {
        alert(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    setIsUploading(false);
    setUploadProgressMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    fetchMedia();
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDelete = async (item: MediaAsset) => {
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, fileName: item.file_name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');

      setMediaList((prev) => prev.filter((m) => m.id !== item.id));
      setDeleteConfirmItem(null);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredMedia = mediaList.filter((item) => {
    if (filterType !== 'all' && item.media_type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.file_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#BD8B52]">
            Asset Storage & Catalog Media
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight mt-1">
            Photo & Video Media Library
          </h1>
          <p className="text-xs text-[#737373] mt-1 max-w-xl leading-relaxed">
            Upload high-resolution photography and runway videos directly to Supabase storage. Stored assets can be attached to products, curated outfits, and editorial drops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSqlGuide(!showSqlGuide)}
            className="px-3.5 py-2 bg-[#F5F1E8] hover:bg-[#E5E0D8] text-[#171717] text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#BD8B52]" />
            {showSqlGuide ? 'Hide Table SQL' : 'View Table SQL'}
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* SQL Migration Assistant Banner */}
      {showSqlGuide && (
        <div className="bg-[#171717] text-white border border-[#333] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#BD8B52]">
              <Database className="w-5 h-5" />
              <h3 className="font-bold text-sm">Supabase `public.media_assets` Table Schema</h3>
            </div>
            <span className="text-[10px] text-[#A3A3A3] font-mono">
              supabase/migrations/20261029010000_media_assets_and_storage_fix.sql
            </span>
          </div>
          <p className="text-xs text-[#D4D4D4] leading-relaxed">
            Run this migration in your Supabase SQL Editor to enable the dedicated metadata table and configure zero-error storage policies:
          </p>
          <pre className="bg-[#0D0D0D] p-4 rounded-xl text-[11px] font-mono text-[#D4A36A] overflow-x-auto max-h-56">
{`CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  category TEXT DEFAULT 'product',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view media assets" ON public.media_assets FOR SELECT USING (true);
CREATE POLICY "Admins can insert media assets" ON public.media_assets FOR INSERT WITH CHECK (true);`}
          </pre>
        </div>
      )}

      {/* Upload Drag/Drop Box */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          isUploading
            ? 'border-[#BD8B52] bg-[#BD8B52]/5'
            : 'border-[#E5E0D8] bg-white hover:border-[#BD8B52] hover:bg-[#FDFBF7]'
        }`}
      >
        <div className="flex justify-center items-center gap-3 text-[#BD8B52] mb-3">
          <div className="w-12 h-12 rounded-xl bg-[#F5F1E8] flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-[#BD8B52]" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#F5F1E8] flex items-center justify-center">
            <Video className="w-6 h-6 text-[#BD8B52]" />
          </div>
        </div>
        <h3 className="font-bold text-base text-[#171717]">
          {isUploading ? uploadProgressMsg || 'Uploading media...' : 'Click to Upload Photos or Runway Videos'}
        </h3>
        <p className="text-xs text-[#737373] mt-1 max-w-md mx-auto">
          Supports JPEG, PNG, WebP photography up to 25MB, and MP4/WebM videos up to 50MB. Files are instantly served via high-speed global CDN.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-[#F5F1E8] text-[#555] hover:text-[#171717]'
            }`}
          >
            All Media ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              filterType === 'image'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-[#F5F1E8] text-[#555] hover:text-[#171717]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Photos Only ({mediaList.filter((m) => m.media_type === 'image').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              filterType === 'video'
                ? 'bg-[#171717] text-white shadow-sm'
                : 'bg-[#F5F1E8] text-[#555] hover:text-[#171717]'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Videos Only ({mediaList.filter((m) => m.media_type === 'video').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by filename or title..."
            className="w-full pl-9 pr-4 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-xl text-xs text-[#171717] focus:bg-white focus:border-[#BD8B52] focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#737373] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-[#737373] bg-white border border-[#E5E0D8] rounded-2xl space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-[#BD8B52] mx-auto" />
          <p>Loading media catalog...</p>
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => {
            const isVideo = item.media_type === 'video';
            const isCopied = copiedId === item.id;
            const fileSizeMb = (item.file_size / (1024 * 1024)).toFixed(2);

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E5E0D8] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Media Viewport */}
                <div className="relative aspect-fashion bg-[#171717] overflow-hidden flex items-center justify-center">
                  {isVideo ? (
                    <video
                      src={item.url}
                      controls
                      preload="metadata"
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                    />
                  )}

                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white shadow-xs ${
                        isVideo ? 'bg-purple-600' : 'bg-emerald-600'
                      }`}
                    >
                      {isVideo ? 'Video Clip' : 'Photo'}
                    </span>
                    {item.file_size > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/70 text-white">
                        {fileSizeMb} MB
                      </span>
                    )}
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors"
                    title="Open original file in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Media Details */}
                <div className="p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-xs text-[#171717] truncate" title={item.title}>
                      {item.title}
                    </h4>
                    <p className="text-[10px] font-mono text-[#737373] truncate mt-0.5">
                      {item.file_name}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F5F1E8]">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(item.url, item.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#F5F1E8] hover:bg-[#E5E0D8] text-[#171717]'
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#BD8B52]" /> Copy URL
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteConfirmItem(item)}
                      className="p-1.5 text-[#737373] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete media"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center text-xs text-[#737373] bg-white border border-[#E5E0D8] rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F5F1E8] text-[#BD8B52] flex items-center justify-center mx-auto shadow-sm">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#171717]">No Media Found</h3>
          <p className="max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? `No media matches your search "${searchQuery}".`
              : 'Your media library is empty. Upload your first product photo or runway video above.'}
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Upload className="w-4 h-4" /> Upload First Photo/Video
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <h4 className="font-bold text-base">Delete Media Asset</h4>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#171717]">{deleteConfirmItem.title}</strong>? Any garment or outfit using this media URL will no longer be able to display it.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-3 py-1.5 border border-[#E5E0D8] rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmItem)}
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
