"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { MediaVideo } from "@/lib/backend";
import { editorialImage } from "@/lib/img";
import VideoPreview from "@/components/VideoPreview";

export default function MediaVideoCard({ video, preview = false, paused = false }: { video: MediaVideo; preview?: boolean; paused?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const poster = video.thumbnail?.full_url ?? editorialImage(`video-${video.id}`, 900, 1100);

  return (
    <article>
      {playing ? (
        <div>
          {video.file_url ? (
            <video className="aspect-video w-full bg-black" src={video.file_url} poster={poster} controls autoPlay playsInline aria-label={video.title} />
          ) : video.embed_url ? (
            <iframe
              className="aspect-video w-full border-0 bg-black"
              src={`${video.embed_url}?autoplay=1`}
              title={video.title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : null}
          <button type="button" onClick={() => setPlaying(false)} className="mt-2 text-sm underline underline-offset-4">Close video</button>
        </div>
      ) : (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${video.title}`} className="photo-card group relative block aspect-[4/5] w-full bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
          <Image unoptimized src={poster} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
          {preview && video.file_url && <VideoPreview src={video.file_url} paused={paused} />}
          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-paper bg-black/30 text-paper">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-5 w-5"><path d="M8 5v14l11-7z" /></svg>
            </span>
          </span>
          {video.duration && <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 font-nav text-[10px] text-paper">{video.duration}</span>}
        </button>
      )}
      <h3 className="mt-4 font-display text-lg leading-snug">{video.title}</h3>
      {video.event && <Link href={`/events/${encodeURIComponent(video.event.slug)}`} className="mt-2 inline-block text-sm text-gray-600 underline underline-offset-4">{video.event.name}</Link>}
    </article>
  );
}
