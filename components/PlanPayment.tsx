"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PaymentPlan, PaymentProvider, PlanPaymentStart } from "@/lib/backend";
import { formatMoney } from "@/lib/money";

// On-site payment for payment plans. Card details go straight into Stripe's
// or Paystack's own secure fields; this component only ever sees a one-time
// client secret / access code, and never decides on its own that a payment
// succeeded: it asks our verify endpoint, which asks the provider.

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    Stripe?: (key: string) => any;
    PaystackPop?: new () => any;
  }
}

const SCRIPTS: Record<PaymentProvider, string> = {
  stripe: "https://js.stripe.com/v3/",
  paystack: "https://js.paystack.co/v2/inline.js",
};

const PROVIDER_LABELS: Record<PaymentProvider, string> = {
  stripe: "Card",
  paystack: "Paystack",
};

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing?.dataset.loaded) return resolve();
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => { script.dataset.loaded = "1"; resolve(); });
    script.addEventListener("error", () => reject(new Error("The payment form could not load. Check your connection and try again.")));
    if (!existing) {
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

type Verified = {
  status: "pending" | "paid" | "cancelled";
  amount: string;
  currency: string;
  manage_token: string;
  event_slug: string;
  registration_status: string;
  balance: string;
};

export async function pollVerify(reference: string, attempts = 12): Promise<Verified | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(`/api/plan-checkout/verify/${encodeURIComponent(reference)}`, { cache: "no-store" });
      if (res.ok) {
        const data: Verified = await res.json();
        if (data.status === "paid") return data;
      }
    } catch { /* Retry below. */ }
    await new Promise((r) => setTimeout(r, 2500));
  }
  return null;
}

function ErrorNote({ message }: { message: string }) {
  return <p role="alert" className="mt-4 border-l-2 border-red-700 pl-3 text-sm text-red-800">{message}</p>;
}

/** Stripe Payment Element, mounted inline. */
function StripeForm({ start, slug, onPaid }: { start: PlanPaymentStart; slug: string; onPaid: (v: Verified) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let element: any;
    let cancelled = false;
    loadScript(SCRIPTS.stripe).then(() => {
      if (cancelled || !window.Stripe || !mountRef.current) return;
      const stripe = window.Stripe(start.publishable_key!);
      const elements = stripe.elements({
        clientSecret: start.client_secret,
        appearance: {
          theme: "stripe",
          variables: { colorPrimary: "#000000", colorText: "#101010", borderRadius: "2px", fontFamily: "Helvetica Neue, Arial, sans-serif" },
        },
      });
      element = elements.create("payment", { layout: "tabs" });
      element.on("ready", () => setReady(true));
      element.mount(mountRef.current);
      stripeRef.current = stripe;
      elementsRef.current = elements;
    }).catch((e: Error) => setError(e.message));
    return () => { cancelled = true; element?.destroy(); };
  }, [start.client_secret, start.publishable_key]);

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    if (!stripeRef.current || !elementsRef.current) return;
    setBusy(true);
    setError("");
    const { error: stripeError, paymentIntent } = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      confirmParams: { return_url: `${window.location.origin}/events/${slug}/registration/callback` },
      redirect: "if_required",
    });
    if (stripeError) {
      setError(stripeError.message ?? "Your payment could not be completed.");
      setBusy(false);
      return;
    }
    const verified = await pollVerify(paymentIntent?.id ?? start.reference);
    if (verified) onPaid(verified);
    else {
      setError("Your payment is processing. We'll email you as soon as it's confirmed. Please don't pay again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={pay}>
      <div ref={mountRef} className="min-h-[220px]" />
      {!ready && !error && <p className="text-sm text-gray-500">Loading secure payment form…</p>}
      {error && <ErrorNote message={error} />}
      <button type="submit" disabled={!ready || busy} className="btn-primary mt-6 w-full disabled:opacity-50">
        {busy ? "Processing…" : `Pay ${formatMoney(start.amount, start.currency)}`}
      </button>
      <p className="mt-3 text-center text-xs text-gray-500">Secured by Stripe. Card details never touch Glitz servers.</p>
    </form>
  );
}

