"use client";

import { useEffect, useState } from "react";

type OrderStatus = {
  stripe_session_id: string;
  status: "pending" | "paid" | "failed" | "refunded";
  email: string;
  amount: string;
  delivery_link: string;
  issue_title: string;
  format: "digital" | "print";
};

export default function OrderStatus({ reference }: { reference: string }) {
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
    return (
      <>
        <p className="eyebrow mb-3">Confirmed</p>
        <h1 className="font-display text-4xl">Thank you for your order.</h1>
        <p className="mt-4 text-sm text-gray-600">
          {order.issue_title} — {order.format === "print" ? "Print edition" : "Digital edition"}. A
          confirmation has been sent to {order.email}.
        </p>
        {order.format === "digital" &&
          (order.delivery_link ? (
            <a href={order.delivery_link} className="btn-primary mt-8 inline-flex">
              Download Your Issue
            </a>
          ) : (
            <p className="mt-8 text-sm text-gray-600">
              Your digital download link will be emailed to you shortly.
            </p>
          ))}
        {order.format === "print" && (
          <p className="mt-8 text-sm text-gray-600">
            Your copy ships to the address you provided — we&apos;ll email tracking once it&apos;s on
            its way.
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
