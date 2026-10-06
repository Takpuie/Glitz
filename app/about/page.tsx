import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { editorialImage } from "@/lib/img";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Glitz Africa and its platforms for African fashion, culture, business and leadership.",
  alternates: { canonical: "/about" },
};

const brands = [
  "Glitz Africa Magazine",
  "Ghana Women of the Year Honours",
  "Ghana Female CEO Summit",
  "SheBoss Global",
  "Glitz Style Awards",
  "Glitz Africa Fashion Week",
];

export default function AboutPage() {
  return (
    <div>
      <section className="container-editorial grid grid-cols-1 gap-12 border-b border-ink/15 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow mb-3">Since 1997</p>
          <h1 className="font-display text-5xl leading-tight sm:text-6xl">
            A Pan-African Media &amp; Events House
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-gray-600 md:text-base">
            Glitz Africa is published by Kollage Media — a group running
            publishing, advertising, project management and experiential
            production as one operation, reaching 1M+ people across print,
            digital and events.
          </p>
        </div>
        <div className="photo-card relative aspect-[4/5] w-full bg-gray-100">
          <Image unoptimized src={editorialImage("about-founder", 1000, 1250)} alt="Claudia Lumor, Founder" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        </div>
      </section>

      <section className="container-editorial py-16 md:py-20">
        <p className="eyebrow mb-2">The Portfolio</p>
        <h2 className="mb-10 font-display text-4xl sm:text-5xl">One House, Six Brands</h2>
        <ul className="grid grid-cols-1 divide-y divide-ink/15 border-y border-ink/15 sm:grid-cols-2">
          {brands.map((b, i) => (
            <li key={b} className="flex items-center gap-4 py-5 sm:px-6">
              <span className="font-nav text-xs text-gray-400">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-xl">{b}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="contact" className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <div className="max-w-xl">
            <p className="eyebrow mb-3">Contact</p>
            <h2 className="font-display text-3xl sm:text-4xl">Get in touch with Glitz Africa</h2>
            <address className="mt-5 not-italic text-sm leading-7 text-gray-700">
              Glitz Africa<br />
              Accra, Ghana<br />
              <a className="transition-colors hover:text-gold" href="mailto:info@glitzafrica.com">
                info@glitzafrica.com
              </a><br />
              <a className="transition-colors hover:text-gold" href="tel:+233509388934">
                0509388934
              </a>
            </address>
            <Link href="/contact" className="btn-outline mt-7">Send an enquiry</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
