import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";
import { PeopleGrid, PhotoGrid, SectionHead } from "@/components/EventEditorial";
import { getBackendEvent } from "@/lib/backend";
import {
  CEO_EMAIL,
  CEO_PHONE,
  awardCategories,
  edition2027,
  gwoty,
  gwotyAudience,
  gwotyAwardMoments,
  gwotyImages,
  gwotyRedCarpet,
  pastHonourees,
  programme2027,
  summitImages,
  whyPartner,
} from "@/data/ceo-gwoty";
import { telHref } from "@/data/sheboss";

const SLUG = "gwoty";
const description =
  "The red tie gala celebrating exceptional Ghanaian women. 10th edition: 30 April 2027, Kempinski Hotel Gold Coast City, Accra.";

export const metadata: Metadata = {
  title: "Ghana Women of the Year Honours 2027",
  description,
  alternates: { canonical: `/events/${SLUG}` },
  openGraph: {
    type: "website",
    url: `/events/${SLUG}`,
    title: "Ghana Women of the Year Honours 2027",
    description,
    images: [{ url: gwotyImages.hero, alt: "Honourees on stage at the Ghana Women of the Year Honours" }],
  },
  twitter: { card: "summary_large_image", title: "Ghana Women of the Year Honours 2027", description, images: [gwotyImages.hero] },
};

