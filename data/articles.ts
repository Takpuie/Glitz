import {
  getArticles as getBackendArticles,
  getArticle as getBackendArticle,
  relatedArticles as getRelatedBackendArticles,
  CATEGORIES,
  type Article,
} from "@/lib/backend";

export { CATEGORIES };
export type { Article, Category } from "@/lib/backend";

const fallbackArticles = [
  {
    slug: "gafw-2026-lineup",
    category: "Fashion",
    title: "Inside the GAFW 2026 Lineup: Twenty Designers Redefining African Luxury",
    dek: "From Accra to Lagos to the diaspora, Glitz Africa Fashion Week returns this November with its most ambitious showcase yet.",
    author: "Ama Boateng",
    date: "Sep 2, 2026",
    readTime: "8 min read",
    image: "/images/gafw/hero-designer-and-model.jpg",
    body: [
      "Glitz Africa Fashion Week returns with a new generation of designers putting African craft, tailoring and movement at the centre of the global conversation.",
      "The 2026 lineup brings together established houses and emerging voices from across the continent for a week built around runway, trade and community.",
    ],
    featured: true,
  },
] as const;

export async function getArticles(): Promise<Article[]> {
  try {
    return await getBackendArticles();
  } catch {
    return fallbackArticles as unknown as Article[];
  }
}

export async function getArticle(slug: string): Promise<Article | undefined> {
  try {
    return await getBackendArticle(slug);
  } catch {
    return fallbackArticles.find((article) => article.slug === slug) as unknown as Article | undefined;
  }
}

export async function relatedArticles(slug: string, count = 3): Promise<Article[]> {
  try {
    return await getRelatedBackendArticles(slug, count);
  } catch {
    return fallbackArticles.filter((article) => article.slug !== slug).slice(0, count) as unknown as Article[];
  }
}
