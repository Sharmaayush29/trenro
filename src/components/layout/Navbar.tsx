'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import TrenroLogo from '@/components/brand/TrenroLogo';
import { useDemoStore } from '@/lib/store/demo-context';
import { useCart } from '@/lib/store/cart-context';
import {
  Search,
  Heart,
  User,
  Menu,
  X,
  Compass,
  Sparkles,
  Tag,
  BookOpen,
  ShieldCheck,
  LogOut,
  ChevronDown,
  ShoppingBag,
  Package,
  Layers,
  Mail,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, savedOutfitIds, logout } = useDemoStore();
  const { itemCount, setIsCartOpen } = useCart();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  interface NavLinkItem {
    name: string;
    href: string;
    icon: React.ElementType;
    highlight?: boolean;
  }

  const navLinks: NavLinkItem[] = [
    { name: 'Shop All', href: '/shop', icon: ShoppingBag },
    { name: 'T-Shirts', href: '/shop?category=T-Shirt', icon: Tag },
    { name: 'Shirts', href: '/shop?category=Shirt', icon: Compass },
    { name: 'Trousers', href: '/shop?category=Trousers', icon: Layers },
    { name: 'Lookbook', href: '/outfits', icon: Sparkles },
    { name: 'Style Guides', href: '/style-guides', icon: BookOpen },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E5E0D8] transition-colors">
      {/* Top Customer Concierge Bar */}
      <div className="bg-[#171717] text-[#D4D4D4] py-1.5 px-4 text-[11px] border-b border-[#262626]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-[#BD8B52]" />
              Client Concierge: <a href="mailto:rasu29906@gmail.com" className="font-semibold text-white hover:text-[#BD8B52] transition-colors">rasu29906@gmail.com</a>
            </span>
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#A3A3A3] font-medium hidden md:block">
            TRENRO Engineered Menswear • Free Shipping Across India Above ₹999
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <TrenroLogo size="md" showTagline={false} />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              if (link.highlight) {
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full transition-all ${
                      active
                        ? 'bg-[#72785B] text-white shadow-sm'
                        : 'bg-[#72785B]/10 text-[#72785B] hover:bg-[#72785B]/20 border border-[#72785B]/30'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {link.name}
                  </Link>
                );
              }
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 text-xs font-semibold tracking-wider uppercase transition-colors relative ${
                    active ? 'text-[#171717] font-bold' : 'text-[#737373] hover:text-[#171717]'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#72785B]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Toggle */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-[#171717] hover:text-[#72785B] hover:bg-[#F6F3ED] rounded-full transition-colors cursor-pointer"
              aria-label="Search outfits"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Saved Outfits / Favorites */}
            <Link
              href="/dashboard/saved"
              className="relative p-2 text-[#171717] hover:text-[#72785B] hover:bg-[#F6F3ED] rounded-full transition-colors"
              aria-label="Saved Outfits"
            >
              <Heart className="w-5 h-5" />
              {mounted && savedOutfitIds.length > 0 && (
                <span
                  suppressHydrationWarning
                  className="absolute -top-1 -right-1 bg-[#72785B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {savedOutfitIds.length}
                </span>
              )}
            </Link>

            {/* Shopping Bag Button with Counter */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#171717] hover:text-[#72785B] hover:bg-[#F6F3ED] rounded-full transition-colors cursor-pointer"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span
                  suppressHydrationWarning
                  className="absolute -top-1 -right-1 bg-[#171717] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#72785B]/40 shadow-xs"
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* Direct Admin Entry for Authorized Admins */}
            {mounted && user?.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#171717] hover:bg-[#72785B] text-white text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors shadow-xs"
                title="Catalog & Store Administration"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#BD8B52]" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Account Menu */}
            {mounted && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-[#E5E0D8] hover:border-[#72785B] bg-[#F6F3ED] transition-all cursor-pointer"
                  aria-expanded={userDropdownOpen}
                >
                  <span className="text-xs font-semibold text-[#171717] hidden md:inline truncate max-w-[100px]">
                    {user.display_name}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#171717] text-white flex items-center justify-center text-xs font-bold border border-[#72785B]/40">
                    {user.display_name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white border border-[#E5E0D8] rounded-xl shadow-xl py-2 z-50 text-xs"
                    onClick={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-[#F6F3ED]">
                      <p className="font-bold text-[#171717] truncate">{user.display_name}</p>
                      <p className="text-[11px] text-[#737373] truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 text-[#171717] hover:bg-[#F6F3ED] transition-colors"
                    >
                      <User className="w-4 h-4 text-[#72785B]" />
                      My Dashboard
                    </Link>

                    <Link
                      href="/dashboard/orders"
                      className="flex items-center gap-2 px-4 py-2.5 text-[#171717] hover:bg-[#F6F3ED] transition-colors"
                    >
                      <Package className="w-4 h-4 text-[#72785B]" />
                      My Orders & Shipments
                    </Link>

                    <Link
                      href="/dashboard/saved"
                      className="flex items-center gap-2 px-4 py-2.5 text-[#171717] hover:bg-[#F6F3ED] transition-colors"
                    >
                      <Heart className="w-4 h-4 text-[#72785B]" />
                      Saved Looks ({savedOutfitIds.length})
                    </Link>

                    <Link
                      href="/dashboard/preferences"
                      className="flex items-center gap-2 px-4 py-2.5 text-[#171717] hover:bg-[#F6F3ED] transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-[#72785B]" />
                      Style Preferences
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2.5 text-[#72785B] font-semibold hover:bg-[#F6F3ED] transition-colors border-t border-[#F6F3ED]"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#72785B]" />
                        Catalog Admin
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors border-t border-[#F6F3ED] cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  href="/login"
                  className="px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#171717] hover:text-[#72785B] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-block px-4 py-2 bg-[#171717] text-white hover:bg-[#72785B] text-xs font-bold uppercase tracking-wider rounded-md transition-colors"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#171717] hover:bg-[#F6F3ED] rounded-md transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Expandable Search Input */}
        {searchOpen && (
          <div className="py-4 border-t border-[#E5E0D8] animate-in fade-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center max-w-2xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search heavyweight tees, camp-collar linen shirts, Gurkha trousers, denim jackets..."
                className="w-full pl-10 pr-24 py-3 bg-[#F6F3ED] border border-[#E8E3D9] rounded-full text-sm text-[#171717] placeholder-[#737373] focus:bg-white focus:border-[#72785B] focus:outline-none"
                autoFocus
              />
              <Search className="w-4 h-4 absolute left-3.5 text-[#737373]" />
              <button
                type="submit"
                className="absolute right-2 px-4 py-1.5 bg-[#171717] hover:bg-[#72785B] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E8E3D9] px-4 pt-2 pb-6 space-y-2">
          <div className="pt-2 pb-3 border-b border-[#F6F3ED]">
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#171717] text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#72785B]" />
              Explore Entire Apparel Archive
            </Link>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                  active
                    ? 'bg-[#F6F3ED] text-[#72785B] font-bold'
                    : 'text-[#171717] hover:bg-[#F6F3ED]'
                }`}
              >
                <Icon className="w-4 h-4 text-[#72785B]" />
                {link.name}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[#F6F3ED] space-y-2">
            {mounted && user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-[#171717]"
                >
                  <User className="w-4 h-4 text-[#72785B]" />
                  My Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsCartOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-[#171717] w-full text-left"
                >
                  <ShoppingBag className="w-4 h-4 text-[#72785B]" />
                  <span>Shopping Bag ({itemCount})</span>
                </button>
                <Link
                  href="/dashboard/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-[#171717]"
                >
                  <Package className="w-4 h-4 text-[#72785B]" />
                  My Orders & Shipments
                </Link>
                <Link
                  href="/dashboard/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-[#171717]"
                >
                  <Heart className="w-4 h-4 text-[#72785B]" />
                  Saved Looks ({savedOutfitIds.length})
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-[#72785B] font-bold bg-[#72785B]/10 rounded-xl"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#72785B]" />
                    Catalog Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 border border-[#171717] text-[#171717] font-bold text-xs uppercase tracking-wider rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2.5 bg-[#171717] text-white font-bold text-xs uppercase tracking-wider rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Customer Care Drawer Section */}
            <div className="pt-4 border-t border-[#E8E3D9] text-xs space-y-1.5 text-[#737373]">
              <span className="font-bold text-[10px] uppercase tracking-wider text-[#171717] block">
                Direct Client Concierge
              </span>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#BD8B52]" />
                <a href="mailto:rasu29906@gmail.com" className="font-semibold text-[#171717] hover:underline">
                  rasu29906@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
