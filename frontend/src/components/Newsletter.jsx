'use client';
import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <section className="bg-[#EFE9E1] py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <Mail className="w-7 h-7 text-neutral-800 stroke-[1.2] shrink-0 hidden sm:block" />
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-900 mb-1">
              STAY IN THE KNOW
            </h4>
            <p className="text-xs text-neutral-600 font-light">
              Be the first to know about new arrivals, exclusive offers and style inspiration.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full md:w-auto shadow-xs">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-4 py-2.5 text-xs bg-white border border-neutral-300 rounded-none focus:outline-none focus:border-black min-w-[240px] flex-grow"
          />
          <button
            type="submit"
            className="bg-black text-white text-xs tracking-[0.2em] font-medium uppercase px-6 py-2.5 hover:bg-neutral-800 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            {subscribed ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>JOINED</span>
              </>
            ) : (
              <span>SUBSCRIBE</span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
