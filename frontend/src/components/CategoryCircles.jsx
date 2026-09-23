'use client';
import React from 'react';
import Link from 'next/link';

const categories = [
  { name: 'NEW IN', slug: 'new-in', badge: 'NEW', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80' },
  { name: 'CLOTHING', slug: 'clothing', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=300&q=80' },
  { name: 'DRESSES', slug: 'dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&q=80' },
  { name: 'TOPS', slug: 'tops', image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80' },
  { name: 'BOTTOMS', slug: 'bottoms', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80' },
  { name: 'BAGS', slug: 'bags', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&q=80' },
  { name: 'SHOES', slug: 'shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&q=80' },
  { name: 'ACCESSORIES', slug: 'accessories', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&q=80' },
];

export default function CategoryCircles() {
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-8 py-8 sm:py-12 border-b border-neutral-100">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 xs:gap-3.5 sm:gap-6 text-center">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            className="group flex flex-col items-center"
          >
            <div className="relative w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full overflow-hidden border border-neutral-200 mb-2 p-0.5 group-hover:border-neutral-900 group-hover:scale-105 transition duration-300">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover rounded-full"
              />
              {cat.badge && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 bg-white text-[7px] xs:text-[8px] tracking-widest font-semibold px-1 py-0.5 rounded shadow-xs text-neutral-900">
                  {cat.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] xs:text-[10px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.18em] uppercase text-neutral-800 font-medium group-hover:text-neutral-500 transition truncate max-w-full">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
