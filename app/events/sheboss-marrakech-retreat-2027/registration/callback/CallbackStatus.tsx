"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { pollVerify } from "@/components/PlanPayment";

/** Lands here only when a bank's 3-D Secure step or Paystack redirected
 * away from the page. Confirms with our backend, then opens the schedule. */
export default function CallbackStatus({ reference, slug }: { reference: string; slug: string }) {
  const router = useRouter();
  const [state, setState] = useState<"checking" | "slow">("checking");

  useEffect(() => {
    let active = true;
    pollVerify(reference).then((verified) => {
      if (!active) return;
      if (verified) router.replace(`/events/${slug}/registration/${verified.manage_token}`);
      else setState("slow");
    });
    return () => { active = false; };
  }, [reference, slug, router]);

  return state === "checking" ? (
    <>
      <p className="eyebrow mb-3">Payment</p>
      <h1 className="font-display text-4xl">Confirming your payment…</h1>
    </>
  ) : (
    <>
      <p className="eyebrow mb-3">Payment</p>
      <h1 className="font-display text-4xl">Your payment is still processing.</h1>
      <p className="mt-4 text-sm text-gray-600">
        You&apos;ll receive a confirmation email as soon as it clears. Please don&apos;t pay again. Reference: {reference}
      </p>
      <Link href={`/events/${slug}`} className="btn-outline mt-8">Back to the retreat</Link>
    </>
  );
}
