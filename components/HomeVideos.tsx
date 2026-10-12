"use client";

import Link from "next/link";
import { useState } from "react";
import MediaVideoCard from "@/components/MediaVideoCard";
import type { MediaVideo } from "@/lib/backend";

function FilmGroup({ videos, duplicate = false, paused, onPlaybackChange }: { videos: MediaVideo[]; duplicate?: boolean; paused: boolean; onPlaybackChange: (playing: boolean) => void }) {
  return (
    <div className="film-group flex shrink-0 items-start gap-5 pr-5 md:gap-7 md:pr-7" aria-hidden={duplicate || undefined}>
      {videos.map((video, index) => (
        <div
          key={video.id}
          className={`shrink-0 ${index % 3 === 1 ? "w-[72vw] sm:w-[42vw] lg:w-[30vw]" : "w-[64vw] sm:w-[36vw] lg:w-[24vw]"}`}
        >
          <MediaVideoCard video={video} preview paused={paused} duplicate={duplicate} onPlaybackChange={onPlaybackChange} />
        </div>
      ))}
    </div>
  );
}

export default function HomeVideos({ videos }: { videos: MediaVideo[] }) {
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  if (!videos.length) return null;
  const featured = videos.slice(0, 6);

  return (
    <section className="overflow-hidden bg-ink py-16 text-paper md:py-24" aria-labelledby="home-videos-title">
      <div className="container-editorial mb-10 flex items-end justify-between gap-8 md:mb-14">
        <div>
          <p className="mb-3 font-nav text-xs uppercase tracking-widest text-white/60">Glitz in motion</p>
          <h2 id="home-videos-title" className="max-w-3xl font-display text-4xl leading-[1.02] sm:text-6xl">
            Stories that move culture.
          </h2>
        </div>
        <div className="hidden shrink-0 items-center gap-5 sm:flex">
          <button type="button" onClick={() => setPaused(value => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 font-nav text-[10px] uppercase tracking-widest transition-colors hover:border-[#d4af37] hover:text-[#d4af37]" aria-pressed={paused}>
            <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>{paused ? "Resume reel" : "Pause reel"}
          </button>
          <Link href="/media" className="border-b border-white/60 pb-2 font-nav text-xs uppercase tracking-widest transition-colors hover:border-white">Explore all films</Link>
        </div>
      </div>

      <div className="film-reel relative overflow-hidden" aria-label="Featured Glitz films">
        <div className="film-track flex w-max" style={{ animationPlayState: paused || playing ? "paused" : "running" }}>
          <FilmGroup videos={featured} paused={paused || playing} onPlaybackChange={setPlaying} />
          <FilmGroup videos={featured} duplicate paused={paused || playing} onPlaybackChange={setPlaying} />
        </div>
      </div>

      <div className="container-editorial mt-8 flex items-center justify-between gap-4 sm:hidden">
        <button type="button" onClick={() => setPaused(value => !value)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 font-nav text-[10px] uppercase tracking-widest" aria-pressed={paused}>
          <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>{paused ? "Resume" : "Pause reel"}
        </button>
        <Link href="/media" className="border-b border-white/60 pb-2 font-nav text-xs uppercase tracking-widest">Explore all films</Link>
      </div>
    </section>
  );
}