/** Paystack Inline popup, opened over the page. */
function PaystackLauncher({ start, onPaid, onCancel }: { start: PlanPaymentStart; onPaid: (v: Verified) => void; onCancel: () => void }) {
  const [state, setState] = useState<"opening" | "open" | "verifying" | "error">("opening");
  const [error, setError] = useState("");
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    loadScript(SCRIPTS.paystack).then(() => {
      if (!window.PaystackPop) throw new Error("Paystack could not load.");
      const popup = new window.PaystackPop();
      setState("open");
      popup.resumeTransaction(start.access_code, {
        onSuccess: async () => {
          setState("verifying");
          const verified = await pollVerify(start.reference);
          if (verified) onPaid(verified);
          else {
            setError("Your payment is processing. We'll email you as soon as it's confirmed. Please don't pay again.");
            setState("error");
          }
        },
        onCancel: () => onCancel(),
        onError: (e: { message?: string }) => { setError(e?.message ?? "Paystack could not start the payment."); setState("error"); },
      });
    }).catch((e: Error) => { setError(e.message); setState("error"); });
  }, [start.access_code, start.reference, onPaid, onCancel]);

  return (
    <div className="py-6 text-center">
      {state === "opening" && <p className="text-sm text-gray-600">Opening Paystack…</p>}
      {state === "open" && <p className="text-sm text-gray-600">Complete your payment in the Paystack window.</p>}
      {state === "verifying" && <p className="text-sm text-gray-600">Confirming your payment…</p>}
      {state === "error" && (
        <>
          <ErrorNote message={error} />
          <button type="button" onClick={onCancel} className="btn-outline mt-6">Back</button>
        </>
      )}
    </div>
  );
}

function PaymentStep({ start, slug, onPaid, onCancel }: { start: PlanPaymentStart; slug: string; onPaid: (v: Verified) => void; onCancel: () => void }) {
  return (
    <div>
      <div className="mb-6 flex items-baseline justify-between border-b border-ink/15 pb-4">
        <p className="eyebrow">Paying now</p>
        <p className="font-display text-3xl">{formatMoney(start.amount, start.currency)}</p>
      </div>
      {start.provider === "stripe"
        ? <StripeForm start={start} slug={slug} onPaid={onPaid} />
        : <PaystackLauncher start={start} onPaid={onPaid} onCancel={onCancel} />}
      {start.provider === "stripe" && (
        <button type="button" onClick={onCancel} className="mt-4 w-full text-center font-nav text-[11px] uppercase tracking-widest2 text-gray-500 hover:text-ink">
          Change payment method
        </button>
      )}
    </div>
  );
}

function PaidNote({ verified, slug }: { verified: Verified; slug: string }) {
  const complete = verified.registration_status === "complete";
  return (
    <div className="text-center">
      <p className="eyebrow mb-3">{complete ? "Paid in full" : "Payment received"}</p>
      <h3 className="font-display text-4xl">{complete ? "You're all set." : "Thank you."}</h3>
      <p className="mx-auto mt-4 max-w-md text-sm text-gray-600">
        We received {formatMoney(verified.amount, verified.currency)}. A confirmation is on its way to your inbox.
        {!complete && <> Your remaining balance is {formatMoney(verified.balance, verified.currency)}.</>}
      </p>
      <Link href={`/events/${slug}/registration/${verified.manage_token}`} className="btn-primary mt-8">
        {complete ? "View your registration" : "View your payment schedule"}
      </Link>
      <p className="mt-3 text-xs text-gray-500">Bookmark that page: it's where you pay your next installments.</p>
    </div>
  );
}

