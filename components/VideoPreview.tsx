"use client";

import { useEffect, useRef } from "react";

export default function VideoPreview({ src, paused }: { src: string; paused: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const update = () => {
      if (visible && !paused && !preference.matches && !document.hidden) {
        if (!element.getAttribute("src")) element.src = src;
        element.play().catch(() => {});
      } else element.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0.25 });
    observer.observe(element);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); preference.removeEventListener("change", update); document.removeEventListener("visibilitychange", update); element.pause(); };
  }, [src, paused]);
  return <video ref={ref} muted loop playsInline preload="none" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />;
}
