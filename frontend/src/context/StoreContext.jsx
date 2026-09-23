'use client';
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [mounted, setMounted] = useState(false);
  const isSyncingFromBackend = useRef(false);

  const activeEmail = session?.user?.email ? session.user.email.toLowerCase() : null;

  // 1. Initial Mount: Wipe any stale legacy unscoped storage
  useEffect(() => {
    setMounted(true);
    try {
      localStorage.removeItem('cfs_cart');
      localStorage.removeItem('cfs_wishlist');
      localStorage.removeItem('cfs_guest_cart');
      localStorage.removeItem('cfs_guest_wish');
    } catch (e) {}
  }, []);

  // 2. Sync Cart & Wishlist strictly to Authenticated Account
  useEffect(() => {
    if (!mounted) return;

    if (status === 'authenticated' && activeEmail) {
      // Step A: Immediate load from user-scoped localStorage cache
      try {
        const localUserCart = localStorage.getItem(`cfs_cart_${activeEmail}`);
        const localUserWish = localStorage.getItem(`cfs_wish_${activeEmail}`);
        if (localUserCart) setCart(JSON.parse(localUserCart));
        if (localUserWish) setWishlist(JSON.parse(localUserWish));
      } catch (e) {
        console.error('Failed reading user local cache:', e);
      }

      // Step B: Fetch authoritative cart & wishlist from MySQL database
      isSyncingFromBackend.current = true;
      fetch('/api/user/sync')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.authenticated) {
            const userCart = data.cart || [];
            const userWish = data.wishlist || [];
            setCart(userCart);
            setWishlist(userWish);

            try {
              localStorage.setItem(`cfs_cart_${activeEmail}`, JSON.stringify(userCart));
              localStorage.setItem(`cfs_wish_${activeEmail}`, JSON.stringify(userWish));
            } catch (e) {}
          }
        })
        .catch((err) => console.error('Error syncing from database:', err))
        .finally(() => {
          setTimeout(() => {
            isSyncingFromBackend.current = false;
          }, 300);
        });
    } else if (status === 'unauthenticated') {
      // User is NOT logged in: Cart and Wishlist MUST BE EMPTY
      setCart([]);
      setWishlist([]);
    }
  }, [mounted, status, activeEmail]);

  // 3. Persist Cart changes to MySQL for the logged-in user
  useEffect(() => {
    if (!mounted || isSyncingFromBackend.current) return;

    if (activeEmail && status === 'authenticated') {
      try {
        localStorage.setItem(`cfs_cart_${activeEmail}`, JSON.stringify(cart));
      } catch (e) {}

      const timer = setTimeout(() => {
        fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, wishlist }),
        }).catch((e) => console.error('Cart sync to MySQL error:', e));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [cart, activeEmail, mounted, status]);

  // 4. Persist Wishlist changes to MySQL for the logged-in user
  useEffect(() => {
    if (!mounted || isSyncingFromBackend.current) return;

    if (activeEmail && status === 'authenticated') {
      try {
        localStorage.setItem(`cfs_wish_${activeEmail}`, JSON.stringify(wishlist));
      } catch (e) {}

      const timer = setTimeout(() => {
        fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cart, wishlist }),
        }).catch((e) => console.error('Wishlist sync to MySQL error:', e));
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [wishlist, activeEmail, mounted, status]);

  // Add to Cart: Requires logged-in user account
  const addToCart = (product, selectedSize, selectedColor, quantity = 1) => {
    if (!session?.user) {
      router.push('/account');
      return;
    }

    const size = selectedSize || (Array.isArray(product.sizes) ? product.sizes[0] : 'Standard');
    const color = selectedColor || (Array.isArray(product.colors) ? product.colors[0] : 'Default');

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingIndex > -1) {
        const nextCart = [...prev];
        nextCart[existingIndex].quantity += quantity;
        return nextCart;
      }

      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: Number(product.price),
          image_url: product.image_url,
          selectedSize: size,
          selectedColor: color,
          quantity,
        },
      ];
    });
  };

  const removeFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index, qty) => {
    if (qty <= 0) {
      removeFromCart(index);
      return;
    }
    setCart((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: qty } : item))
    );
  };

  const clearCart = () => setCart([]);

  // Wishlist Toggle: Requires logged-in user account
  const toggleWishlist = (product) => {
    if (!session?.user) {
      router.push('/account');
      return;
    }

    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  };

  // Sign out: Instantly wipe in-memory and local state
  const logout = () => {
    setCart([]);
    setWishlist([]);
    try {
      if (activeEmail) {
        localStorage.removeItem(`cfs_cart_${activeEmail}`);
        localStorage.removeItem(`cfs_wish_${activeEmail}`);
      }
      localStorage.removeItem('cfs_cart');
      localStorage.removeItem('cfs_wishlist');
      localStorage.removeItem('cfs_guest_cart');
      localStorage.removeItem('cfs_guest_wish');
    } catch (e) {}
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        user: session?.user || null,
        session,
        status,
        isAuthenticated: Boolean(session?.user),
        logout,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        cartTotal,
        cartCount,
        mounted,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
