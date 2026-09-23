'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, mounted } = useStore();
  const isWishlisted = mounted && wishlist.some((item) => item.id === product.id);

  let colors = [];
  try {
    colors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors || [];
  } catch (e) {
    colors = product.colors || [];
  }

  const [activeColor, setActiveColor] = useState(colors[0] || null);

  return (
    <div className="group relative flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-3">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500"
          />
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product);
          }}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-neutral-800 shadow-sm transition"
        >
          <Heart
            className={`w-3.5 h-3.5 transition ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-700'
            }`}
          />
        </button>
      </div>

      {/* Product Title */}
      <Link href={`/product/${product.id}`} className="block mb-1">
        <h3 className="text-xs tracking-[0.08em] uppercase text-neutral-800 hover:text-neutral-500 truncate transition">
          {product.title}
        </h3>
      </Link>

      {/* Price */}
      <span className="text-xs font-medium text-neutral-900 mb-2">
        ₹{Number(product.price).toLocaleString('en-IN')}
      </span>

      {/* Color Swatches */}
      {colors.length > 0 && (
        <div className="flex items-center gap-1.5 mt-auto pt-1">
          {colors.map((c, i) => (
            <button
              key={i}
              onClick={() => setActiveColor(c)}
              className={`w-2.5 h-2.5 rounded-full border transition ${
                activeColor === c ? 'scale-125 border-black' : 'border-neutral-300'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
