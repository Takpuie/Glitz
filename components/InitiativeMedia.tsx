import Image from "next/image";
import { getMediaPhotos, getMediaVideos } from "@/lib/backend";
import MediaVideoCard from "@/components/MediaVideoCard";

export default async function InitiativeMedia({ slug }: { slug: string }) {
  const [photosResult, videosResult] = await Promise.allSettled([getMediaPhotos(), getMediaVideos()]);
  const photos = (photosResult.status === "fulfilled" ? photosResult.value : []).filter((photo) => photo.event?.slug === slug);
  const videos = (videosResult.status === "fulfilled" ? videosResult.value : []).filter((video) => video.event?.slug === slug);
  if (!photos.length && !videos.length) return null;

  return <section className="hairline bg-smoke">
    <div className="container-editorial space-y-12 py-16">
      {videos.length > 0 && <div>
        <h2 className="mb-8 font-display text-4xl">Videos &amp; Conversations</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => <MediaVideoCard key={video.id} video={video} />)}
        </div>
      </div>}
      {photos.length > 0 && <div>
        <h2 className="mb-8 font-display text-4xl">In Pictures</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo) => <figure key={photo.id}>
            <div className="photo-card relative aspect-[4/3] bg-gray-200">
              <Image unoptimized src={photo.image.full_url} alt={photo.alt_text || photo.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
            </div>
            <figcaption className="mt-3 text-sm text-gray-600">{photo.caption || photo.title}</figcaption>
          </figure>)}
        </div>
      </div>}
    </div>
  </section>;
}
