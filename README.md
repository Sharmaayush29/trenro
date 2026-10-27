# TRENRO — Direct-to-Consumer Menswear Brand & Commerce Platform

> **“WEAR THE TREND. OWN THE LOOK.”**  
> Premium, contemporary menswear engineered for Indian lifestyle & fit architecture.

---

## 1. What TRENRO Does

**TRENRO** is an original direct-to-consumer (D2C) men's clothing brand and modern fashion commerce platform. TRENRO designs, stocks, and sells its own branded apparel—specializing in heavyweight 240–280 GSM cotton tees, breathable Cuban collar and French linen shirts, pleated Gurkha trousers, and structured outerwear.

### Core Capabilities
- **Direct-to-Consumer (D2C) Shopping:** Authentic product catalog with multi-angle photography, real size selectors (`S`, `M`, `L`, `XL`, `XXL`), color options, dynamic bag drawer, promotional coupon engine, and instant checkout.
- **Genuine Admin CMS:** Full inventory and catalog desk supporting product creation, multi-image galleries, video previews, publication controls, draft states, price architecture (Cost Price, Selling Price, Compare-At Price), SKU generation, and stock management.
- **Order Management & Fulfillment:** Complete customer order pipeline (`Confirmed` → `Processing` → `Shipped` → `Delivered`), order tracking references (`TRN-XXXXXX`), customer details, item snapshots, and live status adjustments.
- **UPI & Payment Administration:** Server-side Razorpay UPI order creation, timing-safe HMAC-SHA256 signature verification, webhook handler, and admin transaction desk with real-time settlement and Cash on Delivery (COD) tracking.
- **Zero Unrequested AI:** Removed all artificial intelligence chatbots, AI stylists, prompt generators, and hallucinated recommendations in favor of deterministic search, genuine curated collections, and real catalog queries.
- **Strict Data Integrity:** Honest metrics only. Zero fabricated reviews, false sales figures, or fake stock countdowns.

---

