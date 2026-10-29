import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSessionUser } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Database,
  Lock,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();

  // 1. Strict Fail-Closed Check if Database is Not Configured
  if (!configured) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 space-y-6">
        <div className="bg-white border border-[#E5E0D8] rounded-3xl p-8 sm:p-10 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
            <Database className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#BD8B52]">
              Access Control Guard
            </span>
            <h1 className="text-2xl font-black text-[#171717]">
              Supabase Configuration Required
            </h1>
            <p className="text-xs text-[#737373] leading-relaxed max-w-md mx-auto">
              In accordance with security policies, administrative access cannot be granted through client-side state, email pattern matching, or demo bypasses.
            </p>
          </div>

          <div className="p-4 bg-[#FDFBF7] border border-[#E5E0D8] rounded-2xl text-left text-xs text-[#555] space-y-2">
            <p className="font-bold text-[#171717] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#BD8B52]" /> Required Admin Setup:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-[#737373]">
              <li>Configure real Supabase variables in your local <code className="text-[#171717] bg-[#F5F1E8] px-1 py-0.5 rounded">.env.local</code>.</li>
              <li>Execute the database migrations in <code className="text-[#171717] bg-[#F5F1E8] px-1 py-0.5 rounded">supabase/migrations/</code>.</li>
              <li>Sign up a standard account, then promote it to admin via SQL: <code className="text-[#171717] bg-[#F5F1E8] px-1 py-0.5 rounded">UPDATE public.profiles SET role = &apos;admin&apos; WHERE email = &apos;your@email.com&apos;;</code></li>
            </ol>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-6 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Server-side Authenticated User Lookup
  const sessionUser = await getServerSessionUser();

  // If unauthenticated -> redirect to login with safe relative redirect
  if (!sessionUser) {
    redirect('/login?redirect=/admin');
  }

  // 3. Strict Server-Side Authorization: Check Database Role
  if (sessionUser.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <div className="bg-white border border-red-200 rounded-3xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-700 border border-red-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">
              403 Forbidden
            </span>
            <h1 className="text-2xl font-black text-[#171717]">Access Restricted</h1>
            <p className="text-xs text-[#737373] leading-relaxed">
              Signed in as <strong className="text-[#171717]">{sessionUser.email}</strong>. This account does not possess administrator credentials in the database.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#171717] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              Go to User Dashboard
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 bg-[#F5F1E8] hover:bg-[#E5E0D8] text-[#171717] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
            >
              Public Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Admin Portal Render
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="bg-[#171717] text-white rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#2E2E2E]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#BD8B52]/20 border border-[#BD8B52]/40 flex items-center justify-center text-[#D4A36A]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">Editorial Admin Portal</h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#BD8B52] text-white">
                Admin
              </span>
            </div>
            <p className="text-xs text-[#A3A3A3] mt-0.5">
              Verified session: {sessionUser.displayName} ({sessionUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 bg-[#262626] hover:bg-[#333] border border-[#3E3E3E] text-xs font-semibold rounded-lg text-[#F5F1E8] transition-colors"
          >
            User View
          </Link>
          <Link
            href="/"
            className="px-3 py-1.5 bg-[#262626] hover:bg-[#333] border border-[#3E3E3E] text-xs font-semibold rounded-lg text-[#F5F1E8] transition-colors"
          >
            Public Site
          </Link>
        </div>
      </div>

      {/* Admin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <AdminSidebar />
        <main className="lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}
