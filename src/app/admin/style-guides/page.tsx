'use client';

import React, { useState } from 'react';
import { useDemoStore } from '@/lib/store/demo-context';
import { StyleGuide } from '@/types';
import { formatDate } from '@/lib/utils/formatters';
import { BookOpen, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

export default function AdminStyleGuidesPage() {
  const { styleGuides, addStyleGuide, updateStyleGuide, deleteStyleGuide } = useDemoStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [category, setCategory] = useState('Color Theory');
  const [authorName, setAuthorName] = useState('TRENRO Editorial');
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [published, setPublished] = useState(true);

  const handleOpenCreate = () => {
    setEditingGuideId(null);
    setTitle('');
    setSlug('');
    setExcerpt('');
    setContent('### Introduction\n\nWrite editorial fashion advice here...\n\n#### Key Rules\n- Rule 1\n- Rule 2');
    setCoverImageUrl('https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&auto=format&fit=crop&q=80');
    setCategory('Color Theory');
    setAuthorName('TRENRO Editorial');
    setReadTimeMinutes(5);
    setPublished(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (guide: StyleGuide) => {
    setEditingGuideId(guide.id);
    setTitle(guide.title);
    setSlug(guide.slug);
    setExcerpt(guide.excerpt);
    setContent(guide.content);
    setCoverImageUrl(guide.cover_image_url);
    setCategory(guide.category);
    setAuthorName(guide.author_name);
    setReadTimeMinutes(guide.read_time_minutes);
    setPublished(guide.published);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingGuideId) {
      updateStyleGuide(editingGuideId, {
        title,
        slug,
        excerpt,
        content,
        cover_image_url: coverImageUrl,
        category,
        author_name: authorName,
        read_time_minutes: readTimeMinutes,
        published,
      });
    } else {
      addStyleGuide({
        title,
        slug,
        excerpt,
        content,
        cover_image_url: coverImageUrl,
        category,
        author_name: authorName,
        read_time_minutes: readTimeMinutes,
        published,
        published_at: new Date().toISOString(),
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F1E8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#BD8B52]" /> Style Guide Management
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Draft, edit, publish, or retract educational fashion guides and color theory essays.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-[#BD8B52] hover:bg-[#A3743E] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Draft Article
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E5E0D8] text-[#737373] uppercase tracking-wider font-bold">
              <th className="py-3 px-3">Article</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Author</th>
              <th className="py-3 px-3">Published Date</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5F1E8]">
            {styleGuides.map((guide) => (
              <tr key={guide.id} className="hover:bg-[#FDFBF7] transition-colors">
                <td className="py-3 px-3 flex items-center gap-3">
                  <img
                    src={guide.cover_image_url}
                    alt={guide.title}
                    className="w-10 h-10 object-cover rounded bg-[#F5F1E8] flex-shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-[#171717] max-w-sm truncate">{guide.title}</h4>
                    <span className="text-[10px] text-[#A3A3A3]">/{guide.slug}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-[#555]">{guide.category}</td>
                <td className="py-3 px-3 text-[#555]">{guide.author_name}</td>
                <td className="py-3 px-3 text-[#737373]">{formatDate(guide.published_at)}</td>
                <td className="py-3 px-3">
                  <button
                    type="button"
                    onClick={() =>
                      updateStyleGuide(guide.id, { published: !guide.published })
                    }
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                      guide.published
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {guide.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="py-3 px-3 text-right space-x-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(guide)}
                    className="p-1.5 text-[#555] hover:text-[#BD8B52] rounded transition-colors"
                    title="Edit Guide"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(guide.id)}
                    className="p-1.5 text-[#555] hover:text-red-600 rounded transition-colors"
                    title="Delete Guide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold text-base">Delete Article</h4>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Are you sure you want to permanently delete this style guide?
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
                  deleteStyleGuide(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5F1E8]">
              <h3 className="font-bold text-base text-[#171717]">
                {editingGuideId ? 'Edit Article' : 'Draft New Style Guide'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-[#737373] hover:text-[#171717]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Article Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!editingGuideId) {
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)+/g, '')
                      );
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#171717] uppercase tracking-wider block">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Excerpt / Summary
                </label>
                <textarea
                  rows={2}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Article Body (Markdown)
                </label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg font-mono text-xs focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  required
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="guidePublishToggle"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="accent-[#BD8B52] w-4 h-4"
                />
                <label htmlFor="guidePublishToggle" className="font-bold text-[#171717] cursor-pointer">
                  Publish Article to Readers
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F5F1E8]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 border border-[#E5E0D8] rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#BD8B52] hover:bg-[#A3743E] text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  {editingGuideId ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
