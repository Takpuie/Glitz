import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { events } from "@/data/events";
import { getBackendEvents, type BackendEvent } from "@/lib/backend";
import { editorialImage } from "@/lib/img";

export const metadata: Metadata = {
  title: "Events",
  description: "Discover Glitz Africa events celebrating fashion, culture, business and achievement.",
  alternates: { canonical: "/events" },
};

const STATUS_LABELS: Record<string, string> = {
  on_sale: "On sale",
  applications_open: "Applications open",
  save_the_date: "Save the date",
  archived: "Archived",
};

function formatDate(start: string, end: string | null) {
  const startDate = new Date(`${start}T00:00:00Z`);
  const formatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  if (!end || end === start) return formatter.format(startDate);
  return `${formatter.format(startDate)} - ${formatter.format(new Date(`${end}T00:00:00Z`))}`;
}

export default async function EventsPage() {
  let backendEvents: BackendEvent[] = [];
  try { backendEvents = await getBackendEvents(); } catch { /* Use the local event catalogue below. */ }
  const eventList = backendEvents.length ? backendEvents.map((backend) => {
    const fallback = events.find((event) => event.slug === backend.slug);
    return {
      ...fallback,
      ...backend,
      dates: formatDate(backend.start_date, backend.end_date),
      statusLabel: STATUS_LABELS[backend.status] ?? backend.status,
      image: backend.cover_image?.full_url ?? fallback?.image ?? editorialImage(backend.slug, 1600, 1000),
    };
  }) : events.map((event) => ({ ...event, statusLabel: event.status, image: event.image }));

  return (
    <div>
      <header className="container-editorial border-b border-ink/15 py-12 md:py-16">
        <p className="eyebrow mb-3">The Calendar</p>
        <h1 className="font-display text-5xl sm:text-6xl">Events</h1>
        <p className="mt-4 max-w-xl text-sm text-gray-600 md:text-base">
          Explore Glitz events, from upcoming gatherings to past editions
          celebrating fashion, culture, business and achievement.
        </p>
      </header>

      <div>
        {eventList.map((event, i) => (
          <Link
            key={event.slug}
            href={`/events/${event.slug}`}
            className="group block border-b border-ink/15"
          >
            <div className="container-editorial grid grid-cols-1 items-center gap-8 py-10 md:grid-cols-[220px_1fr_auto] md:gap-12 md:py-12">
              <div className="photo-card relative aspect-[4/3] w-full bg-gray-100 md:aspect-square">
                <Image
                  unoptimized
                  src={event.image}
                  alt={event.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 220px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div>
                <p className="font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">
                  {String(i + 1).padStart(2, "0")} &middot; {event.statusLabel}
                </p>
                <h2 className="mt-3 font-display text-3xl leading-tight group-hover:underline underline-offset-4 sm:text-4xl">
                  {event.name}
                </h2>
                <p className="mt-2 max-w-md text-sm text-gray-600">{event.tagline}</p>
              </div>
              <div className="font-nav text-[11px] uppercase tracking-widest2 text-gray-700 md:text-right">
                <p>{event.dates}</p>
                <p className="mt-1 text-gray-500">{event.venue}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="container-editorial flex flex-col items-start justify-between gap-4 py-12 sm:flex-row sm:items-center">
        <p className="text-sm text-gray-600">
          Looking for coverage of a past edition — winners, galleries, press?
        </p>
        <Link href="/events/archive" className="btn-outline">View the Full Archive</Link>
      </div>
    </div>
  );
}
