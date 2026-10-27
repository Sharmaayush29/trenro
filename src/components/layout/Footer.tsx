'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import TrenroLogo from '@/components/brand/TrenroLogo';
import { ArrowRight, CheckCircle2, Shield, Compass, Calculator, ExternalLink, Mail, Info } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && email.includes('@')) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#171717] text-[#F5F1E8] border-t border-[#2A2A2A] mt-auto">
      {/* Brand Value Pillars */}
      <div className="border-b border-[#2A2A2A] py-8 px-4 sm:px-6 lg:px-8 bg-[#121212]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-[#BD8B52] shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                Engineered Fabrics
              </h5>
              <p className="text-[11px] text-[#A3A3A3]">240–280 GSM heavyweight cotton & French linen</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-[#BD8B52] shrink-0">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                Complimentary Shipping
              </h5>
              <p className="text-[11px] text-[#A3A3A3]">Free express delivery on orders over ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-[#BD8B52] shrink-0">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                7-Day Doorstep Exchange
              </h5>
              <p className="text-[11px] text-[#A3A3A3]">Rider brings your replacement size directly</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#262626] flex items-center justify-center text-[#BD8B52] shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                Cash On Delivery & UPI
              </h5>
              <p className="text-[11px] text-[#A3A3A3]">Zero advance COD or instant 1-click UPI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Bar */}
      <div className="border-b border-[#2A2A2A] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <span className="text-[#BD8B52] text-xs font-bold tracking-[0.2em] uppercase">
              TRENRO Style Journal
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
              Never miss a new curated look or style guide.
            </h3>
            <p className="text-sm text-[#A3A3A3] mt-2">
              Get weekly outfit breakdowns, budget alerts, and color combination guides delivered to your inbox.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="flex items-center gap-3 p-4 bg-[#262626] border border-[#BD8B52]/40 rounded-xl text-white">
                <CheckCircle2 className="w-5 h-5 text-[#BD8B52] flex-shrink-0" />
                <p className="text-sm">
                  Welcome to TRENRO Style Journal! You will receive our next curated outfit drop.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="flex-1 px-4 py-3 bg-[#262626] border border-[#3A3A3A] rounded-xl text-sm text-white placeholder-[#737373] focus:border-[#BD8B52] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#BD8B52] hover:bg-[#A3743E] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Join Drops <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
            <p className="text-[11px] text-[#737373] mt-2">
              Curated menswear looks only. No spam, ever. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <TrenroLogo variant="light" size="lg" showTagline={true} />
            <p className="text-xs text-[#A3A3A3] leading-relaxed max-w-sm">
              TRENRO is an original independent menswear brand engineered with custom heavyweight textiles,
              precise contemporary proportions, and enduring craftsmanship. Designed and fulfilled directly
              from our studio atelier.
            </p>
            <div className="pt-2 text-xs text-[#A3A3A3]">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#BD8B52] shrink-0" />
                <a href="mailto:rasu29906@gmail.com" className="hover:text-white font-medium transition-colors">
                  rasu29906@gmail.com
                </a>
                <span className="text-[10px] text-[#737373]">(Client Concierge)</span>
              </div>
            </div>
          </div>

          {/* Quick Discover */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#BD8B52]">
              Apparel Archive
            </h4>
            <ul className="space-y-2 text-xs text-[#A3A3A3]">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Garments (Archive)
                </Link>
              </li>
              <li>
                <Link href="/shop?category=T-Shirt" className="hover:text-white transition-colors">
                  Heavyweight T-Shirts (240–280 GSM)
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Shirt" className="hover:text-white transition-colors">
                  Camp-Collar Linen Shirts
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Trousers" className="hover:text-white transition-colors">
                  Gurkha & Pleated Trousers
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Jacket" className="hover:text-white transition-colors">
                  Denim Truckers & Jackets
                </Link>
              </li>
              <li>
                <Link href="/outfits" className="hover:text-white transition-colors">
                  Head-to-Toe Lookbook
                </Link>
              </li>
            </ul>
          </div>

          {/* Style & Fit */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#BD8B52]">
              Fit & Styling
            </h4>
            <ul className="space-y-2 text-xs text-[#A3A3A3]">
              <li>
                <Link href="/style-guides" className="hover:text-white transition-colors">
                  Indian Fit & Drop Shoulder Guide
                </Link>
              </li>
              <li>
                <Link href="/shipping-and-returns" className="hover:text-white transition-colors">
                  7-Day Doorstep Size Trial
                </Link>
              </li>
              <li>
                <Link href="/outfits?occasion=College" className="hover:text-white transition-colors">
                  Campus & Daily Outfits
                </Link>
              </li>
              <li>
                <Link href="/outfits?occasion=Office" className="hover:text-white transition-colors">
                  Smart Workwear Looks
                </Link>
              </li>
              <li>
                <Link href="/outfits?occasion=Casual+Date" className="hover:text-white transition-colors">
                  Weekend & Date Fits
                </Link>
              </li>
            </ul>
          </div>

          {/* About & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#BD8B52]">
              Brand & Policies
            </h4>
            <ul className="space-y-2 text-xs text-[#A3A3A3]">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About TRENRO Atelier
                </Link>
              </li>
              <li>
                <Link href="/shipping-and-returns" className="hover:text-white transition-colors font-semibold text-[#BD8B52]">
                  Shipping & Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Customer Concierge
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* TRENRO Brand Guarantee Statement */}
        <div className="mt-12 pt-8 border-t border-[#2A2A2A] text-[11px] text-[#737373] leading-relaxed">
          <p className="mb-2">
            <strong className="text-[#A3A3A3]">TRENRO Direct-to-Consumer Guarantee:</strong> TRENRO is an original independent Indian menswear brand. All garments featured on this platform are original TRENRO apparel manufactured with custom 240–280 GSM cottons, European flax linens, and tailored fits. Orders are fulfilled directly with express air dispatch and an unconditional 7-day doorstep size exchange trial across India.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-[#737373]">
            <p>© 2026 TRENRO Apparel Co. All Rights Reserved. Indian Contemporary Menswear.</p>
            <div className="flex items-center gap-2 text-[11px] text-[#A3A3A3]">
              <span>Wear the Trend. Own the Look.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
