import Image from "next/image";
import { editorialImage } from "@/lib/img";

const archive = [
  { name: "GAFW 2025", year: "2025", winner: "Best Collection: Aisha Obed", img: editorialImage("archive-gafw-2025", 900, 700) },
  { name: "Ghana Women of the Year 2025", year: "2025", winner: "16 honourees celebrated", img: editorialImage("archive-gwoty-2025", 900, 700) },
  { name: "Glitz Style Awards 2025", year: "2025", winner: "Best Dressed: Efya", img: editorialImage("archive-style-2025", 900, 700) },
  { name: "GAFW 2024", year: "2024", winner: "Best Collection: Christie Brown", img: editorialImage("archive-gafw-2024", 900, 700) },
  { name: "SheBoss Global 2024", year: "2024", winner: "200+ founders convened", img: editorialImage("archive-sheboss-2024", 900, 700) },
  { name: "Female CEO Summit 2024", year: "2024", winner: "Keynote: Bozoma Saint John", img: editorialImage("archive-ceo-2024", 900, 700) },
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
            <p className="mt-1 text-sm text-gray-600">{a.winner}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
