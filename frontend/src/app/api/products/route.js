import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_PRODUCTS = [
  {
    id: 1,
    title: 'Linen Blend Blazer',
    category_slug: 'clothing',
    price: 2999.0,
    description: 'Structured linen-blend blazer with single-breasted horn buttons and tailored notched lapels.',
    image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&q=80',
    colors: ['#d9cbb8', '#222222', '#4a5568'],
    sizes: ['XS', 'S', 'M', 'L'],
    is_featured: true,
  },
  {
    id: 2,
    title: 'Satin Slip Dress',
    category_slug: 'dresses',
    price: 2499.0,
    description: 'Silky cowl-neck midi slip dress tailored for effortless, understated evening elegance.',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&q=80',
    colors: ['#111111', '#e3d2c1', '#bfa181'],
    sizes: ['XS', 'S', 'M', 'L'],
    is_featured: true,
  },
  {
    id: 3,
    title: 'Ribbed Knit Top',
    category_slug: 'tops',
    price: 1299.0,
    description: 'Premium stretch fine ribbed crew-neck tee in soft ivory with subtle ribbed texture.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=700&q=80',
    colors: ['#f3ece2', '#111111', '#a0aec0'],
    sizes: ['S', 'M', 'L'],
    is_featured: true,
  },
  {
    id: 4,
    title: 'Wide Leg Trousers',
    category_slug: 'bottoms',
    price: 1999.0,
    description: 'High-rise pleated tailored trousers featuring a fluid drape and concealed closure.',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=700&q=80',
    colors: ['#c8b7a6', '#2d3748'],
    sizes: ['XS', 'S', 'M', 'L'],
    is_featured: true,
  },
  {
    id: 5,
    title: 'Leather Shoulder Bag',
    category_slug: 'bags',
    price: 3499.0,
    description: 'Supple Italian full-grain leather curved shoulder bag adorned with custom gold-tone hardware.',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80',
    colors: ['#111111', '#8b5a2b'],
    sizes: ['One Size'],
    is_featured: true,
  },
  {
    id: 6,
    title: 'Strappy Heeled Sandal',
    category_slug: 'shoes',
    price: 2199.0,
    description: 'Minimalist multi-strap square toe block heel crafted in buttery soft Italian nappa.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=700&q=80',
    colors: ['#111111', '#e2d4c0'],
    sizes: ['36', '37', '38', '39', '40'],
    is_featured: true,
  },
  {
    id: 7,
    title: 'Sculptural Gold Hoop Earrings',
    category_slug: 'accessories',
    price: 1499.0,
    description: '18k gold vermeil chunky teardrop sculptural hoop earrings with secure click closure.',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&q=80',
    colors: ['#d4af37', '#e5e4e2'],
    sizes: ['One Size'],
    is_featured: true,
  },
  {
    id: 8,
    title: 'Silk Twill Printed Scarf',
    category_slug: 'accessories',
    price: 1899.0,
    description: '100% pure Mulberry silk twill square scarf featuring geometric hand-rolled hem.',
    image_url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=700&q=80',
    colors: ['#2b3a4a', '#8b5a2b'],
    sizes: ['90x90 cm'],
    is_featured: false,
  },
  {
    id: 9,
    title: 'Pleated Halter Maxi Dress',
    category_slug: 'dresses',
    price: 3799.0,
    description: 'Floor-skimming micro-pleated halter neckline evening gown with a flowing silhouette.',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=700&q=80',
    colors: ['#c5a059', '#111111', '#800020'],
    sizes: ['XS', 'S', 'M', 'L'],
    is_featured: true,
  },
  {
    id: 10,
    title: 'Tailored Poplin Oversized Shirt',
    category_slug: 'tops',
    price: 1899.0,
    description: 'Crisp organic cotton poplin button-down shirt with elongated cuffs and dropped shoulders.',
    image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=700&q=80',
    colors: ['#ffffff', '#87ceeb', '#111111'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    is_featured: true,
  },
  {
    id: 11,
    title: 'Pleated Tailored Bermuda Shorts',
    category_slug: 'bottoms',
    price: 1699.0,
    description: 'Sophisticated knee-length tailored shorts in structured stretch twill with front pleats.',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=700&q=80',
    colors: ['#222222', '#d9cbb8'],
    sizes: ['XS', 'S', 'M', 'L'],
    is_featured: false,
  },
  {
    id: 12,
    title: 'Woven Leather Bucket Bag',
    category_slug: 'bags',
    price: 3999.0,
    description: 'Artisanal hand-woven calfskin leather bucket bag with removable canvas drawstring pouch.',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=700&q=80',
    colors: ['#8b5a2b', '#111111', '#e3d2c1'],
    sizes: ['One Size'],
    is_featured: true,
  },
];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const category = (searchParams.get('category') || '').toLowerCase();
  const search = (searchParams.get('search') || '').toLowerCase();
  const featured = searchParams.get('featured');
  const id = searchParams.get('id');

  // Try local backend proxy first if running
  try {
    const queryString = searchParams.toString();
    const backendUrl = `http://localhost:5000/api/products${queryString ? `?${queryString}` : ''}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(backendUrl, { cache: 'no-store', signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch (e) {
    // Ignore and proceed to resilient cloud fallback
  }

  // Filter fallback catalog
  let filtered = [...FALLBACK_PRODUCTS];

  if (id) {
    const single = filtered.find((p) => String(p.id) === String(id));
    return NextResponse.json(single || filtered[0]);
  }

  if (category) {
    if (category === 'clothing') {
      filtered = filtered.filter((p) =>
        ['clothing', 'dresses', 'tops', 'bottoms'].includes(p.category_slug)
      );
    } else {
      filtered = filtered.filter((p) => p.category_slug === category);
    }
  }

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
    );
  }

  if (featured === 'true') {
    filtered = filtered.filter((p) => p.is_featured);
  }

  return NextResponse.json(filtered);
}
