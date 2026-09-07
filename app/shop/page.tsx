import Image from "next/image";
import Link from "next/link";
import { backIssues, currentIssue, subscriptionPlans } from "@/data/issues";

export default function ShopPage() {
  return (
    <div>
      <header className="container-editorial border-b border-ink/15 py-12 md:py-16">
        <p className="eyebrow mb-3">Shop the Magazine</p>
        <h1 className="font-display text-5xl sm:text-6xl">The Glitz Africa Store</h1>
        <p className="mt-4 max-w-xl text-sm text-gray-600 md:text-base">
          Single issues and subscriptions, print and digital — shipped across
          Ghana, the continent and internationally.
        </p>
      </header>

      {/* Current issue */}
      <section className="container-editorial grid grid-cols-1 gap-10 py-16 md:grid-cols-2 md:py-20">
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden bg-gray-100 md:mx-0">
          <Image unoptimized src={currentIssue.image} alt={currentIssue.title} fill sizes="(max-width: 768px) 80vw, 40vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="eyebrow mb-3">{currentIssue.issueNumber} &middot; On Sale Now</p>
          <h2 className="font-display text-4xl leading-tight sm:text-5xl">{currentIssue.title}</h2>
          <p className="mt-2 text-sm text-gray-500">{currentIssue.season}</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-600 md:text-base">
            The women redefining power across business and culture, a first look
            at GAFW 2026, and the interviews that opened doors this year.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="btn-primary">Buy Print &mdash; {currentIssue.price}</button>
            <button className="btn-outline" id="digital">Buy Digital &mdash; GHS 25</button>
          </div>
        </div>
      </section>

      {/* Subscriptions */}
      <section id="subscribe" className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <div className="mb-10 text-center">
            <p className="eyebrow mb-2">Subscribe &amp; Save</p>
            <h2 className="font-display text-4xl sm:text-5xl">Never Miss an Issue</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex flex-col border p-8 ${plan.highlight ? "border-ink bg-paper" : "border-ink/20 bg-paper"}`}
              >
                {plan.highlight && (
                  <p className="mb-4 font-nav text-[10px] uppercase tracking-widest2 text-gray-500">
                    Most Popular
                  </p>
                )}
                <h3 className="font-display text-2xl">{plan.name}</h3>
                <p className="mt-4">
                  <span className="font-display text-4xl">{plan.price}</span>
                  <span className="ml-1 text-sm text-gray-500">{plan.cadence}</span>
                </p>
                <ul className="mt-6 flex-1 space-y-3 border-t border-ink/10 pt-6 text-sm text-gray-700">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span aria-hidden>&mdash;</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className={plan.highlight ? "btn-primary mt-8" : "btn-outline mt-8"}>
                  Choose {plan.name}
                </button>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-gray-500">
            Gift a subscription at checkout — schedule delivery for any start date.
          </p>
        </div>
      </section>

      {/* Back issues */}
      <section className="container-editorial py-16 md:py-20">
        <div className="mb-10 flex items-end justify-between border-b border-ink/15 pb-5">
          <div>
            <p className="eyebrow mb-2">Archive</p>
            <h2 className="font-display text-4xl sm:text-5xl">Back Issues</h2>
          </div>
          <Link href="#" className="link-underline hidden font-nav text-[11px] uppercase tracking-widest2 sm:block">
            View Full Archive
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-6">
          {backIssues.map((issue) => (
            <div key={issue.slug}>
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
                <Image unoptimized src={issue.image} alt={issue.title} fill sizes="(max-width: 768px) 45vw, 16vw" className="object-cover" />
                {issue.soldOut && (
                  <div className="absolute inset-x-0 bottom-0 bg-ink py-1.5 text-center font-nav text-[9.5px] uppercase tracking-widest2 text-paper">
                    Print Sold Out &middot; Digital Only
                  </div>
                )}
              </div>
              <p className="mt-3 font-nav text-[10px] uppercase tracking-widest2 text-gray-500">{issue.issueNumber}</p>
              <p className="font-display text-lg leading-snug">{issue.title}</p>
              <p className="mt-1 text-xs text-gray-500">{issue.season}</p>
              <p className="mt-1 font-nav text-xs tracking-wide">{issue.price}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
