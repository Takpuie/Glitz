import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import LumaEmbed, { isLumaUrl } from "@/components/LumaEmbed";
import { PlanCheckout } from "@/components/PlanPayment";
import { getBackendEvent, type BackendEvent } from "@/lib/backend";
import {
  EARLY_BIRD_CLOSES_AT,
  RETREAT_LUMA_EMBED_URL,
  SHEBOSS_EMAIL,
  SHEBOSS_PHONES,
  dohaGallery,
  earlyBird,
  installmentPlan,
  retreat,
  retreatImportantInfo,
  retreatInclusions,
  shebossImages,
  standardFull,
  telHref,
} from "@/data/sheboss";

// Re-render hourly so the early bird offer disappears on its own after the
// deadline, without a redeploy.
export const revalidate = 3600;

const title = "SheBoss Global Marrakech Retreat 2027";
const description =
  "3–7 February 2027, Marrakech. A curated escape for women who lead, inspire and shape what's next. Register from $3,300 (early bird) or pay in three monthly installments.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `/events/${retreat.slug}` },
  openGraph: {
    type: "website",
    url: `/events/${retreat.slug}`,
    title,
    description,
    images: [{ url: shebossImages.retreatFeature, alt: "SheBoss Global retreat guests" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [shebossImages.retreatFeature] },
};

function earlyBirdOpen() {
  return Date.now() < Date.parse(EARLY_BIRD_CLOSES_AT);
}

function PriceCard({ eyebrow, price, label, detail, note }: { eyebrow: string; price: string; label: string; detail?: React.ReactNode; note: string }) {
  return (
    <div className="flex flex-col bg-paper p-8 text-center sm:p-10">
      <p className="font-nav text-[11px] uppercase tracking-widest2 text-[#a88418]">{eyebrow}</p>
      <p className="mt-4 font-display text-5xl lg:text-6xl">{price}</p>
      <p className="mt-2 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-600">{label}</p>
      {detail && <p className="mt-6 text-sm text-gray-700">{detail}</p>}
      <p className={`${detail ? "mt-2" : "mt-6"} text-sm text-gray-600`}>{note}</p>
    </div>
  );
}

function SectionNumber({ n }: { n: number }) {
  return <span className="text-[#a88418]">{String(n).padStart(2, "0")}</span>;
}

export default async function MarrakechRetreatPage() {
  const showEarlyBird = earlyBirdOpen();
  const hasLuma = isLumaUrl(RETREAT_LUMA_EMBED_URL);

  // On-site checkout appears only once the backend has plans and at least
  // one configured payment provider; otherwise the page relies on Luma.
  let backendEvent: BackendEvent | undefined;
  try { backendEvent = await getBackendEvent(retreat.slug); } catch { /* Luma-only below. */ }
  const plans = backendEvent?.payment_plans ?? [];
  const providers = backendEvent?.payment_providers ?? [];
  const canPayOnSite = plans.length > 0 && providers.length > 0;
  let section = 0;
  const next = () => ++section;

  return (
    <div>
      {/* Hero */}
      <section className="container-editorial grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-[1.1fr_1fr] md:gap-16 md:py-20">
        <div>
          <p className="eyebrow mb-4">SheBoss Global &middot; Presented by Glitz Africa</p>
          <h1 className="font-display text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
            Marrakech
            <span className="block italic text-[#a88418]">Retreat 2027</span>
          </h1>
          <p className="mt-6 font-nav text-[11px] uppercase tracking-widest2 text-gray-700">
            {retreat.dates} &nbsp;|&nbsp; {retreat.location}
          </p>
          <p className="mt-6 max-w-md font-display text-2xl italic leading-snug text-gray-800">{retreat.tagline}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <a href="#register" className="btn-primary">Register &amp; Pay</a>
            <a href="#payment-options" className="btn-outline">Payment Options</a>
          </div>
        </div>
        <div className="photo-card relative aspect-[4/5] w-full bg-gray-200">
          <Image unoptimized src={shebossImages.retreatHero} alt="A SheBoss Global guest at sunset" fill priority sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
        </div>
      </section>

      {/* Registration & payment options */}
      <section id="payment-options" className="hairline scroll-mt-32 bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <p className="eyebrow mb-2 text-center">Registration &amp; Payment Options</p>
          <h2 className="mb-10 text-center font-display text-4xl sm:text-5xl">Secure Your Place</h2>
          <div className={`mx-auto grid grid-cols-1 gap-px border border-ink/15 bg-ink/15 ${showEarlyBird ? "max-w-5xl md:grid-cols-3" : "max-w-4xl md:grid-cols-2"}`}>
            {showEarlyBird && (
              <PriceCard
                eyebrow="Early Bird"
                price={earlyBird.price}
                label={earlyBird.label}
                detail={<><strong>Deadline:</strong> {earlyBird.deadline}</>}
                note="Available only when the full registration fee is paid by the deadline."
              />
            )}
            <PriceCard
              eyebrow="Standard Registration"
              price={standardFull.price}
              label={standardFull.label}
              note="Pay the full registration fee in one payment."
            />
            <PriceCard
              eyebrow="Installment Plan"
              price={installmentPlan.price}
              label={installmentPlan.label}
              detail={<strong>{installmentPlan.summary}</strong>}
              note="For participants choosing the structured monthly installment option."
            />
          </div>
        </div>
      </section>

      {/* Plan details */}
      <section className="container-editorial max-w-4xl space-y-14 py-16 md:py-20">
        {showEarlyBird && (
          <div>
            <h2 className="font-display text-3xl sm:text-4xl"><SectionNumber n={next()} /> &nbsp;Early Bird Privilege</h2>
            <p className="mt-4 text-[17px] leading-relaxed text-gray-700">{earlyBird.copy}</p>
          </div>
        )}

        <div>
          <h2 className="font-display text-3xl sm:text-4xl"><SectionNumber n={next()} /> &nbsp;Standard Full Payment</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-gray-700">{standardFull.copy}</p>
        </div>

        <div>
          <h2 className="font-display text-3xl sm:text-4xl"><SectionNumber n={next()} /> &nbsp;Monthly Installment Plan</h2>
          <p className="mt-4 text-[17px] leading-relaxed text-gray-700">{installmentPlan.copy}</p>
          {/* Fits a phone screen: no fixed minimum width, tighter padding on small screens. */}
          <table className="mt-8 w-full border border-ink/15 text-left text-sm">
            <thead className="bg-ink text-paper">
              <tr>
                <th scope="col" className="px-3 py-4 font-nav text-[10px] uppercase tracking-widest sm:px-5 sm:text-[11px] sm:tracking-widest2">Payment</th>
                <th scope="col" className="px-3 py-4 font-nav text-[10px] uppercase tracking-widest sm:px-5 sm:text-[11px] sm:tracking-widest2">Amount</th>
                <th scope="col" className="px-3 py-4 font-nav text-[10px] uppercase tracking-widest sm:px-5 sm:text-[11px] sm:tracking-widest2">When</th>
              </tr>
            </thead>
            <tbody>
              {installmentPlan.installments.map((row) => (
                <tr key={row.label} className="border-t border-ink/15">
                  <td className="px-3 py-4 sm:px-5">{row.label}</td>
                  <td className="whitespace-nowrap px-3 py-4 font-semibold sm:px-5">{row.amount}</td>
                  <td className="px-3 py-4 sm:px-5">{row.due}</td>
                </tr>
              ))}
              <tr className="border-t border-ink/15 bg-smoke">
                <th scope="row" className="px-3 py-4 font-nav text-[10px] uppercase tracking-widest sm:px-5 sm:text-[11px] sm:tracking-widest2">Total</th>
                <td className="whitespace-nowrap px-3 py-4 font-semibold sm:px-5">{installmentPlan.total}</td>
                <td className="px-3 py-4 text-gray-600 sm:px-5">Three payments</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-4 text-sm text-gray-600">{installmentPlan.note}</p>
        </div>
      </section>

      {/* Experience */}
      <section className="hairline">
        <div className="container-editorial grid grid-cols-1 gap-12 py-16 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-20">
          <div className="photo-card relative aspect-[4/5] w-full bg-gray-200 md:aspect-auto md:min-h-[560px]">
            <Image unoptimized src={dohaGallery[9].src} alt={dohaGallery[9].alt} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow mb-2">{String(next()).padStart(2, "0")} &middot; Your Retreat Experience</p>
            <h2 className="font-display text-4xl sm:text-5xl">Your registration includes</h2>
            <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {retreatInclusions.map((item) => (
                <li key={item} className="flex gap-4 py-4 text-[15px] leading-relaxed text-gray-800">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rotate-45 bg-[#a88418]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Important information */}
      <section className="hairline bg-smoke">
        <div className="container-editorial max-w-4xl py-16 md:py-20">
          <p className="eyebrow mb-2">{String(next()).padStart(2, "0")} &middot; Important Information</p>
          <ul className="mt-4 space-y-4">
            {retreatImportantInfo.map((item, i) => (
              <li key={item} className="flex gap-4 text-[17px] leading-relaxed text-gray-800">
                <span className="font-nav text-xs text-gray-500">{String(i + 1).padStart(2, "0")}</span>
                <span>{i === 0 ? <>International flights and accommodation are <strong>not included</strong> in the registration fee.</> : item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Register (Luma) */}
      <section id="register" className="hairline scroll-mt-32">
        <div className="container-editorial max-w-4xl py-16 md:py-20">
          <p className="eyebrow mb-2">Register &amp; Pay</p>
          <h2 className="font-display text-4xl sm:text-5xl">Make your place in Marrakech.</h2>
          <p className="mt-4 max-w-2xl text-sm text-gray-600 md:text-base">
            {hasLuma
              ? "Choose your payment option below and complete your registration securely."
              : "Online registration opens shortly. To secure your place now, contact the SheBoss team directly."}
          </p>
          {canPayOnSite && (
            <div className="mt-10 border border-ink/15 p-6 sm:p-10">
              <p className="font-nav text-[11px] uppercase tracking-widest2 text-[#a88418]">Option A &middot; Pay here on Glitz</p>
              <h3 className="mb-8 mt-2 font-display text-3xl">Register &amp; pay securely</h3>
              <PlanCheckout slug={retreat.slug} plans={plans} providers={providers} />
            </div>
          )}

          <div className="mt-10">
            {hasLuma ? (
              <>
                {canPayOnSite && (
                  <>
                    <p className="font-nav text-[11px] uppercase tracking-widest2 text-[#a88418]">Option B &middot; Register via Luma</p>
                    <h3 className="mb-6 mt-2 font-display text-3xl">Prefer Luma?</h3>
                  </>
                )}
                <LumaEmbed src={RETREAT_LUMA_EMBED_URL} title="Register for the SheBoss Global Marrakech Retreat 2027" />
              </>
            ) : !canPayOnSite && (
              <div className="flex flex-wrap gap-4">
                <a href={`mailto:${SHEBOSS_EMAIL}?subject=${encodeURIComponent("Marrakech Retreat 2027 registration")}`} className="btn-primary">Email to Register</a>
                <a href={telHref(SHEBOSS_PHONES[0])} className="btn-outline">Call {SHEBOSS_PHONES[0]}</a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section className="hairline bg-smoke">
        <div className="container-editorial grid max-w-4xl grid-cols-1 gap-8 py-16 sm:grid-cols-2 md:py-20">
          <div>
            <p className="eyebrow mb-3">Bookings &amp; Enquiries</p>
            {SHEBOSS_PHONES.map((phone) => (
              <a key={phone} href={telHref(phone)} className="link-underline block w-fit py-1 font-display text-2xl">{phone}</a>
            ))}
          </div>
          <div>
            <p className="eyebrow mb-3">Email</p>
            <a href={`mailto:${SHEBOSS_EMAIL}`} className="link-underline block w-fit break-all py-1 font-display text-2xl">{SHEBOSS_EMAIL}</a>
          </div>
        </div>
        <div className="container-editorial pb-16 text-center">
          <p className="font-nav text-[11px] uppercase tracking-widest2 text-[#a88418]">Make your place in Marrakech.</p>
          <p className="mt-3 font-display text-2xl italic text-gray-800">An extraordinary gathering. An unforgettable experience.</p>
          <Link href="/events/sheboss-global" className="link-underline mt-8 inline-block font-nav text-[11px] uppercase tracking-widest2">
            &larr; More from SheBoss Global
          </Link>
        </div>
      </section>
    </div>
  );
}
