import React from 'react';
import Link from 'next/link';
import { Truck, RefreshCw, ShieldCheck, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';

export default function ShippingAndReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold text-[#BD8B52] uppercase tracking-[0.2em]">
          Customer Care & Fulfilment
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#171717] tracking-tight">
          Shipping & Doorstep Exchange Policy
        </h1>
        <p className="text-xs text-[#737373]">Official TRENRO Direct-to-Consumer Fulfilment Standard</p>
      </div>

      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-10 space-y-8 text-sm text-[#404040] leading-relaxed shadow-sm">
        {/* Core Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#FDFBF7] border border-[#E5E0D8] rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#BD8B52]/10 text-[#BD8B52] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#171717] text-xs">Free Delivery Over ₹999</h4>
            <p className="text-[11px] text-[#737373] leading-relaxed">
              Complimentary express courier across all tier-1 and tier-2 Indian cities for orders ₹999 and above. Flat ₹99 for smaller orders.
            </p>
          </div>

          <div className="p-4 bg-[#FDFBF7] border border-[#E5E0D8] rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#BD8B52]/10 text-[#BD8B52] flex items-center justify-center">
              <RefreshCw className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#171717] text-xs">7-Day Doorstep Exchange</h4>
            <p className="text-[11px] text-[#737373] leading-relaxed">
              Need a size up or down? Our courier comes directly to your delivery address to exchange sizes with zero hassle.
            </p>
          </div>

          <div className="p-4 bg-[#FDFBF7] border border-[#E5E0D8] rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-[#BD8B52]/10 text-[#BD8B52] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-[#171717] text-xs">3–5 Business Days</h4>
            <p className="text-[11px] text-[#737373] leading-relaxed">
              Dispatched within 24 hours from regional fulfillment hubs with SMS and WhatsApp courier tracking.
            </p>
          </div>
        </div>

        {/* Section 1: Dispatch & Timelines */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#BD8B52]" /> 1. Dispatch & Shipping Timelines
          </h2>
          <p>
            Orders confirmed with verified UPI, Credit/Debit card, or Cash on Delivery are dispatched from our warehouse within 24 to 36 hours (excluding national holidays and Sundays).
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#555]">
            <li><strong>Metro Cities (Mumbai, Delhi NCR, Bangalore, Hyderabad, Chennai, Kolkata):</strong> 2–3 business days.</li>
            <li><strong>Tier-2 & Tier-3 Cities:</strong> 3–5 business days.</li>
            <li><strong>Northeast & Remote Regions:</strong> 5–7 business days.</li>
          </ul>
        </section>

        {/* Section 2: Cash on Delivery Terms */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#BD8B52]" /> 2. Cash on Delivery (COD)
          </h2>
          <p>
            TRENRO supports genuine Cash on Delivery across serviceable pincodes in India. No advance deposit or card reservation is required. You pay the exact order total directly to the delivery courier in cash or via courier UPI QR upon package arrival.
          </p>
        </section>

        {/* Section 3: Doorstep Exchange Policy */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[#BD8B52]" /> 3. Doorstep Size & Silhouette Exchange
          </h2>
          <p>
            We understand that fit is paramount in modern menswear. If you find your tee, shirt, or trousers require a different size, you may request an exchange within 7 days of package delivery.
          </p>
          <p className="text-xs text-[#737373]">
            Conditions: Garments must be unworn, unwashed, and with original TRENRO tags intact.
          </p>
        </section>

        {/* Section 4: Cancellation Policy */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-[#171717]">4. Cancellation & Order Adjustments</h2>
          <p>
            You can modify your delivery address or cancel your order anytime before it has been marked as <strong>Dispatched</strong> by contacting our customer care desk directly or viewing your account order dashboard.
          </p>
          <div className="p-4 bg-[#F6F3ED] border border-[#E8E3D9] rounded-2xl text-xs space-y-1">
            <p className="font-bold text-[#171717]">Direct Client Concierge:</p>
            <p className="text-[#555]">Email: <a href="mailto:rasu29906@gmail.com" className="font-bold text-[#171717] hover:underline">rasu29906@gmail.com</a></p>
            <p className="text-[11px] text-[#737373]">Hours: Monday – Saturday, 9:00 AM – 7:00 PM IST</p>
          </div>
        </section>

        <div className="pt-4 border-t border-[#F5F1E8] flex flex-wrap gap-4 items-center justify-between">
          <Link
            href="/shop"
            className="px-6 py-3 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors inline-flex items-center gap-2"
          >
            Shop TRENRO Collection <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="text-xs font-bold text-[#72785B] hover:underline uppercase tracking-wider"
          >
            Need Help With an Order? Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
