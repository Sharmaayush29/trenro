'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import TrenroLogo from '@/components/brand/TrenroLogo';
import { useDemoStore } from '@/lib/store/demo-context';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { isValidRedirectUrl } from '@/lib/utils/formatters';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Database,
} from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectUrl = isValidRedirectUrl(rawRedirect) ? rawRedirect! : '/dashboard';

  const { isConfigured, setUserProfile } = useDemoStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!email.includes('@') || !email.includes('.')) {
        throw new Error('Please enter a valid email address.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      if (!isConfigured) {
        throw new Error(
          'Authentication service is unavailable: Supabase credentials are not configured in environment. In accordance with strict security policies, guest access cannot authenticate without verified database backing.'
        );
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error('Supabase client failed to initialize');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        throw new Error(error.message || 'Invalid email or password.');
      }

      if (data.user) {
        const isAdminEmail = data.user.email?.toLowerCase() === 'ayush@gmail.com';

        // Async background profile fetch
        supabase
          .from('profiles')
          .select('id, display_name, email, role, avatar_url, created_at, updated_at')
          .eq('id', data.user.id)
          .maybeSingle()
          .then(({ data: profile }: { data: any }) => {
            if (profile) setUserProfile(profile);
          });

        const initialUserObj = {
          id: data.user.id,
          display_name: data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          role: (isAdminEmail ? 'admin' : 'user') as 'admin' | 'user',
          created_at: data.user.created_at,
          updated_at: new Date().toISOString(),
        };

        setUserProfile(initialUserObj);
        setSuccessMsg('Signed in successfully! Redirecting...');
        const target = isAdminEmail && redirectUrl === '/dashboard' ? '/admin' : redirectUrl;
        router.push(target);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <TrenroLogo size="lg" showTagline={true} />
        <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
          Welcome Back to TRENRO
        </h2>
        <p className="text-xs text-[#737373]">
          Sign in to access your saved wardrobe, calibrated style preferences, and personalized outfit ideas.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 border border-[#E5E0D8] rounded-2xl shadow-sm space-y-6">
          {!isConfigured && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <Database className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Database Setup Notice</strong>
                <span>
                  Supabase credentials are not configured in .env.local. Live user sign-in and account synchronization are disabled until database variables are provided.
                </span>
              </div>
            </div>
          )}

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

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                Email Address
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

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#BD8B52] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs text-[#171717] focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-[#737373] absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isConfigured}
              className="w-full py-3 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[#737373]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#BD8B52] font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading sign-in...</div>}>
      <LoginContent />
    </Suspense>
  );
}
