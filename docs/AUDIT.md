# TRENRO Security, Architecture, & Business Model Audit
**Date:** October 2026  
**Auditor:** Senior Full-Stack, Application Security & QA Engineering  
**Scope:** Entire repository (`src/`, `supabase/`, `.env*`, tests, workflows)

---

## 1. Executive Summary

TRENRO was conceived as an outfit-discovery and affiliate-shopping platform for men in India, helping users coordinate complete head-to-toe looks within clear budgets. However, an inspection of the current repository reveals severe architectural contradictions, critical security flaws, and fabricated direct-to-consumer (D2C) e-commerce claims.

Specifically:
- **Business Model Fabrication:** The public UI presents TRENRO as an in-house clothing brand with direct manufacturing ("TRENRO Atelier", "100% In-house craft"), its own fulfillment centers ("Mumbai & Bangalore"), express shipping, Cash on Delivery (COD), 7-day doorstep size replacement, cart checkout, and order tracking. In reality, TRENRO possesses no inventory, no payment gateway, no shipping courier integrations, and no warehouse operations.
- **Authentication & Privilege Escalation:** Any login or signup containing the substring `"admin"` in the email is automatically granted administrator privileges on the client. The admin portal layout accepts any password without verification and grants access. Privilege state is stored in browser `localStorage` and read from user-editable Supabase `user_metadata`.
- **Database & RLS Leakage:** The initial migration (`20261025000000_trenro_initial_schema.sql`) contains a Row Level Security policy allowing anonymous visitors to `SELECT` from `public.profiles`, exposing user email addresses and metadata. The `public.is_admin()` helper function is `SECURITY DEFINER` without a fixed `search_path`, creating a privilege escalation vector. Relation tables allow draft outfits to leak to the public.
- **Fake Persistence & Dummy APIs:** `src/app/api/contact/route.ts` and `src/app/api/affiliate/click/route.ts` return fabricated IDs and report success without persisting to any database or calling any email service. Admin catalog modifications in `demo-context.tsx` write only to `localStorage` while presenting themselves as store operations.

---

## 2. Route & Component Inventory

| Route / File | Stated Purpose | Actual Implementation Status | Findings & Vulnerabilities |
|---|---|---|---|
| `/` (`src/app/page.tsx`) | Storefront homepage | Mixed / Misleading | Claims "TRENRO Atelier", "100% in-house craft", "Orders ship from fulfillment centers", "COD & 7-day exchange". Mixed affiliate & fake cart links. |
| `/outfits` (`src/app/outfits/page.tsx`) | Outfit catalog | Functional (client store) | Filters by occasion, style, budget. Displays outfits from client state. |
| `/outfits/[slug]` (`src/app/outfits/[slug]/page.tsx`) | Outfit detail breakdown | Misleading / Fake D2C | Provides "Add Selected Pieces to Bag" button with size selector. Falsely claims "Direct from TRENRO Studio". Hides original retailer links in favor of fake cart. |
| `/shop-the-look` (`src/app/shop-the-look/page.tsx`) | Head-to-toe discovery | Functional / Misleading | Contains bundle-to-cart buttons claiming in-house fulfillment. |
| `/budget-looks` (`src/app/budget-looks/page.tsx`) | Budget curations (e.g. Under ₹999) | Functional | Filters looks by calculated item totals. |
| `/trends` (`src/app/trends/page.tsx`) | Editorial trend forecast | Static editorial | Hardcoded metrics ("trending", "saved"). |
| `/style-guides` & `[slug]` | Fashion editorial guides | Functional | Good editorial content, needs honest authoring attribution. |
| `/find-my-look` (`src/app/find-my-look/page.tsx`) | 60-second style quiz | Functional | Client-side recommendation based on preferences. |
| `/cart` (`src/components/cart/CartDrawer.tsx`) | Shopping drawer | Fictitious D2C Cart | Collects items for fictitious checkout; free shipping progress meter. |
| `/checkout` (`src/app/checkout/page.tsx`) | D2C Checkout & Payment | Completely Fictitious / Hazardous | Collects full customer address, phone number, and payment mode (COD, UPI, Card). Claims "256-Bit SSL Encrypted Checkout". Saves dummy order to `localStorage`. |
| `/order-success/[orderId]` | Order confirmation | Completely Fictitious | Falsely claims order is confirmed "Direct from TRENRO Atelier" with courier delivery estimate. |
| `/dashboard` (`src/app/dashboard/page.tsx`) | User profile & style hub | Partially real (localStorage) | Displays preferences, saved looks, and recent history. |
| `/dashboard/orders` | Customer order tracking | Fictitious | Lists dummy orders from `localStorage` with fake courier statuses ("In Transit", "Delivered"). |
| `/dashboard/preferences` | Style calibration | Functional (localStorage) | Sets budget, styles, colors. |
| `/dashboard/saved` | Saved wardrobe looks | Functional (localStorage) | Lists saved outfits. |
| `/dashboard/history` | Recently viewed looks | Functional (localStorage) | Lists viewed outfits. |
| `/dashboard/settings` | Profile settings | Partially wired | Allows updating display name in client store. |
| `/login` (`src/app/login/page.tsx`) | Authentication | Broken / Insecure | Unchecked open redirect; promotes `*admin*@*` emails to admin in demo mode. |
| `/signup` (`src/app/signup/page.tsx`) | Account creation | Broken / Insecure | Submits client-controlled `role: 'user'` in user_metadata; auto-promotes `*admin*` emails in demo mode. |
| `/forgot-password` & `/reset-password` | Password recovery | Partially wired | Supabase client auth methods called if configured. |
| `/admin` (`src/app/admin/layout.tsx`, `page.tsx`) | Administrator portal | Severe Security Bypass | Form accepts any password; `loginAsDemoAdmin()` assigns role in `localStorage`; client-only route protection; fake customer order tracking. |
| `/admin/outfits` | Outfit management | Mock-only / LocalStorage | Writes to `localStorage` instead of Supabase database. |
| `/admin/products` | Product catalog management | Mock-only / LocalStorage | Writes to `localStorage`. |
| `/admin/orders` | Customer orders admin | Fictitious | Dummy order manager that changes statuses of fictitious orders. |
| `/admin/style-guides` | Editorial articles admin | Mock-only / LocalStorage | Writes to `localStorage`. |
| `/admin/collections` | Collections admin | Mock-only / LocalStorage | Writes to `localStorage`. |
| `/admin/analytics` | Outbound click reporting | Partially wired | Displays local click entries; includes hardcoded "2.4 clicks/session" fake metric. |
| `/about` (`src/app/about/page.tsx`) | About TRENRO | Contradictory | Claims "Direct-to-Consumer Atelier: We design, cut, and fulfill every garment directly under the TRENRO label." |
| `/contact` (`src/app/contact/page.tsx`) | Contact form | Partially wired | References order reference numbers and size exchanges. Submits to `/api/contact`. |
| `/affiliate-disclosure` | Affiliate disclosure | Misleading | Titled "Atelier Craft & Fulfillment Policy" promising Pan-India express fulfillment instead of disclosing affiliate relationships. |
| `/terms` (`src/app/terms/page.tsx`) | Terms of service | True to original business | Accurately describes TRENRO as an affiliate discovery site (conflicting with the rest of the app). |
| `/privacy` (`src/app/privacy/page.tsx`) | Privacy policy | Incomplete | Does not account for contact submission storage, analytics, or cookies. |
| `/api/contact` | Contact API route handler | Dummy Success | Validates input format, but fabricates `cnt-...` ID without database persistence or email delivery. |
| `/api/affiliate/click` | Outbound affiliate click tracking | Dummy Success | Validates retailer allowlist, but fabricates `clk-...` ID without persisting click events. |

