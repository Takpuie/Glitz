"use client";

import { useState } from "react";
import type { BackendMagazineIssue } from "@/lib/backend";

function formatPrice(price: string) {
  return `GHS ${Math.round(parseFloat(price)).toLocaleString()}`;
}

export default function MagazineCheckout({
  issue,
  compact = false,
}: {
  issue: BackendMagazineIssue;
  compact?: boolean;
}) {
  const [format, setFormat] = useState<"digital" | "print" | null>(null);
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const printAvailable = issue.is_print_available && !issue.print_sold_out;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!format) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/magazine-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: issue.slug,
          format,
          buyer_email: email,
          shipping_address: format === "print" ? address : undefined,
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

  return (
    <div>
      <div className={`flex flex-wrap gap-3 ${compact ? "mt-3" : "mt-8 gap-4"}`}>
        {printAvailable && (
          <button
            type="button"
            className={compact ? "btn-outline px-3 py-1.5 text-[10px]" : "btn-primary"}
            onClick={() => {
              setFormat("print");
              setError(null);
            }}
          >
            Buy Print — {formatPrice(issue.price)}
          </button>
        )}
        {issue.is_digital_available && (
          <button
            type="button"
            className={compact ? "btn-outline px-3 py-1.5 text-[10px]" : "btn-outline"}
            onClick={() => {
              setFormat("digital");
              setError(null);
            }}
          >
            Buy Digital — {formatPrice(issue.price)}
          </button>
        )}
      </div>

      {format && (
        <form onSubmit={handleSubmit} className="mt-5 max-w-sm space-y-4 border border-ink/15 p-5">
          <p className="eyebrow">
            {format === "print" ? "Print" : "Digital"} — {issue.title}
          </p>
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
          {format === "print" && (
            <div>
              <label className="eyebrow mb-2 block">Shipping address</label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border-b border-ink bg-transparent py-2 font-body text-sm focus:outline-none"
              />
            </div>
          )}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? "Redirecting…" : `Pay ${formatPrice(issue.price)}`}
            </button>
            <button type="button" className="btn-outline" onClick={() => setFormat(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
