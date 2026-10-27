'use client';

import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit contact message');
      }

      setSuccessMsg(data.message || 'Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-[11px] font-bold text-[#72785B] uppercase tracking-[0.25em]">
          Customer Care & Studio
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight">
          Get in Touch with TRENRO
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
          Questions about sizing, fabric GSM, order status, or tailoring specifications? Our studio customer care team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contact Information Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#171717] text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-md border border-[#262626]">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#72785B] uppercase tracking-widest">
                Direct Assistance
              </span>
              <h3 className="font-bold text-lg text-[#F6F3ED]">Customer Support Desk</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                Connect directly with our client care associates for order updates, size advice, or garment care inquiries.
              </p>
            </div>

            <div className="space-y-4 pt-2 text-xs">
              {/* Email */}
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 hover:border-[#72785B]/50 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-[#72785B]/20 text-[#72785B] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block">Official Support Email</span>
                  <a
                    href="mailto:rasu29906@gmail.com"
                    className="font-bold text-xs text-[#F6F3ED] hover:text-[#72785B] transition-colors break-all"
                  >
                    rasu29906@gmail.com
                  </a>
                  <span className="text-[10px] text-[#737373] block mt-0.5">Replies within 24 hours</span>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#A3A3A3] uppercase tracking-wider block">Operating Hours</span>
                  <span className="font-semibold text-xs text-[#F6F3ED] block">Monday – Saturday</span>
                  <span className="text-[11px] text-[#A3A3A3]">9:00 AM – 7:00 PM IST</span>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Guarantee Card */}
          <div className="p-5 bg-white border border-[#E8E3D9] rounded-2xl text-xs text-[#737373] space-y-2 shadow-xs">
            <h4 className="font-bold text-[#171717] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#72785B]" /> Genuine TRENRO Guarantee
            </h4>
            <p className="leading-relaxed">
              Every garment bearing the TRENRO label is designed in-house, produced with pre-shrunk combed cotton or pure European flax linen, and rigorously checked before dispatch.
            </p>
          </div>
        </div>

        {/* Contact Form Column */}
        <div className="md:col-span-7 bg-white border border-[#E8E3D9] rounded-3xl p-6 sm:p-8 shadow-xs">
          {successMsg ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-emerald-900 text-lg">Message Received</h3>
              <p className="text-xs text-emerald-700 leading-relaxed max-w-sm mx-auto">{successMsg}</p>
              <button
                type="button"
                onClick={() => setSuccessMsg('')}
                className="mt-2 px-6 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-900 transition-colors"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="border-b border-[#F6F3ED] pb-3">
                <h3 className="text-base font-black text-[#171717]">Send an Inquiry</h3>
                <p className="text-[#737373]">Fill out the details below and we will get back to you promptly.</p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:border-[#72785B] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:border-[#72785B] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Sizing Advice for Linen Shirt / Order Status"
                  className="w-full px-4 py-2.5 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:border-[#72785B] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717] uppercase tracking-wider block">
                  Message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your question or requirement..."
                  className="w-full p-4 bg-[#F6F3ED] border border-[#E8E3D9] rounded-xl text-xs text-[#171717] focus:bg-white focus:border-[#72785B] focus:outline-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? 'Submitting...' : 'Send Message'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
