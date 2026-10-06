import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBackendEvent, type BackendEvent } from "@/lib/backend";
import { events, getEvent } from "@/data/events";
import { editorialImage } from "@/lib/img";
import EnquiryForm from "@/components/EnquiryForm";

const STATUS_LABELS: Record<string, string> = {
  on_sale: "On sale",
  applications_open: "Applications open",
  save_the_date: "Save the date",
  archived: "Archived",
};

export async function generateStaticParams() {
  return events.filter((e) => e.slug !== "gafw").map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let backendEvent: BackendEvent | undefined;
  try { backendEvent = await getBackendEvent(params.slug); } catch { /* Use local event metadata. */ }
  const fallback = getEvent(params.slug);
  const event = backendEvent ?? fallback;
  if (!event) return { title: "Event not found", robots: { index: false, follow: false } };
  const title = "name" in event ? event.name : params.slug;
  const description = event.tagline || event.description;
  const image = backendEvent?.cover_image?.full_url ?? fallback?.image;
  const canonical = `/events/${params.slug}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title, description, images: image ? [{ url: image, alt: title }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function EventEditionPage({ params }: { params: { slug: string } }) {
  let backendEvent: BackendEvent | undefined;
  try { backendEvent = await getBackendEvent(params.slug); } catch { /* Render the matching local event below. */ }
  const fallbackEvent = getEvent(params.slug);
  const event = backendEvent ? {
    name: backendEvent.name,
    shortName: fallbackEvent?.shortName ?? backendEvent.name,
    tagline: backendEvent.tagline,
    description: backendEvent.description,
    venue: backendEvent.venue,
    status: STATUS_LABELS[backendEvent.status] ?? backendEvent.status,
    dates: `${backendEvent.start_date}${backendEvent.end_date ? ` - ${backendEvent.end_date}` : ""}`,
    image: backendEvent.cover_image?.full_url ?? fallbackEvent?.image ?? editorialImage(backendEvent.slug, 1600, 1000),
    gallery: fallbackEvent?.gallery,
  } : fallbackEvent;
  if (!event) return notFound();

  const statusLabel = event.status;
  const eventDate = event.dates;
  const eventImage = event.image;

  return (
    <div>
      <section className="container-editorial grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-20">
        <div>
          <p className="eyebrow mb-4">
            {statusLabel} &middot; {eventDate} &middot; {backendEvent?.venue ?? event.venue}
          </p>
          <h1 className="font-display text-5xl leading-[1.03] sm:text-6xl">{backendEvent?.name ?? event.name}</h1>
          <p className="mt-5 max-w-md text-base text-gray-600">{backendEvent?.tagline ?? event.tagline}</p>
        </div>
        <div className="photo-card relative aspect-[4/3] w-full bg-gray-200">
          <Image unoptimized src={eventImage} alt={backendEvent?.name ?? event.name} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
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
                <a href="#register-interest" className="btn-primary">Register Interest</a>
              )}
              <Link href="/partners#enquire" className="btn-outline">Become a Sponsor</Link>
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

      <section id="register-interest" className="hairline scroll-mt-40">
        <div className="container-editorial max-w-2xl py-16">
          <h2 className="mb-8 font-display text-3xl">Register your interest</h2>
          {backendEvent ? <EnquiryForm kind="event" event={{ slug: params.slug, name: event.name }} /> : <Link href="/contact" className="btn-outline">Contact us about this event</Link>}
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
