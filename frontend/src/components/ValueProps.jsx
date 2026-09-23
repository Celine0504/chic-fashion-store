'use client';
import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

const perks = [
  { icon: Truck, title: 'FREE SHIPPING', desc: 'On orders over ₹1,999' },
  { icon: RotateCcw, title: 'EASY RETURNS', desc: '30-day return policy' },
  { icon: ShieldCheck, title: 'SECURE PAYMENTS', desc: 'Safe & encrypted checkout' },
  { icon: Headphones, title: 'CUSTOMER CARE', desc: "We're here to help" },
];

export default function ValueProps() {
  return (
    <section className="border-y border-neutral-200 bg-white py-8 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {perks.map((p, i) => {
          const Icon = p.icon;
          return (
            <div key={i} className="flex flex-col items-center">
              <Icon className="w-5 h-5 text-neutral-800 mb-2 stroke-[1.5]" />
              <h4 className="text-[11px] tracking-[0.2em] font-semibold uppercase text-neutral-900 mb-0.5">
                {p.title}
              </h4>
              <p className="text-[11px] text-neutral-500 font-light">{p.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
