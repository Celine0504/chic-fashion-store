'use client';
import React from 'react';

const photos = [
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80',
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=400&q=80',
];

export default function StyleInspiration() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs sm:text-sm tracking-[0.25em] font-semibold uppercase text-neutral-900">
          STYLE INSPIRATION
        </h2>
        <span className="text-xs tracking-[0.2em] uppercase text-neutral-500 font-medium">
          FOLLOW @CHICFASHION.OFFICIAL
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {photos.map((src, i) => (
          <div key={i} className="aspect-square bg-neutral-100 overflow-hidden group cursor-pointer">
            <img
              src={src}
              alt="Style Inspiration"
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
