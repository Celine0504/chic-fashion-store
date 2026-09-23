import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const queryString = searchParams.toString();
  const backendUrl = `http://localhost:5000/api/products${queryString ? `?${queryString}` : ''}`;

  try {
    const res = await fetch(backendUrl, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to proxy /api/products to backend:', error.message);
    return NextResponse.json([], { status: 200 });
  }
}
