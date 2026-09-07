import Image from "next/image";
import ArticleCard from "@/components/ArticleCard";
import { articles } from "@/data/articles";
import { editorialImage } from "@/lib/img";

const pillars = [
  { title: "Travel", copy: "Weekend escapes and long-haul journeys across West Africa and beyond, mapped by editors who've actually made the trip.", img: editorialImage("living-page-travel", 1000, 1250) },
  { title: "Interiors", copy: "Homes, studios and hospitality spaces worth a second look — form, material and the people who made them.", img: editorialImage("living-page-interiors", 1000, 1250) },
  { title: "Wellness", copy: "Rest, ritual and the growing culture of slowing down, from Accra's studios to its coastline.", img: editorialImage("living-page-wellness", 1000, 1250) },
  { title: "Food & Drink", copy: "The chefs, tables and kitchens redefining what modern West African hospitality looks like.", img: editorialImage("living-page-food", 1000, 1250) },
];

export default function LivingPage() {
  const feature = articles.find((a) => a.category === "Living") ?? articles[0];

  return (
    <div>
      <section className="relative h-[56vh] min-h-[420px] w-full overflow-hidden bg-ink">
        <Image unoptimized src={editorialImage("living-hero", 1800, 1000)} alt="Glitz Africa Living" fill priority sizes="100vw" className="object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
        <div className="container-editorial absolute inset-x-0 bottom-0 pb-10">
          <p className="font-nav text-[11px] uppercase tracking-widest2 text-gray-300">Sister Title</p>
          <h1 className="mt-4 font-display text-5xl text-paper sm:text-6xl">Glitz Africa Living</h1>
          <p className="mt-4 max-w-lg text-sm text-gray-200 md:text-base">
            Travel, interiors, wellness and the good table — the lifestyle
            companion to Glitz Africa Magazine.
          </p>
        </div>
      </section>

      <section className="container-editorial py-16 md:py-20">
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div key={p.title}>
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
                <Image unoptimized src={p.img} alt={p.title} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover" />
              </div>
              <h3 className="mt-4 font-display text-2xl">{p.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{p.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <p className="eyebrow mb-8">Featured</p>
          <div className="max-w-lg">
            <ArticleCard article={feature} size="large" />
          </div>
        </div>
      </section>
    </div>
  );
}
