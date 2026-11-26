import type { Metadata } from "next";
import Link from "next/link";
import { retreat } from "@/data/sheboss";
import CallbackStatus from "./CallbackStatus";

export const metadata: Metadata = { title: "Confirming Payment", robots: { index: false, follow: false } };

export default function RegistrationCallbackPage({
  searchParams,
}: {
  // Stripe appends payment_intent; Paystack appends reference (and trxref).
  searchParams: { payment_intent?: string; reference?: string; trxref?: string };
}) {
  const reference = searchParams.payment_intent ?? searchParams.reference ?? searchParams.trxref;
  return (
    <div className="container-editorial max-w-xl py-20 text-center">
      {reference ? (
        <CallbackStatus reference={reference} slug={retreat.slug} />
      ) : (
        <>
          <p className="eyebrow mb-3">Payment</p>
          <h1 className="font-display text-4xl">No payment reference found.</h1>
          <Link href={`/events/${retreat.slug}`} className="btn-outline mt-8">Back to the retreat</Link>
        </>
      )}
    </div>
  );
}
