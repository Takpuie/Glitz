"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import MediaVideoCard from "@/components/MediaVideoCard";
import type { MediaVideo } from "@/lib/backend";

export default function HomeVideos({ videos }: { videos: MediaVideo[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  if (!videos.length) return null;
  function move(direction: number) {
    track.current?.scrollBy({ left: direction * track.current.clientWidth * 0.85, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <section className="bg-ink py-16 text-paper md:py-20" aria-labelledby="home-videos-title">
    <div className="container-editorial">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div><p className="mb-3 font-nav text-xs uppercase tracking-widest text-white/60">On film</p><h2 id="home-videos-title" className="font-display text-4xl sm:text-5xl">Inside the world of Glitz.</h2></div>
        <div className="flex flex-wrap items-center gap-3"><button className="text-xs underline underline-offset-8" onClick={() => setPaused(value => !value)}>{paused ? "Play previews" : "Pause previews"}</button><Link href="/media" className="mx-4 text-xs uppercase tracking-widest underline underline-offset-8">All films</Link><button onClick={() => move(-1)} aria-label="Previous videos" aria-controls="home-video-track" className="h-10 w-10 rounded-full border border-white/40">←</button><button onClick={() => move(1)} aria-label="Next videos" aria-controls="home-video-track" className="h-10 w-10 rounded-full border border-white/40">→</button></div>
      </div>
      <div id="home-video-track" ref={track} tabIndex={0} aria-label="Glitz videos; scroll to explore" className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6">
        {videos.map(video => <div key={video.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]"><MediaVideoCard video={video} preview paused={paused} /></div>)}
      </div>
    </div>
  </section>;
}
