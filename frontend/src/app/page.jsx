'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import HeroSection from '@/components/HeroSection';
import CategoryCircles from '@/components/CategoryCircles';
import CuratedCollections from '@/components/CuratedCollections';
import ProductCard from '@/components/ProductCard';
import PromoBanner from '@/components/PromoBanner';
import ValueProps from '@/components/ValueProps';
import StyleInspiration from '@/components/StyleInspiration';
import Newsletter from '@/components/Newsletter';

const initialFallbackPicks = [
  {
    id: 1,
    title: 'Linen Blend Blazer',
    price: 2999.0,
    image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80',
    colors: ['#d9cbb8', '#222222', '#4a5568'],
  },
  {
    id: 2,
    title: 'Satin Slip Dress',
    price: 2499.0,
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&q=80',
    colors: ['#111111', '#e3d2c1', '#bfa181'],
  },
  {
    id: 3,
    title: 'Ribbed Knit Top',
    price: 1299.0,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80',
    colors: ['#f3ece2', '#111111', '#a0aec0'],
  },
  {
    id: 4,
    title: 'Wide Leg Trousers',
    price: 1999.0,
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80',
    colors: ['#c8b7a6', '#2d3748'],
  },
  {
    id: 5,
    title: 'Leather Shoulder Bag',
    price: 3499.0,
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80',
    colors: ['#111111', '#8b5a2b'],
  },
  {
    id: 6,
    title: 'Strappy Heeled Sandal',
    price: 2199.0,
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=80',
    colors: ['#111111', '#e2d4c0'],
  },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState(initialFallbackPicks);

  useEffect(() => {
    fetch('http://localhost:5000/api/products?featured=true')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedProducts(data);
        }
      })
      .catch((err) => {
        console.warn('API fetch warning, using seeded defaults:', err.message);
      });
  }, []);

  return (
    <div>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Circular Categories */}
      <CategoryCircles />

      {/* 3. Curated Collections 4-Card Grid */}
      <CuratedCollections />

      {/* 4. Featured Picks Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs sm:text-sm tracking-[0.25em] font-semibold uppercase text-neutral-900">
            FEATURED PICKS
          </h2>
          <Link
            href="/shop"
            className="text-xs tracking-[0.2em] uppercase text-neutral-500 hover:text-black transition"
          >
            SHOP ALL
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 5. Promotional Banner */}
      <PromoBanner />

      {/* 6. Value Guarantees */}
      <ValueProps />

      {/* 7. Style Inspiration Lifestyle Gallery */}
      <StyleInspiration />

      {/* 8. Stay in the Know Newsletter */}
      <Newsletter />
    </div>
  );
}
