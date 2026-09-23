'use client';
import React from 'react';
import Link from 'next/link';

const collections = [
  {
    title: 'The New Neutrals',
    slug: 'clothing',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
  },
  {
    title: 'Effortless Essentials',
    slug: 'dresses',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
  },
  {
    title: 'Power Tailoring',
    slug: 'clothing',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
  },
  {
    title: 'Refined Accessories',
    slug: 'bags',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  },
];

export default function CuratedCollections() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs sm:text-sm tracking-[0.25em] font-semibold uppercase text-neutral-900">
          CURATED COLLECTIONS
        </h2>
        <Link
          href="/shop"
          className="text-xs tracking-[0.2em] uppercase text-neutral-500 hover:text-black transition"
        >
          VIEW ALL
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {collections.map((item, idx) => (
          <Link
            key={idx}
            href={`/shop?category=${item.slug}`}
            className="group relative h-80 sm:h-96 overflow-hidden bg-neutral-100"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700 ease-out"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <h3 className="text-xl font-serif mb-1 leading-snug">{item.title}</h3>
              <span className="text-[11px] tracking-[0.2em] uppercase text-neutral-300 group-hover:text-white transition inline-flex items-center gap-1">
                Shop Now →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
