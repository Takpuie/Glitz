import MediaVideoCard from "@/components/MediaVideoCard";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getMediaPhotos, getMediaVideos, getPressCoverage } from "@/lib/backend";

export const metadata: Metadata = {
  title: "Media Gallery",
  description: "Watch videos, browse photography and explore press coverage from Glitz Africa.",
  alternates: { canonical: "/media" },
};

export default async function MediaPage() {
  const [videosResult, pressResult, photosResult] = await Promise.allSettled([
    getMediaVideos(),
    getPressCoverage(),
    getMediaPhotos(),
  ]);
  const videos = videosResult.status === "fulfilled" ? videosResult.value : [];
  const press = pressResult.status === "fulfilled" ? pressResult.value : [];
  const photos = photosResult.status === "fulfilled" ? photosResult.value : [];
  if (photosResult.status === "rejected") console.error("Unable to load media photos", photosResult.reason);
  if (videosResult.status === "rejected") console.error("Unable to load media videos", videosResult.reason);
  if (pressResult.status === "rejected") console.error("Unable to load press coverage", pressResult.reason);

  return (
    <div>
      <header className="container-editorial border-b border-ink/12 py-12 md:py-16">
        <p className="eyebrow mb-3">Watch &amp; Read</p>
        <h1 className="font-display text-5xl sm:text-6xl">Media</h1>
        <p className="mt-4 max-w-xl text-sm text-gray-600 md:text-base">
          Photography, runway film, interviews and behind-the-scenes video, plus where else
          Glitz Africa is making news.
        </p>
      </header>

      <section className="container-editorial py-16 md:py-20" aria-labelledby="photos-heading">
        <h2 id="photos-heading" className="eyebrow mb-8">Photos</h2>
        {photos.length ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <figure key={photo.id}>
                <a href={photo.full_image.full_url} target="_blank" rel="noopener noreferrer" className="photo-card group relative block aspect-[4/3] w-full bg-gray-200" aria-label={`View ${photo.title} in full size (opens in a new tab)`}>
                  <Image unoptimized src={photo.image.full_url} alt={photo.alt_text} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </a>
                <figcaption className="mt-4">
                  <h3 className="font-display text-lg leading-snug">{photo.title}</h3>
                  {photo.caption && <p className="mt-2 whitespace-pre-line text-sm text-gray-600">{photo.caption}</p>}
                  {photo.credit && <p className="mt-2 text-xs text-gray-500">Photo: {photo.credit}</p>}
                  {photo.event && <Link href={`/events/${encodeURIComponent(photo.event.slug)}`} className="mt-2 inline-block text-sm text-gray-600 underline underline-offset-4">{photo.event.name}</Link>}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            {photosResult.status === "rejected" ? "Photos are temporarily unavailable. Please try again shortly." : "New photos are coming soon."}
          </p>
        )}
      </section>

      <section className="container-editorial border-t border-ink/12 py-16 md:py-20" aria-labelledby="videos-heading">
        <h2 id="videos-heading" className="eyebrow mb-8">Video</h2>
        {videos.length ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => <MediaVideoCard key={video.id} video={video} />)}
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            {videosResult.status === "rejected" ? "Videos are temporarily unavailable. Please try again shortly." : "New films and interviews are coming soon."}
          </p>
        )}
      </section>

      <section className="hairline bg-smoke" aria-labelledby="press-heading">
        <div className="container-editorial py-16 md:py-20">
          <h2 id="press-heading" className="eyebrow mb-8">In the Press</h2>
          {press.length ? (
            <div className="divide-y divide-ink/15 border-y border-ink/15">
              {press.map((article) => (
                <a key={article.id} href={article.article_url} target="_blank" rel="noopener noreferrer" className="group flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-display text-xl group-hover:underline underline-offset-4">{article.headline}<span className="sr-only"> (opens in a new tab)</span></h3>
                  <div className="shrink-0 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500 sm:text-right">
                    <p>{article.publication}</p>
                    <time dateTime={article.published_date} className="mt-2 block">
                      {new Date(`${article.published_date}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}
                    </time>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              {pressResult.status === "rejected" ? "Press coverage is temporarily unavailable. Please try again shortly." : "Check back soon for Glitz Africa in the press."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
