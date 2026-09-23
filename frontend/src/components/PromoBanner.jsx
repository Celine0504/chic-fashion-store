'use client';
import React from 'react';
import Link from 'next/link';

export default function PromoBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      <div className="bg-[#DFD7CB] py-10 sm:py-12 px-8 sm:px-16 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] font-semibold uppercase text-neutral-700 block mb-1">
            SIGNATURE SUMMER SALE
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif text-neutral-900 mb-2">
            Up to 30% Off
          </h2>
          <p className="text-xs tracking-wide text-neutral-700 font-light">
            On selected styles for a limited time.
          </p>
        </div>
        <Link
          href="/shop?category=clothing"
          className="bg-black text-white text-xs tracking-[0.2em] uppercase font-medium px-8 py-3.5 hover:bg-neutral-800 transition whitespace-nowrap shadow-xs"
        >
          SHOP THE SALE
        </Link>
      </div>
    </section>
  );
}