function ProviderPicker({ providers, value, onChange }: { providers: PaymentProvider[]; value: PaymentProvider; onChange: (p: PaymentProvider) => void }) {
  if (providers.length < 2) return null;
  return (
    <fieldset>
      <legend className="eyebrow mb-2 block">Pay with</legend>
      <div className="grid grid-cols-2 gap-3">
        {providers.map((provider) => (
          <label key={provider} className={`cursor-pointer border px-4 py-3 text-center font-nav text-xs uppercase tracking-widest transition-colors ${value === provider ? "border-ink bg-ink text-white" : "border-ink/20 hover:border-ink"}`}>
            <input type="radio" name="provider" value={provider} checked={value === provider} onChange={() => onChange(provider)} className="sr-only" />
            {PROVIDER_LABELS[provider]}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function planSummary(plan: PaymentPlan) {
  const n = plan.installments.length;
  if (n === 1) return `${formatMoney(plan.total, plan.currency)} in one payment`;
  const amounts = new Set(plan.installments.map((i) => i.amount));
  return amounts.size === 1
    ? `${n} × ${formatMoney(plan.installments[0].amount, plan.currency)} monthly`
    : `${formatMoney(plan.total, plan.currency)} in ${n} payments`;
}

/** New registration: choose a plan, enter details, pay the first amount. */
export function PlanCheckout({ slug, plans, providers }: { slug: string; plans: PaymentPlan[]; providers: PaymentProvider[] }) {
  const [planId, setPlanId] = useState(plans[0]?.id);
  const [provider, setProvider] = useState<PaymentProvider>(providers[0]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [start, setStart] = useState<PlanPaymentStart | null>(null);
  const [verified, setVerified] = useState<Verified | null>(null);
  const plan = plans.find((p) => p.id === planId) ?? plans[0];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/plan-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, plan_id: plan.id, provider, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        const fieldError = data && typeof data === "object" ? Object.values(data).flat()[0] : null;
        setError(typeof data.detail === "string" ? data.detail : typeof fieldError === "string" ? fieldError : "Please check your details and try again.");
        return;
      }
      setStart(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (verified) return <PaidNote verified={verified} slug={slug} />;
  if (start) return <PaymentStep start={start} slug={slug} onPaid={setVerified} onCancel={() => setStart(null)} />;

  const firstPayment = plan.installments[0]?.amount ?? plan.total;

  return (
    <form onSubmit={submit} className="space-y-8">
      <fieldset>
        <legend className="eyebrow mb-3 block">Choose your option</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {plans.map((p) => (
            <label key={p.id} className={`cursor-pointer border p-5 transition-colors ${p.id === plan.id ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"}`}>
              <input type="radio" name="plan" value={p.id} checked={p.id === plan.id} onChange={() => setPlanId(p.id)} className="sr-only" />
              <span className="block font-nav text-[10.5px] uppercase tracking-widest2 opacity-80">{p.name}</span>
              <span className="mt-2 block font-display text-3xl">{formatMoney(p.total, p.currency)}</span>
              <span className="mt-1 block text-xs opacity-80">{planSummary(p)}</span>
            </label>
          ))}
        </div>
        {plan.description && <p className="mt-3 text-sm text-gray-600">{plan.description}</p>}
      </fieldset>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow mb-2 block">Full name</span>
          <input required maxLength={150} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-b border-ink bg-transparent py-3 font-body text-sm focus:outline-none" />
        </label>
        <label className="block">
          <span className="eyebrow mb-2 block">Email</span>
          <input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border-b border-ink bg-transparent py-3 font-body text-sm focus:outline-none" />
        </label>
        <label className="block sm:col-span-2">
          <span className="eyebrow mb-2 block">Phone (with country code)</span>
          <input type="tel" autoComplete="tel" maxLength={40} placeholder="+233 …" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border-b border-ink bg-transparent py-3 font-body text-sm focus:outline-none" />
        </label>
      </div>

      <ProviderPicker providers={providers} value={provider} onChange={setProvider} />

      {error && <ErrorNote message={error} />}

      <div className="border-t border-ink/15 pt-6">
        <p className="mb-4 text-sm text-gray-700">
          You pay <strong>{formatMoney(firstPayment, plan.currency)}</strong> today
          {plan.installments.length > 1 && <>, then the remaining installments monthly. We&apos;ll email you a link to pay each one, with reminders before every due date</>}.
        </p>
        <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-50">
          {busy ? "Starting secure payment…" : "Continue to payment"}
        </button>
      </div>
    </form>
  );
}

/** Existing registration: pay the next amount due, or the whole balance. */
export function PayBalance({
  slug, token, providers, amountDueNow, balance, currency,
}: { slug: string; token: string; providers: PaymentProvider[]; amountDueNow: string; balance: string; currency: string }) {
  const [provider, setProvider] = useState<PaymentProvider>(providers[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [start, setStart] = useState<PlanPaymentStart | null>(null);
  const [verified, setVerified] = useState<Verified | null>(null);

  async function begin(payAll: boolean) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/plan-registrations/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, pay_all: payAll }),
      });
      const data = await res.json();
      if (!res.ok) setError(typeof data.detail === "string" ? data.detail : "Payment could not start. Please try again.");
      else setStart(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (verified) return <PaidNote verified={verified} slug={slug} />;
  if (start) return <PaymentStep start={start} slug={slug} onPaid={setVerified} onCancel={() => setStart(null)} />;

  const canPayAll = Number(balance) > Number(amountDueNow);
  return (
    <div className="space-y-6">
      <ProviderPicker providers={providers} value={provider} onChange={setProvider} />
      {error && <ErrorNote message={error} />}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" disabled={busy} onClick={() => begin(false)} className="btn-primary flex-1 disabled:opacity-50">
          Pay {formatMoney(amountDueNow, currency)} now
        </button>
        {canPayAll && (
          <button type="button" disabled={busy} onClick={() => begin(true)} className="btn-outline flex-1 disabled:opacity-50">
            Pay full balance ({formatMoney(balance, currency)})
          </button>
        )}
      </div>
    </div>
  );
}
