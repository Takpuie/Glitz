import Image from "next/image";
import Link from "next/link";
import { INITIATIVES } from "@/data/initiatives";
import Newsletter from "@/components/Newsletter";

const EXPLORE = [
  ...INITIATIVES,
  { label: "All Glitz Events", href: "/events" },
  { label: "Media", href: "/media" },
];

const COMPANY: { label: string; href: string }[] = [
  { label: "About Glitz Africa", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Advertise & Partner", href: "/partners" },
  { label: "Care Foundation", href: "/foundation" },
  { label: "Awards & Nominations", href: "/nominate" },
  { label: "Your Bag", href: "/cart" },
  { label: "Account", href: "/account" },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-gray-300">
      <div className="container-editorial grid grid-cols-2 gap-10 py-16 lg:grid-cols-4 lg:py-20">
        <div className="col-span-2 lg:col-span-1">
          <Image
            src="/images/glitz-logo-white.png"
            alt="Glitz Africa"
            width={208}
            height={63}
            className="h-auto w-[170px]"
          />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-gray-400">
            Ghana&rsquo;s destination for fashion, beauty, culture, entertainment
            and lifestyle.
          </p>
          <div className="mt-6 flex gap-4 font-nav text-[11px] uppercase tracking-widest2">
            <a
              href="https://www.instagram.com/glitzafrica_hq/"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-gray-300 hover:text-paper"
            >
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@glitz.africa"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-gray-300 hover:text-paper"
            >
              TikTok
            </a>
            <a
              href="https://x.com/glitzafrica"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-gray-300 hover:text-paper"
            >
              X
            </a>
          </div>
        </div>

        <div>
          <p className="font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">Explore</p>
          <ul className="mt-5 space-y-3">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline text-sm text-gray-300 hover:text-paper">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">Company</p>
          <ul className="mt-5 space-y-3">
            {COMPANY.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="link-underline text-sm text-gray-300 hover:text-paper">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 lg:col-span-1">
          <p className="font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">Stay in the Know</p>
          <p className="mt-5 max-w-[220px] text-sm text-gray-400">
            The best of GLITZ, delivered monthly.
          </p>
          <Newsletter dark />
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container-editorial flex flex-col items-center justify-between gap-3 py-6 font-nav text-[10px] uppercase tracking-widest2 text-gray-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Glitz Africa Magazine / Kollage Media. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="link-underline hover:text-paper">Privacy</a>
            <a href="#" className="link-underline hover:text-paper">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