## 2. Architecture & Technology Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router with Turbopack, Partial Prefetching, and React 19).
- **Language:** TypeScript 5.
- **Styling:** Tailwind CSS v4 with bespoke editorial neutral tokens (`#171717`, `#BD8B52`, `#FAF7F2`, `#E5E0D8`).
- **Database & Auth:** [Supabase](https://supabase.com/) PostgreSQL with Row-Level Security (RLS) policies and session management via `@supabase/ssr`.
- **Client Persistence:** Dual-persistence engine syncing with Supabase when connected and caching in `localStorage` (`trenro_custom_products_v3`, `trenro_orders_v2`) when offline or in demonstration mode.
- **Payments:** Razorpay official API with paise conversion and HMAC-SHA256 signature verification.
- **Automated Testing:** Node.js native test runner (`node:test`, `node:assert/strict`) executed with `tsx`.

---

## 3. Prerequisites

- **Node.js:** v20.x or higher (LTS recommended)
- **Package Manager:** `npm` (v10 or higher)
- **Supabase Account:** Free or Pro project for PostgreSQL & Storage (optional in demo mode)
- **Razorpay Merchant Account:** Test or Live keys for UPI / Netbanking / Card payments

---

## 4. Local Installation

```bash
# 1. Clone repository
git clone <your-repo-url>
cd Dream

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Environment Configuration

Edit `.env.local` with your configuration:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Mode Switch
# Set to "false" to enforce live Supabase connection
NEXT_PUBLIC_DEMO_MODE=true

# Razorpay / UPI Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_yourKeyId
RAZORPAY_KEY_ID=rzp_test_yourKeyId
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

---

## 6. Database Setup & Migrations

The database migration files are located in `supabase/migrations/`:
- `supabase/migrations/20261026_harden_security_and_rls.sql`: Enables RLS, creates profiles, outfits, products, and triggers.

To apply migrations using the Supabase CLI:
```bash
npx supabase db push
```
Or execute the SQL migration script directly in the **Supabase Dashboard → SQL Editor**.

---

## 7. Storage Configuration

If using Supabase Storage for product photography and videos:
1. Create a public bucket named `product-images`.
2. Configure bucket policies to allow authenticated staff to upload (`INSERT`), and public visitors to view (`SELECT`).
3. Set max upload size to `5MB` and allowed MIME types to `image/jpeg, image/png, image/webp, video/mp4`.

---

## 8. Admin Account Provisioning

Administrator privileges are strictly verified on the server via the `profiles` table. Email substring matches or client-side roles are blocked.

### Provisioning an Admin User
1. Sign up a new user via `/signup`.
2. Open the **Supabase Dashboard → SQL Editor** and execute:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@trenro.com';
```
3. The user can now access `/admin` and execute restricted catalog mutations.

---

## 9. Product Creation & Image Management

1. Sign in with an authorized admin account and navigate to `/admin/products`.
2. Click **Add New Apparel**.
3. Fill in:
   - **Product Name** & **Internal SKU** (`TRN-TSH-001`, `TRN-SHT-002`)
   - **Apparel Category** (T-Shirts, Shirts, Trousers, Outerwear)
   - **Pricing:** Selling Price (INR), Compare-At Price, Internal Cost Price
   - **Warehouse Stock:** Starting inventory count and low-stock alert threshold
   - **Sizes:** Toggle available sizes (`S`, `M`, `L`, `XL`, `XXL`)
   - **Colors:** Comma-separated colorways
   - **Images:** Primary cover image URL, additional gallery URLs, and preview video clip
4. Click **Save Product & Persist**.
5. The product is saved to Supabase (and mirrored to local cache) and immediately visible on `/shop` and `/outfits`.

---

## 10. User Roles & Permissions

| Role | Access Level | Description |
|---|---|---|
| **Visitor / Customer** | Public Storefront | Browses garments, adds to cart, places orders, views `/dashboard/orders`. |
| **Catalog Manager** | Admin Catalog | Creates, edits, publishes, and updates garments in `/admin/products`. |
| **Order Manager** | Admin Order Desk | Manages order statuses in `/admin/orders` (`Confirmed` → `Delivered`). |
| **Owner / Admin** | Complete Platform | Full access to `/admin`, financial analytics, and UPI gateway settings. |

---

## 11. UPI & Payment Setup

TRENRO supports official **UPI (Instant Netbanking)**, **Credit/Debit Cards**, and **Cash on Delivery (COD)** via Razorpay.

### Setup Steps
1. Create an account at [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Navigate to **Settings → API Keys** and generate **Key ID** and **Key Secret**.
3. Add keys to `.env.local`:
   ```bash
   RAZORPAY_KEY_ID=rzp_live_yourLiveKey
   RAZORPAY_KEY_SECRET=your_live_secret
   ```
4. Configure Webhooks:
   - URL: `https://your-domain.com/api/payments/webhook`
   - Active Events: `order.paid`, `payment.failed`, `refund.processed`
   - Webhook Secret: Set in `RAZORPAY_WEBHOOK_SECRET`

---

## 12. Sandbox vs. Production Configuration

- **Sandbox (`rzp_test_...`):** Real UPI transactions are simulated; test orders can be placed without debiting funds.
- **Production (`rzp_live_...`):** Real INR transactions via UPI apps (GPay, PhonePe, Paytm, BHIM) and banking networks.
- In both modes, order totals are **strictly recalculated on the server** based on database product prices to prevent client-side price tampering.

---

## 13. Quality Assurance Commands

Run all verification commands:

```bash
# 1. Type Check (Strict TypeScript validation)
npx tsc --noEmit

# 2. Automated Test Suite (24 unit & integration tests)
npm test

# 3. Linting Check (ESLint 9 rules)
npm run lint

# 4. Production Build (Next.js 16 Turbopack with Partial Prefetching)
npm run build
```

---

## 14. Deployment Procedure (Vercel)

1. Push code to your Git repository (GitHub/GitLab).
2. Import project into [Vercel](https://vercel.com).
3. Add the required environment variables in **Project Settings → Environment Variables**.
4. Set Build Command: `next build`.
5. Deploy.

---

## 15. Troubleshooting & FAQ

- **Product changes not saving?** Ensure `NEXT_PUBLIC_DEMO_MODE=true` or that Supabase credentials are valid in `.env.local`. When offline, products persist in `localStorage`.
- **Payment gateway setup warning?** Fill in `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env.local` to remove the setup warning banner.
- **Free delivery not applying?** TRENRO applies complimentary shipping on orders of ₹999 or higher; orders under ₹999 carry a flat ₹99 fee.
- **Size exchange policy:** TRENRO offers a 7-day doorstep size exchange policy on all standard garments.
