'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/lib/store/demo-context';
import {
  Settings,
  User,
  Mail,
  Lock,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export default function AccountSettingsPage() {
  const { user, logout } = useDemoStore();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    logout();
    alert('Account data wiped successfully.');
  };

  return (
    <div className="space-y-8">
      {/* Profile Information Box */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="pb-4 border-b border-[#F5F1E8]">
          <h2 className="text-xl sm:text-2xl font-black text-[#171717] flex items-center gap-2">
            <User className="w-5 h-5 text-[#BD8B52]" /> Profile Details
          </h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Manage your personal credentials and identity settings.
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile name updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E5E0D8] rounded-lg text-xs text-[#171717] focus:bg-white focus:border-[#BD8B52] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#171717] uppercase tracking-wider block">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'user@trenro.com'}
              className="w-full px-3.5 py-2.5 bg-[#F5F1E8] border border-[#E5E0D8] rounded-lg text-xs text-[#737373] cursor-not-allowed"
            />
            <span className="text-[10px] text-[#A3A3A3]">
              Email is managed through your authentication provider.
            </span>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-[#171717] hover:bg-[#BD8B52] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Security & Password */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="font-bold text-base text-[#171717] flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#BD8B52]" /> Security & Password
        </h3>
        <p className="text-xs text-[#737373] leading-relaxed">
          Need to change or reset your password? Trigger a password recovery email to receive a
          secure token.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block px-4 py-2 border border-[#E5E0D8] hover:border-[#BD8B52] text-[#171717] rounded-lg text-xs font-semibold transition-colors"
        >
          Request Password Reset
        </Link>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-white border border-red-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-bold text-base text-red-600">Danger Zone: Delete Account</h3>
        </div>
        <p className="text-xs text-[#737373] leading-relaxed">
          Permanently delete your profile, preferences, and bookmarked outfits. This action is
          irreversible.
        </p>

        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete My Account
        </button>
      </div>

      {/* Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#E5E0D8] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h4 className="text-lg font-bold text-[#171717]">Confirm Account Deletion</h4>
            <p className="text-xs text-[#737373] leading-relaxed">
              Are you sure you want to delete your TRENRO account? All saved outfits, view history,
              and style settings will be wiped.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-[#E5E0D8] rounded-lg text-xs font-semibold text-[#171717]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
