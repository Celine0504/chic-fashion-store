'use client';
import React from 'react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative w-full bg-[#EAE6E1] min-h-[460px] md:min-h-[620px] flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-12 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-8 sm:py-12">
        {/* Left Editorial Copy */}
        <div className="z-10 max-w-lg text-center md:text-left">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.3em] uppercase text-neutral-700 block mb-2 sm:mb-3">
            NEW SEASON
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif tracking-tight text-neutral-900 leading-[1.1] mb-4 sm:mb-6">
            Modern Elegance
          </h1>
          <p className="text-neutral-600 text-xs sm:text-base font-light tracking-wide mb-6 sm:mb-8 leading-relaxed">
            Timeless pieces. Contemporary style. Made for you.
          </p>
          <Link
            href="/shop"
            className="w-full sm:w-auto text-center inline-block bg-black text-white text-xs tracking-[0.25em] font-medium uppercase px-8 py-4 hover:bg-neutral-800 transition duration-300 shadow-sm"
          >
            SHOP THE COLLECTION
          </Link>
        </div>

        {/* Right Hero Lifestyle Image */}
        <div className="relative h-[380px] sm:h-[500px] md:h-[580px] flex justify-center md:justify-end">
          <img
            src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=900&q=80"
            alt="Modern Elegance"
            className="h-full w-auto object-cover object-top shadow-sm"
          />
        </div>
      </div>

      {/* Hero Carousel Indicators */}
      <div className="absolute bottom-6 right-8 hidden sm:flex items-center gap-3">
        <button className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-neutral-900 flex items-center justify-center text-xs shadow-sm transition">
          ‹
        </button>
        <button className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-neutral-900 flex items-center justify-center text-xs shadow-sm transition">
          ›
        </button>
      </div>
    </section>
  );
}
