"use client";

import Image from "next/image";
import { useState } from "react";
import type { PartnerLogo } from "@/lib/backend";

export default function PartnerMarquee({ partners }: { partners: PartnerLogo[] }) {
  const [paused, setPaused] = useState(false);
  if (!partners.length) return null;
  return <section aria-labelledby="partners-heading" className="border-y border-ink/15 bg-white py-12 md:py-16">
    <div className="container-editorial mb-8 flex items-center justify-between gap-5"><div><p className="eyebrow mb-2">Together, we make it happen</p><h2 id="partners-heading" className="font-display text-3xl">Our partners</h2></div><button onClick={() => setPaused(value => !value)} aria-label={paused ? "Play partner logo animation" : "Pause partner logo animation"} className="partner-motion-toggle text-xs uppercase tracking-widest">{paused ? "Play" : "Pause"}</button></div>
    <div className={`partner-marquee overflow-hidden ${paused ? "is-paused" : ""}`}>
      <div className="partner-track flex w-max">
        {[false, true].map(duplicate => <div key={String(duplicate)} aria-hidden={duplicate || undefined} className={`partner-group flex shrink-0 items-center ${duplicate ? "partner-copy" : ""}`}>
          {partners.map(partner => <div key={partner.id} className="flex w-48 shrink-0 items-center justify-center px-8 sm:w-56">
            {partner.website && !duplicate ? <a href={partner.website} aria-label={partner.name} className="block w-full transition-opacity hover:opacity-60"><Image unoptimized src={partner.logo.full_url} alt={partner.name} width={160} height={64} className="h-16 w-full object-contain" /></a> : <Image unoptimized src={partner.logo.full_url} alt={duplicate ? "" : partner.name} width={160} height={64} className="h-16 w-full object-contain" />}
          </div>)}
        </div>)}
      </div>
    </div>
  </section>;
}
