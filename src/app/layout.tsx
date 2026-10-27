import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { DemoProvider } from '@/lib/store/demo-context';
import { CartProvider } from '@/lib/store/cart-context';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: "TRENRO — Engineered Menswear | Official Online Store",
  description:
    "Official online store of TRENRO. Premium modern menswear for the Indian market. Heavyweight 240-280 GSM t-shirts, French linen shirts, pleated trousers, cargos, and jackets. Direct-to-consumer quality.",
  keywords: [
    "TRENRO menswear",
    "men clothing brand india",
    "heavyweight t-shirts men",
    "resort shirts men",
    "pleated trousers men",
    "d2c menswear india",
    "trenro fashion",
  ],
  authors: [{ name: 'TRENRO Official' }],
  metadataBase: new URL('https://trenro.com'),
  openGraph: {
    title: "TRENRO — Engineered Menswear | Official Online Store",
    description: 'Modern men’s apparel designed for drape, substance, and clean silhouettes.',
    siteName: 'TRENRO',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#FDFBF7] text-[#171717]"
      >
        <DemoProvider>
          <CartProvider>
            {/* TRENRO Brand Announcement Bar */}
            <div className="bg-[#171717] text-[#F5F1E8] text-[11px] font-semibold py-2 px-4 text-center tracking-wider uppercase border-b border-[#2A2A2A]">
              <span>
                Free Express Delivery on Orders Over ₹999 &nbsp;•&nbsp; 7-Day Doorstep Size Exchange &nbsp;•&nbsp; Cash On Delivery & Instant UPI
              </span>
            </div>

            <Suspense fallback={<nav className="h-20 bg-white border-b border-[#E5E0D8]" />}>
              <Navbar />
            </Suspense>

            <div className="flex-1">{children}</div>

            <Footer />
            <CartDrawer />
          </CartProvider>
        </DemoProvider>
      </body>
    </html>
  );
}
