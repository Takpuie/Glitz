// Server-side fetch client for the Django + Wagtail backend. Every export
// here runs only on the server (Server Components / route handlers) — the
// URL never needs a NEXT_PUBLIC_ prefix.

import { editorialImage } from "@/lib/img";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

const POST_FIELDS =
  "title,dek,author_name,category(name,slug),published_date,read_time_minutes,cover_image,body";

type WagtailImage = {
  full_url: string;
  width: number;
  height: number;
  alt: string;
};

type WagtailPost = {
  id: number;
  meta: { slug: string };
  title: string;
  dek: string;
  author_name: string;
  category: { name: string; slug: string } | null;
  published_date: string | null;
  read_time_minutes: number | null;
  cover_image: WagtailImage | null;
  body: { type: string; value: string; id: string }[];
};

async function wagtailFetch(path: string) {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    // Editorial content changes rarely; a short revalidate window keeps
    // pages fast without going fully static against a live CMS.
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    throw new Error(`Backend request failed: ${path} (${res.status})`);
  }
  return res.json();
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function toArticle(post: WagtailPost): Article {
  return {
    slug: post.meta.slug,
    category: (post.category?.name as Category) ?? "News",
    title: post.title,
    dek: post.dek,
    author: post.author_name,
    date: formatDate(post.published_date),
    readTime: post.read_time_minutes ? `${post.read_time_minutes} min read` : "",
    image: post.cover_image?.full_url ?? editorialImage(post.meta.slug, 1200, 1500),
    body: post.body.filter((b) => b.type === "paragraph").map((b) => b.value),
  };
}

export const CATEGORIES = ["News", "Entertainment", "Fashion", "Hair & Beauty", "Lifestyle"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Article = {
  slug: string;
  category: Category;
  title: string;
  dek: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  body: string[];
  featured?: boolean;
};

export async function getArticles(): Promise<Article[]> {
  const data = await wagtailFetch(
    `/api/v2/pages/?type=content.Post&fields=${POST_FIELDS}&order=-published_date&limit=100`
  );
  const articles = (data.items as WagtailPost[]).map(toArticle);
  if (articles[0]) articles[0].featured = true;
  return articles;
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  const data = await wagtailFetch(
    `/api/v2/pages/?type=content.Post&fields=${POST_FIELDS}&slug=${encodeURIComponent(slug)}`
  );
  const items = data.items as WagtailPost[];
  if (items.length === 0) return undefined;
  return toArticle(items[0]);
}

export async function relatedArticles(slug: string, count = 3): Promise<Article[]> {
  const all = await getArticles();
  return all.filter((a) => a.slug !== slug).slice(0, count);
}

export type TicketTier = {
  id: number;
  name: string;
  description: string;
  price: string;
  capacity: number;
  remaining: number;
};

export type BackendEvent = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  venue: string;
  start_date: string;
  end_date: string | null;
  status: "on_sale" | "applications_open" | "save_the_date" | "archived";
  cover_image: { url: string; full_url: string; width: number; height: number } | null;
  ticket_types: TicketTier[];
};

export async function getBackendEvent(slug: string): Promise<BackendEvent | undefined> {
  const res = await fetch(`${BACKEND_URL}/api/events/${encodeURIComponent(slug)}/`, {
    next: { revalidate: 30 },
  });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`Backend request failed: /api/events/${slug}/ (${res.status})`);
  return res.json();
}
