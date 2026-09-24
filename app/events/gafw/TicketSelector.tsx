"use client";

import { useState } from "react";
import type { TicketTier } from "@/lib/backend";

function formatPrice(price: string) {
  return `GHS ${Math.round(parseFloat(price)).toLocaleString()}`;
}

export default function TicketSelector({
  slug,
  ticketTypes,
}: {
  slug: string;
  ticketTypes: TicketTier[];
}) {
  const [selected, setSelected] = useState<TicketTier | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          ticket_type_id: selected.id,
          buyer_name: name,
          buyer_email: email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.checkout_url;
    } catch {
      setError("Network error — please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="divide-y divide-ink/15 border-y border-ink/15">
        {ticketTypes.map((t) => {
          const soldOut = t.remaining <= 0;
          const lowStock = !soldOut && t.remaining <= 20;
          return (
            <div
              key={t.id}
              className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="font-display text-xl">{t.name}</h3>
                <p className="mt-1 max-w-md text-sm text-gray-600">{t.description}</p>
                {lowStock && (
                  <p className="mt-1 font-nav text-[10px] uppercase tracking-widest2 text-gray-500">
                    Only {t.remaining} left
                  </p>
                )}
              </div>
              <div className="flex items-center gap-6">
                <span className="font-nav text-sm tracking-wide">{formatPrice(t.price)}</span>
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() => {
                    setSelected(t);
                    setError(null);
                  }}
                  className={soldOut ? "btn-outline cursor-not-allowed opacity-40" : "btn-outline"}
                >
                  {soldOut ? "Sold Out" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="mt-8 max-w-md border border-ink/15 p-6">
          <p className="eyebrow mb-1">Registering for</p>
          <h4 className="mb-5 font-display text-lg">{selected.name}</h4>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="eyebrow mb-2 block">Full name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-ink bg-transparent py-3 font-body text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="eyebrow mb-2 block">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-b border-ink bg-transparent py-3 font-body text-sm focus:outline-none"
              />
            </div>
            {error && <p className="text-sm text-red-700">{error}</p>}
            <div className="flex flex-wrap items-center gap-4">
              <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                {loading ? "Redirecting…" : `Continue to Payment — ${formatPrice(selected.price)}`}
              </button>
              <button type="button" className="btn-outline" onClick={() => setSelected(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-500">
        QR e-tickets issued instantly on purchase. Refunds and transfers available up to 7 days
        before each date, per event policy.
      </p>
    </div>
  );
}
