'use client';

import React, { useState } from 'react';
import { useDemoStore } from '@/lib/store/demo-context';
import { Collection } from '@/types';
import { formatINR } from '@/lib/utils/formatters';
import { FolderKanban, Plus, Layers, ArrowUpDown, Check } from 'lucide-react';

export default function AdminCollectionsPage() {
  const { collections, outfits } = useDemoStore();
  const [collectionList, setCollectionList] = useState(collections);

  return (
    <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F1E8]">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#BD8B52]" /> Collections & Curations
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Manage budget-driven collections, seasonal features, and homepage display priorities.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {collectionList.map((col, index) => (
          <div
            key={col.id}
            className="p-5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-[#BD8B52]/10 text-[#BD8B52] rounded text-[10px] font-bold uppercase tracking-wider">
                  {col.collection_type}
                </span>
                <span className="text-xs text-[#737373]">Order: #{col.display_order}</span>
              </div>
              <h3 className="font-bold text-base text-[#171717]">{col.name}</h3>
              <p className="text-xs text-[#737373] max-w-lg">{col.description}</p>
              {col.budget_max && (
                <span className="text-[11px] font-bold text-emerald-700 block">
                  Budget Filter: Up to {formatINR(col.budget_max)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-white border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#171717]">
                Active Collection
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
