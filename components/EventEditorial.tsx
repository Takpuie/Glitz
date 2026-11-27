import Image from "next/image";

export type EditorialPhoto = { src: string; alt: string; caption?: string; wide?: boolean };
export type EditorialPerson = { name: string; role: string };

export function SectionHead({ eyebrow, title, light = false, center = false }: { eyebrow: string; title: string; light?: boolean; center?: boolean }) {
  return (
    <div className={`mb-10 border-b pb-5 md:mb-12 ${light ? "border-paper/20" : "border-ink/15"} ${center ? "text-center" : ""}`}>
      <p className={`mb-2 font-nav text-[11px] uppercase tracking-widest2 ${light ? "text-[#d4af37]" : "text-gray-600"}`}>{eyebrow}</p>
      <h2 className="font-display text-4xl sm:text-5xl">{title}</h2>
    </div>
  );
}

/** Masonry-style grid: wide photos span two columns. */
export function PhotoGrid({ photos, columns = 4 }: { photos: EditorialPhoto[]; columns?: 3 | 4 }) {
  return (
    <div className={`grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 ${columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
      {photos.map((photo) => (
        <figure key={photo.src} className={`group relative overflow-hidden rounded-md bg-gray-200 ${photo.wide ? "col-span-2 aspect-[3/2]" : "aspect-[2/3]"}`}>
          <Image
            unoptimized
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={photo.wide ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
            className="object-cover object-[center_22%] transition-transform duration-700 group-hover:scale-105"
          />
          {photo.caption && (
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-10 font-nav text-[10px] uppercase tracking-widest2 text-paper">
              {photo.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

/** Name and role cards, for speakers, guests and honourees. Cell borders
 * (not a gap background) so a part-filled last row leaves no grey blocks. */
export function PeopleGrid({ people, light = false }: { people: EditorialPerson[]; light?: boolean }) {
  return (
    <ul className={`grid grid-cols-1 border-l border-t sm:grid-cols-2 lg:grid-cols-3 ${light ? "border-paper/15" : "border-ink/15"}`}>
      {people.map((person) => (
        <li key={person.name} className={`border-b border-r p-6 ${light ? "border-paper/15" : "border-ink/15"}`}>
          <p className="font-display text-2xl leading-tight">{person.name}</p>
          <p className={`mt-2 text-sm ${light ? "text-paper/70" : "text-gray-600"}`}>{person.role}</p>
        </li>
      ))}
    </ul>
  );
}
