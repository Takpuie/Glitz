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
      <section className="relative h-[60vh] min-h-[440px] w-full overflow-hidden bg-ink">
        <Image unoptimized src={event.image} alt={event.name} fill priority sizes="100vw" className="object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
        <div className="container-editorial absolute inset-x-0 bottom-0 pb-12">
          <p className="font-nav text-[11px] uppercase tracking-widest2 text-gray-300">
            {event.status} &middot; {event.dates} &middot; {event.venue}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.02] text-paper sm:text-6xl">
            {event.name}
          </h1>
          <p className="mt-5 max-w-lg text-sm text-gray-200 md:text-base">{event.tagline}</p>
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
    </div>
  );
}
