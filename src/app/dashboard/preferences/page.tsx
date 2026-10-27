'use client';

import React, { useState } from 'react';
import { useDemoStore } from '@/lib/store/demo-context';
import { formatINR } from '@/lib/utils/formatters';
import { Sparkles, Save, CheckCircle2, RotateCcw } from 'lucide-react';

export default function PreferencesPage() {
  const { preferences, updatePreferences } = useDemoStore();

  const [budget, setBudget] = useState<number>(preferences.preferred_budget || 2500);
  const [styles, setStyles] = useState<string[]>(preferences.preferred_styles || []);
  const [occasions, setOccasions] = useState<string[]>(preferences.preferred_occasions || []);
  const [fits, setFits] = useState<string[]>(preferences.preferred_fits || []);
  const [colours, setColours] = useState<string[]>(preferences.preferred_colours || []);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const styleOptions = ['Streetwear', 'Minimalist', 'Smart Casual', 'Old Money', 'Casual'];
  const occasionOptions = ['College', 'Casual Date', 'Office', 'Weekend', 'Party', 'Festive'];
  const fitOptions = ['Slim', 'Regular', 'Relaxed', 'Oversized'];
  const colourOptions = ['Black', 'White', 'Olive', 'Cream', 'Khaki', 'Navy', 'Brown', 'Blue'];

  const toggleArrayItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      preferred_budget: budget,
      preferred_styles: styles,
      preferred_occasions: occasions,
      preferred_fits: fits,
      preferred_colours: colours,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-[#F5F1E8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#BD8B52]" /> My Style Preferences
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Calibrate your personal aesthetic so TRENRO can recommend outfits tailored to your life.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Preferences Saved!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Preferred Budget */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider">
              1. Preferred Target Outfit Budget
            </label>
            <span className="text-sm font-black text-[#BD8B52]">{formatINR(budget)}</span>
          </div>
          <input
            type="range"
            min={800}
            max={8000}
            step={100}
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full accent-[#BD8B52] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#737373]">
            <span>₹800 (Student basic)</span>
            <span>₹2,500 (Elevated casual)</span>
            <span>₹8,000+ (Sartorial)</span>
          </div>
        </div>

        {/* Preferred Styles */}
        <div className="space-y-2 pt-4 border-t border-[#F5F1E8]">
          <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
            2. Favorite Style Personas
          </label>
          <div className="flex flex-wrap gap-2">
            {styleOptions.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => toggleArrayItem(styles, st, setStyles)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  styles.includes(st)
                    ? 'bg-[#171717] text-white shadow-sm'
                    : 'bg-[#FDFBF7] text-[#737373] border border-[#E5E0D8] hover:border-[#BD8B52]'
                }`}
              >
                {st} {styles.includes(st) && '✓'}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Occasions */}
        <div className="space-y-2 pt-4 border-t border-[#F5F1E8]">
          <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
            3. Frequent Dressing Scenarios
          </label>
          <div className="flex flex-wrap gap-2">
            {occasionOptions.map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => toggleArrayItem(occasions, occ, setOccasions)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  occasions.includes(occ)
                    ? 'bg-[#BD8B52] text-white shadow-sm'
                    : 'bg-[#FDFBF7] text-[#737373] border border-[#E5E0D8] hover:border-[#BD8B52]'
                }`}
              >
                {occ} {occasions.includes(occ) && '✓'}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Fits */}
        <div className="space-y-2 pt-4 border-t border-[#F5F1E8]">
          <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
            4. Silhouette & Fit Preference
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {fitOptions.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => toggleArrayItem(fits, f, setFits)}
                className={`py-2 px-3 rounded-lg border text-center text-xs font-semibold transition-all ${
                  fits.includes(f)
                    ? 'border-[#BD8B52] bg-[#BD8B52] text-white'
                    : 'border-[#E5E0D8] bg-[#FDFBF7] text-[#555] hover:border-[#BD8B52]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Preferred Colours */}
        <div className="space-y-2 pt-4 border-t border-[#F5F1E8]">
          <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
            5. Preferred Colors
          </label>
          <div className="flex flex-wrap gap-2">
            {colourOptions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleArrayItem(colours, c, setColours)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                  colours.includes(c)
                    ? 'bg-[#171717] text-white border-[#171717]'
                    : 'bg-white text-[#737373] border-[#E5E0D8] hover:border-[#BD8B52]'
                }`}
              >
                {c} {colours.includes(c) && '✓'}
              </button>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-6 border-t border-[#E5E0D8] flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" /> Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
