import Link from "next/link";
import Newsletter from "@/components/Newsletter";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Read",
    links: [
      { label: "News & Style", href: "/news" },
      { label: "Glitz Africa Living", href: "/living" },
      { label: "Shop the Magazine", href: "/shop" },
      { label: "Digital Library", href: "/shop#digital" },
    ],
  },
  {
    title: "Events",
    links: [
      { label: "Glitz Africa Fashion Week", href: "/events/gafw" },
      { label: "Ghana Women of the Year", href: "/events/gwoty" },
      { label: "Female CEO Summit", href: "/events/female-ceo-summit" },
      { label: "SheBoss Global", href: "/events/sheboss-global" },
      { label: "Glitz Style Awards", href: "/events/style-awards" },
      { label: "Full Event Archive", href: "/events/archive" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Glitz Africa", href: "/about" },
      { label: "Advertise & Partner", href: "/partners" },
      { label: "Care Foundation", href: "/foundation" },
      { label: "Awards & Nominations", href: "/nominate" },
      { label: "Careers", href: "/about#careers" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink/15 bg-paper">
      <div className="container-editorial py-14 md:py-16">
        <Newsletter />
      </div>

      <div className="hairline">
        <div className="container-editorial grid grid-cols-2 gap-10 py-14 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="font-display text-3xl font-semibold">GLITZ AFRICA</span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-600">
              The Pan-African home for fashion, power and culture — published by
              Kollage Media. 1M+ audience across print, digital &amp; events.
            </p>
            <div className="mt-6 flex gap-4 font-nav text-[11px] uppercase tracking-widest2 text-ink">
              <a href="#" className="link-underline">Instagram</a>
              <a href="#" className="link-underline">TikTok</a>
              <a href="#" className="link-underline">X</a>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="eyebrow mb-5">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline text-sm text-gray-700 hover:text-ink">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="hairline">
        <div className="container-editorial flex flex-col items-center justify-between gap-3 py-6 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Glitz Africa Magazine / Kollage Media. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="link-underline">Privacy</a>
            <a href="#" className="link-underline">Terms</a>
            <Link href="/account" className="link-underline">Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
