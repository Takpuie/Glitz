import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { events } from "@/data/events";

export const metadata: Metadata = {
  title: "Glitz Events",
  description: "Explore Glitz Africa events, programmes and celebrations across fashion, leadership and culture.",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <main>
      <header className="container-editorial border-b border-ink/15 py-12 md:py-16">
        <p className="eyebrow mb-3">Glitz Events</p>
        <h1 className="font-display text-5xl sm:text-6xl">Events &amp; Gatherings</h1>
        <p className="mt-4 max-w-2xl text-sm text-gray-600 md:text-base">
          From runway showcases and leadership summits to honours and community programmes,
          Glitz Africa brings together the people, brands and ideas shaping African culture and business.
        </p>
      </header>

      <section className="container-editorial py-16 md:py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <article key={event.slug} className="group overflow-hidden border border-ink/15 bg-paper">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                <Image
                  unoptimized
                  src={event.image}
                  alt={event.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="space-y-4 p-6">
                <p className="font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">{event.status}</p>
                <h2 className="font-display text-3xl leading-tight">{event.name}</h2>
                <p className="text-sm text-gray-600">{event.tagline}</p>
                <dl className="space-y-2 text-sm text-gray-600">
                  <div>
                    <dt className="sr-only">Dates</dt>
                    <dd>{event.dates}</dd>
                  </div>
                  <div>
                    <dt className="sr-only">Venue</dt>
                    <dd>{event.venue}</dd>
                  </div>
                </dl>
                <p className="text-sm leading-relaxed text-gray-700">{event.description}</p>
                <div className="flex gap-3 pt-2">
                  <Link href={`/events/${event.slug}`} className="btn-primary">View Event</Link>
                  <Link href="/events/archive" className="btn-outline">Archive</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <div className="max-w-2xl border border-ink/15 bg-paper p-8 sm:p-12">
            <p className="eyebrow mb-3">Past Editions</p>
            <h2 className="font-display text-3xl sm:text-4xl">Explore the full archive</h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
              Revisit previous Glitz Africa showcases, honours and leadership programmes, including
              winners, galleries and key moments from each edition.
            </p>
            <Link href="/events/archive" className="btn-primary mt-8 inline-flex">
              View the Events Archive
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
