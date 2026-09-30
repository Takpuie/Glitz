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
    const update = () => setReduced(preference.matches);
    update(); preference.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (section.current) observer.observe(section.current);
    return () => { preference.removeEventListener("change", update); observer.disconnect(); };
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
      {slide.video_url && !reduced && <video ref={video} src={slide.video_url} poster={slide.poster.full_url} muted loop playsInline preload="metadata" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />}
    </div>
    <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/35 to-black/15" />
    <div className="container-editorial pb-8 pt-32 md:pb-12">
      <div className="max-w-3xl pb-14 md:pb-20" aria-live={moving ? "off" : "polite"}>
        <p className="mb-5 font-nav text-[11px] uppercase tracking-[0.3em] text-white/80">{slide.eyebrow || "Glitz Africa"}</p>
        <h1 className="max-w-3xl font-display text-5xl leading-[1.02] sm:text-7xl lg:text-8xl">{slide.title}</h1>
        {slide.description && <p className="mt-6 max-w-lg text-base leading-relaxed text-white/80 md:text-lg">{slide.description}</p>}
        <Link href={slide.button_path} className="mt-8 inline-flex items-center gap-8 border-b border-white/70 pb-3 font-nav text-xs uppercase tracking-widest">{slide.button_label}<span aria-hidden="true">↗</span></Link>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-5 border-t border-white/30 pt-5">
        <div className="flex items-center gap-3" aria-label="Choose a highlight">{slides.map((item, index) => <button key={item.id} onClick={() => setActive(index)} aria-label={`Show ${item.title}`} aria-current={index === active ? "true" : undefined} className={`h-8 w-10 border-b-2 font-nav text-xs ${index === active ? "border-white text-white" : "border-white/25 text-white/60"}`}>{String(index + 1).padStart(2, "0")}</button>)}</div>
        <div className="flex items-center gap-3">
          {!reduced && <button onClick={() => setPaused(value => !value)} className="mr-3 text-xs uppercase tracking-widest" aria-label={paused ? "Play hero motion" : "Pause hero motion"}>{paused ? "Play" : "Pause"}</button>}
          {slides.length > 1 && <><button aria-label="Previous highlight" onClick={() => advance(-1)} className="h-10 w-10 rounded-full border border-white/40">←</button><button aria-label="Next highlight" onClick={() => advance(1)} className="h-10 w-10 rounded-full border border-white/40">→</button></>}
        </div>
      </div>
    </div>
  </section>;
}
