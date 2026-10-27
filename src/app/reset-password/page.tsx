'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TrenroLogo from '@/components/brand/TrenroLogo';
import { useDemoStore } from '@/lib/store/demo-context';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { isConfigured } = useDemoStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      if (isConfigured) {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) throw new Error('Supabase client unavailable');

        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(error.message);

        setSuccessMsg('Your password has been successfully updated! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1500);
      } else {
        setSuccessMsg('Your password has been successfully updated! Redirecting to login...');
        setTimeout(() => router.push('/login'), 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <TrenroLogo size="lg" showTagline={false} />
        <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
          Create New Password
        </h2>
        <p className="text-xs text-[#737373]">
          Please enter and confirm your new secure password.
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

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs text-[#171717] focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-[#737373] absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs text-[#171717] focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-[#737373] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Password'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
