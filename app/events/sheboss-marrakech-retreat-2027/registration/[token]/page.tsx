import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PayBalance } from "@/components/PlanPayment";
import { formatMoney } from "@/lib/money";
import { getPlanRegistration } from "@/lib/backend";
import { SHEBOSS_EMAIL, SHEBOSS_PHONES, retreat, telHref } from "@/data/sheboss";

// Private page: the token in the URL is the only key. Never cached/indexed.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your Registration",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

const STATUS_COPY: Record<string, string> = {
  pending: "Awaiting first payment",
  active: "Paying in installments",
  complete: "Paid in full",
  cancelled: "Cancelled",
};

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function RegistrationPage({ params }: { params: { token: string } }) {
  let registration;
  try {
    registration = await getPlanRegistration(params.token);
  } catch {
    return (
      <div className="container-editorial max-w-2xl py-20 text-center">
        <h1 className="font-display text-4xl">We couldn&apos;t load your registration.</h1>
        <p className="mt-4 text-sm text-gray-600">Please refresh in a moment, or contact {SHEBOSS_EMAIL}.</p>
      </div>
    );
  }
  if (!registration || registration.event.slug !== retreat.slug) return notFound();

  const { plan } = registration;
  const owing = Number(registration.balance) > 0;
  const canPay = owing && registration.status !== "cancelled" && registration.providers.length > 0;

  return (
    <div className="container-editorial max-w-3xl py-14 md:py-20">
      <p className="eyebrow mb-3">{registration.event.name}</p>
      <h1 className="font-display text-4xl sm:text-5xl">Hello, {registration.name.split(" ")[0]}.</h1>
      <p className="mt-3 font-nav text-[11px] uppercase tracking-widest2 text-gray-600">
        {plan.name} &middot; {STATUS_COPY[registration.status] ?? registration.status}
      </p>

      <dl className="mt-10 grid grid-cols-3 gap-px border border-ink/15 bg-ink/15 text-center">
        <div className="bg-paper p-5"><dt className="eyebrow">Total</dt><dd className="mt-2 font-display text-2xl sm:text-3xl">{formatMoney(plan.total, plan.currency)}</dd></div>
        <div className="bg-paper p-5"><dt className="eyebrow">Paid</dt><dd className="mt-2 font-display text-2xl sm:text-3xl">{formatMoney(registration.amount_paid, plan.currency)}</dd></div>
        <div className="bg-paper p-5"><dt className="eyebrow">Balance</dt><dd className="mt-2 font-display text-2xl sm:text-3xl">{formatMoney(registration.balance, plan.currency)}</dd></div>
      </dl>

      <h2 className="mt-12 font-display text-3xl">Payment schedule</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[440px] border border-ink/15 text-left text-sm">
          <thead className="bg-ink text-paper">
            <tr>
              <th scope="col" className="px-5 py-3 font-nav text-[11px] uppercase tracking-widest2">Payment</th>
              <th scope="col" className="px-5 py-3 font-nav text-[11px] uppercase tracking-widest2">Amount</th>
              <th scope="col" className="px-5 py-3 font-nav text-[11px] uppercase tracking-widest2">Due</th>
              <th scope="col" className="px-5 py-3 font-nav text-[11px] uppercase tracking-widest2">Status</th>
            </tr>
          </thead>
          <tbody>
            {registration.schedule.map((row) => (
              <tr key={row.label} className="border-t border-ink/15">
                <td className="px-5 py-4">{row.label}</td>
                <td className="px-5 py-4 font-semibold">{formatMoney(row.amount, plan.currency)}</td>
                <td className="px-5 py-4">{formatDate(row.due_date)}</td>
                <td className="px-5 py-4">
                  <span className={`inline-block px-2 py-1 font-nav text-[10px] uppercase tracking-widest ${row.paid ? "bg-ink text-paper" : row.overdue ? "bg-red-700 text-paper" : "border border-ink/30"}`}>
                    {row.paid ? "Paid" : row.overdue ? "Overdue" : "Upcoming"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-12 border-t border-ink/15 pt-10">
        {registration.status === "complete" ? (
          <>
            <h2 className="font-display text-3xl">You&apos;re all set.</h2>
            <p className="mt-3 text-sm text-gray-600">
              Your registration is paid in full. Detailed retreat locations, the itinerary and the dress-code lookbook will be
              shared with you by email. Flights and accommodation are not included.
            </p>
          </>
        ) : canPay ? (
          <>
            <h2 className="font-display text-3xl">Make a payment</h2>
            <p className="mb-6 mt-3 text-sm text-gray-600">
              {Number(registration.amount_due_now) < Number(registration.balance)
                ? "Pay your next installment now, or clear the full balance in one go."
                : "Pay your remaining balance."}
            </p>
            <PayBalance
              slug={registration.event.slug}
              token={params.token}
              providers={registration.providers}
              amountDueNow={registration.amount_due_now}
              balance={registration.balance}
              currency={plan.currency}
            />
          </>
        ) : (
          <p className="text-sm text-gray-600">
            {registration.status === "cancelled"
              ? "This registration has been cancelled."
              : "Online payment is temporarily unavailable."} Please contact the team to arrange payment.
          </p>
        )}
      </section>

      <section className="mt-12 bg-smoke p-6 text-sm text-gray-700">
        <p className="eyebrow mb-2">Questions?</p>
        <p>
          Email <a href={`mailto:${SHEBOSS_EMAIL}`} className="link-underline">{SHEBOSS_EMAIL}</a> or call{" "}
          {SHEBOSS_PHONES.map((phone, i) => (
            <span key={phone}>{i > 0 && " / "}<a href={telHref(phone)} className="link-underline">{phone}</a></span>
          ))}.
        </p>
        <p className="mt-3 text-xs text-gray-500">Keep this link private: anyone with it can view this schedule and make payments.</p>
      </section>

      <Link href={`/events/${retreat.slug}`} className="link-underline mt-10 inline-block font-nav text-[11px] uppercase tracking-widest2">
        &larr; Back to the retreat
      </Link>
    </div>
  );
}
