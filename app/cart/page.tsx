"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";

function formatPrice(n: number) {
  return `GHS ${Math.round(n).toLocaleString()}`;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const [email, setEmail] = useState("");
  const [shipping, setShipping] = useState({
    shipping_name: "", shipping_phone: "", shipping_address_line1: "", shipping_address_line2: "",
    shipping_city: "", shipping_region: "", shipping_postal_code: "", shipping_country: "GH",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasPrint = items.some((i) => i.format === "print");

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/magazine-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, format: i.format, quantity: i.quantity })),
          buyer_email: email,
          ...(hasPrint ? shipping : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const firstError = typeof data.detail === "string" ? data.detail : Object.values(data)[0];
        setError(String(firstError ?? "Something went wrong. Please try again."));
        setLoading(false);
        return;
      }
      window.location.href = data.checkout_url;
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-editorial py-12 md:py-16">
        <header className="border-b border-ink/12 pb-8">
          <p className="eyebrow mb-3">Glitz Shop</p>
          <h1 className="font-display text-5xl sm:text-6xl">Your Bag</h1>
        </header>

        <div className="max-w-md py-16">
          <div className="border border-ink/15 p-8 text-center">
            <p className="text-sm text-gray-600">Your bag is empty.</p>
            <Link href="/magazine" className="btn-primary mt-6 inline-flex">
              Browse Magazines
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-editorial py-12 md:py-16">
      <header className="border-b border-ink/12 pb-8">
        <p className="eyebrow mb-3">Glitz Shop</p>
        <h1 className="font-display text-5xl sm:text-6xl">Your Bag</h1>
      </header>

      <div className="grid grid-cols-1 gap-12 py-12 md:grid-cols-[1fr_360px]">
        <div className="divide-y divide-ink/12 border-y border-ink/12">
          {items.map((item) => (
            <div key={`${item.slug}-${item.format}`} className="flex gap-5 py-6">
              <div className="photo-card relative aspect-[4/5] w-20 shrink-0 bg-gray-100 sm:w-24">
                {item.image && (
                  <Image unoptimized src={item.image} alt={item.title} fill sizes="100px" className="object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-lg leading-snug">{item.title}</p>
                    <p className="mt-1 font-nav text-[10px] uppercase tracking-widest2 text-gray-500">
                      {item.format}
                    </p>
                  </div>
                  <p className="font-nav text-sm tracking-wide">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 border border-ink/20">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center text-base hover:bg-smoke"
                      onClick={() => updateQuantity(item.slug, item.format, item.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center text-base hover:bg-smoke"
                      onClick={() => updateQuantity(item.slug, item.format, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    className="font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500 hover:text-ink"
                    onClick={() => removeItem(item.slug, item.format)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit border border-ink/15 p-6">
          <p className="eyebrow mb-4">Order Summary</p>
          <div className="flex items-center justify-between border-b border-ink/12 pb-4 text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-nav tracking-wide">{formatPrice(subtotal)}</span>
          </div>

          <form onSubmit={handleCheckout} className="mt-6 space-y-4">
            <div>
              <label className="eyebrow mb-2 block">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-ink bg-transparent py-2 font-body text-sm focus:outline-none"
              />
            </div>
            {hasPrint && (
              <fieldset className="space-y-4 border-t border-ink/15 pt-5">
                <legend className="eyebrow mb-1">Shipping address</legend>
                {[
                  ["shipping_name", "Full name", "text", true, "name"],
                  ["shipping_phone", "Phone number", "tel", true, "tel"],
                  ["shipping_address_line1", "Address line 1", "text", true, "street-address"],
                  ["shipping_address_line2", "Address line 2 (optional)", "text", false, "address-line2"],
                  ["shipping_city", "City / town", "text", true, "address-level2"],
                  ["shipping_region", "Region / state", "text", true, "address-level1"],
                  ["shipping_postal_code", "Postal code (optional)", "text", false, "postal-code"],
                ].map(([name, label, type, required, autoComplete]) => (
                  <div key={String(name)}>
                    <label htmlFor={String(name)} className="mb-1 block text-xs text-gray-600">{label}</label>
                    <input id={String(name)} name={String(name)} type={String(type)} required={Boolean(required)} autoComplete={String(autoComplete)} value={shipping[name as keyof typeof shipping]} onChange={(e) => setShipping((current) => ({ ...current, [String(name)]: e.target.value }))} className="w-full border-b border-ink bg-transparent py-2 font-body text-sm focus:border-gray-500 focus:outline-none" />
                  </div>
                ))}
                <div>
                  <label htmlFor="shipping_country" className="mb-1 block text-xs text-gray-600">Country</label>
                  <select id="shipping_country" required value={shipping.shipping_country} onChange={(e) => setShipping((current) => ({ ...current, shipping_country: e.target.value }))} className="w-full border-b border-ink bg-transparent py-2 font-body text-sm focus:outline-none">
                    <option value="GH">Ghana</option><option value="NG">Nigeria</option><option value="GB">United Kingdom</option><option value="US">United States</option><option value="CA">Canada</option><option value="ZA">South Africa</option><option value="KE">Kenya</option>
                  </select>
                </div>
              </fieldset>
            )}
            {error && <p className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Opening Paystack…" : `Pay with Paystack — ${formatPrice(subtotal)}`}
            </button>
          </form>

          <button
            type="button"
            onClick={clearCart}
            className="mt-4 w-full font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500 hover:text-ink"
          >
            Empty Bag
          </button>
        </aside>
      </div>
    </div>
  );
}
