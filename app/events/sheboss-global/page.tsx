import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import InitiativeMedia from "@/components/InitiativeMedia";
import {
  SHEBOSS_EMAIL,
  dohaGallery,
  dohaSummary2026,
  retreat,
  shebossCalendar2027,
  shebossConvener,
  shebossImages,
  shebossImpact,
  shebossObjectives,
  shebossOverview,
  shebossTargetAudience,
  shebossUkSummary2026,
} from "@/data/sheboss";

const description =
  "SheBoss Global is a Glitz Africa initiative bringing together women executives, professionals and entrepreneurs to network, share ideas and grow. See the 2027 calendar.";

export const metadata: Metadata = {
  title: "SheBoss Global",
  description,
  alternates: { canonical: "/events/sheboss-global" },
  openGraph: {
    type: "website",
    url: "/events/sheboss-global",
    title: "SheBoss Global 2027",
    description,
    images: [{ url: shebossImages.hero, alt: "SheBoss Global retreat guests dressed in white" }],
  },
  twitter: { card: "summary_large_image", title: "SheBoss Global 2027", description, images: [shebossImages.hero] },
};

function SectionHead({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 border-b border-ink/15 pb-5 md:mb-12">
      <p className="eyebrow mb-2">{eyebrow}</p>
      <h2 className="font-display text-4xl sm:text-5xl">{title}</h2>
    </div>
  );
}

