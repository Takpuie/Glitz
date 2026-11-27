import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import SectionHeading from "@/components/SectionHeading";
import HomeHero from "@/components/HomeHero";
import HomeVideos from "@/components/HomeVideos";
import PartnerMarquee from "@/components/PartnerMarquee";
import { getArticles } from "@/data/articles";
import { partners } from "@/data/partners";
import { EARLY_BIRD_CLOSES_AT, earlyBird, installmentPlan, retreat, shebossImages, standardFull } from "@/data/sheboss";
import { getMagazineIssues, getHomepageSlides, getMediaVideos, type HomepageSlide, type MediaVideo } from "@/lib/backend";
import { editorialImage } from "@/lib/img";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const articles = await getArticles();
  const rest = articles.slice(0, 7);
  const earlyBirdOpen = Date.now() < Date.parse(EARLY_BIRD_CLOSES_AT);
  const [magazineResult, slidesResult, videosResult] = await Promise.allSettled([
    getMagazineIssues(),
    getHomepageSlides(),
    getMediaVideos(),
  ]);
  const magazineIssues = magazineResult.status === "fulfilled" ? magazineResult.value : [];
  const homepageSlides = slidesResult.status === "fulfilled" ? slidesResult.value : [];
  const videos = videosResult.status === "fulfilled" ? videosResult.value : [];
  const currentIssue = magazineIssues.find((issue) => issue.is_current_issue) ?? magazineIssues[0];

  const fallbackSlides: HomepageSlide[] = [
    { id: -1, title: "The culture of now.", eyebrow: "Glitz Africa", description: "Your front-row seat to fashion, beauty, entertainment and the people shaping Africa.", poster: { full_url: "/images/hero/fashion-editorial-architecture.webp" }, video_url: null, button_label: "Explore the stories", button_path: "/articles" },
    { id: -2, title: "Where fashion comes alive.", eyebrow: "Glitz Africa Fashion Week", description: "The designers, the details, the moments. Experience the runway with Glitz.", poster: { full_url: "/images/hero/fashion-editorial-cattle.webp" }, video_url: null, button_label: "Discover our events", button_path: "/events" },
    { id: -3, title: "Women shaping what comes next.", eyebrow: "The Female CEO Summit", description: "Ideas, conversations and connections with the women leading change.", poster: { full_url: "/images/hero/fashion-editorial-architecture.webp" }, video_url: null, button_label: "Step inside", button_path: "/events/female-ceo-summit" },
  ];
  const fallbackVideos: MediaVideo[] = [
    { id: -1, title: "Backstage at Glitz Africa Fashion Week", thumbnail: { full_url: "/images/gafw/hero-designer-and-model.jpg" }, embed_url: null, file_url: null, duration: "", event: { name: "Glitz Africa Fashion Week", slug: "gafw" } },
    { id: -2, title: "The runway, in motion", thumbnail: { full_url: "/images/gafw/look-yellow-fringe.jpg" }, embed_url: null, file_url: null, duration: "", event: { name: "Glitz Africa Fashion Week", slug: "gafw" } },
    { id: -3, title: "Women shaping what comes next", thumbnail: { full_url: "/images/female-ceo-summit/podium-red-dress.jpg" }, embed_url: null, file_url: null, duration: "", event: { name: "Female CEO Summit", slug: "female-ceo-summit" } },
    { id: -4, title: "Details from the runway", thumbnail: { full_url: "/images/gafw/accessory-beaded-backpack.jpg" }, embed_url: null, file_url: null, duration: "", event: { name: "Glitz Africa Fashion Week", slug: "gafw" } },
    { id: -5, title: "Ideas, leadership and impact", thumbnail: { full_url: "/images/female-ceo-summit/panel-trade-opportunities.jpg" }, embed_url: null, file_url: null, duration: "", event: { name: "Female CEO Summit", slug: "female-ceo-summit" } },
  ];
  const baseHeroSlides = homepageSlides.length ? homepageSlides : fallbackSlides;
  const uploadedHeroVideos = videos.filter((video) => Boolean(video.file_url));
  const heroSlides = baseHeroSlides.map((slide, index) => ({
    ...slide,
    video_url: slide.video_url ?? uploadedHeroVideos[index % uploadedHeroVideos.length]?.file_url ?? null,
  }));

  return (
    <>
      <HomeHero slides={heroSlides} />
      <PartnerMarquee partners={partners} />

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

      <HomeVideos videos={videos.length ? videos : fallbackVideos} />

      {/* Read latest issue */}
      <section className="hairline bg-smoke">
        <div className="container-editorial grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:py-20">
          <div>
            <p className="eyebrow mb-4">Glitz Magazine</p>
            <h2 className="font-display text-4xl leading-[1.05] sm:text-5xl">
              Read Latest
              <br />
              <span className="italic">Issue</span>
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
            <Image unoptimized src={currentIssue?.cover_image?.full_url ?? editorialImage("magazine-cover-home", 1000, 1300)} alt={currentIssue?.title ?? "Glitz Africa Magazine"} fill sizes="(max-width: 768px) 80vw, 40vw" className="object-contain" />
          </div>
        </div>
      </section>

      {/* Glitz Events: featured event */}
      <section className="container-editorial py-16 md:py-20">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
          <div className="photo-card relative aspect-[4/3] w-full bg-gray-200">
            <Image unoptimized src={shebossImages.retreatFeature} alt="SheBoss Global retreat guests dressed in white" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-[center_40%]" />
          </div>
          <div>
            <p className="eyebrow mb-4">Glitz Events &middot; SheBoss Global</p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              Marrakech Retreat <span className="italic text-[#a88418]">2027</span>
            </h2>
            <p className="mt-3 font-nav text-[11px] uppercase tracking-widest2 text-gray-700">
              {retreat.dates} &nbsp;|&nbsp; {retreat.location}
            </p>
            <p className="mt-5 max-w-md text-base text-gray-600">{retreat.tagline}</p>
            <dl className="mt-6 grid max-w-md grid-cols-1 gap-px border border-ink/15 bg-ink/15 sm:grid-cols-3">
              {earlyBirdOpen && (
                <div className="bg-paper px-4 py-3">
                  <dt className="font-nav text-[10px] uppercase tracking-widest2 text-[#a88418]">Early bird</dt>
                  <dd className="mt-1 font-display text-2xl">{earlyBird.price}</dd>
                  <dd className="text-xs text-gray-500">until {earlyBird.deadline}</dd>
                </div>
              )}
              <div className="bg-paper px-4 py-3">
                <dt className="font-nav text-[10px] uppercase tracking-widest2 text-gray-600">Standard</dt>
                <dd className="mt-1 font-display text-2xl">{standardFull.price}</dd>
                <dd className="text-xs text-gray-500">one payment</dd>
              </div>
              <div className="bg-paper px-4 py-3">
                <dt className="font-nav text-[10px] uppercase tracking-widest2 text-gray-600">Installments</dt>
                <dd className="mt-1 font-display text-2xl">{installmentPlan.price}</dd>
                <dd className="text-xs text-gray-500">{installmentPlan.summary}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href={`/events/${retreat.slug}#register`} className="btn-primary">Register &amp; Pay</Link>
              <Link href={`/events/${retreat.slug}`} className="btn-outline">View the Retreat</Link>
            </div>
            <Link href="/events" className="link-underline mt-6 inline-block font-nav text-[11px] uppercase tracking-widest2 text-gray-600">All Glitz Events &rarr;</Link>
          </div>
        </div>
      </section>
    </>
  );
}
