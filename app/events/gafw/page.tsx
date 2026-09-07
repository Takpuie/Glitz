import Image from "next/image";
import Link from "next/link";
import { gafwProgramme, gafwTickets, getEvent } from "@/data/events";
import { editorialImage } from "@/lib/img";

const sponsors = ["MTN", "Kempinski", "Vodafone", "Absa", "Fidelity Bank", "Delta Air Lines"];

export default function GafwPage() {
  const event = getEvent("gafw")!;

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[520px] w-full overflow-hidden bg-ink">
        <Image unoptimized src={event.image} alt={event.name} fill priority sizes="100vw" className="object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />
        <div className="container-editorial absolute inset-x-0 bottom-0 pb-12">
          <p className="font-nav text-[11px] uppercase tracking-widest2 text-gray-300">
            {event.status} &middot; {event.dates} &middot; {event.venue}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-5xl leading-[1.02] text-paper sm:text-6xl md:text-7xl">
            {event.name}
          </h1>
          <p className="mt-5 max-w-lg text-sm text-gray-200 md:text-base">{event.description}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#tickets" className="inline-flex items-center justify-center gap-2 bg-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-ink transition-colors hover:bg-gray-200">
              Get Tickets
            </a>
            <a href="#apply" className="inline-flex items-center justify-center gap-2 border border-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-paper transition-colors hover:bg-paper hover:text-ink">
              Apply: Young Designers
            </a>
          </div>
        </div>
      </section>

      {/* Countdown-style stats strip */}
      <section className="hairline">
        <div className="container-editorial grid grid-cols-2 divide-x divide-ink/15 border-x border-ink/15 md:grid-cols-4">
          {[
            { label: "Days", value: "64" },
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
          <div className="divide-y divide-ink/15 border-y border-ink/15">
            {gafwTickets.map((t) => (
              <div key={t.tier} className="flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-display text-xl">{t.tier}</h3>
                  <p className="mt-1 max-w-md text-sm text-gray-600">{t.detail}</p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-nav text-sm tracking-wide">{t.price}</span>
                  <button className="btn-outline">Select</button>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-xs text-gray-500">
            QR e-tickets issued instantly on purchase. Refunds and transfers available up to 7 days
            before each date, per event policy.
          </p>
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
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
            <Image unoptimized src={editorialImage("gafw-young-designers", 1000, 1300)} alt="Young Designers Showcase" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
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
