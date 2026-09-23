'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { 
  User as UserIcon, 
  LogOut, 
  Heart, 
  ShoppingBag, 
  AlertCircle, 
  Check, 
  ShieldCheck, 
  KeyRound, 
  ArrowLeft, 
  Mail, 
  Send,
  Lock
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const { data: session, status } = useSession();
  const { wishlist, cartCount, logout } = useStore();
  
  // Tabs: 'signin', 'register', or 'forgot'
  const [tab, setTab] = useState('signin');

  // Forms state
  const [signinForm, setSigninForm] = useState({ email: '', password: '' });
  
  // Registration Flow (Step 1 -> Step 3)
  const [registerStep, setRegisterStep] = useState(1); // 1 = Details, 2 = OTP Verification
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    otp: '',
  });

  // Forgot Password Flow
  const [forgotStep, setForgotStep] = useState(1); // 1 = Email, 2 = OTP & New Password
  const [forgotForm, setForgotForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
    otp: '',
  });

  // Feedback & Timers
  const [error, setError] = useState(
    urlError
      ? urlError.toLowerCase().includes('configuration')
        ? 'Note: Live preview mode. Use your email or click 1-Click VIP Guest Sign In below.'
        : `Sign in issue: ${urlError}`
      : null
  );
  const [loading, setLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devOtpNotice, setDevOtpNotice] = useState(null);
  const [sessionTimeout, setSessionTimeout] = useState(false);

  // Safety timer for initial session check
  useEffect(() => {
    const timer = setTimeout(() => setSessionTimeout(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCooldown > 0) {
      const interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendCooldown]);

  // 1. Traditional Credentials Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResetSuccess(false);

    const res = await signIn('credentials', {
      redirect: false,
      email: signinForm.email.trim(),
      password: signinForm.password,
    });

    if (res?.error) {
      setError(
        "Invalid email or password. You can also click '1-Click VIP Guest Sign In' below to access instantly."
      );
      setLoading(false);
    } else {
      router.push('/account');
      router.refresh();
    }
  };

  // 1b. Instant 1-Click VIP Guest Sign In
  const handleDemoSignIn = async () => {
    setLoading(true);
    setError(null);
    setResetSuccess(false);

    const res = await signIn('credentials', {
      redirect: false,
      email: 'demo@chicfashion.com',
      password: 'fashion123',
    });

    if (res?.error) {
      setError("Sign in issue. Please try again.");
      setLoading(false);
    } else {
      router.push('/account');
      router.refresh();
    }
  };

  // 2. Google OAuth Sign In
  const handleGoogleSignIn = () => {
    setLoading(true);
    setError(null);
    signIn('google', { callbackUrl: '/account' }).catch(() => {
      setError("Google Sign-In is not configured on this environment. Please use Email or 1-Click VIP Guest Sign In.");
      setLoading(false);
    });
    setTimeout(() => setLoading(false), 5000);
  };

  // 3. Step 1 -> Step 3: Trigger Real OTP Dispatch for Registration
  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!registerForm.name || registerForm.name.trim().length === 0) {
      setError("Please enter your full name.");
      return;
    }

    if (!registerForm.email || registerForm.email.trim().length === 0) {
      setError("Please enter your email address.");
      return;
    }

    const emailParts = registerForm.email.trim().toLowerCase().split('@');
    if (emailParts.length === 2) {
      const dom = emailParts[1];
      if (['gamil.com', 'gmial.com', 'gmaill.com', 'gmai.com', 'gmil.com'].includes(dom)) {
        setError(`Invalid email domain "@${dom}". Did you mean "@gmail.com"?`);
        return;
      }
      if (['hotmial.com', 'hotmai.com'].includes(dom)) {
        setError(`Invalid email domain "@${dom}". Did you mean "@hotmail.com"?`);
        return;
      }
      if (['yaho.com', 'yahooo.com'].includes(dom)) {
        setError(`Invalid email domain "@${dom}". Did you mean "@yahoo.com"?`);
        return;
      }
      if (['outlok.com', 'outloo.com'].includes(dom)) {
        setError(`Invalid email domain "@${dom}". Did you mean "@outlook.com"?`);
        return;
      }
    }

    if (!registerForm.password || registerForm.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerForm.email.trim(),
          type: 'register',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send verification code');

      if (data.devOtp) {
        setDevOtpNotice(data.devOtp);
      } else {
        setDevOtpNotice(null);
      }

      setResendCooldown(60);
      setRegisterStep(2); // Dynamic transition to Step 3 OTP view
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Step 3: Verify Real OTP & Activate Account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!registerForm.otp || registerForm.otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
          otp: registerForm.otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setRegSuccess(true);
      setTab('signin');
      setRegisterStep(1);
      setDevOtpNotice(null);
      setSigninForm({
        email: registerForm.email.trim(),
        password: registerForm.password,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Send OTP for Password Reset
  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    if (!forgotForm.email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotForm.email.trim(),
          type: 'reset',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset code');

      if (data.devOtp) {
        setDevOtpNotice(data.devOtp);
      } else {
        setDevOtpNotice(null);
      }

      setResendCooldown(60);
      setForgotStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Verify OTP & Update Password
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!forgotForm.otp || forgotForm.otp.trim().length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      setError("New passwords do not match. Please re-enter.");
      return;
    }

    if (forgotForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotForm.email.trim(),
          newPassword: forgotForm.newPassword,
          otp: forgotForm.otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');

      setResetSuccess(true);
      setSigninForm({
        email: forgotForm.email.trim(),
        password: forgotForm.newPassword,
      });
      setTab('signin');
      setForgotStep(1);
      setDevOtpNotice(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Loading Session state (with 2s safety fallback)
  if (status === 'loading' && !sessionTimeout) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Loading Account...</p>
      </div>
    );
  }

  // Authenticated Dashboard View
  if (status === 'authenticated' && session?.user) {
    const user = session.user;
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-20">
        <div className="text-center mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-2">
            CHIC FASHION STORE • CLIENT PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif uppercase tracking-[0.18em] text-neutral-900">
            MY ACCOUNT
          </h1>
        </div>

        {/* Profile Card */}
        <div className="border border-neutral-200 p-6 sm:p-8 bg-neutral-50/50 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'User'}
                className="w-20 h-20 rounded-full object-cover border border-neutral-300"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-neutral-900 text-white flex items-center justify-center font-serif text-2xl uppercase">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <h2 className="text-lg font-serif tracking-wider uppercase font-semibold text-neutral-900">
                  {user.name || 'Valued Client'}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 self-center sm:self-auto font-medium">
                  <ShieldCheck className="w-3 h-3" /> Verified Member
                </span>
              </div>
              <p className="text-xs text-neutral-500 tracking-wide mb-4">{user.email}</p>

              <div className="flex flex-wrap gap-4 justify-center sm:justify-start text-xs">
                <Link
                  href="/cart"
                  className="flex items-center gap-2 py-2 px-4 border border-neutral-300 bg-white hover:border-black transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Bag ({cartCount})</span>
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 py-2 px-4 border border-neutral-300 bg-white hover:border-black transition"
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Wishlist ({wishlist.length})</span>
                </Link>
                <Link
                  href="/shop"
                  className="py-2 px-4 bg-black text-white hover:bg-neutral-800 transition uppercase tracking-wider text-[11px]"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details & Sign Out */}
        <div className="flex justify-between items-center border-t border-neutral-200 pt-6">
          <div className="text-[11px] text-neutral-400 uppercase tracking-widest">
            Connected via {user.image ? 'Google OAuth' : 'Email Authentication'}
          </div>
          <button
            onClick={() => {
              logout();
              signOut({ callbackUrl: '/account' });
            }}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-red-600 hover:text-red-800 transition py-2 px-4 border border-red-200 hover:border-red-400 bg-red-50/50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  // Unauthenticated Login / Register / Forgot Password View
  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-20">
      <div className="text-center mb-8">
        <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-neutral-400 block mb-2">
          CHIC FASHION STORE
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif uppercase tracking-[0.18em] text-neutral-900">
          {tab === 'forgot' ? 'RESET PASSWORD' : 'MY ACCOUNT'}
        </h1>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Success Alerts */}
      {regSuccess && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>Account verified and created successfully! Please sign in below.</span>
        </div>
      )}

      {resetSuccess && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5">
          <Check className="w-4 h-4 shrink-0" />
          <span>Password updated successfully! You can now sign in below.</span>
        </div>
      )}

      {/* Google OAuth Option & 1-Click VIP Access (when not in forgot mode) */}
      {tab !== 'forgot' && (
        <>
          {/* 1-Click VIP Guest Sign In for Instant Evaluation */}
          <button
            type="button"
            onClick={handleDemoSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 bg-neutral-900 text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-800 transition mb-3 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{loading ? 'Accessing...' : '1-Click VIP Guest Sign In'}</span>
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-neutral-300 text-xs uppercase tracking-wider font-semibold text-neutral-800 hover:border-black transition mb-6 bg-white shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <span className="relative bg-white px-3 text-[10px] uppercase tracking-widest text-neutral-400">
              Or continue with email
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-neutral-200 mb-6">
            <button
              onClick={() => { setTab('signin'); setError(null); }}
              className={`flex-1 py-3 text-xs uppercase tracking-[0.2em] font-semibold transition border-b-2 cursor-pointer ${
                tab === 'signin' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => { setTab('register'); setError(null); setRegisterStep(1); }}
              className={`flex-1 py-3 text-xs uppercase tracking-[0.2em] font-semibold transition border-b-2 cursor-pointer ${
                tab === 'register' ? 'border-black text-black' : 'border-transparent text-neutral-400 hover:text-black'
              }`}
            >
              REGISTER
            </button>
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. SIGN IN FORM
          ───────────────────────────────────────────────────────────── */}
      {tab === 'signin' && (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-medium mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={signinForm.email}
              onChange={(e) => setSigninForm({ ...signinForm, email: e.target.value })}
              className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
              placeholder="e.g. name@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-medium">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setTab('forgot');
                  setForgotStep(1);
                  setError(null);
                  setForgotForm({ ...forgotForm, email: signinForm.email });
                }}
                className="text-[11px] uppercase tracking-wider text-neutral-400 hover:text-black transition underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              required
              value={signinForm.password}
              onChange={(e) => setSigninForm({ ...signinForm, password: e.target.value })}
              className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs uppercase tracking-[0.25em] font-medium py-4 hover:bg-neutral-800 transition mt-4 disabled:bg-neutral-400 cursor-pointer"
          >
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. REGISTER FORM: STEP 1 (Initial Input) & STEP 2 (Action)
          ───────────────────────────────────────────────────────────── */}
      {tab === 'register' && registerStep === 1 && (
        <form onSubmit={handleCreateAccountSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-medium mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
              placeholder="e.g. Eleanor Vance"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-medium mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
              placeholder="e.g. name@example.com"
            />
            <p className="text-[10px] text-neutral-400 mt-1">
              We perform live domain & MX verification to confirm email validity.
            </p>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-medium mb-1.5">
              Password (Min. 6 characters)
            </label>
            <input
              type="password"
              required
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
              placeholder="••••••••"
            />
          </div>

          {/* Step 2: Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs uppercase tracking-[0.25em] font-medium py-4 hover:bg-neutral-800 transition mt-4 disabled:bg-neutral-400 cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'SENDING OTP...' : 'CREATE ACCOUNT'}</span>
          </button>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. REGISTER FORM: STEP 3 (Dynamic OTP Verification)
          ───────────────────────────────────────────────────────────── */}
      {tab === 'register' && registerStep === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
            <div className="font-semibold text-neutral-900 mb-1 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verify Your Email Address</span>
            </div>
            We have sent a 6-digit verification code to:
            <span className="font-semibold text-neutral-900 block mt-1 font-mono">
              {registerForm.email}
            </span>
            <p className="mt-2.5 pt-2 border-t border-neutral-200 text-[11px] text-neutral-500">
              ⚡ Delivered in seconds. If you do not see it in your primary inbox, please check your <strong>Spam / Junk</strong> or <strong>Promotions</strong> folder.
            </p>
          </div>

          {devOtpNotice && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
              <span>Terminal Mode (SMTP not set in .env):</span>
              <span className="font-mono text-sm font-bold tracking-widest bg-white px-2.5 py-0.5 border border-amber-400">
                {devOtpNotice}
              </span>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-medium mb-1.5 text-center">
              Enter 6-Digit Verification Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={registerForm.otp}
              onChange={(e) => setRegisterForm({ ...registerForm, otp: e.target.value.replace(/\D/g, '') })}
              className="w-full border border-neutral-300 p-3 text-center text-xl font-mono tracking-[0.35em] font-bold focus:outline-none focus:border-black"
              placeholder="••••••"
              autoFocus
            />
          </div>

          {/* Action: Verify & Activate Account */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs uppercase tracking-[0.25em] font-medium py-4 hover:bg-neutral-800 transition disabled:bg-neutral-400 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>{loading ? 'VERIFYING...' : 'VERIFY & ACTIVATE ACCOUNT'}</span>
          </button>

          {/* Resend Code & Back Navigation */}
          <div className="flex justify-between items-center pt-2 text-[11px] text-neutral-500">
            <button
              type="button"
              onClick={handleCreateAccountSubmit}
              disabled={loading || resendCooldown > 0}
              className="hover:text-black underline cursor-pointer disabled:text-neutral-400 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
            </button>
            <button
              type="button"
              onClick={() => { setRegisterStep(1); setError(null); }}
              className="hover:text-black underline cursor-pointer"
            >
              Change Email
            </button>
          </div>
        </form>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. FORGOT PASSWORD (STEP 1: Email, STEP 2: OTP & Reset)
          ───────────────────────────────────────────────────────────── */}
      {tab === 'forgot' && forgotStep === 1 && (
        <form onSubmit={handleSendResetOtp} className="space-y-4">
          <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
            Enter your account email to receive a secure 6-digit one-time verification code.
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-medium mb-1.5">
              Account Email Address
            </label>
            <input
              type="email"
              required
              value={forgotForm.email}
              onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
              className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
              placeholder="e.g. name@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs uppercase tracking-[0.25em] font-medium py-4 hover:bg-neutral-800 transition mt-4 disabled:bg-neutral-400 cursor-pointer flex items-center justify-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{loading ? 'SENDING CODE...' : 'SEND RESET CODE'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setTab('signin'); setError(null); }}
            className="w-full py-3 text-xs uppercase tracking-[0.2em] font-medium text-neutral-500 hover:text-black transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </form>
      )}

      {tab === 'forgot' && forgotStep === 2 && (
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 leading-relaxed">
            Enter the 6-digit code sent to <strong className="text-neutral-900">{forgotForm.email}</strong> and choose your new password.
          </div>

          {devOtpNotice && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
              <span>Terminal Mode (SMTP not set in .env):</span>
              <span className="font-mono text-sm font-bold tracking-widest bg-white px-2.5 py-0.5 border border-amber-400">
                {devOtpNotice}
              </span>
            </div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-medium mb-1.5">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={forgotForm.otp}
              onChange={(e) => setForgotForm({ ...forgotForm, otp: e.target.value.replace(/\D/g, '') })}
              className="w-full border border-neutral-300 p-3 text-center text-lg font-mono tracking-[0.3em] font-bold focus:outline-none focus:border-black"
              placeholder="••••••"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-medium mb-1.5">
              New Password (Min. 6 chars)
            </label>
            <input
              type="password"
              required
              value={forgotForm.newPassword}
              onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
              className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-neutral-700 font-medium mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={forgotForm.confirmPassword}
              onChange={(e) => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
              className="w-full border border-neutral-300 p-3 text-xs focus:outline-none focus:border-black"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs uppercase tracking-[0.25em] font-medium py-4 hover:bg-neutral-800 transition mt-4 disabled:bg-neutral-400 cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? 'UPDATING...' : 'VERIFY & RESET PASSWORD'}</span>
          </button>

          <div className="flex justify-between items-center pt-2 text-[11px] text-neutral-500">
            <button
              type="button"
              onClick={handleSendResetOtp}
              disabled={loading || resendCooldown > 0}
              className="hover:text-black underline cursor-pointer disabled:text-neutral-400 disabled:no-underline"
            >
              {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
            </button>
            <button
              type="button"
              onClick={() => { setForgotStep(1); setError(null); }}
              className="hover:text-black underline cursor-pointer"
            >
              Change Email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">Loading...</p>
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}