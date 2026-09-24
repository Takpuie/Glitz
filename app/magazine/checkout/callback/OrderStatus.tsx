"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";

type OrderItem = {
  issue_title: string;
  issue_slug: string;
  format: "digital" | "print";
  quantity: number;
  unit_price: string;
  download_url: string | null;
};

type OrderStatus = {
  stripe_session_id: string;
  status: "pending" | "paid" | "failed" | "refunded";
  email: string;
  amount: string;
  items: OrderItem[];
};

export default function OrderStatus({ reference }: { reference: string }) {
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  async function check() {
    setLoading(true);
    try {
      const res = await fetch(`/api/magazine-checkout/verify/${encodeURIComponent(reference)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setNotFound(true);
      } else {
        setOrder(await res.json());
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  useEffect(() => {
    if (order?.status === "paid") clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.status]);

  if (loading) {
    return (
      <>
        <p className="eyebrow mb-3">Checkout</p>
        <h1 className="font-display text-4xl">Confirming your order…</h1>
      </>
    );
  }

  if (notFound || !order) {
    return (
      <>
        <p className="eyebrow mb-3">Checkout</p>
        <h1 className="font-display text-4xl">We couldn&apos;t find that order.</h1>
        <p className="mt-4 text-sm text-gray-600">
          If you completed payment, check your email, or get in touch with your reference:{" "}
          {reference}.
        </p>
      </>
    );
  }

  if (order.status === "paid") {
    const hasPrint = order.items.some((i) => i.format === "print");
    return (
      <>
        <p className="eyebrow mb-3">Confirmed</p>
        <h1 className="font-display text-4xl">Thank you for your order.</h1>
        <p className="mt-4 text-sm text-gray-600">A confirmation has been sent to {order.email}.</p>

        <div className="mt-8 space-y-4 text-left">
          {order.items.map((item) => (
            <div
              key={`${item.issue_slug}-${item.format}`}
              className="flex items-center justify-between border-b border-ink/12 pb-4"
            >
              <div>
                <p className="font-display text-base">{item.issue_title}</p>
                <p className="mt-1 font-nav text-[10px] uppercase tracking-widest2 text-gray-500">
                  {item.format} &middot; Qty {item.quantity}
                </p>
              </div>
              {item.download_url ? (
                <a href={item.download_url} className="btn-outline">
                  Download
                </a>
              ) : item.format === "digital" ? (
                <p className="text-xs text-gray-500">Link emailed shortly</p>
              ) : null}
            </div>
          ))}
        </div>

        {hasPrint && (
          <p className="mt-6 text-sm text-gray-600">
            Print copies ship to the address you provided — we&apos;ll email tracking once they&apos;re
            on the way.
          </p>
        )}
      </>
    );
  }

  if (order.status === "pending") {
    return (
      <>
        <p className="eyebrow mb-3">Processing</p>
        <h1 className="font-display text-4xl">Your payment is still being confirmed.</h1>
        <p className="mt-4 text-sm text-gray-600">
          This usually resolves within a minute of paying.
        </p>
        <button type="button" onClick={check} className="btn-outline mt-6">
          Check Again
        </button>
      </>
    );
  }

  return (
    <>
      <p className="eyebrow mb-3">Not completed</p>
      <h1 className="font-display text-4xl">This order wasn&apos;t completed.</h1>
      <p className="mt-4 text-sm text-gray-600">No charge was made. You can try again below.</p>
    </>
  );
}
