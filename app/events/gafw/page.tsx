import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { gafwGallery, gafwProgramme, getEvent } from "@/data/events";
import { getBackendEvent } from "@/lib/backend";
import TicketSelector from "./TicketSelector";

const sponsors = ["MTN", "Kempinski", "Vodafone", "Absa", "Fidelity Bank", "Delta Air Lines"];

const STATUS_LABELS: Record<string, string> = {
  on_sale: "On sale",
  applications_open: "Applications open",
  save_the_date: "Save the date",
  archived: "Archived",
};

function formatDateRange(start: string, end: string | null) {
  const startDate = new Date(`${start}T00:00:00Z`);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" };
  if (!end || end === start) return startDate.toLocaleDateString("en-GB", opts);
  const endDate = new Date(`${end}T00:00:00Z`);
  const startDay = startDate.getUTCDate();
  const endLabel = endDate.toLocaleDateString("en-GB", opts);
  return `${startDay}–${endLabel}`;
}

function daysUntil(dateStr: string) {
  const target = new Date(`${dateStr}T00:00:00Z`).getTime();
  const now = Date.now();
  return Math.max(Math.ceil((target - now) / (1000 * 60 * 60 * 24)), 0);
}

export default async function GafwPage() {
  const event = await getBackendEvent("gafw");
  if (!event) return notFound();

  // Placeholder fallback (editorial copy not yet in the backend for these).
  const staticFallback = getEvent("gafw")!;

  return (
    <div>
      {/* Hero */}
      <section className="container-editorial grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-20">
        <div>
          <p className="eyebrow mb-4">
            {STATUS_LABELS[event.status] ?? event.status} &middot; {formatDateRange(event.start_date, event.end_date)}{" "}
            &middot; {event.venue}
          </p>
          <h1 className="font-display text-5xl leading-[1.03] sm:text-6xl">{event.name}</h1>
          <p className="mt-5 max-w-md text-base text-gray-600">{event.description}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#tickets" className="btn-primary">Get Tickets</a>
            <a href="#apply" className="btn-outline">Apply: Young Designers</a>
          </div>
        </div>
        <div className="photo-card relative aspect-[4/3] w-full bg-gray-200">
          <Image
            unoptimized
            src={event.cover_image?.full_url ?? staticFallback.image}
            alt={event.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </section>

      {/* Countdown-style stats strip */}
      <section className="hairline">
        <div className="container-editorial grid grid-cols-2 divide-x divide-ink/15 border-x border-ink/15 md:grid-cols-4">
          {[
            { label: "Days", value: String(daysUntil(event.start_date)) },
            { label: "Designers", value: "20+" },
            { label: "Runway Shows", value: "4" },
            { label: "Trade Tents", value: "35" },
          ].map((s) => (
            <div key={s.label} className="px-4 py-8 text-center">
              <p className="font-display text-4xl sm:text-5xl">{s.value}</p>
              <p className="eyebrow mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Programme */}
      <section className="container-editorial py-16 md:py-20">
        <div className="mb-10 border-b border-ink/15 pb-5 md:mb-12">
          <p className="eyebrow mb-2">Schedule</p>
          <h2 className="font-display text-4xl sm:text-5xl">The Programme</h2>
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-4">
          {gafwProgramme.map((day) => (
            <div key={day.day}>
              <p className="font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">{day.date}</p>
              <h3 className="mt-2 font-display text-2xl">{day.day}</h3>
              <p className="mt-1 text-sm italic text-gray-600">{day.theme}</p>
              <ul className="mt-5 space-y-4 border-t border-ink/10 pt-5">
                {day.items.map((item) => (
                  <li key={item.title} className="flex gap-4 text-sm">
                    <span className="w-12 shrink-0 font-nav text-[11px] tracking-wide text-gray-500">{item.time}</span>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Tickets */}
      <section id="tickets" className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <div className="mb-10 border-b border-ink/15 pb-5 md:mb-12">
            <p className="eyebrow mb-2">Ticketing</p>
            <h2 className="font-display text-4xl sm:text-5xl">Choose Your Access</h2>
          </div>
          <TicketSelector slug={event.slug} ticketTypes={event.ticket_types} />
        </div>
      </section>

      {/* Applications */}
      <section id="apply" className="container-editorial py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <p className="eyebrow mb-3">Open Call</p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              Young Designers Showcase
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-600 md:text-base">
              GAFW's showcase gives emerging designers from across Africa and the
              diaspora a mainstage runway slot. Applications are judged on
              creativity, sustainability, craftsmanship and market potential.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-ink/15 pt-6 text-sm">
              <div>
                <dt className="eyebrow mb-1">Deadline</dt>
                <dd>30 September 2026</dd>
              </div>
              <div>
                <dt className="eyebrow mb-1">Eligibility</dt>
                <dd>Designers under 5 years in business</dd>
              </div>
            </dl>
            <Link href="/nominate" className="btn-primary mt-8 inline-flex">Start Application</Link>
          </div>
          <div className="photo-card relative aspect-[4/5] w-full bg-gray-100">
            <Image unoptimized src="/images/gafw/accessory-beaded-backpack.jpg" alt="Beaded backpack, GAFW runway" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <div className="mb-10 border-b border-ink/15 pb-5 md:mb-12">
            <p className="eyebrow mb-2">On the Runway</p>
            <h2 className="font-display text-4xl sm:text-5xl">From GAFW</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-5">
            {gafwGallery.map((g) => (
              <div key={g.src}>
                <div className="photo-card relative aspect-[3/4] w-full bg-gray-200">
                  <Image unoptimized src={g.src} alt={g.caption} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover" />
                </div>
                <p className="mt-3 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">{g.caption}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors */}
      <section className="hairline">
        <div className="container-editorial py-14 md:py-16">
          <p className="eyebrow mb-8 text-center">2026 Partners</p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {sponsors.map((s) => (
              <span key={s} className="font-display text-xl text-gray-400 sm:text-2xl">{s}</span>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Link href="/partners" className="btn-outline">Download Partnership Brief</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
