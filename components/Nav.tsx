"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const PRIMARY_LINKS = [
  { label: "News & Style", href: "/news" },
  { label: "Glitz Africa Living", href: "/living" },
  { label: "Shop the Magazine", href: "/shop" },
  { label: "Events", href: "/events" },
  { label: "Awards & Nominations", href: "/nominate" },
  { label: "Advertise & Partner", href: "/partners" },
  { label: "Care Foundation", href: "/foundation" },
  { label: "About", href: "/about" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-paper">
      {/* utility bar */}
      <div className="hidden border-b border-ink/10 bg-ink text-paper md:block">
        <div className="container-editorial flex h-9 items-center justify-between font-nav text-[10.5px] uppercase tracking-widest2 text-gray-300">
          <p>Pan-African fashion, power &amp; culture — since 1997</p>
          <div className="flex items-center gap-6">
            <Link href="/foundation" className="link-underline hover:text-paper">
              Care Foundation
            </Link>
            <Link href="/partners" className="link-underline hover:text-paper">
              Advertise
            </Link>
            <Link href="/about" className="link-underline hover:text-paper">
              About Kollage Media
            </Link>
          </div>
        </div>
      </div>

      {/* main bar */}
      <div className={`border-b border-ink/15 transition-shadow ${scrolled ? "shadow-[0_1px_0_rgba(0,0,0,0.08)]" : ""}`}>
        <div className="container-editorial grid h-16 grid-cols-3 items-center md:h-20">
          <div className="flex items-center gap-4">
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="group flex h-9 w-9 flex-col items-start justify-center gap-[5px] md:hidden"
            >
              <span className={`h-px w-6 bg-ink transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`h-px w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`h-px w-6 bg-ink transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </button>
            <nav className="hidden font-nav text-[11px] uppercase tracking-widest2 md:flex md:gap-5 lg:gap-6">
              {PRIMARY_LINKS.slice(0, 3).map((l) => (
                <Link key={l.href} href={l.href} className="link-underline py-1">
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="justify-self-center text-center">
            <span className="block whitespace-nowrap font-display text-[18px] font-semibold tracking-[0.01em] sm:text-[32px] md:text-[38px]">
              GLITZ AFRICA
            </span>
          </Link>

          <div className="flex items-center justify-end gap-4 md:gap-6">
            <nav className="hidden font-nav text-[11px] uppercase tracking-widest2 md:flex md:gap-5 lg:gap-6">
              {PRIMARY_LINKS.slice(3, 6).map((l) => (
                <Link key={l.href} href={l.href} className="link-underline py-1">
                  {l.label}
                </Link>
              ))}
            </nav>
            <button aria-label="Search" className="hidden h-5 w-5 items-center justify-center md:flex">
              <SearchIcon />
            </button>
            <Link href="/account" aria-label="Account" className="flex h-5 w-5 items-center justify-center">
              <AccountIcon />
            </Link>
          </div>
        </div>
      </div>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 top-16 z-40 bg-paper transition-transform duration-300 md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="container-editorial flex flex-col divide-y divide-ink/10 pt-2">
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-4 font-display text-xl"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/account" onClick={() => setOpen(false)} className="py-4 font-nav text-[11px] uppercase tracking-widest2 text-gray-600">
            Account
          </Link>
        </nav>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-full w-full stroke-ink" strokeWidth="1.4">
      <circle cx="8.7" cy="8.7" r="6" />
      <path d="M13.3 13.3 18 18" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-full w-full stroke-ink" strokeWidth="1.4">
      <circle cx="10" cy="6.5" r="3.5" />
      <path d="M2.5 18c1.4-3.8 4.6-5.7 7.5-5.7s6.1 1.9 7.5 5.7" strokeLinecap="round" />
    </svg>
  );
}
