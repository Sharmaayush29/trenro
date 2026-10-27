'use client';

import React, { use, Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useDemoStore } from '@/lib/store/demo-context';
import OutfitCard from '@/components/outfits/OutfitCard';
import { formatDate } from '@/lib/utils/formatters';
import {
  BookOpen,
  Clock,
  Calendar,
  User,
  ArrowLeft,
  Share2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface StyleGuideDetailPageProps {
  params: Promise<{ slug: string }>;
}

function StyleGuideDetailContent({ params }: StyleGuideDetailPageProps) {
  const { slug } = use(params);
  const { styleGuides, outfits } = useDemoStore();

  const guide = styleGuides.find((g) => g.slug === slug);

  if (!guide) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#171717]">Guide Not Found</h2>
        <p className="text-xs text-[#737373]">
          The article you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/style-guides"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#BD8B52] text-white rounded-lg text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Style Guides
        </Link>
      </div>
    );
  }

  const relatedGuides = styleGuides
    .filter((g) => g.id !== guide.id)
    .slice(0, 2);

  // Sample curated looks that match the guide
  const sampleRecommendedOutfits = outfits.slice(0, 2);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: guide.title,
        text: guide.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/style-guides"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#BD8B52] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Style Guides
        </Link>
      </div>

      {/* Article Header */}
      <div className="space-y-4 border-b border-[#E5E0D8] pb-8">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 bg-[#BD8B52]/10 text-[#BD8B52] font-bold uppercase tracking-wider rounded">
            {guide.category}
          </span>
          <span className="text-[#A3A3A3]">•</span>
          <span className="flex items-center gap-1 text-[#737373]">
            <Clock className="w-3.5 h-3.5" /> {guide.read_time_minutes} min read
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight leading-[1.15]">
          {guide.title}
        </h1>

        <p className="text-base sm:text-lg text-[#737373] leading-relaxed">
          {guide.excerpt}
        </p>

        {/* Metadata & Share Bar */}
        <div className="pt-4 flex items-center justify-between text-xs text-[#737373]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-xs">
              TE
            </div>
            <div>
              <span className="font-bold text-[#171717] block">{guide.author_name}</span>
              <span>Published {formatDate(guide.published_at)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#EAE4D6] text-[#171717] rounded-lg text-xs font-semibold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>
      </div>

      {/* Hero Cover Image */}
      <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-[#F5F1E8] border border-[#E5E0D8] shadow-md">
        <img
          src={guide.cover_image_url}
          alt={guide.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Formatted Article Body */}
      <div className="prose prose-neutral max-w-none text-[#262626] leading-relaxed space-y-6 text-sm sm:text-base">
        {guide.content.split('\n\n').map((paragraph, index) => {
          const trimmed = paragraph.trim();
          if (trimmed.startsWith('### ')) {
            return (
              <h2 key={index} className="text-2xl font-black text-[#171717] pt-6 border-t border-[#F5F1E8]">
                {trimmed.replace('### ', '')}
              </h2>
            );
          }
          if (trimmed.startsWith('#### ')) {
            return (
              <h3 key={index} className="text-lg font-bold text-[#BD8B52] pt-4">
                {trimmed.replace('#### ', '')}
              </h3>
            );
          }
          if (trimmed.startsWith('- ') || trimmed.startsWith('1. ')) {
            const lines = trimmed.split('\n');
            return (
              <ul key={index} className="space-y-2 list-disc list-inside bg-[#FDFBF7] p-5 rounded-xl border border-[#E5E0D8]">
                {lines.map((li, i) => (
                  <li key={i} className="text-sm text-[#444] leading-relaxed">
                    {li.replace(/^[-\d.]\s+/, '')}
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={index} className="text-[#404040] leading-relaxed">
              {trimmed}
            </p>
          );
        })}
      </div>

      {/* Curated Looks Putting This Guide Into Practice */}
      <div className="pt-10 border-t border-[#E5E0D8] space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-[#BD8B52] uppercase tracking-[0.2em]">
            Style in Action
          </span>
          <h3 className="text-2xl font-black text-[#171717]">
            Curated Looks Applying this Philosophy
          </h3>
          <p className="text-xs text-[#737373]">
            Verified outfits whose colors and cuts directly reflect the guidelines in this article.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {sampleRecommendedOutfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      </div>

      {/* Related Guides */}
      {relatedGuides.length > 0 && (
        <div className="pt-10 border-t border-[#E5E0D8] space-y-6">
          <h3 className="text-xl font-black text-[#171717]">Continue Reading</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedGuides.map((rel) => (
              <Link
                key={rel.slug}
                href={`/style-guides/${rel.slug}`}
                className="group p-5 bg-white border border-[#E5E0D8] rounded-xl hover:border-[#BD8B52] transition-colors flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] text-[#BD8B52] uppercase font-bold tracking-wider">
                    {rel.category}
                  </span>
                  <h4 className="text-sm font-bold text-[#171717] group-hover:text-[#BD8B52] transition-colors mt-0.5">
                    {rel.title}
                  </h4>
                </div>
                <ArrowRight className="w-4 h-4 text-[#BD8B52] transition-transform group-hover:translate-x-1 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

export default function StyleGuideDetailPage(props: StyleGuideDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center text-xs text-[#737373]">
          Loading style guide article...
        </div>
      }
    >
      <StyleGuideDetailContent {...props} />
    </Suspense>
  );
}
