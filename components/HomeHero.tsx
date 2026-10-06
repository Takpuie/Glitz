"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HomepageSlide } from "@/lib/backend";

export default function HomeHero({ slides }: { slides: HomepageSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const [focused, setFocused] = useState(false);
  const section = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const touch = useRef<number | null>(null);
  const moving = !paused && !reduced && visible && !focused;
  const slide = slides[active % slides.length];

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 768px)");
    const update = () => setReduced(preference.matches || !desktop.matches);
    update(); preference.addEventListener("change", update); desktop.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (section.current) observer.observe(section.current);
    return () => { preference.removeEventListener("change", update); desktop.removeEventListener("change", update); observer.disconnect(); };
  }, []);
  useEffect(() => {
    if (!moving || slides.length < 2) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 8000);
    return () => clearInterval(timer);
  }, [moving, slides.length, active]);
  useEffect(() => {
    if (moving) video.current?.play().catch(() => {});
    else video.current?.pause();
  }, [moving, active]);

  if (!slide) return null;
  function advance(direction: number) { setActive(index => (index + direction + slides.length) % slides.length); }
  return <section ref={section} aria-label="Glitz highlights" aria-roledescription="carousel" className="relative isolate flex min-h-[620px] items-end overflow-hidden bg-ink text-white md:min-h-[min(800px,85svh)]"
    onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onTouchStart={event => { touch.current = event.touches[0].clientX; }} onTouchEnd={event => {
      if (touch.current !== null) { const distance = touch.current - event.changedTouches[0].clientX; if (Math.abs(distance) > 60) advance(distance > 0 ? 1 : -1); }
      touch.current = null;
    }}>
    <div key={slide.id} className="hero-reveal absolute inset-0 -z-20">
      <Image unoptimized src={slide.poster.full_url} alt="" fill priority={active === 0} sizes="100vw" className="object-cover" />
      {slide.video_url && !reduced && <video ref={video} src={slide.video_url} poster={slide.poster.full_url} autoPlay={moving} muted loop playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />}
    </div>
    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/35 to-black/15" />
    <div className="container-editorial pb-8 pt-32 md:pb-12">
      <div className="hero-gold-stroke max-w-3xl pb-14 md:pb-20" aria-live={moving ? "off" : "polite"}>
        <p className="mb-5 font-nav text-[11px] uppercase tracking-[0.3em] text-white">{slide.eyebrow || "Glitz Africa"}</p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.02] sm:text-7xl lg:text-8xl">{slide.title}</h1>
        {slide.description && <p className="mt-6 max-w-lg text-base leading-relaxed text-white md:text-lg">{slide.description}</p>}
        <Link href={slide.button_path} className="mt-8 inline-flex items-center gap-8 border-b border-[#d4af37]/70 pb-3 font-nav text-xs uppercase tracking-widest">{slide.button_label}<span aria-hidden="true">↗</span></Link>
      </div>
      <div className="flex justify-end">
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 p-2 shadow-2xl shadow-black/40 backdrop-blur-md">
          {slides.length > 1 && <button aria-label="Previous highlight" onClick={() => advance(-1)} className="group grid h-11 w-11 place-items-center rounded-full text-white/90 transition-all duration-300 hover:bg-white/10 hover:text-[#d4af37]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.5"><path d="m14.5 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>}
          {!reduced && <button onClick={() => setPaused(value => !value)} className="group grid h-14 w-14 place-items-center rounded-full border border-[#d4af37]/80 bg-[#d4af37] text-ink shadow-[0_0_28px_rgba(212,175,55,0.28)] transition-all duration-300 hover:scale-105 hover:bg-[#e5c65b]" aria-label={paused ? "Play hero motion" : "Pause hero motion"}>
            {paused
              ? <svg aria-hidden="true" viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current"><path d="M8.4 5.7a1 1 0 0 1 1.52-.85l9.2 6.3a1 1 0 0 1 0 1.7l-9.2 6.3a1 1 0 0 1-1.52-.85V5.7Z" /></svg>
              : <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current"><rect x="7" y="5" width="3.5" height="14" rx="1" /><rect x="13.5" y="5" width="3.5" height="14" rx="1" /></svg>}
          </button>}
          {slides.length > 1 && <button aria-label="Next highlight" onClick={() => advance(1)} className="group grid h-11 w-11 place-items-center rounded-full text-white/90 transition-all duration-300 hover:bg-white/10 hover:text-[#d4af37]">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="1.5"><path d="m9.5 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>}
        </div>
      </div>
    </div>
  </section>;
}
