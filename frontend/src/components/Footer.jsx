'use client';
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 text-neutral-700 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 sm:py-16 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <h3 className="font-serif tracking-[0.22em] text-lg font-bold text-neutral-900 mb-3 uppercase">
            CHIC FASHION STORE
          </h3>
          <p className="text-[11px] text-neutral-500 font-light mb-5 leading-relaxed">
            Timeless fashion. Modern living.
          </p>
          <div className="flex gap-4 text-neutral-600 text-xs">
            <span className="hover:text-black cursor-pointer">Instagram</span>
            <span className="hover:text-black cursor-pointer">Facebook</span>
            <span className="hover:text-black cursor-pointer">Pinterest</span>
            <span className="hover:text-black cursor-pointer">TikTok</span>
          </div>
        </div>

        {/* Links: SHOP */}
        <div>
          <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-900 mb-4">SHOP</h4>
          <ul className="space-y-2 text-[11px] text-neutral-500">
            <li><Link href="/shop?category=new-in" className="hover:text-black transition">New In</Link></li>
            <li><Link href="/shop?category=clothing" className="hover:text-black transition">Clothing</Link></li>
            <li><Link href="/shop?category=dresses" className="hover:text-black transition">Dresses</Link></li>
            <li><Link href="/shop?category=shoes" className="hover:text-black transition">Shoes</Link></li>
            <li><Link href="/shop?category=accessories" className="hover:text-black transition">Accessories</Link></li>
            <li><Link href="/shop?sale=true" className="hover:text-black transition">Sale</Link></li>
          </ul>
        </div>

        {/* Links: COMPANY */}
        <div>
          <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-900 mb-4">COMPANY</h4>
          <ul className="space-y-2 text-[11px] text-neutral-500">
            <li><Link href="/shop" className="hover:text-black transition">About Us</Link></li>
            <li><Link href="/shop" className="hover:text-black transition">Our Stores</Link></li>
            <li><Link href="/shop" className="hover:text-black transition">Sustainability</Link></li>
            <li><Link href="/shop" className="hover:text-black transition">Careers</Link></li>
            <li><Link href="/shop" className="hover:text-black transition">Press</Link></li>
            <li><Link href="/shop" className="hover:text-black transition">Contact Us</Link></li>
          </ul>
        </div>

        {/* Links: CUSTOMER CARE */}
        <div>
          <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-900 mb-4">CUSTOMER CARE</h4>
          <ul className="space-y-2 text-[11px] text-neutral-500">
            <li><Link href="/shop" className="hover:text-black transition">Shipping & Delivery</Link></li>
            <li><Link href="/shop" className="hover:text-black transition">Returns & Exchanges</Link></li>
            <li><Link href="/shop" className="hover:text-black transition">Size Guide</Link></li>
            <li><Link href="/shop" className="hover:text-black transition">FAQs</Link></li>
            <li><Link href="/checkout" className="hover:text-black transition">Track Order</Link></li>
          </ul>
        </div>

        {/* WE ACCEPT */}
        <div>
          <h4 className="text-[11px] font-semibold tracking-[0.2em] uppercase text-neutral-900 mb-4">WE ACCEPT</h4>
          <div className="flex flex-wrap gap-2 text-[10px] text-neutral-700 font-medium">
            <span className="border border-neutral-300 px-2.5 py-1 uppercase tracking-wider bg-neutral-50">DEEP LINK</span>
            <span className="border border-neutral-300 px-2.5 py-1 uppercase tracking-wider bg-neutral-50">UPI INTENT</span>
            <span className="border border-neutral-300 px-2.5 py-1 uppercase tracking-wider bg-neutral-50">VISA</span>
            <span className="border border-neutral-300 px-2.5 py-1 uppercase tracking-wider bg-neutral-50">MASTERCARD</span>
            <span className="border border-neutral-300 px-2.5 py-1 uppercase tracking-wider bg-neutral-50">APPLE PAY</span>
          </div>
        </div>
      </div>

      {/* Legal & Copyright */}
      <div className="border-t border-neutral-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row justify-between items-center text-[10px] text-neutral-400 gap-4">
          <p>© 2026 CHIC FASHION STORE. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link href="/shop" className="hover:underline">Privacy Policy</Link>
            <Link href="/shop" className="hover:underline">Terms & Conditions</Link>
            <Link href="/shop" className="hover:underline">Site Map</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
