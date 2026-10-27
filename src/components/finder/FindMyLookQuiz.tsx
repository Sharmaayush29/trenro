'use client';

import React, { useState } from 'react';
import { Outfit } from '@/types';
import { useDemoStore } from '@/lib/store/demo-context';
import OutfitCard from '@/components/outfits/OutfitCard';
import { formatINR, calculateOutfitTotal } from '@/lib/utils/formatters';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Tag,
  Compass,
  Smile,
  Palette,
  Maximize2,
} from 'lucide-react';
import Link from 'next/link';

interface QuizState {
  budget: number; // max budget
  occasion: string;
  style: string;
  colour: string;
  fit: string;
}

export default function FindMyLookQuiz() {
  const { outfits } = useDemoStore();
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(false);

  const [answers, setAnswers] = useState<QuizState>({
    budget: 2500,
    occasion: 'College',
    style: 'Streetwear',
    colour: 'Earthy',
    fit: 'Relaxed',
  });

  const budgetOptions = [
    { label: 'College Budget (Under ₹1,000)', value: 1000, desc: 'Ultra-accessible daily staples' },
    { label: 'Everyday Smart (Under ₹1,500)', value: 1500, desc: 'Quality tees and versatile bottoms' },
    { label: 'Date & Weekend (Under ₹2,500)', value: 2500, desc: 'Elevated layers & statement shirts' },
    { label: 'Full Look (Under ₹5,000)', value: 5000, desc: 'Complete ensemble including footwear' },
    { label: 'Any Budget / Sartorial', value: 15000, desc: 'Focus on pure aesthetics & drape' },
  ];

  const occasionOptions = [
    { label: 'College & Campus', value: 'College', icon: '🎓' },
    { label: 'Casual Date & Cafes', value: 'Casual Date', icon: '☕' },
    { label: 'Office & Workwear', value: 'Office', icon: '💼' },
    { label: 'Weekend Hangout', value: 'Weekend', icon: '🛹' },
    { label: 'Night Out & Party', value: 'Party', icon: '🍸' },
    { label: 'Festive & Traditional', value: 'Festive', icon: '✨' },
  ];

  const styleOptions = [
    { label: 'Streetwear', value: 'Streetwear', desc: 'Graphic tees, cargos, boxy cuts & sneakers' },
    { label: 'Minimalist', value: 'Minimalist', desc: 'Clean lines, zero loud logos, crisp basics' },
    { label: 'Smart Casual', value: 'Smart Casual', desc: 'Cuban collars, polos, tailored chinos' },
    { label: 'Old Money / Riviera', value: 'Old Money', desc: 'Pure linen, pleated gurkhas, loafers' },
    { label: 'Everyday Casual', value: 'Casual', desc: 'Comfortable denim, truckers, classic sneakers' },
  ];

  const colourOptions = [
    { label: 'Monochrome (Black & White)', value: 'Monochrome', colors: ['#171717', '#FFFFFF'] },
    { label: 'Earth Tones (Olive, Tan, Khaki)', value: 'Earthy', colors: ['#556B2F', '#D2B48C', '#8B5A2B'] },
    { label: 'Neutral & Creams (Off-White, Beige)', value: 'Cream', colors: ['#F5F5DC', '#FAF0E6', '#BD8B52'] },
    { label: 'Classic Blues (Navy & Washed Denim)', value: 'Navy', colors: ['#000080', '#4682B4', '#1E3A8A'] },
  ];

  const fitOptions = [
    { label: 'Relaxed Fit', value: 'Relaxed', desc: 'Natural drape with extra room in seat & chest' },
    { label: 'Oversized Fit', value: 'Oversized', desc: 'Drop shoulders, streetwear boxy volume' },
    { label: 'Regular / Straight', value: 'Regular', desc: 'Classic vertical drape, never goes out of style' },
    { label: 'Slim Fit', value: 'Slim', desc: 'Closer silhouette for structured garments' },
  ];

  // Scoring algorithm for transparent rule-based recommendations
  const getRankedOutfits = (): { outfit: Outfit; score: number; matchReasons: string[] }[] => {
    return outfits
      .filter((o) => o.published)
      .map((outfit) => {
        let score = 0;
        const matchReasons: string[] = [];
        const total = calculateOutfitTotal(outfit.products);

        // 1. Budget scoring (Crucial)
        if (total <= answers.budget) {
          score += 40;
          matchReasons.push(`Within your budget of ${formatINR(answers.budget)} (${formatINR(total)})`);
        } else if (total <= answers.budget * 1.2) {
          score += 15; // close to budget
        }

        // 2. Occasion matching
        if (outfit.occasion.toLowerCase() === answers.occasion.toLowerCase()) {
          score += 30;
          matchReasons.push(`Perfect for ${outfit.occasion}`);
        }

        // 3. Style matching
        if (outfit.style.toLowerCase() === answers.style.toLowerCase()) {
          score += 25;
          matchReasons.push(`Matches your ${outfit.style} style preference`);
        }

        // 4. Fit matching
        if (outfit.fit.toLowerCase() === answers.fit.toLowerCase()) {
          score += 15;
          matchReasons.push(`${outfit.fit} silhouette`);
        }

        // 5. Colour matching
        const hasMatchingColor = outfit.colour_tags.some((c) =>
          c.toLowerCase().includes(answers.colour.toLowerCase()) ||
          answers.colour.toLowerCase().includes(c.toLowerCase())
        );
        if (hasMatchingColor) {
          score += 10;
          matchReasons.push('Harmonious color palette');
        }

        return { outfit, score, matchReasons };
      })
      .sort((a, b) => b.score - a.score);
  };

  const rankedResults = getRankedOutfits();
  const topMatches = rankedResults.filter((r) => r.score >= 50);
  const fallbackMatches = rankedResults.slice(0, 4);
  const resultsToShow = topMatches.length > 0 ? topMatches : fallbackMatches;

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setCompleted(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border border-[#E5E0D8] rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10">
      {!completed ? (
        <div>
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-[#737373] uppercase tracking-wider mb-2">
              <span>Step {step} of 5</span>
              <span>Find My Look Quiz</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-[#F5F1E8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#BD8B52] transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Budget */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10">
                  <Tag className="w-3.5 h-3.5" /> Budget Planning
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">
                  What is your target budget for a complete outfit?
                </h2>
                <p className="text-xs sm:text-sm text-[#737373]">
                  We calculate outfit totals strictly from the sum of real product prices.
                </p>
              </div>

              <div className="space-y-3">
                {budgetOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswers({ ...answers, budget: opt.value })}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      answers.budget === opt.value
                        ? 'border-[#BD8B52] bg-[#FDFBF7] shadow-sm ring-1 ring-[#BD8B52]'
                        : 'border-[#E5E0D8] hover:border-[#BD8B52]/50 hover:bg-[#F5F1E8]'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#171717]">{opt.label}</h4>
                      <p className="text-xs text-[#737373] mt-0.5">{opt.desc}</p>
                    </div>
                    {answers.budget === opt.value && (
                      <div className="w-6 h-6 rounded-full bg-[#BD8B52] text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Occasion */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10">
                  <Compass className="w-3.5 h-3.5" /> Occasion
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">
                  Where are you wearing this outfit?
                </h2>
                <p className="text-xs sm:text-sm text-[#737373]">
                  Select the primary scenario so we balance comfort and polish.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {occasionOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswers({ ...answers, occasion: opt.value })}
                    className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      answers.occasion === opt.value
                        ? 'border-[#BD8B52] bg-[#FDFBF7] shadow-sm ring-1 ring-[#BD8B52]'
                        : 'border-[#E5E0D8] hover:border-[#BD8B52]/50 hover:bg-[#F5F1E8]'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-[#171717]">{opt.label}</h4>
                    </div>
                    {answers.occasion === opt.value && (
                      <div className="w-5 h-5 rounded-full bg-[#BD8B52] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Style */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10">
                  <Sparkles className="w-3.5 h-3.5" /> Style Persona
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">
                  Which aesthetic feels most authentic to you?
                </h2>
                <p className="text-xs sm:text-sm text-[#737373]">
                  Choose the design mood you want to project.
                </p>
              </div>

              <div className="space-y-3">
                {styleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswers({ ...answers, style: opt.value })}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      answers.style === opt.value
                        ? 'border-[#BD8B52] bg-[#FDFBF7] shadow-sm ring-1 ring-[#BD8B52]'
                        : 'border-[#E5E0D8] hover:border-[#BD8B52]/50 hover:bg-[#F5F1E8]'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#171717]">{opt.label}</h4>
                      <p className="text-xs text-[#737373] mt-0.5">{opt.desc}</p>
                    </div>
                    {answers.style === opt.value && (
                      <div className="w-6 h-6 rounded-full bg-[#BD8B52] text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Color */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10">
                  <Palette className="w-3.5 h-3.5" /> Color Palette
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">
                  Which color palette do you gravitate toward?
                </h2>
                <p className="text-xs sm:text-sm text-[#737373]">
                  Harmonized tones that flatter Indian skin tones effortlessly.
                </p>
              </div>

              <div className="space-y-3">
                {colourOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswers({ ...answers, colour: opt.value })}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      answers.colour === opt.value
                        ? 'border-[#BD8B52] bg-[#FDFBF7] shadow-sm ring-1 ring-[#BD8B52]'
                        : 'border-[#E5E0D8] hover:border-[#BD8B52]/50 hover:bg-[#F5F1E8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center -space-x-1.5">
                        {opt.colors.map((c, i) => (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-sm text-[#171717]">{opt.label}</span>
                    </div>
                    {answers.colour === opt.value && (
                      <div className="w-6 h-6 rounded-full bg-[#BD8B52] text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Fit */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10">
                  <Maximize2 className="w-3.5 h-3.5" /> Silhouette & Fit
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#171717]">
                  What fit gives you the most confidence?
                </h2>
                <p className="text-xs sm:text-sm text-[#737373]">
                  Proportions make or break an outfit regardless of price.
                </p>
              </div>

              <div className="space-y-3">
                {fitOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswers({ ...answers, fit: opt.value })}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      answers.fit === opt.value
                        ? 'border-[#BD8B52] bg-[#FDFBF7] shadow-sm ring-1 ring-[#BD8B52]'
                        : 'border-[#E5E0D8] hover:border-[#BD8B52]/50 hover:bg-[#F5F1E8]'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm text-[#171717]">{opt.label}</h4>
                      <p className="text-xs text-[#737373] mt-0.5">{opt.desc}</p>
                    </div>
                    {answers.fit === opt.value && (
                      <div className="w-6 h-6 rounded-full bg-[#BD8B52] text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-[#E5E0D8] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 border border-[#E5E0D8] text-[#171717] hover:bg-[#F5F1E8] rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 shadow-sm"
            >
              {step === 5 ? 'Reveal My Matches' : 'Next Step'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#BD8B52] bg-[#BD8B52]/10">
              <Sparkles className="w-3.5 h-3.5" /> Algorithmic Recommendation
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#171717]">
              Curated Outfits Matched for You
            </h2>
            <p className="text-xs sm:text-sm text-[#737373]">
              Matched based on your target budget of{' '}
              <strong className="text-[#171717]">{formatINR(answers.budget)}</strong> for{' '}
              <strong className="text-[#171717]">{answers.occasion}</strong> in{' '}
              <strong className="text-[#171717]">{answers.style}</strong> style.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs text-[#BD8B52] hover:underline font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz with Different Preferences
            </button>
          </div>

          {/* Results Grid */}
          {resultsToShow.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resultsToShow.map((item) => (
                <div key={item.outfit.id} className="flex flex-col">
                  <OutfitCard outfit={item.outfit} />
                  {item.matchReasons.length > 0 && (
                    <div className="mt-2 p-2.5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-[11px] text-[#737373] space-y-1">
                      <p className="font-semibold text-[#171717] flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#BD8B52]" /> Why this matched:
                      </p>
                      <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                        {item.matchReasons.slice(0, 2).map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-10 text-center space-y-3 max-w-lg mx-auto shadow-sm">
              <Sparkles className="w-8 h-8 text-[#BD8B52] mx-auto" />
              <h3 className="text-base font-bold text-[#171717]">Curated Looks Coming Soon</h3>
              <p className="text-xs text-[#737373] leading-relaxed">
                No published outfits currently match your chosen criteria. Create or publish outfits through the Admin Portal, or explore our styling guides.
              </p>
            </div>
          )}

          <div className="text-center pt-6 border-t border-[#E5E0D8]">
            <Link
              href="/outfits"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
            >
              Browse Complete Catalog <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
