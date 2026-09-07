import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { events, getEvent } from "@/data/events";

export function generateStaticParams() {
  return events.filter((e) => e.slug !== "gafw").map((e) => ({ slug: e.slug }));
}

export default function EventEditionPage({ params }: { params: { slug: string } }) {
  const event = getEvent(params.slug);
  if (!event) return notFound();

  return (
    <div>
      <section className="container-editorial grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-20">
        <div>
          <p className="eyebrow mb-4">
            {event.status} &middot; {event.dates} &middot; {event.venue}
          </p>
          <h1 className="font-display text-5xl leading-[1.03] sm:text-6xl">{event.name}</h1>
          <p className="mt-5 max-w-md text-base text-gray-600">{event.tagline}</p>
        </div>
        <div className="photo-card relative aspect-[4/3] w-full bg-gray-200">
          <Image unoptimized src={event.image} alt={event.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
      </section>

      <section className="container-editorial py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_320px]">
          <div className="max-w-2xl">
            <p className="eyebrow mb-3">About This Edition</p>
            <p className="font-display text-2xl leading-relaxed text-gray-800 sm:text-3xl">
              {event.description}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {event.status === "Applications open" ? (
                <Link href="/nominate" className="btn-primary">Apply / Nominate</Link>
              ) : (
                <button className="btn-primary">Register Interest</button>
              )}
              <Link href="/partners" className="btn-outline">Become a Sponsor</Link>
            </div>
          </div>

          <aside className="space-y-6 border-t border-ink/15 pt-8 md:border-l md:border-t-0 md:pl-10 md:pt-0">
            <div>
              <p className="eyebrow mb-1">Dates</p>
              <p className="text-sm">{event.dates}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Venue</p>
              <p className="text-sm">{event.venue}</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Status</p>
              <p className="text-sm">{event.status}</p>
            </div>
            <div className="pt-4">
              <Link href="/events" className="link-underline font-nav text-[11px] uppercase tracking-widest2">
                &larr; Back to All Events
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {event.gallery && (
        <section className="hairline bg-smoke">
          <div className="container-editorial py-16 md:py-20">
            <div className="mb-10 border-b border-ink/15 pb-5 md:mb-12">
              <p className="eyebrow mb-2">In Pictures</p>
              <h2 className="font-display text-4xl sm:text-5xl">From {event.shortName}</h2>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
              {event.gallery.map((g) => (
                <div key={g.src}>
                  <div className="photo-card relative aspect-[4/3] w-full bg-gray-200">
                    <Image unoptimized src={g.src} alt={g.caption} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{g.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
