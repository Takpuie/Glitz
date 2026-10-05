import Image from "next/image";
import type { Partner } from "@/data/partners";

export default function PartnerMarquee({ partners }: { partners: Partner[] }) {
  if (!partners.length) return null;

  return (
    <section aria-labelledby="partners-heading" className="overflow-hidden border-y border-ink/10 bg-white py-16 md:py-24">
      <div className="container-editorial mb-12 text-center md:mb-16">
        <p className="eyebrow mb-4">In good company</p>
        <h2 id="partners-heading" className="mx-auto max-w-2xl font-display text-4xl leading-[1.05] sm:text-5xl">
          Trusted by brands shaping culture.
        </h2>
      </div>
      <div className="partner-marquee relative overflow-hidden" aria-label="Our partners">
        <div className="partner-track flex w-max">
          {[false, true].map((duplicate) => (
            <div key={String(duplicate)} aria-hidden={duplicate || undefined} className={`partner-group flex shrink-0 items-center ${duplicate ? "partner-copy" : ""}`}>
              {partners.map((partner) => (
                <div key={partner.id} className="flex w-52 shrink-0 items-center justify-center px-9 sm:w-64 sm:px-12">
                  {partner.website && !duplicate ? (
                    <a href={partner.website} aria-label={partner.name} className="block w-full transition-transform duration-300 hover:scale-105">
                      <Image unoptimized src={partner.logo.full_url} alt={partner.name} width={190} height={80} className="h-16 w-full object-contain sm:h-20" />
                    </a>
                  ) : (
                    <Image unoptimized src={partner.logo.full_url} alt={duplicate ? "" : partner.name} width={190} height={80} className="h-16 w-full object-contain sm:h-20" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
