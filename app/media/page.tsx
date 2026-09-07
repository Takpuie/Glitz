import Image from "next/image";
import { editorialImage } from "@/lib/img";

const videos = [
  { title: "GAFW 2025 — Mainstage Runway Recap", length: "6:42", img: editorialImage("media-gafw-recap", 900, 1100) },
  { title: "Backstage at the Young Designers Showcase", length: "3:18", img: editorialImage("media-backstage", 900, 1100) },
  { title: "Claudia Lumor: The Full Interview", length: "18:05", img: editorialImage("media-claudia-interview", 900, 1100) },
  { title: "Ghana Women of the Year 2025 — Highlights", length: "5:27", img: editorialImage("media-gwoty-highlights", 900, 1100) },
  { title: "Inside the Glitz Africa Studio", length: "4:10", img: editorialImage("media-studio", 900, 1100) },
  { title: "SheBoss Global 2024 — Founder Stories", length: "9:53", img: editorialImage("media-sheboss-stories", 900, 1100) },
];

const press = [
  { outlet: "Forbes Africa", title: "How Glitz Africa Became a Media House You Can't Ignore" },
  { outlet: "OkayAfrica", title: "GAFW Is Quietly Becoming the Continent's Most Important Fashion Week" },
  { outlet: "Business Insider Africa", title: "Inside Kollage Media's Playbook for Building Five Events a Year" },
];

export default function MediaPage() {
  return (
    <div>
      <header className="container-editorial border-b border-ink/12 py-12 md:py-16">
        <p className="eyebrow mb-3">Watch &amp; Read</p>
        <h1 className="font-display text-5xl sm:text-6xl">Media</h1>
        <p className="mt-4 max-w-xl text-sm text-gray-600 md:text-base">
          Runway film, interviews and behind-the-scenes video, plus where else
          Glitz Africa is making news.
        </p>
      </header>

      <section className="container-editorial py-16 md:py-20">
        <p className="eyebrow mb-8">Video</p>
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <div key={v.title} className="group cursor-pointer">
              <div className="photo-card relative aspect-[4/5] w-full bg-gray-200">
                <Image unoptimized src={v.img} alt={v.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-paper text-paper">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-5 w-5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
                <span className="absolute bottom-3 right-3 rounded bg-black/70 px-2 py-1 font-nav text-[10px] text-paper">
                  {v.length}
                </span>
              </div>
              <p className="mt-4 font-display text-lg leading-snug group-hover:underline underline-offset-4">{v.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <p className="eyebrow mb-8">In the Press</p>
          <div className="divide-y divide-ink/15 border-y border-ink/15">
            {press.map((p) => (
              <div key={p.title} className="flex flex-col gap-1 py-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-display text-xl">{p.title}</p>
                <p className="font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">{p.outlet}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
