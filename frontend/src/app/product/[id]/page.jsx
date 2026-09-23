'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Heart, ShoppingBag, ArrowLeft, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const FALLBACK_CATALOG = [
  {
    id: 1,
    title: 'Linen Blend Blazer',
    category_slug: 'clothing',
    price: 2999.00,
    description: 'Structured linen-blend blazer with single-breasted horn buttons and tailored notched lapels.',
    image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80',
    colors: ['#d9cbb8', '#222222', '#4a5568'],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 2,
    title: 'Satin Slip Dress',
    category_slug: 'dresses',
    price: 2499.00,
    description: 'Silky cowl-neck midi slip dress tailored for effortless, understated evening elegance.',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&q=80',
    colors: ['#111111', '#e3d2c1', '#bfa181'],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 3,
    title: 'Ribbed Knit Top',
    category_slug: 'tops',
    price: 1299.00,
    description: 'Premium stretch fine ribbed crew-neck tee in soft ivory with subtle ribbed texture.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80',
    colors: ['#f3ece2', '#111111', '#a0aec0'],
    sizes: ['S', 'M', 'L'],
  },
  {
    id: 4,
    title: 'Wide Leg Trousers',
    category_slug: 'bottoms',
    price: 1999.00,
    description: 'High-rise pleated tailored trousers featuring a fluid drape and concealed closure.',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80',
    colors: ['#c8b7a6', '#2d3748'],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 5,
    title: 'Leather Shoulder Bag',
    category_slug: 'bags',
    price: 3499.00,
    description: 'Supple Italian full-grain leather curved shoulder bag adorned with custom gold-tone hardware.',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80',
    colors: ['#111111', '#8b5a2b'],
    sizes: ['One Size'],
  },
  {
    id: 6,
    title: 'Strappy Heeled Sandal',
    category_slug: 'shoes',
    price: 2199.00,
    description: 'Minimalist multi-strap square toe block heel crafted in buttery soft Italian nappa.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=80',
    colors: ['#111111', '#e2d4c0'],
    sizes: ['36', '37', '38', '39', '40'],
  },
  {
    id: 7,
    title: 'Sculptural Gold Hoop Earrings',
    category_slug: 'accessories',
    price: 1499.00,
    description: '18k gold vermeil chunky teardrop sculptural hoop earrings with secure click closure.',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&q=80',
    colors: ['#d4af37', '#e5e4e2'],
    sizes: ['One Size'],
  },
  {
    id: 8,
    title: 'Silk Twill Printed Scarf',
    category_slug: 'accessories',
    price: 1899.00,
    description: '100% pure Mulberry silk twill square scarf featuring geometric hand-rolled hem.',
    image_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=700&q=80',
    colors: ['#2b3a4a', '#8b5a2b'],
    sizes: ['90x90 cm'],
  },
  {
    id: 9,
    title: 'Pleated Halter Maxi Dress',
    category_slug: 'dresses',
    price: 3799.00,
    description: 'Floor-skimming micro-pleated halter neckline evening gown with a flowing silhouette.',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&q=80',
    colors: ['#c5a059', '#111111', '#800020'],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 10,
    title: 'Tailored Poplin Oversized Shirt',
    category_slug: 'tops',
    price: 1899.00,
    description: 'Crisp organic cotton poplin button-down shirt with elongated cuffs and dropped shoulders.',
    image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=700&q=80',
    colors: ['#ffffff', '#87ceeb', '#111111'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  {
    id: 11,
    title: 'Pleated Tailored Bermuda Shorts',
    category_slug: 'bottoms',
    price: 1699.00,
    description: 'Sophisticated knee-length tailored shorts in structured stretch twill with front pleats.',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=700&q=80',
    colors: ['#222222', '#d9cbb8'],
    sizes: ['XS', 'S', 'M', 'L'],
  },
  {
    id: 12,
    title: 'Woven Leather Bucket Bag',
    category_slug: 'bags',
    price: 3999.00,
    description: 'Artisanal hand-woven calfskin leather bucket bag with removable canvas drawstring pouch.',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80',
    colors: ['#8b5a2b', '#111111', '#e3d2c1'],
    sizes: ['One Size'],
  },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, toggleWishlist, wishlist, mounted } = useStore();

  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Product not found in API');
        return res.json();
      })
      .then((data) => {
        if (data && data.title) {
          setProduct(data);
          const sizes = Array.isArray(data.sizes)
            ? data.sizes
            : typeof data.sizes === 'string'
            ? JSON.parse(data.sizes)
            : ['XS', 'S', 'M', 'L'];
          const colors = Array.isArray(data.colors)
            ? data.colors
            : typeof data.colors === 'string'
            ? JSON.parse(data.colors)
            : ['#111111'];
          if (sizes.length > 0) setSelectedSize(sizes[0]);
          if (colors.length > 0) setSelectedColor(colors[0]);
        } else {
          throw new Error('Fallback needed');
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback to local catalog
        const fallback = FALLBACK_CATALOG.find((p) => String(p.id) === String(id)) || FALLBACK_CATALOG[0];
        setProduct(fallback);
        setSelectedSize(fallback.sizes[0] || 'Standard');
        setSelectedColor(fallback.colors[0] || '#111111');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center text-xs uppercase tracking-[0.25em] text-neutral-400">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-2xl uppercase tracking-widest mb-4">PRODUCT NOT FOUND</h1>
        <button
          onClick={() => router.push('/shop')}
          className="text-xs uppercase tracking-widest border-b border-black pb-1 cursor-pointer"
        >
          Return to collections
        </button>
      </div>
    );
  }

  // Resilient field normalization
  const title = product.title || product.name || 'Linen Blend Blazer';
  const imageUrl = product.image_url || product.image || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80';
  const category = (product.category_slug || product.category || 'Collection').toUpperCase();
  const price = Number(product.price || 2999);
  const description = product.description || 'Crafted with premium materials for effortless elegance and timeless style.';

  let sizes = [];
  try {
    sizes = Array.isArray(product.sizes)
      ? product.sizes
      : typeof product.sizes === 'string'
      ? JSON.parse(product.sizes)
      : ['XS', 'S', 'M', 'L'];
  } catch (e) {
    sizes = ['XS', 'S', 'M', 'L'];
  }

  let colors = [];
  try {
    colors = Array.isArray(product.colors)
      ? product.colors
      : typeof product.colors === 'string'
      ? JSON.parse(product.colors)
      : ['#d9cbb8', '#222222', '#4a5568'];
  } catch (e) {
    colors = ['#d9cbb8', '#222222', '#4a5568'];
  }

  const isWishlisted = mounted && wishlist.some((w) => String(w.id) === String(product.id));

  const handleAddToCart = () => {
    addToCart({ ...product, title, image_url: imageUrl, price }, selectedSize, selectedColor, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const handleBuyNow = () => {
    addToCart({ ...product, title, image_url: imageUrl, price }, selectedSize, selectedColor, 1);
    router.push('/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-8 hover:text-black transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Product Image */}
        <div className="aspect-[3/4] bg-neutral-100 overflow-hidden border border-neutral-100 shadow-xs">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-semibold mb-2">
            CHIC FASHION STORE • {category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif text-neutral-900 mb-3 tracking-wide">
            {title}
          </h1>
          <p className="text-xl font-medium text-neutral-900 mb-6">
            ₹{price.toLocaleString('en-IN')}
          </p>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light mb-8">
            {description}
          </p>

          {/* Color Selector */}
          {colors.length > 0 && (
            <div className="mb-6">
              <span className="block text-xs uppercase tracking-widest font-medium mb-3 text-neutral-800">
                COLOR
              </span>
              <div className="flex gap-3">
                {colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${
                      selectedColor === c ? 'border-black scale-110' : 'border-transparent shadow-xs'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {sizes.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs uppercase tracking-widest font-medium text-neutral-800">
                  SIZE
                </span>
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider underline cursor-pointer">
                  Size Guide
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`min-w-[48px] px-3 py-2 text-xs font-medium border uppercase tracking-wider transition cursor-pointer ${
                      selectedSize === s
                        ? 'border-black bg-black text-white'
                        : 'border-neutral-200 text-neutral-800 hover:border-black'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-3">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white text-xs tracking-[0.2em] uppercase font-medium py-4 flex items-center justify-center gap-2 hover:bg-neutral-800 transition shadow-sm cursor-pointer"
            >
              {added ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4" />}
              {added ? 'ADDED TO BAG' : 'ADD TO BAG'}
            </button>
            <button
              onClick={() => toggleWishlist({ ...product, title, image_url: imageUrl, price })}
              className="px-5 border border-neutral-300 hover:border-black transition cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-700'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleBuyNow}
            className="w-full border border-black text-black text-xs tracking-[0.2em] uppercase font-medium py-3.5 hover:bg-black hover:text-white transition mb-8 cursor-pointer"
          >
            INSTANT BUY (DEEP LINK URL)
          </button>

          {/* Perks checklist */}
          <div className="border-t pt-6 space-y-3 text-[11px] text-neutral-600 font-light">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-neutral-800" />
              <span>Complimentary shipping on orders over ₹1,999</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-neutral-800" />
              <span>30-day effortless returns and exchanges</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-800" />
              <span>Direct app deep link payment without card input</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
