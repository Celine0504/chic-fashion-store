'use client';
import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { useStore } from '@/context/StoreContext';

export default function WishlistPage() {
  const { wishlist, mounted } = useStore();

  if (!mounted) {
    return <div className="py-24 text-center text-xs uppercase tracking-widest text-neutral-400">Loading wishlist...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <div className="border-b border-neutral-200 pb-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif uppercase tracking-[0.2em] text-neutral-900 mb-1">
          MY WISHLIST
        </h1>
        <p className="text-xs uppercase tracking-widest text-neutral-500 font-light">
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for later
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-6">
            You haven’t added any items to your wishlist yet.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-black text-white text-xs uppercase tracking-[0.25em] px-8 py-4 hover:bg-neutral-800 transition"
          >
            EXPLORE COLLECTIONS
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
