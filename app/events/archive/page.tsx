import Image from "next/image";
import { editorialImage } from "@/lib/img";

const archive = [
  { name: "GAFW 2022", year: "2022", winner: "", img: "/images/gafw/look-red-rope-belt.jpg" },
  { name: "Ghana Women of the Year 2026", year: "2026", winner: "12 honourees celebrated", img: editorialImage("archive-gwoty-2026", 900, 700) },
  { name: "She Boss Global UK 2026", year: "2026", winner: "", img: editorialImage("archive-sheboss-global-uk-2026", 900, 700) },
  { name: "She Boss Doha Retreat 2026", year: "2026", winner: "", img: editorialImage("archive-sheboss-doha-2026", 900, 700) },
  { name: "Female CEO Summit 2026", year: "2026", winner: "Keynote: Matilda Asante", img: "/images/female-ceo-summit/podium-speaker.jpg" },
];

export default function EventsArchivePage() {
  return (
    <div className="container-editorial py-12 md:py-16">
      <header className="border-b border-ink/15 pb-8">
        <p className="eyebrow mb-3">Permanent Record</p>
        <h1 className="font-display text-5xl sm:text-6xl">Event Archive</h1>
        <p className="mt-4 max-w-xl text-sm text-gray-600 md:text-base">
          Every past edition, honouree list and gallery — nothing here gets
          taken down once the event ends.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-x-8 gap-y-14 pt-12 sm:grid-cols-2 lg:grid-cols-3">
        {archive.map((a) => (
          <div key={a.name} className="group">
            <div className="photo-card relative aspect-[4/3] w-full bg-gray-100">
              <Image unoptimized src={a.img} alt={a.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="mt-4 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">{a.year}</p>
            <h3 className="mt-1 font-display text-2xl">{a.name}</h3>
            {a.winner && <p className="mt-1 text-sm text-gray-600">{a.winner}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
