import Link from "next/link";
import MediaVideoCard from "@/components/MediaVideoCard";
import type { MediaVideo } from "@/lib/backend";

function FilmGroup({ videos, duplicate = false }: { videos: MediaVideo[]; duplicate?: boolean }) {
  return (
    <div className={`film-group flex shrink-0 items-start gap-5 pr-5 md:gap-7 md:pr-7 ${duplicate ? "pointer-events-none select-none" : ""}`} aria-hidden={duplicate || undefined}>
      {videos.map((video, index) => (
        <div
          key={video.id}
          className={`shrink-0 ${index % 3 === 1 ? "w-[72vw] sm:w-[42vw] lg:w-[30vw]" : "w-[64vw] sm:w-[36vw] lg:w-[24vw]"}`}
        >
          <MediaVideoCard video={video} preview />
        </div>
      ))}
    </div>
  );
}

export default function HomeVideos({ videos }: { videos: MediaVideo[] }) {
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
        <Link href="/media" className="hidden shrink-0 border-b border-white/60 pb-2 font-nav text-xs uppercase tracking-widest transition-colors hover:border-white sm:block">
          Explore all films
        </Link>
      </div>

      <div className="film-reel relative overflow-hidden" aria-label="Featured Glitz films">
        <div className="film-track flex w-max">
          <FilmGroup videos={featured} />
          <FilmGroup videos={featured} duplicate />
        </div>
      </div>

      <div className="container-editorial mt-10 sm:hidden">
        <Link href="/media" className="border-b border-white/60 pb-2 font-nav text-xs uppercase tracking-widest">
          Explore all films
        </Link>
      </div>
    </section>
  );
}