export default async function GwotyPage() {
  let hasBackendEvent = false;
  try { hasBackendEvent = Boolean(await getBackendEvent(SLUG)); } catch { /* Fall back to email registration. */ }

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <Image unoptimized src={gwotyImages.hero} alt="Honourees on stage at the Ghana Women of the Year Honours 2026" fill priority sizes="100vw" className="-z-10 object-cover opacity-60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="container-editorial flex min-h-[min(72vh,680px)] flex-col justify-end py-14 md:min-h-[min(80vh,780px)] md:py-20">
          <p className="font-nav text-[11px] uppercase tracking-widest2 text-paper/80">{gwoty.edition} &middot; {gwoty.dressCode}</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.98] sm:text-7xl lg:text-8xl">
            Ghana Women of the Year
            <span className="block italic text-[#d4af37]">Honours 2027</span>
          </h1>
          <p className="mt-6 font-nav text-[11px] uppercase tracking-widest2 text-paper/90">
            {gwoty.when} &nbsp;|&nbsp; {gwoty.venue}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/nominate" className="inline-flex items-center justify-center rounded-sm bg-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-ink transition-colors hover:bg-gray-200">Nominate a Woman</Link>
            <a href="#attend" className="inline-flex items-center justify-center rounded-sm border border-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-paper transition-colors hover:bg-paper hover:text-ink">Attend the Gala</a>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="container-editorial grid grid-cols-1 gap-12 py-16 md:grid-cols-[1.2fr_1fr] md:gap-16 md:py-24">
        <div>
          <p className="eyebrow mb-2">About the Honours</p>
          <h2 className="font-display text-4xl sm:text-5xl">Honouring the women shaping Ghana</h2>
          <p className="mt-8 font-display text-2xl leading-relaxed text-gray-900">{gwoty.intro}</p>
          <p className="mt-6 text-[17px] leading-relaxed text-gray-700">{gwoty.evening}</p>
          <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-ink/15 pt-8 sm:grid-cols-3">
            <div><dt className="eyebrow mb-1">Date</dt><dd className="text-sm">30 April 2027, evening</dd></div>
            <div><dt className="eyebrow mb-1">Venue</dt><dd className="text-sm">{gwoty.venue}</dd></div>
            <div><dt className="eyebrow mb-1">Dress code</dt><dd className="text-sm">{gwoty.dressCode}</dd></div>
          </dl>
        </div>
        <div className="photo-card relative aspect-[4/5] w-full bg-gray-200 md:aspect-auto md:min-h-[620px]">
          <Image unoptimized src={gwotyImages.intro} alt="A guest on the Women of the Year red carpet" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover object-top" />
        </div>
      </section>

      {/* Award categories */}
      <section className="bg-ink text-paper">
        <div className="container-editorial py-16 md:py-24">
          <SectionHead light eyebrow="The Honours" title="Award Categories" />
          <ol className="grid grid-cols-1 border-l border-t border-paper/15 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {awardCategories.map((c, i) => (
              <li key={c} className="flex items-baseline gap-4 border-b border-r border-paper/15 p-6">
                <span className="font-nav text-xs text-[#d4af37]">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-2xl leading-tight">{c}</span>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/nominate" className="inline-flex items-center justify-center rounded-sm bg-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-ink transition-colors hover:bg-gray-200">Submit a Nomination</Link>
            <p className="text-sm text-paper/70">Nominations are reviewed through a structured, transparent process.</p>
          </div>
        </div>
      </section>

      {/* Award moments 2026 */}
      <section className="container-editorial py-16 md:py-24">
        <SectionHead eyebrow="Ghana Women of the Year Honours 2026" title="Moments from the Stage" />
        <p className="-mt-4 mb-10 max-w-3xl text-[17px] leading-relaxed text-gray-700">{gwoty.recap2026}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gwotyAwardMoments.map((m, i) => (
            <figure key={m.src} className={`group relative overflow-hidden rounded-md bg-gray-200 ${i === 0 ? "sm:col-span-2 lg:row-span-2" : ""} aspect-[3/2]`}>
              <Image unoptimized src={m.src} alt={m.alt} fill sizes={i === 0 ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"} className="object-cover transition-transform duration-700 group-hover:scale-105" />
              {m.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 font-nav text-[10px] uppercase tracking-widest2 text-paper">{m.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      </section>

      {/* The evening */}
      <section className="hairline bg-smoke">
        <div className="container-editorial grid grid-cols-1 items-center gap-12 py-16 md:grid-cols-2 md:gap-16 md:py-24">
          <div className="grid grid-cols-2 gap-4">
            <div className="relative col-span-2 aspect-[3/2] overflow-hidden rounded-md bg-gray-200">
              <Image unoptimized src={gwotyImages.evening} alt="A live performance at the Honours" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div className="relative col-span-2 aspect-[3/2] overflow-hidden rounded-md bg-gray-200">
              <Image unoptimized src={gwotyImages.dinner} alt="Guests at the gala dinner" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          </div>
          <div>
            <p className="eyebrow mb-2">The Evening</p>
            <h2 className="font-display text-4xl sm:text-5xl">An evening of celebration</h2>
            <p className="mt-6 text-[17px] leading-relaxed text-gray-700">{gwoty.evening}</p>
            <h3 className="mt-10 font-nav text-[11px] uppercase tracking-widest2 text-gray-600">Who attends</h3>
            <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {gwotyAudience.map((a) => (
                <li key={a} className="flex gap-4 py-3 text-[15px] text-gray-800"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#a88418]" />{a}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Past honourees */}
      <section className="container-editorial py-16 md:py-24">
        <SectionHead eyebrow="Over 100 women celebrated in 11 years" title="Past Honourees" />
        <PeopleGrid people={pastHonourees} />
      </section>

      {/* Red carpet */}
      <section className="hairline">
        <div className="container-editorial py-16 md:py-24">
          <SectionHead eyebrow="GWOTYH in Pictures" title="On the Red Carpet" />
          <PhotoGrid photos={gwotyRedCarpet} columns={3} />
        </div>
      </section>

      {/* Part of the summit week */}
      <section className="bg-ink text-paper">
        <div className="container-editorial grid grid-cols-1 items-center gap-12 py-16 md:grid-cols-2 md:gap-16 md:py-24">
          <div>
            <p className="font-nav text-[11px] uppercase tracking-widest2 text-[#d4af37]">{edition2027.dates}</p>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl">The finale of the Ghana Female CEO Summit</h2>
            <ol className="mt-8 divide-y divide-paper/15 border-y border-paper/15">
              {programme2027.map((d) => (
                <li key={d.title} className="grid grid-cols-[90px_1fr] gap-4 py-4">
                  <span className="font-nav text-[11px] uppercase tracking-widest2 text-paper/60">{d.day}{d.time ? <><br />{d.time}</> : null}</span>
                  <span className="font-display text-xl">{d.title}</span>
                </li>
              ))}
            </ol>
            <Link href="/events/female-ceo-summit" className="mt-8 inline-flex items-center justify-center rounded-sm border border-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-paper transition-colors hover:bg-paper hover:text-ink">Explore the Summit</Link>
          </div>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md bg-gray-800">
            <Image unoptimized src={summitImages.hero} alt="Speakers on stage at the Ghana Female CEO Summit" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Attend & partner */}
      <section id="attend" className="scroll-mt-32 bg-smoke">
        <div className="container-editorial grid grid-cols-1 gap-12 py-16 md:grid-cols-[1fr_1.2fr] md:gap-16 md:py-20">
          <div>
            <p className="eyebrow mb-2">Tables, tickets & partnerships</p>
            <h2 className="font-display text-4xl sm:text-5xl">Attend the Gala</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-gray-700">
              Register your interest for seats and tables at the 2027 Honours, or talk to us about partnering with Ghana&apos;s
              most credible celebration of women&apos;s leadership.
            </p>
            <ul className="mt-8 space-y-3">
              {whyPartner.slice(0, 3).map((w) => (
                <li key={w.title} className="text-sm text-gray-700"><strong className="text-ink">{w.title}:</strong> {w.copy}</li>
              ))}
            </ul>
            <dl className="mt-8 space-y-4">
              <div><dt className="eyebrow mb-1">Email</dt><dd><a href={`mailto:${CEO_EMAIL}`} className="link-underline font-display text-xl">{CEO_EMAIL}</a></dd></div>
              <div><dt className="eyebrow mb-1">Phone</dt><dd><a href={telHref(CEO_PHONE)} className="link-underline font-display text-xl">{CEO_PHONE}</a></dd></div>
            </dl>
          </div>
          <div className="border border-ink/15 bg-paper p-6 sm:p-10">
            {hasBackendEvent ? (
              <EnquiryForm kind="event" event={{ slug: SLUG, name: "Ghana Women of the Year Honours 2027" }} />
            ) : (
              <div>
                <p className="text-[15px] text-gray-700">Email the team to reserve seats or tables, or to discuss partnership.</p>
                <a href={`mailto:${CEO_EMAIL}?subject=${encodeURIComponent("Ghana Women of the Year Honours 2027")}`} className="btn-primary mt-6">Email the Team</a>
              </div>
            )}
            <div className="mt-8 flex flex-wrap gap-4 border-t border-ink/15 pt-6">
              <Link href="/nominate" className="btn-outline">Nominate a Woman</Link>
              <Link href="/partners#enquire" className="btn-outline">Become a Sponsor</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Closing image */}
      <section className="relative h-[46vh] min-h-[320px] overflow-hidden bg-ink">
        <Image unoptimized src={gwotyImages.closing} alt="Honourees celebrating on stage" fill sizes="100vw" className="object-cover opacity-90" />
      </section>
    </div>
  );
}
