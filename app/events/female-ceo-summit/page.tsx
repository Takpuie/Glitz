import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";
import { PeopleGrid, PhotoGrid, SectionHead } from "@/components/EventEditorial";
import { getBackendEvent } from "@/lib/backend";
import {
  CEO_EMAIL,
  CEO_PHONE,
  SHOW_PROPOSED_SPEAKERS,
  dealRoom,
  edition2027,
  focusAreas,
  gwotyImages,
  keyHighlights,
  masterclasses,
  mediaPartners2026,
  partners2026,
  pastGuestsOfHonour,
  pastSpeakers,
  programme2027,
  proposedSpeakers2027,
  summit2026,
  summitGallery,
  summitImages,
  summitIntro,
  summitStats,
  whyPartner,
} from "@/data/ceo-gwoty";
import { telHref } from "@/data/sheboss";

const SLUG = "female-ceo-summit";
const description =
  "Ghana's foremost leadership conference for women in executive and entrepreneurial roles. 28–30 April 2027, Kempinski Hotel Gold Coast City, Accra.";

export const metadata: Metadata = {
  title: "Ghana Female CEO Summit 2027",
  description,
  alternates: { canonical: `/events/${SLUG}` },
  openGraph: {
    type: "website",
    url: `/events/${SLUG}`,
    title: "Ghana Female CEO Summit 2027",
    description,
    images: [{ url: summitImages.hero, alt: "Speakers on stage at the Ghana Female CEO Summit" }],
  },
  twitter: { card: "summary_large_image", title: "Ghana Female CEO Summit 2027", description, images: [summitImages.hero] },
};

