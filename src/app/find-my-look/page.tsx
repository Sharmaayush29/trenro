'use client';

import React from 'react';
import FindMyLookQuiz from '@/components/finder/FindMyLookQuiz';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function FindMyLookPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* Intro Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10 border border-[#BD8B52]/20">
          <Sparkles className="w-3.5 h-3.5" /> 60-Second Outfit Quiz
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight">
          Find Your Perfect Look
        </h1>
        <p className="text-sm sm:text-base text-[#737373] leading-relaxed">
          Tell us your target budget, the occasion, and your preferred silhouette. Our
          transparent, rule-based engine scores our catalog of verified outfits to present your
          best matching looks.
        </p>
      </div>

      {/* Quiz Container */}
      <FindMyLookQuiz />

      {/* Transparency Guarantee */}
      <div className="max-w-xl mx-auto p-4 bg-white border border-[#E5E0D8] rounded-xl text-center text-xs text-[#737373] space-y-1 shadow-sm">
        <p className="font-bold text-[#171717] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#BD8B52]" /> Transparent, Rule-Based Matching
        </p>
        <p>
          Outfits and garments are curated and presented purely on verified tailoring math,
          occasion suitability, and garment proportions.
        </p>
      </div>
    </div>
  );
}
