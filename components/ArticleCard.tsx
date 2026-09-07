import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/data/articles";

export default function ArticleCard({
  article,
  size = "regular",
}: {
  article: Article;
  size?: "large" | "regular" | "small";
}) {
  const aspect =
    size === "large" ? "aspect-[4/5]" : size === "small" ? "aspect-[3/4]" : "aspect-[4/5]";
  const titleSize =
    size === "large"
      ? "text-2xl sm:text-3xl md:text-4xl"
      : size === "small"
      ? "text-base sm:text-lg"
      : "text-xl sm:text-2xl";

  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <div className={`relative w-full overflow-hidden bg-gray-100 ${aspect}`}>
        <Image
          unoptimized
          src={article.image}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="pt-4">
        <p className="eyebrow">{article.category}</p>
        <h3 className={`mt-2 font-display leading-[1.08] ${titleSize} group-hover:underline underline-offset-4`}>
          {article.title}
        </h3>
        {size !== "small" && (
          <p className="mt-2 line-clamp-2 text-sm text-gray-600">{article.dek}</p>
        )}
        <p className="mt-3 font-nav text-[10.5px] uppercase tracking-widest2 text-gray-500">
          {article.author} &middot; {article.date}
        </p>
      </div>
    </Link>
  );
}
