import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events Archive",
  description: "Explore past Glitz Africa events celebrating fashion, culture, business and achievement.",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <main>
      <header className="container-editorial border-b border-ink/15 py-12 md:py-16">
        <p className="eyebrow mb-3">Glitz Events</p>
        <h1 className="font-display text-5xl sm:text-6xl">Events Archive</h1>
        <p className="mt-4 max-w-xl text-sm text-gray-600 md:text-base">
          Revisit past Glitz Africa events, including winners, galleries and coverage from previous editions.
        </p>
      </header>

      <section className="container-editorial py-16 md:py-20">
        <div className="max-w-2xl border border-ink/15 bg-smoke p-8 sm:p-12">
          <p className="eyebrow mb-3">Past Editions</p>
          <h2 className="font-display text-3xl sm:text-4xl">Explore the full archive</h2>
          <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
            Browse highlights and stories from Glitz Africa&apos;s previous programmes and celebrations.
          </p>
          <Link href="/events/archive" className="btn-primary mt-8 inline-flex">
            View the Events Archive
          </Link>
        </div>
      </section>
    </main>
  );
}
