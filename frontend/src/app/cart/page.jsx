'use client';
import React from 'react';
import Link from 'next/link';
import { Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, mounted, isAuthenticated, user } = useStore();

  if (!mounted) {
    return <div className="py-24 text-center text-xs uppercase tracking-widest text-neutral-400">Loading bag...</div>;
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-28 text-center">
        <h1 className="font-serif text-2xl uppercase tracking-[0.2em] mb-4">YOUR SHOPPING BAG IS EMPTY</h1>
        <p className="text-xs uppercase tracking-widest text-neutral-500 mb-8 font-light">
          Explore our latest collection of timeless fashion pieces.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-black text-white text-xs uppercase tracking-[0.25em] px-8 py-4 font-medium hover:bg-neutral-800 transition"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  const shippingCost = cartTotal >= 1999 ? 0 : 149;
  const grandTotal = cartTotal + shippingCost;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <h1 className="font-serif text-2xl sm:text-3xl uppercase tracking-[0.2em] mb-2">
        SHOPPING BAG ({cart.length})
      </h1>
      <p className="text-xs text-neutral-500 uppercase tracking-widest mb-10 font-light">
        Review your luxury selections before proceeding to checkout.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Cart Item Rows */}
        <div className="lg:col-span-2 divide-y divide-neutral-200 border-t border-neutral-200">
          {cart.map((item, idx) => (
            <div key={idx} className="py-6 flex gap-6 items-center">
              <div className="w-20 sm:w-24 aspect-[3/4] bg-neutral-100 overflow-hidden shrink-0">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-900 mb-1 truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] text-neutral-500 uppercase tracking-wider mb-1">
                  Size: {item.selectedSize}
                </p>
                {item.selectedColor && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[11px] text-neutral-500 uppercase tracking-wider">Color:</span>
                    <span
                      className="w-3 h-3 rounded-full border border-neutral-300"
                      style={{ backgroundColor: item.selectedColor }}
                    />
                  </div>
                )}
                <span className="text-xs font-medium text-neutral-900">
                  ₹{Number(item.price).toLocaleString('en-IN')}
                </span>

                {/* Quantity Buttons */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-neutral-200">
                    <button
                      onClick={() => updateQuantity(idx, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs hover:bg-neutral-100 transition"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(idx, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs hover:bg-neutral-100 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Subtotal & Delete */}
              <div className="text-right flex flex-col items-end justify-between h-24">
                <span className="text-xs font-medium text-neutral-900">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
                <button
                  onClick={() => removeFromCart(idx)}
                  className="text-neutral-400 hover:text-black transition p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Box */}
        <div className="bg-neutral-50 p-6 sm:p-8 border border-neutral-200">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold mb-6 text-neutral-900">
            ORDER SUMMARY
          </h2>
          <div className="space-y-3 text-xs text-neutral-600 mb-6 border-b border-neutral-200 pb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'COMPLIMENTARY' : `₹${shippingCost}`}</span>
            </div>
            {shippingCost > 0 && (
              <p className="text-[10px] text-neutral-400">
                Add ₹{(1999 - cartTotal).toLocaleString('en-IN')} more for complimentary shipping
              </p>
            )}
          </div>
          <div className="flex justify-between text-sm font-semibold mb-8 text-neutral-900">
            <span>Estimated Total</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 w-full bg-black text-white text-xs uppercase tracking-[0.25em] py-4 font-medium hover:bg-neutral-800 transition"
          >
            <span>CHECKOUT</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
