import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import SectionHeading from "@/components/SectionHeading";
import { articles } from "@/data/articles";
import { events } from "@/data/events";
import { currentIssue } from "@/data/issues";
import { editorialImage } from "@/lib/img";

export default function Home() {
  const [cover, secondA, secondB, ...rest] = articles;
  const gafw = events[0];

  return (
    <>
      {/* Hero / cover story */}
      <section className="border-b border-ink/15">
        <Link href={`/news/${cover.slug}`} className="group relative block h-[78vh] min-h-[560px] w-full overflow-hidden bg-ink">
          <Image
            unoptimized
            src={cover.image}
            alt={cover.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" />
          <div className="container-editorial absolute inset-x-0 bottom-0 pb-10 md:pb-14">
            <p className="font-nav text-[11px] uppercase tracking-widest2 text-gray-200">
              Cover Story &middot; {cover.category}
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.03] text-paper sm:text-5xl md:text-6xl lg:text-7xl">
              {cover.title}
            </h1>
            <p className="mt-5 max-w-lg text-sm text-gray-200 md:text-base">{cover.dek}</p>
            <p className="mt-5 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-300">
              {cover.author} &middot; {cover.date} &middot; {cover.readTime}
            </p>
          </div>
        </Link>
      </section>

      {/* Secondary features */}
      <section className="container-editorial py-14 md:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
          <ArticleCard article={secondA} size="large" />
          <ArticleCard article={secondB} size="large" />
        </div>
      </section>

      {/* GAFW banner */}
      <section className="bg-ink text-paper">
        <div className="container-editorial grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="font-nav text-[11px] uppercase tracking-widest2 text-gray-400">
              {gafw.status} &middot; {gafw.dates}
            </p>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">
              {gafw.name}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-300 md:text-base">
              {gafw.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/events/gafw" className="inline-flex items-center justify-center gap-2 bg-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-ink transition-colors hover:bg-gray-200">
                Get Tickets
              </Link>
              <Link href="/nominate" className="inline-flex items-center justify-center gap-2 border border-paper px-7 py-3 font-nav text-[11px] uppercase tracking-widest2 text-paper transition-colors hover:bg-paper hover:text-ink">
                Apply: Young Designers
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <Image unoptimized src={gafw.image} alt={gafw.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Latest mosaic */}
      <section className="container-editorial py-16 md:py-20">
        <SectionHeading eyebrow="Just In" title="Latest" href="/news" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {rest.map((a, i) => (
            <div key={a.slug} className={i === 0 ? "col-span-2 md:col-span-2" : "col-span-1"}>
              <ArticleCard article={a} size={i === 0 ? "large" : "small"} />
            </div>
          ))}
        </div>
      </section>

      {/* Shop teaser */}
      <section className="hairline">
        <div className="container-editorial grid grid-cols-1 gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden bg-gray-100 md:mx-0">
            <Image unoptimized src={currentIssue.image} alt={currentIssue.title} fill sizes="(max-width: 768px) 80vw, 40vw" className="object-cover" />
          </div>
          <div className="flex flex-col justify-center">
            <p className="eyebrow mb-3">{currentIssue.issueNumber} &middot; {currentIssue.season}</p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">{currentIssue.title}</h2>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-gray-600 md:text-base">
              This edition: the women redefining power across business and culture,
              a first look at GAFW 2026, and the interviews that opened doors this year.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary">Shop This Issue &mdash; {currentIssue.price}</Link>
              <Link href="/shop#subscribe" className="btn-outline">Subscribe &amp; Save</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Living teaser strip */}
      <section className="hairline bg-smoke">
        <div className="container-editorial py-16 md:py-20">
          <SectionHeading eyebrow="Glitz Africa Living" title="Life, at a Slower Pace" href="/living" linkLabel="Explore Living" />
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              { title: "Travel", copy: "Weekend escapes across West Africa, mapped by editors.", img: editorialImage("living-travel", 900, 1100) },
              { title: "Interiors", copy: "Homes and studios worth a second look.", img: editorialImage("living-interiors", 900, 1100) },
              { title: "Wellness", copy: "Rest, ritual and the culture of slowing down.", img: editorialImage("living-wellness", 900, 1100) },
            ].map((item) => (
              <Link key={item.title} href="/living" className="group block">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-200">
                  <Image unoptimized src={item.img} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-4 font-display text-2xl group-hover:underline underline-offset-4">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{item.copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
