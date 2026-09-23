'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h2 className="text-2xl font-serif uppercase tracking-widest text-neutral-900 mb-4">
        Something went wrong
      </h2>
      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-6">
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => reset()}
          className="bg-black text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-neutral-800 transition cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-neutral-300 text-xs uppercase tracking-widest px-6 py-3 hover:border-black transition"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
