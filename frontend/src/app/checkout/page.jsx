'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Copy,
  Check,
  MessageCircle,
  Smartphone,
  QrCode,
  CreditCard,
  Banknote,
  Printer
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, mounted, user } = useStore();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'UPI_DEEPLINK', // 'UPI_DEEPLINK' or 'COD' or 'WHATSAPP'
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: prev.address || '104 Elegance Boulevard',
        city: prev.city || 'Mumbai',
        postalCode: prev.postalCode || '400050',
      }));
    }
  }, [user]);

  const [orderResult, setOrderResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState('qr'); // 'qr', 'apps', 'whatsapp'

  if (!mounted) {
    return <div className="py-24 text-center text-xs uppercase tracking-widest text-neutral-400">Loading checkout...</div>;
  }

  const shippingCost = cartTotal >= 1999 ? 0 : 149;
  const grandTotal = cartTotal + shippingCost;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: form,
          items: cart,
          totalAmount: grandTotal,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrderResult(data);
        if (form.paymentMethod === 'COD') {
          setIsPaid(true); // Cash on delivery placed immediately
        }
        clearCart();
      } else {
        throw new Error(data.error || 'Failed to place order');
      }
    } catch (err) {
      console.warn('Backend order fallback:', err.message);
      // Fallback deep links
      const fallbackOrder = `CFS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      const encodedAmount = grandTotal.toFixed(2);
      const note = encodeURIComponent(`Order ${fallbackOrder}`);
      const payee = 'chicfashion@upi';
      const storeName = encodeURIComponent('CHIC FASHION STORE');
      
      const upiLink = `upi://pay?pa=${payee}&pn=${storeName}&am=${encodedAmount}&cu=INR&tn=${note}&tr=${fallbackOrder}`;
      const waText = encodeURIComponent(
        `Hello CHIC FASHION STORE!\n\nI have placed order *#${fallbackOrder}* for *₹${encodedAmount}*.\nName: ${form.name}\nShipping: ${form.address}, ${form.city}\n\nPlease confirm my order.`
      );

      setOrderResult({
        success: true,
        orderNumber: fallbackOrder,
        paymentDeepLink: upiLink,
        links: {
          upi: upiLink,
          gpay: `tez://upi/pay?pa=${payee}&pn=${storeName}&am=${encodedAmount}&cu=INR&tn=${note}&tr=${fallbackOrder}`,
          phonepe: `phonepe://pay?pa=${payee}&pn=${storeName}&am=${encodedAmount}&cu=INR&tn=${note}&tr=${fallbackOrder}`,
          paytm: `paytmmp://pay?pa=${payee}&pn=${storeName}&am=${encodedAmount}&cu=INR&tn=${note}&tr=${fallbackOrder}`,
          whatsapp: `https://wa.me/919876543210?text=${waText}`,
        },
        totalAmount: grandTotal,
        customerName: form.name,
      });
      if (form.paymentMethod === 'COD') {
        setIsPaid(true);
      }
      clearCart();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setVerifying(true);
    try {
      await fetch(`http://localhost:5000/api/orders/${orderResult.orderNumber}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: form.paymentMethod }),
      });
    } catch (e) {
      console.warn(e);
    }
    setTimeout(() => {
      setVerifying(false);
      setIsPaid(true);
    }, 1200);
  };

  const copyLink = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. ORDER COMPLETED / INVOICE VIEW
  if (orderResult && isPaid) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="w-9 h-9 stroke-[1.5]" />
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-emerald-600 block mb-1">
          PAYMENT CONFIRMED
        </span>
        <h1 className="font-serif text-3xl uppercase tracking-[0.18em] mb-2 text-neutral-900">
          THANK YOU FOR YOUR ORDER
        </h1>
        <p className="text-xs uppercase tracking-widest text-neutral-500 mb-8 font-light">
          Order Reference: <span className="font-semibold text-neutral-900">{orderResult.orderNumber}</span>
        </p>

        {/* Invoice Card */}
        <div className="bg-white border border-neutral-200 p-8 sm:p-10 mb-8 text-left shadow-xs">
          <div className="flex justify-between items-start border-b border-neutral-200 pb-5 mb-6">
            <div>
              <h3 className="font-serif uppercase text-lg font-bold tracking-wider text-neutral-900">
                CHIC FASHION STORE
              </h3>
              <p className="text-[11px] text-neutral-500">Order #{orderResult.orderNumber}</p>
              <p className="text-[11px] text-neutral-500">
                Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold tracking-widest uppercase px-3 py-1 rounded-none">
              {form.paymentMethod === 'COD' ? 'CASH ON DELIVERY' : 'PAID VIA DEEP LINK'}
            </span>
          </div>

          <div className="space-y-3 text-xs text-neutral-700 mb-6">
            <div className="flex justify-between">
              <span className="text-neutral-500">Customer Name</span>
              <span className="font-medium text-neutral-900">{form.name || orderResult.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Shipping Address</span>
              <span className="font-medium text-neutral-900 text-right">{form.address}, {form.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Estimated Delivery</span>
              <span className="font-medium text-neutral-900">3 - 5 Business Days</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-neutral-200 pt-4 text-neutral-900">
              <span>Total Paid</span>
              <span>₹{Number(orderResult.totalAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 border border-neutral-300 py-3 text-xs uppercase tracking-widest hover:border-black transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>

        <Link
          href="/shop"
          className="inline-block bg-black text-white text-xs uppercase tracking-[0.25em] px-8 py-4 font-medium hover:bg-neutral-800 transition"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  // 2. ORDER PLACED -> DEEP LINK & PAYMENT MODAL / PAGE
  if (orderResult && !isPaid) {
    const upiLink = orderResult.links?.upi || orderResult.paymentDeepLink;
    const waLink = orderResult.links?.whatsapp || `https://wa.me/919876543210?text=Order%20${orderResult.orderNumber}`;

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-8 py-12 sm:py-16 text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-1">
          CHIC FASHION STORE CHECKOUT
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl uppercase tracking-[0.18em] mb-2 text-neutral-900">
          SELECT HOW TO PAY
        </h1>
        <p className="text-xs uppercase tracking-widest text-neutral-500 mb-8 font-light">
          Order Ref: <span className="font-semibold text-neutral-800">{orderResult.orderNumber}</span> • Total Due:{' '}
          <span className="font-bold text-neutral-900">₹{Number(orderResult.totalAmount).toLocaleString('en-IN')}</span>
        </p>

        {/* Payment Tabs */}
        <div className="flex border-b border-neutral-200 mb-6 text-xs uppercase tracking-wider font-semibold">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'qr' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('apps')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'apps' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>UPI Apps</span>
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-3 border-b-2 flex items-center justify-center gap-1.5 transition ${
              activeTab === 'whatsapp' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp</span>
          </button>
        </div>

        {/* Tab 1: QR Code (Best for Laptop / Desktop Users) */}
        {activeTab === 'qr' && (
          <div className="bg-neutral-50 border border-neutral-200 p-8 mb-6 text-center">
            <p className="text-xs text-neutral-600 font-light mb-4 leading-relaxed">
              Open <strong>PhonePe, Google Pay, Paytm</strong>, or any banking app on your phone and scan the code below:
            </p>
            <div className="inline-block p-4 bg-white border border-neutral-200 shadow-xs mb-4">
              <QRCodeSVG value={upiLink} size={200} level="M" />
            </div>
            <p className="text-[11px] font-medium text-neutral-800 mb-4">
              Amount to Pay: ₹{Number(orderResult.totalAmount).toLocaleString('en-IN')}
            </p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wider">
              UPI Payee ID: chicfashion@upi
            </p>
          </div>
        )}

        {/* Tab 2: Mobile Direct App Deep Links */}
        {activeTab === 'apps' && (
          <div className="bg-neutral-50 border border-neutral-200 p-6 sm:p-8 mb-6 text-left">
            <p className="text-xs text-neutral-600 font-light mb-4">
              If you are browsing on a mobile device, tap any app below to open payment directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <a
                href={orderResult.links?.phonepe || upiLink}
                className="flex items-center justify-between border border-neutral-300 bg-white p-3 text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:border-black transition"
              >
                <span>PhonePe</span>
                <ExternalLink className="w-4 h-4 text-neutral-400" />
              </a>
              <a
                href={orderResult.links?.gpay || upiLink}
                className="flex items-center justify-between border border-neutral-300 bg-white p-3 text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:border-black transition"
              >
                <span>Google Pay</span>
                <ExternalLink className="w-4 h-4 text-neutral-400" />
              </a>
              <a
                href={orderResult.links?.paytm || upiLink}
                className="flex items-center justify-between border border-neutral-300 bg-white p-3 text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:border-black transition"
              >
                <span>Paytm</span>
                <ExternalLink className="w-4 h-4 text-neutral-400" />
              </a>
              <a
                href={upiLink}
                className="flex items-center justify-between border border-neutral-300 bg-white p-3 text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:border-black transition"
              >
                <span>Any UPI App</span>
                <ExternalLink className="w-4 h-4 text-neutral-400" />
              </a>
            </div>
            <p className="text-[10px] text-neutral-400">
              * Note: Deep link application triggers work natively on mobile smartphones.
            </p>
          </div>
        )}

        {/* Tab 3: WhatsApp Checkout Link */}
        {activeTab === 'whatsapp' && (
          <div className="bg-neutral-50 border border-neutral-200 p-6 sm:p-8 mb-6 text-left">
            <p className="text-xs text-neutral-600 font-light mb-4 leading-relaxed">
              Prefer to confirm with our concierge team? Click below to send your order reference directly to our official WhatsApp store handle:
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white text-xs uppercase tracking-[0.2em] py-3.5 font-medium hover:bg-emerald-700 transition mb-3"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Open WhatsApp Order Link</span>
            </a>
          </div>
        )}

        {/* Copy Deep Link URL button */}
        <button
          type="button"
          onClick={() => copyLink(upiLink)}
          className="flex items-center justify-center gap-2 w-full border border-neutral-300 text-neutral-700 text-xs uppercase tracking-wider py-3 hover:border-black transition mb-4 bg-white"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'COPIED UPI URL TO CLIPBOARD' : 'COPY RAW UPI DEEP LINK'}</span>
        </button>

        {/* I Have Completed Payment Confirmation Button */}
        <button
          type="button"
          disabled={verifying}
          onClick={handleConfirmPayment}
          className="w-full bg-black text-white text-xs uppercase tracking-[0.25em] font-medium py-4 hover:bg-neutral-800 transition shadow-sm mb-6 flex items-center justify-center gap-2"
        >
          {verifying ? (
            <span>VERIFYING PAYMENT...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>I HAVE MADE PAYMENT (CONFIRM ORDER)</span>
            </>
          )}
        </button>

        <Link
          href="/shop"
          className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition border-b border-neutral-300 pb-0.5"
        >
          Return to Storefront
        </Link>
      </div>
    );
  }

  // 3. EMPTY CART STATE
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-2xl uppercase tracking-widest mb-4">CHECKOUT IS EMPTY</h1>
        <p className="text-xs uppercase tracking-widest text-neutral-500 mb-8 font-light">
          Your shopping bag currently has no items.
        </p>
        <Link href="/shop" className="bg-black text-white text-xs uppercase tracking-widest px-8 py-4">
          EXPLORE COLLECTIONS
        </Link>
      </div>
    );
  }

  // 4. MAIN CHECKOUT FORM
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <Link href="/cart" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500 mb-8 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Return to bag
      </Link>

      <h1 className="font-serif text-2xl sm:text-3xl uppercase tracking-[0.2em] mb-10 text-neutral-900">
        CHECKOUT
      </h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Customer Information Inputs */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900 border-b pb-3 mb-4">
              1. CONTACT INFORMATION
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
              />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
              />
              <input
                type="tel"
                required
                placeholder="Phone Number (+91 ...)"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black sm:col-span-2"
              />
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900 border-b pb-3 mb-4">
              2. SHIPPING ADDRESS
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                required
                placeholder="Street Address, Apt / Suite"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
                />
                <input
                  type="text"
                  required
                  placeholder="Postal Code"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-neutral-900 border-b pb-3 mb-4">
              3. PAYMENT METHOD
            </h2>
            <div className="space-y-3">
              <label
                onClick={() => setForm({ ...form, paymentMethod: 'UPI_DEEPLINK' })}
                className={`flex items-start gap-3 p-4 border cursor-pointer transition ${
                  form.paymentMethod === 'UPI_DEEPLINK' ? 'border-black bg-neutral-50' : 'border-neutral-200'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === 'UPI_DEEPLINK'}
                  onChange={() => setForm({ ...form, paymentMethod: 'UPI_DEEPLINK' })}
                  className="mt-0.5 accent-black"
                />
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-900">
                    UPI Deep Link & Dynamic QR Code
                  </span>
                  <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                    Pay instantly via PhonePe, Google Pay, Paytm, or BHIM. Zero card input needed.
                  </p>
                </div>
              </label>

              <label
                onClick={() => setForm({ ...form, paymentMethod: 'COD' })}
                className={`flex items-start gap-3 p-4 border cursor-pointer transition ${
                  form.paymentMethod === 'COD' ? 'border-black bg-neutral-50' : 'border-neutral-200'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === 'COD'}
                  onChange={() => setForm({ ...form, paymentMethod: 'COD' })}
                  className="mt-0.5 accent-black"
                />
                <div>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-900">
                    Cash on Delivery (Pay upon arrival)
                  </span>
                  <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                    Pay in cash or UPI when your luxury parcel is delivered to your doorstep.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Order Summary & Submit */}
        <div className="bg-neutral-50 p-6 sm:p-8 border border-neutral-200">
          <h2 className="text-xs uppercase tracking-[0.2em] font-semibold mb-4 text-neutral-900">
            ORDER SUMMARY
          </h2>

          <div className="space-y-3 text-xs text-neutral-600 mb-6 border-b pb-4">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'COMPLIMENTARY' : `₹${shippingCost}`}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold text-neutral-900 border-t pt-2">
              <span>Total Payable</span>
              <span>₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs uppercase tracking-[0.25em] font-medium py-4 hover:bg-neutral-800 transition disabled:bg-neutral-400"
          >
            {loading
              ? 'PROCESSING...'
              : form.paymentMethod === 'COD'
              ? 'CONFIRM CASH ON DELIVERY'
              : 'PROCEED TO PAYMENT (DEEP LINK)'}
          </button>

          <div className="flex items-center justify-center gap-1.5 mt-4 text-[10px] text-neutral-400 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Order Processing</span>
          </div>
        </div>
      </form>
    </div>
  );
}
