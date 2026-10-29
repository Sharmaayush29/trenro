'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TrenroLogo from '@/components/brand/TrenroLogo';
import { useDemoStore } from '@/lib/store/demo-context';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, Database } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { isConfigured, setUserProfile } = useDemoStore();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (!displayName || displayName.trim().length < 2) {
        throw new Error('Please enter your full name (minimum 2 characters).');
      }
      if (!email.includes('@') || !email.includes('.')) {
        throw new Error('Please enter a valid email address.');
      }
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long for account security.');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      if (!isConfigured) {
        throw new Error(
          'Registration service is unavailable: Supabase database credentials are not configured in environment. In accordance with security requirements, guest accounts cannot be created without persistent database storage.'
        );
      }

      // Call server endpoint that creates and auto-confirms user without sending rate-limited emails
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          displayName: displayName.trim(),
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        // Resilient fallback: if server service role key is not yet set in Vercel, use standard client signup
        if (regRes.status === 503) {
          const supabaseFallback = getSupabaseBrowserClient();
          if (supabaseFallback) {
            const { data: clientSignUpData, error: clientSignUpErr } = await supabaseFallback.auth.signUp({
              email: email.trim().toLowerCase(),
              password,
              options: {
                data: {
                  display_name: displayName.trim(),
                },
              },
            });

            if (clientSignUpErr) {
              throw new Error(clientSignUpErr.message);
            }

            if (clientSignUpData.session && clientSignUpData.user) {
              const newUser = {
                id: clientSignUpData.user.id,
                display_name: displayName.trim(),
                email: email.trim().toLowerCase(),
                role: (email.trim().toLowerCase() === 'ayush@gmail.com' ? 'admin' : 'user') as 'admin' | 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setUserProfile(newUser);
              setSuccessMsg('Account created & signed in! Redirecting to dashboard...');
              setTimeout(() => router.push('/dashboard'), 500);
              return;
            } else {
              setSuccessMsg('Registration received! You can now sign in with your credentials.');
              setTimeout(() => router.push('/login'), 1200);
              return;
            }
          }
        }
        throw new Error(regData.error || 'Failed to create account.');
      }

      // Now instantly sign in the verified user
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (!authError && authData.user) {
          const newUser = {
            id: authData.user.id,
            display_name: displayName.trim(),
            email: email.trim().toLowerCase(),
            role: (email.trim().toLowerCase() === 'ayush@gmail.com' ? 'admin' : 'user') as 'admin' | 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUserProfile(newUser);
          setSuccessMsg('Account created & signed in successfully! Redirecting to dashboard...');
          setTimeout(() => router.push('/dashboard'), 400);
          return;
        }
      }

      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => router.push('/login'), 600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
        <TrenroLogo size="lg" showTagline={true} />
        <h2 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
          Join TRENRO
        </h2>
        <p className="text-xs text-[#737373]">
          Create an account to save curated outfits, calibrate your budget, and personalize discovery.
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
                  Supabase credentials are not configured in .env.local. Live account registration is disabled until database variables are provided.
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

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Ayush Sharma"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs text-[#171717] focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
                <User className="w-4 h-4 text-[#737373] absolute left-3 top-3" />
              </div>
            </div>

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
              <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs text-[#171717] focus:bg-white focus:border-[#BD8B52] focus:outline-none"
                />
                <Lock className="w-4 h-4 text-[#737373] absolute left-3 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
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
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[#737373]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#BD8B52] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
