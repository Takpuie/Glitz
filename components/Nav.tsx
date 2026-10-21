"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountLink } from "@/components/AccountModal";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart-context";
import MagazineDropdown from "@/components/MagazineDropdown";
import Newsletter from "@/components/Newsletter";
import { CATEGORIES } from "@/data/articles";
import { INITIATIVES } from "@/data/initiatives";
import { visitorRequest, type Reader, type VisitorSession } from "@/lib/visitor";

const PRIMARY_LINKS = INITIATIVES;
const MAGAZINE_CATEGORIES = [
  { name: "All Stories", slug: "all", href: "/articles" },
  ...CATEGORIES.map((category) => ({ name: category, slug: category, href: `/articles?category=${encodeURIComponent(category)}` })),
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const [reader, setReader] = useState<Reader | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    let version = 0;
    async function refreshReader() {
      const requestVersion = ++version;
      try {
        const session = await visitorRequest<VisitorSession>("session");
        if (active && requestVersion === version) setReader(session.reader);
      } catch { /* Keep the last known state during a temporary connection failure. */ }
    }
    function updateReader(event: Event) {
      version++;
      setReader((event as CustomEvent<Reader | null>).detail);
    }
    refreshReader();
    window.addEventListener("focus", refreshReader);
    window.addEventListener("glitz:reader-updated", updateReader);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshReader);
      window.removeEventListener("glitz:reader-updated", updateReader);
    };
  }, [pathname]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

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
        <div className="container-editorial grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 md:h-[72px] md:grid-cols-3">
          <div className="flex items-center">
            <button
              aria-label="Toggle menu"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              onClick={() => setOpen((v) => !v)}
              className="group flex h-9 w-9 flex-col items-start justify-center gap-[5px] lg:hidden"
            >
              <span className={`h-px w-6 bg-ink transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`h-px w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
              <span className={`h-px w-6 bg-ink transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </button>
          </div>

          <Link href="/" aria-label="Glitz Africa home" className="justify-self-center">
            <Image
              src="/images/glitz-logo-black.png"
              alt="Glitz Africa"
              width={208}
              height={63}
              priority
              className="h-auto w-[132px] sm:w-[150px]"
            />
          </Link>

          <div className="flex items-center justify-end gap-2 sm:gap-5">
            {reader ? <Link href="/account" aria-label={`Your account: ${reader.display_name}`} title={reader.display_name} className="flex min-w-0 items-center gap-1.5 rounded-full hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/40">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <circle cx="12" cy="8" r="3.25" />
                <path d="M5.5 20v-1.5a6.5 6.5 0 0 1 13 0V20" strokeLinecap="round" />
              </svg>
              </span>
              <span className="max-w-[56px] truncate font-nav text-xs sm:max-w-[120px]">{reader.display_name}</span>
            </Link> : <AccountLink className="flex h-8 shrink-0 items-center rounded-full border border-ink/40 px-3 font-nav text-[11px] hover:bg-ink/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">Sign in</AccountLink>}
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

        <nav aria-label="Main navigation" className="hidden justify-center gap-6 border-t border-ink/8 py-3 font-nav text-[11px] uppercase tracking-[0.14em] text-gray-700 lg:flex xl:gap-9">
          {PRIMARY_LINKS.map((l) => (
            l.href === "/magazine" ? <MagazineDropdown key={l.label} events={MAGAZINE_CATEGORIES} /> :
            <Link key={l.label} href={l.href} className="link-underline hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* mobile drawer */}
      <div
        id="mobile-navigation"
        hidden={!open}
        onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
        className="fixed inset-0 top-24 z-40 overflow-y-auto bg-paper md:top-[104px] lg:hidden"
      >
        <div className="mx-auto w-full max-w-lg px-8 pb-12 pt-5 text-center">
          <nav aria-label="Mobile navigation" className="flex flex-col divide-y divide-ink/15 border-b border-ink/15">
            {PRIMARY_LINKS.map((l) => (
              l.href === "/magazine" ? <MagazineDropdown key={l.label} events={MAGAZINE_CATEGORIES} mobile onNavigate={() => setOpen(false)} /> :
              <Link key={l.label} href={l.href} onClick={() => setOpen(false)} className="py-5 font-nav text-sm uppercase tracking-[0.12em]">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="py-7">
            <p className="font-nav text-[11px] uppercase tracking-widest2 text-gray-500">Follow Glitz Africa</p>
            <div className="mt-5 flex items-center justify-center gap-9">
              <SocialLink href="https://www.instagram.com/glitzafrica_hq/" label="Instagram"><InstagramIcon /></SocialLink>
              <SocialLink href="https://www.tiktok.com/@glitz.africa" label="TikTok"><TikTokIcon /></SocialLink>
              <SocialLink href="https://x.com/glitzafrica" label="X"><XIcon /></SocialLink>
            </div>
          </div>

          <div className="border-t border-ink/15 pt-7">
            <h2 className="font-display text-2xl">Stay in the know</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-600">Get the latest stories, style and events from Glitz Africa in your inbox.</p>
            <Newsletter buttonLabel="Subscribe" className="mx-auto text-left [&_button]:w-full" />
          </div>

          <div className="mt-7 border-t border-ink/15 pt-5">
            {reader ? <Link href="/account" onClick={() => setOpen(false)} className="break-words font-nav text-xs uppercase tracking-widest2 text-gray-600">{reader.display_name}</Link> : <AccountLink onClick={() => setOpen(false)} className="font-nav text-xs uppercase tracking-widest2 text-gray-600">Sign in</AccountLink>}
          </div>
        </div>
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

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return <a href={href} aria-label={`Visit Glitz Africa on ${label}`} title={label} className="relative z-10 flex h-11 w-11 touch-manipulation items-center justify-center rounded-full border border-ink/20 transition-colors hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper focus-visible:outline-none">{children}</a>;
}

function InstagramIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><rect x="3.5" y="3.5" width="17" height="17" rx="4" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.7" r=".8" fill="currentColor" stroke="none" /></svg>;
}

function TikTokIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M14 4v10.2a4.2 4.2 0 1 1-3.2-4.1" /><path d="M14 4c.7 2.6 2.4 4.1 5 4.4" /></svg>;
}

function XIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4.2 3h4.5l4.1 5.5L17.6 3h2.1l-6 7 6.3 11h-4.5l-4.7-6.3L5.4 21H3.3l6.5-7.8L4.2 3Zm3.4 1.7 8.8 14.6h1.9L9.5 4.7H7.6Z" /></svg>;
}
