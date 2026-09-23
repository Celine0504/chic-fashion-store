'use client';
import React, { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global unhandled error:', error);
  }, [error]);

  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-neutral-50 font-sans p-6 text-center">
        <div className="max-w-md bg-white p-8 border border-neutral-200 shadow-sm">
          <h2 className="text-xl font-serif uppercase tracking-widest mb-3">Something went wrong</h2>
          <p className="text-xs text-neutral-500 mb-6">{error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => reset()}
            className="bg-black text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-neutral-800 transition cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
