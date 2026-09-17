"use client";

import { useEffect, useState } from "react";

type TicketStatus = {
  paystack_reference: string;
  status: "pending" | "paid" | "cancelled" | "refunded";
  check_in_code: string;
  buyer_name: string;
  buyer_email: string;
  event_name: string;
  ticket_type_name: string;
};

export default function CheckoutStatus({ reference }: { reference: string }) {
  const [ticket, setTicket] = useState<TicketStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  async function check() {
    setLoading(true);
    try {
      const res = await fetch(`/api/checkout/verify/${encodeURIComponent(reference)}`, {
        cache: "no-store",
      });
      if (!res.ok) {
        setNotFound(true);
      } else {
        setTicket(await res.json());
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

  if (notFound || !ticket) {
    return (
      <>
        <p className="eyebrow mb-3">Checkout</p>
        <h1 className="font-display text-4xl">We couldn&apos;t find that order.</h1>
        <p className="mt-4 text-sm text-gray-600">
          If you completed payment, check your email for confirmation, or get in touch with your
          reference: {reference}.
        </p>
      </>
    );
  }

  if (ticket.status === "paid") {
    return (
      <>
        <p className="eyebrow mb-3">Confirmed</p>
        <h1 className="font-display text-4xl">You&apos;re in, {ticket.buyer_name.split(" ")[0]}.</h1>
        <p className="mt-4 text-sm text-gray-600">
          {ticket.ticket_type_name} — {ticket.event_name}. A confirmation has been sent to{" "}
          {ticket.buyer_email}.
        </p>
        <div className="mt-8 inline-block border border-ink/20 px-8 py-6">
          <p className="eyebrow mb-2">Check-in code</p>
          <p className="font-display text-3xl tracking-widest">{ticket.check_in_code}</p>
        </div>
      </>
    );
  }

  if (ticket.status === "pending") {
    return (
      <>
        <p className="eyebrow mb-3">Processing</p>
        <h1 className="font-display text-4xl">Your payment is still being confirmed.</h1>
        <p className="mt-4 text-sm text-gray-600">
          This usually resolves within a minute of paying. If you haven&apos;t completed payment
          yet, this order will expire automatically.
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
      <p className="mt-4 text-sm text-gray-600">No charge was made. You can select a ticket again below.</p>
    </>
  );
}