---

## 3. Detailed Security Vulnerabilities

### Issue A1: Email-String Role Escalation
- **Location:** `src/app/login/page.tsx` (lines 63–75), `src/app/signup/page.tsx` (lines 75–82)
- **Vulnerability:**
  ```typescript
  const isAdmin = email.toLowerCase().includes('admin');
  // ... assigns role: (isAdmin ? 'admin' : 'user')
  ```
- **Severity:** High / Insecure by Design. Any user registering or logging in with an email containing the word "admin" (e.g., `sysadmin@gmail.com`, `badadmin@yahoo.com`) receives full administrative access in the client store.

### Issue A2: Password-Free Admin Login Bypass
- **Location:** `src/app/admin/layout.tsx` (lines 49–56)
- **Vulnerability:**
  ```typescript
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.includes('@')) return;
    loginAsDemoAdmin(); // Ignores password completely!
  };
  ```
- **Severity:** Critical. The password input field is entirely decorative. Any visitor can enter any email address with an `@` symbol and be logged in as an administrator.

### Issue A3: Client-Side Authorization & LocalStorage Role Trust
- **Location:** `src/app/admin/layout.tsx` (line 28), `src/lib/store/demo-context.tsx` (lines 112–120, 199–222)
- **Vulnerability:** Protected views inspect `user?.role === 'admin'` from React state initialized from `localStorage.getItem('trenro_current_user')`. Any user can set `localStorage.setItem('trenro_current_user', JSON.stringify({ role: 'admin' }))` in the browser console and gain full admin UI access.

### Issue A4: User-Editable Metadata Role Trust
- **Location:** `src/lib/store/demo-context.tsx` (line 188)
- **Vulnerability:**
  ```typescript
  role: (session.user.user_metadata?.role as 'user' | 'admin') || 'user'
  ```
- **Severity:** High. In Supabase, `raw_user_meta_data` is directly editable by the end-user via `supabase.auth.updateUser({ data: { role: 'admin' } })`. User metadata must never be used for authorization decisions.

### Issue A5: Unvalidated Redirects (Open Redirect)
- **Location:** `src/app/login/page.tsx` (line 23)
- **Vulnerability:** `searchParams.get('redirect')` is passed directly to `router.push(redirectUrl)` without verifying that the target begins with a single `/` and not `//` or an external protocol like `https://malicious-site.com`.

