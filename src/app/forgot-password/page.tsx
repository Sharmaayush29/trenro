'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TrenroLogo from '@/components/brand/TrenroLogo';
import { useDemoStore } from '@/lib/store/demo-context';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { isConfigured } = useDemoStore();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }

      if (isConfigured) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) throw new Error('Supabase client unavailable');

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw new Error(error.message);

        setSuccessMsg(
          'Password recovery instructions sent! Please check your email inbox.'
        );
      } else {
        setSuccessMsg(
          'Password recovery instructions sent! Please check your email inbox.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <TrenroLogo size="lg" showTagline={false} />
        <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
          Reset Your Password
        </h2>
        <p className="text-xs text-[#737373]">
          Enter the email associated with your TRENRO account to receive a secure recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E5E0D8] rounded-2xl shadow-sm space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                Your Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs text-[#171717] focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
                <Mail className="w-4 h-4 text-[#737373] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Sending link...' : 'Send Recovery Email'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#737373] hover:text-[#BD8B52] inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
