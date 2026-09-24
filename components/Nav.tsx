"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";

const PRIMARY_LINKS = [
  { label: "Home", href: "/" },
  { label: "News", href: "/articles?category=News" },
  { label: "Entertainment", href: "/articles?category=Entertainment" },
  { label: "Fashion", href: "/articles?category=Fashion" },
  { label: "Hair & Beauty", href: "/articles?category=Hair+%26+Beauty" },
  { label: "Lifestyle", href: "/articles?category=Lifestyle" },
  { label: "Magazine", href: "/magazine" },
  { label: "Glitz Events", href: "/events" },
  { label: "Media", href: "/media" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-paper">
      {/* utility bar */}
      <div className="bg-ink text-paper">
        <div className="container-editorial flex h-8 items-center justify-center">
          <p className="font-nav text-[10px] uppercase tracking-widest2 text-gray-300 sm:text-[10.5px]">
            Glitz Africa &middot; Fashion, Culture, Lifestyle &amp; Entertainment
          </p>
        </div>
      </div>

      {/* main bar */}
      <div className="border-b border-ink/12">
        <div className="container-editorial grid h-16 grid-cols-3 items-center md:h-[72px]">
          <div className="flex items-center">
            <button
              aria-label="Toggle menu"
              onClick={() => setOpen((v) => !v)}
              className="group flex h-9 w-9 flex-col items-start justify-center gap-[5px] lg:hidden"
            >
              <span className={`h-px w-6 bg-ink transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`h-px w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`h-px w-6 bg-ink transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </button>
          </div>

          <Link href="/" className="justify-self-center text-center leading-none">
            <span className="block whitespace-nowrap font-display text-[22px] font-bold tracking-[0.06em] sm:text-[26px]">
              GLITZ
            </span>
            <span className="mt-0.5 block font-nav text-[8px] uppercase tracking-widest2 text-gray-500">
              Africa
            </span>
          </Link>

          <div className="flex items-center justify-end gap-5">
            <button aria-label="Search" className="flex h-[18px] w-[18px] items-center justify-center">
              <SearchIcon />
            </button>
            <Link href="/cart" aria-label="Your bag" className="relative flex h-[18px] w-[18px] items-center justify-center">
              <BagIcon />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-ink px-[3px] font-nav text-[9px] leading-none text-paper">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav className="hidden justify-center gap-6 border-t border-ink/8 py-3 font-nav text-[11px] uppercase tracking-[0.14em] text-gray-700 lg:flex xl:gap-9">
          {PRIMARY_LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="link-underline hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* mobile drawer */}
      <div
        className={`fixed inset-0 top-16 z-40 bg-paper transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <nav className="container-editorial flex flex-col divide-y divide-ink/10 pt-2">
          {PRIMARY_LINKS.map((l) => (
            <Link
              key={l.label}
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

function BagIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-full w-full stroke-ink" strokeWidth="1.4">
      <path d="M5.5 7h9l.7 10.5a1 1 0 0 1-1 1.07H5.8a1 1 0 0 1-1-1.07L5.5 7Z" strokeLinejoin="round" />
      <path d="M7.3 7V5.3a2.7 2.7 0 0 1 5.4 0V7" strokeLinecap="round" />
    </svg>
  );
}
