"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartFormat = "digital" | "print";

export type CartItem = {
  slug: string;
  title: string;
  format: CartFormat;
  price: string; // decimal string, matches backend
  image?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string, format: CartFormat) => void;
  updateQuantity: (slug: string, format: CartFormat, quantity: number) => void;
  clearCart: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "glitz-cart";

function sameLine(a: { slug: string; format: CartFormat }, b: { slug: string; format: CartFormat }) {
  return a.slug === b.slug && a.format === b.format;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Ignore — a blocked/unavailable localStorage just means an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore — nothing to persist to if storage isn't available.
    }
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item));
      if (existing) {
        return prev.map((i) => (sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function removeItem(slug: string, format: CartFormat) {
    setItems((prev) => prev.filter((i) => !sameLine(i, { slug, format })));
  }

  function updateQuantity(slug: string, format: CartFormat, quantity: number) {
    if (quantity <= 0) {
      removeItem(slug, format);
      return;
    }
    setItems((prev) => prev.map((i) => (sameLine(i, { slug, format }) ? { ...i, quantity } : i)));
  }

  function clearCart() {
    setItems([]);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
