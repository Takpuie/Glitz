// Article data now lives in the Django + Wagtail CMS — this module just
// re-exports the typed fetch client so existing imports keep working.
export { CATEGORIES, getArticle, getArticles, relatedArticles } from "@/lib/backend";
export type { Article, Category } from "@/lib/backend";