export default async function FemaleCeoSummitPage() {
  let hasBackendEvent = false;
  try { hasBackendEvent = Boolean(await getBackendEvent(SLUG)); } catch { /* Fall back to email registration. */ }

  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <Image unoptimized src={summitImages.hero} alt="Speakers on stage at the Ghana Female CEO Summit 2026" fill priority sizes="100vw" className="-z-10 object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="container-editorial flex min-h-[min(72vh,680px)] flex-col justify-end py-14 md:min-h-[min(80vh,780px)] md:py-20">
          <p className="font-nav text-[11px] uppercase tracking-widest2 text-paper/80">Glitz Africa presents</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl leading-[0.98] sm:text-7xl lg:text-8xl">
            Ghana Female CEO Summit
            <span className="block italic text-[#d4af37]">2027</span>
          </h1>
          <p className="mt-6 font-nav text-[11px] uppercase tracking-widest2 text-paper/90">
            {edition2027.dates} &nbsp;|&nbsp; {edition2027.venue}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#register" className="inline-flex items-center justify-center rounded-sm bg-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-ink transition-colors hover:bg-gray-200">Register Interest</a>
            <a href="#partner" className="inline-flex items-center justify-center rounded-sm border border-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-paper transition-colors hover:bg-paper hover:text-ink">Partner With Us</a>
            <Link href="/events/gwoty" className="inline-flex items-center px-2 py-3 font-nav text-[11px] uppercase tracking-widest2 text-paper/85 hover:text-paper">Women of the Year Honours &rarr;</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-ink/15">
        <dl className="container-editorial grid grid-cols-2 gap-px bg-ink/10 md:grid-cols-4">
          {summitStats.map((s) => (
            <div key={s.label} className="bg-paper px-4 py-8 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-4xl sm:text-5xl">
                {s.figure.replace(/\+$/, "")}
                {s.figure.endsWith("+") && <span className="ml-0.5 align-top font-body text-2xl font-light text-[#a88418] sm:text-3xl">+</span>}
              </dd>
              <dd className="mt-2 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-600">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Intro */}
      <section className="container-editorial grid grid-cols-1 gap-12 py-16 md:grid-cols-[1.2fr_1fr] md:gap-16 md:py-24">
        <div>
          <p className="eyebrow mb-2">About the Summit</p>
          <h2 className="font-display text-4xl sm:text-5xl">Where Ghana&apos;s women in leadership convene</h2>
          <p className="mt-8 font-display text-2xl leading-relaxed text-gray-900">{summitIntro[0]}</p>
          <p className="mt-6 text-[17px] leading-relaxed text-gray-700">{summitIntro[1]}</p>
          <p className="mt-6 text-[17px] leading-relaxed text-gray-700">{edition2027.focus}</p>
        </div>
        <div className="photo-card relative aspect-[4/5] w-full bg-gray-200 md:aspect-auto md:min-h-[560px]">
          <Image unoptimized src={summitImages.intro} alt="An address from the Ghana Female CEO Summit podium" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
        </div>
      </section>

      {/* Programme */}
      <section id="programme" className="hairline scroll-mt-32 bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <SectionHead eyebrow={`${edition2027.dates} · Kempinski Hotel Gold Coast City`} title="Three Days, One Platform" />
          <ol className="grid grid-cols-1 gap-px bg-ink/15 md:grid-cols-2 xl:grid-cols-4">
            {programme2027.map((d) => (
              <li key={d.title} className="flex flex-col bg-paper p-7">
                <p className="font-nav text-[11px] uppercase tracking-widest2 text-[#a88418]">{d.day}{d.time ? ` · ${d.time}` : ""}</p>
                <p className="mt-1 text-sm text-gray-500">{d.date}</p>
                <h3 className="mt-4 font-display text-2xl leading-tight">{d.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-700">{d.copy}</p>
                {d.href && <Link href={d.href} className="link-underline mt-5 w-fit font-nav text-[11px] uppercase tracking-widest2">Discover the Honours &rarr;</Link>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Focus areas & highlights */}
      <section className="container-editorial grid grid-cols-1 gap-12 py-16 md:grid-cols-[1fr_1.3fr] md:gap-16 md:py-24">
        <div className="photo-card relative aspect-[4/5] w-full bg-gray-200 md:aspect-auto md:min-h-[620px]">
          <Image unoptimized src={summitImages.focus} alt="A delegate at the Ghana Female CEO Summit" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
        </div>
        <div>
          <p className="eyebrow mb-2">Day 2 · The Summit</p>
          <h2 className="font-display text-4xl sm:text-5xl">Focus Areas</h2>
          <ol className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {focusAreas.map((f, i) => (
              <li key={f.title}>
                <span className="font-display text-3xl text-[#a88418]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 font-display text-xl">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-700">{f.copy}</p>
              </li>
            ))}
          </ol>
          <h3 className="mt-12 font-nav text-[11px] uppercase tracking-widest2 text-gray-600">Key Highlights</h3>
          <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
            {keyHighlights.map((h) => (
              <li key={h.title} className="flex gap-4 py-4">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#a88418]" />
                <p className="text-[15px] leading-relaxed text-gray-800"><strong className="font-semibold text-ink">{h.title}:</strong> {h.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Deal Room */}
      <section className="bg-ink text-paper">
        <div className="container-editorial grid grid-cols-1 items-center gap-12 py-16 md:grid-cols-2 md:gap-16 md:py-24">
          <div>
            <p className="font-nav text-[11px] uppercase tracking-widest2 text-[#d4af37]">Day 3 · Morning Session</p>
            <h2 className="mt-2 font-display text-5xl sm:text-6xl">{dealRoom.title}</h2>
            {dealRoom.copy.map((p) => <p key={p} className="mt-6 text-[17px] leading-relaxed text-paper/80">{p}</p>)}
            <a href="#register" className="mt-8 inline-flex items-center justify-center rounded-sm bg-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-ink transition-colors hover:bg-gray-200">Express Interest</a>
          </div>
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md bg-gray-800">
            <Image unoptimized src={summitImages.dealRoom} alt="Business leaders in conversation at a roundtable" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Masterclasses */}
      <section id="masterclasses" className="container-editorial scroll-mt-32 py-16 md:py-24">
        <SectionHead eyebrow="Day 3 · Morning Masterclasses" title="Executive Masterclasses" />
        <p className="-mt-4 mb-12 max-w-3xl text-[17px] leading-relaxed text-gray-700">
          Deep-dive sessions with industry leaders, innovators and policymakers on how women are shaping resilient enterprises
          across finance, energy, industry, real estate and the creative economy, with toolkits for participants, visibility
          for sponsors and reform pathways for policymakers.
        </p>
        <div className="grid grid-cols-1 gap-x-10 gap-y-16 md:grid-cols-2">
          {masterclasses.map((m) => (
            <article key={m.title}>
              <div className="photo-card relative aspect-[3/2] w-full bg-gray-200">
                <Image unoptimized src={m.image} alt={`${m.title} masterclass`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              </div>
              <p className="mt-6 font-nav text-[11px] uppercase tracking-widest2 text-[#a88418]">Masterclass</p>
              <h3 className="mt-1 font-display text-3xl leading-tight">{m.title}</h3>
              <p className="mt-1 font-display text-xl italic text-gray-600">{m.subtitle}</p>
              <dl className="mt-5 space-y-3 text-sm leading-relaxed text-gray-700">
                <div><dt className="inline font-semibold text-ink">Focus: </dt><dd className="inline">{m.focus}</dd></div>
                <div><dt className="inline font-semibold text-ink">For: </dt><dd className="inline">{m.audience}</dd></div>
              </dl>
              <ul className="mt-4 space-y-2">
                {m.objectives.map((o) => (
                  <li key={o} className="flex gap-3 text-sm text-gray-700"><span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#a88418]" />{o}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* 2026 recap */}
      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <SectionHead eyebrow="Executive Summary · 2026 Edition" title={summit2026.heading} />
          <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.3fr_1fr] md:gap-16">
            <div className="space-y-6">
              <p className="font-nav text-[11px] uppercase tracking-widest2 text-gray-600">{summit2026.meta}</p>
              {summit2026.paragraphs.map((p) => <p key={p} className="text-[17px] leading-relaxed text-gray-700">{p}</p>)}
            </div>
            <div>
              <h3 className="font-nav text-[11px] uppercase tracking-widest2 text-gray-600">Distinguished leaders at the 2026 programme</h3>
              <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
                {summit2026.distinguished.map((d) => <li key={d} className="py-3 text-sm text-gray-800">{d}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="container-editorial py-16 md:py-24">
        <SectionHead eyebrow="Ghana Female CEO Summit in Pictures" title="Scenes from 2026" />
        <PhotoGrid photos={summitGallery} />
      </section>

      {/* Guests & speakers */}
      <section className="bg-ink text-paper">
        <div className="container-editorial py-16 md:py-24">
          <SectionHead light eyebrow="Over the past 11 years" title="Past Special Guests of Honour & Keynote Speakers" />
          <PeopleGrid light people={pastGuestsOfHonour} />
          <div className="mt-20">
            <SectionHead light eyebrow="Technology, banking, business, government, real estate and the creative arts" title="Past Speakers" />
            <PeopleGrid light people={pastSpeakers} />
          </div>
          {SHOW_PROPOSED_SPEAKERS && proposedSpeakers2027.length > 0 && (
            <div className="mt-20">
              <SectionHead light eyebrow="2027" title="Speakers" />
              <PeopleGrid light people={proposedSpeakers2027} />
            </div>
          )}
        </div>
      </section>

      {/* Partners */}
      <section id="partner" className="scroll-mt-32">
        <div className="container-editorial grid grid-cols-1 gap-12 py-16 md:grid-cols-2 md:gap-16 md:py-24">
          <div>
            <SectionHead eyebrow="Partnerships" title="Why Partner With Glitz Africa" />
            <ul className="space-y-6">
              {whyPartner.map((w) => (
                <li key={w.title}>
                  <h3 className="font-display text-2xl">{w.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed text-gray-700">{w.copy}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href={`mailto:${CEO_EMAIL}?subject=${encodeURIComponent("Ghana Female CEO Summit 2027 partnership")}`} className="btn-primary">Become a Partner</a>
              <Link href="/partners#enquire" className="btn-outline">Sponsorship Enquiry</Link>
            </div>
          </div>
          <div>
            <div className="photo-card relative aspect-[3/2] w-full bg-gray-200">
              <Image unoptimized src={summitImages.partner} alt="Women leaders on stage at the summit" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <h3 className="mt-10 font-nav text-[11px] uppercase tracking-widest2 text-gray-600">Supported in 2026 by</h3>
            <p className="mt-3 font-display text-xl leading-relaxed">{partners2026.join(" · ")}</p>
            <h3 className="mt-6 font-nav text-[11px] uppercase tracking-widest2 text-gray-600">Media partners</h3>
            <p className="mt-3 font-display text-xl">{mediaPartners2026.join(" · ")}</p>
          </div>
        </div>
      </section>

      {/* Register */}
      <section id="register" className="hairline scroll-mt-32 bg-smoke">
        <div className="container-editorial grid grid-cols-1 gap-12 py-16 md:grid-cols-[1fr_1.2fr] md:gap-16 md:py-20">
          <div>
            <p className="eyebrow mb-2">{edition2027.dates}</p>
            <h2 className="font-display text-4xl sm:text-5xl">Register your interest</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-gray-700">
              Be first to hear when registration opens for the Business Owners Breakfast Forum, the Summit, the Deal Room and the
              masterclasses.
            </p>
            <dl className="mt-8 space-y-4 text-sm">
              <div><dt className="eyebrow mb-1">Email</dt><dd><a href={`mailto:${CEO_EMAIL}`} className="link-underline font-display text-xl">{CEO_EMAIL}</a></dd></div>
              <div><dt className="eyebrow mb-1">Phone</dt><dd><a href={telHref(CEO_PHONE)} className="link-underline font-display text-xl">{CEO_PHONE}</a></dd></div>
              <div><dt className="eyebrow mb-1">Venue</dt><dd className="text-base">{edition2027.venue}</dd></div>
            </dl>
          </div>
          <div className="border border-ink/15 bg-paper p-6 sm:p-10">
            {hasBackendEvent ? (
              <EnquiryForm kind="event" event={{ slug: SLUG, name: "Ghana Female CEO Summit 2027" }} />
            ) : (
              <div>
                <p className="text-[15px] text-gray-700">Email the summit team to register your interest or ask about delegate places.</p>
                <a href={`mailto:${CEO_EMAIL}?subject=${encodeURIComponent("Ghana Female CEO Summit 2027 registration")}`} className="btn-primary mt-6">Email to Register</a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cross-link */}
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        <Image unoptimized src={gwotyImages.hero} alt="Honourees on stage at the Ghana Women of the Year Honours" fill sizes="100vw" className="-z-10 object-cover opacity-45" />
        <div className="container-editorial py-20 text-center md:py-28">
          <p className="font-nav text-[11px] uppercase tracking-widest2 text-[#d4af37]">Day 3 · Evening Gala · 30 April 2027</p>
          <h2 className="mx-auto mt-3 max-w-3xl font-display text-4xl sm:text-6xl">Ghana Women of the Year Honours</h2>
          <p className="mx-auto mt-5 max-w-xl text-paper/85">The red tie evening that closes the summit, celebrating the women shaping Ghana.</p>
          <Link href="/events/gwoty" className="mt-8 inline-flex items-center justify-center rounded-sm bg-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-ink transition-colors hover:bg-gray-200">Discover the Honours</Link>
        </div>
      </section>
    </div>
  );
}
