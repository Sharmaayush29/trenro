'use client';

import React from 'react';
import { useDemoStore } from '@/lib/store/demo-context';
import { Sparkles, Database } from 'lucide-react';

export default function DemoModeBanner() {
  const { isConfigured } = useDemoStore();

  if (isConfigured) return null;

  return (
    <div className="bg-[#171717] text-[#F5F1E8] border-b border-[#2A2A2A] text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#BD8B52]/20 text-[#D4A36A] border border-[#BD8B52]/30">
            <Sparkles className="w-3 h-3" />
            Local Editorial Mode
          </span>
          <span className="text-[#A3A3A3]">
            Sample outfit archive loaded. Connect Supabase credentials in .env.local to enable real database auth and publishing.
          </span>
        </div>
      </div>
    </div>
  );
}
