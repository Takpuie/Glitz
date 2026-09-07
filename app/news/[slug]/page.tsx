import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import { articles, getArticle, relatedArticles } from "@/data/articles";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) return notFound();
  const related = relatedArticles(article.slug);

  const body = [
    "It is easy to talk about African fashion as a single story — one continent, one aesthetic, one moment. Spend an afternoon on the trade tent floor and that story falls apart within minutes.",
    "What emerges instead is closer to the truth: a hundred smaller stories, each with its own supply chain, its own client base, its own argument about what luxury means outside of Paris and Milan. This is the story Glitz Africa keeps returning to, issue after issue, event after event.",
    "“We are not asking for a seat at someone else's table anymore,” one designer told us backstage, still pinning a hem minutes before doors opened. “We built our own table. Now we're deciding who sits where.”",
    "That confidence is new, or at least newly visible — and it is exactly the shift this publication exists to document.",
  ];

  return (
    <article>
      <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden bg-ink">
        <Image unoptimized src={article.image} alt={article.title} fill priority sizes="100vw" className="object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
        <div className="container-editorial absolute inset-x-0 bottom-0 pb-10">
          <p className="font-nav text-[11px] uppercase tracking-widest2 text-gray-200">{article.category}</p>
          <h1 className="mt-4 max-w-3xl font-display text-3xl leading-[1.05] text-paper sm:text-5xl">
            {article.title}
          </h1>
        </div>
      </div>

      <div className="container-editorial grid grid-cols-1 gap-12 py-14 md:grid-cols-[1fr_260px] md:py-20">
        <div className="mx-auto w-full max-w-2xl">
          <p className="font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">
            By {article.author} &middot; {article.date} &middot; {article.readTime}
          </p>
          <p className="mt-6 font-display text-xl leading-relaxed text-gray-800 sm:text-2xl">
            {article.dek}
          </p>
          <div className="mt-8 space-y-6 text-[17px] leading-relaxed text-gray-800">
            {body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-10 flex gap-5 border-y border-ink/15 py-5 font-nav text-[11px] uppercase tracking-widest2">
            <span className="text-gray-500">Share</span>
            <a href="#" className="link-underline">X</a>
            <a href="#" className="link-underline">Facebook</a>
            <a href="#" className="link-underline">WhatsApp</a>
          </div>
        </div>

        <aside className="space-y-8 md:border-l md:border-ink/15 md:pl-10">
          <div>
            <p className="eyebrow mb-4">Read Next</p>
            <div className="space-y-6">
              {related.map((r) => (
                <Link key={r.slug} href={`/news/${r.slug}`} className="group block">
                  <p className="font-display text-lg leading-snug group-hover:underline underline-offset-4">
                    {r.title}
                  </p>
                  <p className="mt-1 font-nav text-[10px] uppercase tracking-widest2 text-gray-500">
                    {r.category}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <section className="hairline">
        <div className="container-editorial py-14 md:py-16">
          <p className="eyebrow mb-8">More From Glitz Africa</p>
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
            {related.map((r) => (
              <ArticleCard key={r.slug} article={r} size="small" />
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
