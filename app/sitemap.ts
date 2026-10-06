import type { MetadataRoute } from "next";
import { getBackendEvents, getSitemapPosts } from "@/lib/backend";

export const revalidate = 3600;

const BASE_URL = "https://glitzafrica.com";
const STATIC_PATHS = [
  "", "/articles", "/events", "/events/archive", "/events/gafw",
  "/magazine", "/media", "/about", "/foundation", "/partners",
  "/contact", "/nominate",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [postsResult, eventsResult] = await Promise.allSettled([
    getSitemapPosts(),
    getBackendEvents(),
  ]);
  const posts = postsResult.status === "fulfilled" ? postsResult.value : [];
  const events = eventsResult.status === "fulfilled" ? eventsResult.value : [];

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${BASE_URL}${path}`,
      changeFrequency: path === "" || path === "/articles" ? "daily" as const : "weekly" as const,
      priority: path === "" ? 1 : path === "/articles" ? 0.9 : 0.7,
    })),
    ...posts.map((post) => ({
      url: `${BASE_URL}/articles/${encodeURIComponent(post.slug)}`,
      lastModified: post.last_modified ? new Date(post.last_modified) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      url: `${BASE_URL}/events/${encodeURIComponent(event.slug)}`,
      lastModified: event.start_date ? new Date(`${event.start_date}T00:00:00Z`) : undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
