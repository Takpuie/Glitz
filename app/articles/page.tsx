import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { getArticles, CATEGORIES } from "@/data/articles";

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const articles = await getArticles();
  const active = searchParams.category;
  const filtered = active ? articles.filter((a) => a.category === active) : articles;

  return (
    <div className="container-editorial py-12 md:py-16">
      <header className="flex flex-col gap-6 border-b border-ink/12 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-3">Glitz Africa Journal</p>
          <h1 className="font-display text-5xl sm:text-6xl">Stories</h1>
          {active && (
            <p className="mt-3 text-sm text-gray-600">Browsing category: {active}</p>
          )}
        </div>
        <nav className="flex flex-wrap gap-2">
          <Link
            href="/articles"
            className={`rounded-full px-4 py-1.5 font-nav text-[10.5px] uppercase tracking-widest2 transition-colors ${
              !active ? "bg-ink text-paper" : "border border-ink/20 text-gray-600 hover:border-ink hover:text-ink"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/articles?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-1.5 font-nav text-[10.5px] uppercase tracking-widest2 transition-colors ${
                active === c ? "bg-ink text-paper" : "border border-ink/20 text-gray-600 hover:border-ink hover:text-ink"
              }`}
            >
              {c}
            </Link>
          ))}
        </nav>
      </header>

      {filtered.length === 0 ? (
        <p className="py-20 text-sm text-gray-500">No stories found for this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 pt-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard key={a.slug} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
