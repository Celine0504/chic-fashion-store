'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

function ShopContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let url = '/api/products';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    setLoading(true);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [category, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      {/* Page Title & Filter Overview */}
      <div className="border-b border-neutral-200 pb-4 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif uppercase tracking-[0.2em] text-neutral-900">
            {category ? category.replace('-', ' ') : search ? `Search: "${search}"` : 'All Collections'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest font-light">
            Showing {products.length} {products.length === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Quick Category Switcher */}
        <div className="flex flex-wrap gap-2 text-xs tracking-wider uppercase">
          {['all', 'clothing', 'dresses', 'tops', 'bottoms', 'bags', 'shoes', 'accessories'].map((cat) => {
            const isActive = (!category && cat === 'all') || category === cat;
            return (
              <a
                key={cat}
                href={cat === 'all' ? '/shop' : `/shop?category=${cat}`}
                className={`px-3 py-1.5 border transition ${
                  isActive ? 'border-black bg-black text-white' : 'border-neutral-200 hover:border-black'
                }`}
              >
                {cat}
              </a>
            );
          })}
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs tracking-[0.25em] uppercase text-neutral-400">
          Loading catalog...
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-neutral-400 mb-4">
            No items found matching your criteria.
          </p>
          <a
            href="/shop"
            className="inline-block text-xs uppercase tracking-[0.2em] border-b border-black pb-0.5"
          >
            Clear Filter
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs tracking-[0.25em] uppercase text-neutral-400">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