export default function SheBossGlobalPage() {
  return (
    <div>
      {/* Cover */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <Image unoptimized src={shebossImages.hero} alt="SheBoss Global retreat guests dressed in white" fill priority sizes="100vw" className="-z-10 object-cover object-[center_22%] opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        <div className="container-editorial flex min-h-[min(70vh,640px)] flex-col justify-end py-14 md:min-h-[min(78vh,760px)] md:py-20">
          <p className="font-nav text-[11px] uppercase tracking-widest2 text-paper/80">A Glitz Africa Initiative</p>
          <h1 className="mt-4 font-display text-6xl leading-[0.95] sm:text-7xl lg:text-8xl">
            SheBoss Global
            <span className="block italic text-[#d4af37]">2027</span>
          </h1>
          <p className="mt-6 max-w-lg text-base text-paper/85 md:text-lg">A line-up of activities across Africa, Europe and North America.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#calendar" className="inline-flex items-center justify-center rounded-sm bg-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-ink transition-colors hover:bg-gray-200">2027 Calendar</a>
            <Link href={`/events/${retreat.slug}`} className="inline-flex items-center justify-center rounded-sm border border-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-paper transition-colors hover:bg-paper hover:text-ink">Marrakech Retreat</Link>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="container-editorial grid grid-cols-1 gap-12 py-16 md:grid-cols-[1.2fr_1fr] md:gap-16 md:py-24">
        <div>
          <p className="eyebrow mb-2">Overview</p>
          <h2 className="font-display text-4xl sm:text-5xl">About SheBoss</h2>
          <div className="mt-8 space-y-6">
            <p className="font-display text-2xl leading-relaxed text-gray-900 sm:text-[1.7rem]">{shebossOverview[0]}</p>
            {shebossOverview.slice(1).map((p) => (
              <p key={p} className="text-[17px] leading-relaxed text-gray-700">{p}</p>
            ))}
          </div>
        </div>
        <div className="photo-card relative aspect-[4/5] w-full bg-gray-200">
          <Image unoptimized src={shebossImages.overview} alt="A speaker at the SheBoss Global podium" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover object-[center_22%]" />
        </div>
      </section>

      {/* Objectives */}
      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <SectionHead eyebrow="Why We Gather" title="Objectives" />
          <ol className="grid grid-cols-1 gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-5">
            {shebossObjectives.map((objective, i) => (
              <li key={objective} className="bg-smoke p-6 lg:p-7">
                <span className="font-display text-4xl text-[#a88418]">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-4 text-[15px] leading-relaxed text-gray-800">{objective}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Impact */}
      <section className="container-editorial grid grid-cols-1 gap-12 py-16 md:grid-cols-[1fr_1.4fr] md:gap-16 md:py-24">
        <div className="photo-card relative aspect-[4/5] w-full bg-gray-200">
          <Image unoptimized src={shebossImages.impact} alt="A SheBoss delegate at the retreat" fill sizes="(max-width: 768px) 100vw, 35vw" className="object-cover object-[center_22%]" />
        </div>
        <div className="flex flex-col justify-center">
          <p className="eyebrow mb-2">The SheBoss Impact Globally</p>
          <h2 className="font-display text-4xl sm:text-5xl">A decade of women in the room</h2>
          <dl className="mt-10 divide-y divide-ink/15 border-y border-ink/15">
            {shebossImpact.map((item) => (
              <div key={item.figure} className="grid grid-cols-1 gap-2 py-6 sm:grid-cols-[180px_1fr] sm:gap-8">
                <dt className="font-display text-4xl">{item.figure}</dt>
                <dd className="text-[15px] leading-relaxed text-gray-700 sm:pt-2">{item.copy}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Optional brief sections */}
      {(shebossTargetAudience.length > 0 || shebossConvener) && (
        <section className="hairline">
          <div className="container-editorial grid grid-cols-1 gap-16 py-16 md:grid-cols-2 md:py-20">
            {shebossTargetAudience.length > 0 && (
              <div>
                <SectionHead eyebrow="Who It's For" title="Target Audience" />
                <ul className="space-y-3 text-[17px] leading-relaxed text-gray-800">
                  {shebossTargetAudience.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            )}
            {shebossConvener && (
              <div>
                <SectionHead eyebrow="The Convener" title={shebossConvener.name} />
                <p className="font-nav text-[11px] uppercase tracking-widest2 text-gray-500">{shebossConvener.role}</p>
                <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-gray-800">
                  {shebossConvener.bio.map((p) => <p key={p}>{p}</p>)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Calendar */}
      <section id="calendar" className="hairline scroll-mt-32 bg-ink text-paper">
        <div className="container-editorial py-16 md:py-20">
          <div className="mb-10 border-b border-paper/20 pb-5 md:mb-12">
            <p className="font-nav text-[11px] uppercase tracking-widest2 text-paper/70">Annual Calendar Summary</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">SheBoss Global 2027</h2>
          </div>
          <ol className="grid grid-cols-1 gap-px bg-paper/20 sm:grid-cols-2 lg:grid-cols-3">
            {shebossCalendar2027.map((edition) => {
              const inner = (
                <>
                  <p className="font-nav text-[11px] uppercase tracking-widest2 text-[#d4af37]">{edition.month}</p>
                  <h3 className="mt-3 font-display text-3xl">{edition.title}</h3>
                  {edition.location && <p className="mt-1 text-sm text-paper/70">{edition.location}</p>}
                  <p className="mt-6 font-nav text-[10.5px] uppercase tracking-widest2 text-paper/60">
                    {edition.status}{edition.href && <span className="ml-2 text-paper">&rarr;</span>}
                  </p>
                </>
              );
              return (
                <li key={edition.title} className="bg-ink">
                  {edition.href ? (
                    <Link href={edition.href} className="block h-full p-7 transition-colors hover:bg-gray-900">{inner}</Link>
                  ) : (
                    <div className="h-full p-7">{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Retreat feature */}
      <section className="container-editorial grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-24">
        <div className="photo-card relative aspect-[3/2] w-full bg-gray-200">
          <Image unoptimized src={shebossImages.retreatFeature} alt="Retreat guests in white on the promenade" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-[center_22%]" />
        </div>
        <div>
          <p className="eyebrow mb-2">The SheBoss Global Retreat &middot; February 2027</p>
          <h2 className="font-display text-4xl sm:text-5xl">Marrakech Retreat 2027</h2>
          <p className="mt-3 font-nav text-[11px] uppercase tracking-widest2 text-gray-700">{retreat.dates} &nbsp;|&nbsp; {retreat.location}</p>
          <p className="mt-6 font-display text-2xl italic leading-snug text-gray-800">{retreat.tagline}</p>
          <p className="mt-4 text-[15px] leading-relaxed text-gray-700">
            A two-day conference, four curated luxury dinners, a closing gala in the Agafay Desert, spa and wellness,
            and cultural visits to Jardin Majorelle and the Musée Yves Saint Laurent.
          </p>
          <Link href={`/events/${retreat.slug}`} className="btn-primary mt-8">View Retreat &amp; Register</Link>
        </div>
      </section>

      {/* Doha 2026 */}
      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <SectionHead eyebrow="Executive Summary 2026" title="SheBoss Global Doha Retreat" />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_280px] md:gap-16">
            <div className="space-y-6">
              <p className="font-display text-2xl leading-relaxed text-gray-900">{dohaSummary2026[0]}</p>
              {dohaSummary2026.slice(1).map((p) => (
                <p key={p} className="text-[17px] leading-relaxed text-gray-700">{p}</p>
              ))}
            </div>
            <dl className="space-y-6 border-t border-ink/15 pt-6 md:border-l md:border-t-0 md:pl-10 md:pt-0">
              <div><dt className="eyebrow mb-1">Dates</dt><dd className="text-sm">10–15 February 2026</dd></div>
              <div><dt className="eyebrow mb-1">Venue</dt><dd className="text-sm">Marsa Malaz Kempinski, The Pearl, Doha</dd></div>
              <div><dt className="eyebrow mb-1">Partner</dt><dd className="text-sm">Qatari Businesswomen Association (QBWA)</dd></div>
            </dl>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-editorial py-16 md:py-20">
        <SectionHead eyebrow="SheBoss Global Retreat Gallery" title="Doha, in Pictures" />
        <div className="grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {dohaGallery.map((photo) => (
            <figure key={photo.src} className={`relative overflow-hidden rounded-md bg-gray-200 ${photo.wide ? "col-span-2 aspect-[3/2]" : "aspect-[2/3]"}`}>
              <Image unoptimized src={photo.src} alt={photo.alt} fill sizes={photo.wide ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"} className="object-cover object-[center_22%] transition-transform duration-700 hover:scale-105" />
            </figure>
          ))}
        </div>
      </section>

      {/* UK + further editions */}
      <section className="hairline">
        <div className="container-editorial py-16 md:py-20">
          <SectionHead eyebrow="Around the World" title="SheBoss Editions" />
          {shebossUkSummary2026.length > 0 && (
            <div className="mb-12 max-w-3xl space-y-4">
              <p className="eyebrow">SheBoss UK &middot; Executive Summary 2026</p>
              {shebossUkSummary2026.map((p) => <p key={p} className="text-[17px] leading-relaxed text-gray-700">{p}</p>)}
            </div>
          )}
          <div className="grid grid-cols-1 gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-5">
            {shebossCalendar2027.slice(1).map((edition) => (
              <div key={edition.title} className="bg-paper p-6">
                <p className="font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">{edition.month}</p>
                <h3 className="mt-2 font-display text-2xl">{edition.title}</h3>
                <p className="mt-3 text-sm text-gray-600">Dates and venue to be announced.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CMS galleries, if staff tag photos to these editions in Wagtail */}
      <InitiativeMedia slug="sheboss-global" />

      {/* Sponsorship */}
      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 text-center md:py-24">
          <p className="eyebrow mb-3">For Sponsorships &amp; Partnerships</p>
          <h2 className="mx-auto max-w-2xl font-display text-4xl sm:text-5xl">Partner with SheBoss Global</h2>
          <a href={`mailto:${SHEBOSS_EMAIL}`} className="link-underline mt-6 inline-block font-display text-2xl">{SHEBOSS_EMAIL}</a>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href={`mailto:${SHEBOSS_EMAIL}?subject=${encodeURIComponent("SheBoss Global sponsorship")}`} className="btn-primary">Email the Team</a>
            <Link href="/partners#enquire" className="btn-outline">Become a Sponsor</Link>
          </div>
          <p className="mt-14 font-display text-3xl italic text-gray-800">Thank you.</p>
        </div>
      </section>
    </div>
  );
}
