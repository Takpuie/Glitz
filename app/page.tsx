import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import SectionHeading from "@/components/SectionHeading";
import { getArticles } from "@/data/articles";
import { events } from "@/data/events";
import { editorialImage } from "@/lib/img";

export default async function Home() {
  const articles = await getArticles();
  const [cover, ...allRest] = articles;
  const rest = allRest.slice(0, 7);
  const gafw = events[0];

  return (
    <>
      {/* Hero */}
      <section className="container-editorial grid grid-cols-1 items-center gap-10 py-14 md:grid-cols-2 md:gap-16 md:py-20">
        <div>
          <p className="eyebrow mb-4">The Latest From Glitz Africa</p>
          <h1 className="font-display text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
            The culture of
            <br />
            <span className="italic">now.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-gray-600 md:text-lg">
            Your front-row seat to fashion, beauty, entertainment, lifestyle
            and the people shaping Africa.
          </p>
          <Link href={`/articles/${cover.slug}`} className="btn-primary mt-8 inline-flex">
            Read the Feature
          </Link>
        </div>
        <Link href={`/articles/${cover.slug}`} className="group photo-card relative block aspect-[4/5] w-full">
          <Image
            unoptimized
            src={cover.image}
            alt={cover.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between px-5 py-4">
            <p className="font-nav text-[10px] uppercase tracking-widest2 text-paper">Featured Story</p>
            <p className="font-nav text-[10px] uppercase tracking-widest2 text-gray-200">{cover.author}</p>
          </div>
        </Link>
      </section>

      {/* Latest from GLITZ */}
      <section className="hairline">
        <div className="container-editorial py-16 md:py-20">
          <SectionHeading eyebrow="From the Journal" title="Latest from GLITZ" href="/articles" linkLabel="View All Stories" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-x-8">
            {rest.map((a, i) => (
              <div key={a.slug} className={i === 0 ? "col-span-2 md:col-span-2" : "col-span-1"}>
                <ArticleCard article={a} size={i === 0 ? "large" : "small"} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Read something glitzy */}
      <section className="hairline bg-smoke">
        <div className="container-editorial grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="eyebrow mb-4">Glitz Magazine</p>
            <h2 className="font-display text-4xl leading-[1.05] sm:text-5xl">
              Read something
              <br />
              <span className="italic">glitzy.</span>
            </h2>
            <p className="mt-5 max-w-sm text-base text-gray-600">
              A quarterly collection of our most thoughtful stories, designed
              to be kept, shared, and returned to.
            </p>
            <Link href="/magazine" className="btn-outline mt-8 inline-flex">
              Shop the Collection
            </Link>
          </div>
          <div className="photo-card relative aspect-[4/5] w-full max-w-sm justify-self-center bg-gray-200 md:justify-self-end">
            <Image unoptimized src={editorialImage("magazine-cover-home", 1000, 1300)} alt="Glitz Africa Magazine" fill sizes="(max-width: 768px) 80vw, 40vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Glitz Events */}
      <section className="container-editorial py-16 md:py-20">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="photo-card relative aspect-[4/3] w-full bg-gray-200">
            <Image unoptimized src={gafw.image} alt={gafw.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow mb-4">Glitz Events &middot; {gafw.dates}</p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">{gafw.name}</h2>
            <p className="mt-5 max-w-md text-base text-gray-600">{gafw.description}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/events/gafw" className="btn-primary">Get Tickets</Link>
              <Link href="/events" className="btn-outline">All Glitz Events</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
