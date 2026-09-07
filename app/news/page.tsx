import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import { articles } from "@/data/articles";

const CATEGORIES = ["All", "Fashion", "Beauty", "Culture", "Business", "Opinion"] as const;

export default function NewsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const active = searchParams.category ?? "All";
  const filtered =
    active === "All" ? articles : articles.filter((a) => a.category === active);
  const [lead, ...restList] = filtered.length ? filtered : articles;

  return (
    <div className="container-editorial py-12 md:py-16">
      <header className="border-b border-ink/15 pb-8">
        <p className="eyebrow mb-3">Section</p>
        <h1 className="font-display text-5xl sm:text-6xl">News &amp; Style</h1>
        <p className="mt-4 max-w-xl text-sm text-gray-600 md:text-base">
          Fashion, beauty, culture, business and opinion from across the continent
          — the daily read from Glitz Africa's editors.
        </p>

        <nav className="mt-8 flex flex-wrap gap-x-7 gap-y-3 font-nav text-[11px] uppercase tracking-widest2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={c === "All" ? "/news" : `/news?category=${c}`}
              className={`link-underline pb-1 ${active === c ? "text-ink" : "text-gray-500 hover:text-ink"}`}
            >
              {c}
            </Link>
          ))}
        </nav>
      </header>

      {lead && (
        <div className="border-b border-ink/15 py-12">
          <ArticleCard article={lead} size="large" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-14 pt-12 sm:grid-cols-2 lg:grid-cols-3">
        {restList.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>
    </div>
  );
}
