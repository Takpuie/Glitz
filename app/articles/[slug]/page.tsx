import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import sanitizeHtml from "sanitize-html";
import ArticleCard from "@/components/ArticleCard";
import ReaderComments from "@/components/ReaderComments";
import ArticleShare from "@/components/ArticleShare";
import {
  getArticles,
  getArticle,
  relatedArticles,
} from "@/lib/backend";

function sanitizeArticleHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [
      "p", "br", "strong", "em", "b", "i", "u", "s", "h2", "h3", "h4",
      "ul", "ol", "li", "blockquote", "a", "figure", "figcaption", "img", "hr", "span",
    ],
    allowedAttributes: {
      "*": ["class"],
      a: ["href", "title"],
      img: ["src", "alt", "width", "height", "loading"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: (_tagName, attributes) => ({
        tagName: "a",
        attribs: { ...attributes, rel: "noopener noreferrer" },
      }),
    },
  });
}

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug);
  if (!article) return { title: "Story not found", robots: { index: false, follow: false } };
  const canonical = `/articles/${article.slug}`;
  return {
    title: article.title,
    description: article.dek || `Read ${article.title} on Glitz Africa.`,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: canonical,
      siteName: "Glitz Africa",
      title: article.title,
      description: article.dek,
      publishedTime: article.publishedDate ?? undefined,
      authors: article.author ? [article.author] : undefined,
      images: [{ url: article.image, alt: article.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.dek,
      images: [article.image],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticle(params.slug);
  if (!article) return notFound();
  const related = await relatedArticles(article.slug);
  const body = article.body;
  const safeBody = body.map(sanitizeArticleHtml);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.dek,
    image: [article.image],
    datePublished: article.publishedDate,
    author: { "@type": "Person", name: article.author || "Glitz Africa" },
    publisher: { "@type": "Organization", name: "Glitz Africa", url: "https://glitzafrica.com" },
    mainEntityOfPage: `https://glitzafrica.com/articles/${article.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <header className="container-editorial border-b border-ink/12 py-12 md:py-16">
        <p className="eyebrow mb-3">{article.category}</p>
        <h1 className="max-w-3xl font-display text-4xl leading-[1.05] sm:text-5xl md:text-6xl">
          {article.title}
        </h1>
        <p className="mt-5 max-w-xl text-base text-gray-600 md:text-lg">{article.dek}</p>
        <p className="mt-6 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">
          By {article.author} &middot; {article.date} &middot; {article.readTime}
        </p>
      </header>

      <div className="container-editorial grid grid-cols-1 gap-12 py-14 md:grid-cols-[1fr_260px] md:py-16">
        <div className="mx-auto w-full max-w-2xl">
          <div className="photo-card relative aspect-[16/10] w-full bg-gray-200">
            <Image unoptimized src={article.image} alt={article.title} fill sizes="(max-width: 768px) 100vw, 700px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
              <p className="font-nav text-[10px] uppercase tracking-widest2 text-paper">Featured Story</p>
            </div>
          </div>

          <div className="article-body mt-10">
            {safeBody.map((html, i) => (
              <div key={i} className="article-body-block" dangerouslySetInnerHTML={{ __html: html }} />
            ))}
          </div>

          <ArticleShare title={article.title} />
        </div>

        <aside className="space-y-8 md:border-l md:border-ink/15 md:pl-10">
          <div>
            <p className="eyebrow mb-4">Read Next</p>
            <div className="space-y-6">
              {related.map((r) => (
                <Link key={r.slug} href={`/articles/${r.slug}`} className="group block">
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

      <ReaderComments slug={article.slug} />

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
