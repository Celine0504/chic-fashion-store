'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, User, Heart, ShoppingBag, Search, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useStore } from '@/context/StoreContext';

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const { cartCount, wishlist, mounted, user: storeUser } = useStore();
  const activeUser = session?.user || storeUser;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-100">
      {/* Top Banner */}
      <div className="bg-black text-white text-[10px] sm:text-[11px] uppercase tracking-[0.25em] py-2 px-4 flex justify-between items-center text-center">
        <span className="cursor-pointer hover:opacity-75 transition">‹</span>
        <span className="font-light">FREE SHIPPING ON ORDERS OVER ₹1,999</span>
        <span className="cursor-pointer hover:opacity-75 transition">›</span>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 sm:py-5 flex items-center justify-between">
        {/* Left: Menu button */}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-neutral-900 hover:text-neutral-500 transition"
        >
          <Menu className="w-5 h-5 stroke-[1.5]" />
          <span className="hidden sm:inline">MENU</span>
        </button>

        {/* Center: Brand Logo */}
        <Link
          href="/"
          className="text-xl sm:text-2xl md:text-3xl font-serif tracking-[0.22em] text-neutral-900 font-semibold uppercase select-none text-center"
        >
          CHIC FASHION STORE
        </Link>

        {/* Right: Icons (Account, Wishlist, Cart) */}
        <div className="flex items-center gap-4 sm:gap-6 text-neutral-900">
          <Link href="/account" title={activeUser ? `Signed in as ${activeUser.name || 'Member'}` : 'Sign In / Account'} className="relative hover:opacity-60 transition flex items-center">
            <User className="w-5 h-5 stroke-[1.5]" />
            {mounted && activeUser && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
            )}
          </Link>
          <Link href="/wishlist" title="Wishlist" className="relative hover:opacity-60 transition">
            <Heart className="w-5 h-5 stroke-[1.5]" />
            {mounted && wishlist.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-neutral-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link href="/cart" title="Shopping Bag" className="relative hover:opacity-60 transition">
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {mounted && (
              <span className="absolute -top-2 -right-2 bg-neutral-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="max-w-4xl mx-auto px-4 pb-3 sm:pb-4">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            placeholder="Search for products, categories, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-none py-2 sm:py-2.5 pl-4 pr-10 text-xs tracking-wider placeholder-neutral-400 focus:outline-none focus:border-neutral-900 transition"
          />
          <button type="submit" className="absolute right-3.5 top-2.5 sm:top-3 text-neutral-400 hover:text-neutral-900 transition">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Slide-out Sidebar Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex transition-all">
          <div className="bg-white w-80 max-w-full h-full p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-8 border-b pb-4">
                <span className="font-serif tracking-[0.2em] text-sm uppercase font-semibold">NAVIGATION</span>
                <button onClick={() => setMenuOpen(false)} className="text-neutral-500 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ul className="space-y-4 text-xs tracking-[0.2em] uppercase font-medium">
                <li><Link href="/" onClick={() => setMenuOpen(false)} className="block py-1 hover:text-neutral-500">Home</Link></li>
                <li><Link href="/account" onClick={() => setMenuOpen(false)} className="block py-1 hover:text-neutral-500 font-semibold text-neutral-900">{activeUser ? `My Account (${activeUser.name || 'Member'})` : 'Sign In / Register'}</Link></li>
                <li><Link href="/shop" onClick={() => setMenuOpen(false)} className="block py-1 hover:text-neutral-500">All Collections</Link></li>
                <li><Link href="/shop?category=clothing" onClick={() => setMenuOpen(false)} className="block py-1 hover:text-neutral-500">Clothing</Link></li>
                <li><Link href="/shop?category=dresses" onClick={() => setMenuOpen(false)} className="block py-1 hover:text-neutral-500">Dresses</Link></li>
                <li><Link href="/shop?category=tops" onClick={() => setMenuOpen(false)} className="block py-1 hover:text-neutral-500">Tops</Link></li>
                <li><Link href="/shop?category=bottoms" onClick={() => setMenuOpen(false)} className="block py-1 hover:text-neutral-500">Bottoms</Link></li>
                <li><Link href="/shop?category=bags" onClick={() => setMenuOpen(false)} className="block py-1 hover:text-neutral-500">Bags</Link></li>
                <li><Link href="/shop?category=shoes" onClick={() => setMenuOpen(false)} className="block py-1 hover:text-neutral-500">Shoes</Link></li>
                <li><Link href="/shop?category=accessories" onClick={() => setMenuOpen(false)} className="block py-1 hover:text-neutral-500">Accessories</Link></li>
              </ul>
            </div>
            <div className="border-t pt-4 text-[10px] text-neutral-400 tracking-wider">
              <p className="font-medium text-neutral-900 mb-1">CHIC FASHION STORE</p>
              <p>Timeless pieces crafted with modern elegance.</p>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMenuOpen(false)} />
        </div>
      )}
    </header>
  );
}