### Issue B1: Public Exposure of User Profiles & Email Addresses in RLS
- **Location:** `supabase/migrations/20261025000000_trenro_initial_schema.sql` (lines 197–198)
- **Vulnerability:**
  ```sql
  CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);
  ```
- **Severity:** High Privacy Violation. Anonymous visitors can query the Supabase REST API and dump every registered user's ID, display name, and full email address.

### Issue B2: Unrestricted `is_admin()` Function Without Fixed `search_path`
- **Location:** `supabase/migrations/20261025000000_trenro_initial_schema.sql` (lines 186–194)
- **Vulnerability:** `CREATE OR REPLACE FUNCTION public.is_admin() ... LANGUAGE plpgsql SECURITY DEFINER;` lacks `SET search_path = public, pg_temp;`. A malicious schema or function could hijack execution under superuser privileges.

### Issue B3: Inadequate Self-Promotion Prevention in Profile Update Policy
- **Location:** `supabase/migrations/20261025000000_trenro_initial_schema.sql` (lines 200–204)
- **Vulnerability:** The policy uses a subquery in `WITH CHECK`, which can be circumvented or cause recursion. A `BEFORE UPDATE` database trigger is required to strictly forbid modifying the `role` column.

### Issue B4: Unpublished & Relation Table Leaks
- **Location:** `supabase/migrations/20261025000000_trenro_initial_schema.sql` (lines 290–292)
- **Vulnerability:** `collection_outfits` allows `SELECT USING (true);`. Draft or unpublished outfits linked to collections are visible to anonymous users through the junction table.

### Issue C1 & C2: Non-Persistent Dummy API Endpoints Reporting Fake Success
- **Location:** `src/app/api/contact/route.ts`, `src/app/api/affiliate/click/route.ts`
- **Vulnerability:** Both endpoints receive data and respond with `{ success: true, submissionId: ... }` or `{ success: true, loggedClickId: ... }` with generated timestamps, but execute zero database queries and call zero email services. Users believe messages and clicks were delivered when they were discarded into void.

---

## 4. Product Truth & Business Model Discrepancies

The entire e-commerce infrastructure currently in the app is fictional:
1. **Atelier Claims:** "100% In-house craft", "TRENRO Atelier", "Handcrafted in Mumbai & Bangalore". TRENRO does not design, cut, weave, or produce garments.
2. **Logistics Claims:** "Pan-India express delivery", "Dispatched from central hubs in Mumbai & Bangalore", "Free shipping above ₹999", "Air courier 2-4 days". TRENRO has no courier contracts or warehouses.
3. **Payment & Checkout Claims:** "Cash On Delivery (COD)", "Instant UPI QR code", "256-Bit SSL Encrypted Checkout". TRENRO has no merchant account or payment processor integrated.
4. **Returns & Customer Support:** "7-day doorstep size exchange", "+91 98200 12345 phone line". TRENRO cannot exchange garments from external retailers.
5. **Promotional Offers:** "TRENRO10" 10% coupon code and "₹200 off your first atelier order" on a site that does not sell anything.
6. **False Affiliate Page:** `/affiliate-disclosure` was rewritten into an "Atelier Craft Guarantee" page that actively denies third-party retailing!

---

## 5. Remediation Roadmap

1. **Phase 2 — Product Truth:**
   - Remove fake cart, checkout (`/checkout`), order success (`/order-success/[orderId]`), customer orders (`/dashboard/orders`), and admin order fulfillment (`/admin/orders`).
   - Transform `ProductCard` and `OutfitCard` from fake "Add to Bag" to honest "View at Retailer" / "Shop Look" with retailer badges (e.g. Myntra, Ajio, Snitch, Zara, Westside), price verification dates, and affiliate transparency disclosures.
   - Replace false claims in Header, Footer, Homepage, About, Contact, and Affiliate Disclosure.
2. **Phase 3 — Security Hardening:**
   - Eliminate email-string admin escalation from all login/signup components.
   - Implement real server-side session and admin checks using `@supabase/ssr` server client.
   - Restrict `/admin` on the server: redirect unauthenticated requests to `/login`, return 403 to non-admin authenticated users.
   - Harden Supabase schema migration: fix `profiles` RLS to allow users to view only their own record, seal `is_admin()` with `SET search_path = public, pg_temp`, add a database trigger preventing `role` column modifications, and protect relation tables against draft leaks.
   - Implement real database persistence for contact form and outbound clicks with rate limiting and honeypot spam protection.
3. **Phase 4 — Data & Functionality:**
   - Connect catalog reads to Supabase when configured, with clear and honest fallback labeling for editorial starter items in demo/development mode.
   - Ensure external retailer links are validated against approved domains, use `rel="noopener noreferrer sponsored"`, and track outbound clicks truthfully.
4. **Phase 5 — Professional UI/UX Redesign:**
   - Keep TRENRO's charcoal, ivory, and copper palette.
   - Polish responsive layout, typography, accessible labels, keyboard navigation, and mobile menu.
5. **Phase 6 — Testing & Verification:**
   - Replace dummy arithmetic tests with actual security, authentication, allowlist, and data-integrity tests.
   - Run typecheck, lint, unit tests, and browser verification with screenshots.
