import sanitizeHtml from "sanitize-html";
import type { ArticleBodyBlock, ArticleGalleryItem } from "@/lib/backend";

type CmsImage = { full_url: string; width?: number; height?: number; alt?: string };
type CaptionedImage = { image: CmsImage; caption?: string };

function clean(value: unknown) {
  return sanitizeHtml(typeof value === "string" ? value : "", {
    allowedTags: ["p", "br", "strong", "em", "b", "i", "u", "s", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a"],
    allowedAttributes: { a: ["href", "title"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: { a: (_name, attrs) => ({ tagName: "a", attribs: { ...attrs, rel: "noopener noreferrer" } }) },
  });
}

function CmsFigure({ image, caption }: CaptionedImage) {
  if (!image?.full_url) return null;
  return (
    <figure className="my-9">
      {/* CMS dimensions preserve layout; browser handles arbitrary editorial aspect ratios. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.full_url} alt={image.alt || caption || "Article image"} width={image.width} height={image.height} className="h-auto w-full" loading="lazy" />
      {caption && <figcaption className="mt-2 font-nav text-xs leading-relaxed text-gray-500">{caption}</figcaption>}
    </figure>
  );
}

function embedUrl(raw: string) {
  try {
    const url = new URL(raw);
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : raw;
    }
    if (url.hostname === "youtu.be") return `https://www.youtube.com/embed/${url.pathname.slice(1)}`;
    if (url.hostname.includes("vimeo.com")) return `https://player.vimeo.com/video/${url.pathname.split("/").filter(Boolean).pop()}`;
  } catch { return raw; }
  return raw;
}

export function ArticleBody({ blocks }: { blocks: ArticleBodyBlock[] }) {
  return <div className="article-body mt-10">{blocks.map((block, index) => {
    const key = block.id || `${block.type}-${index}`;
    if (block.type === "paragraph") return <div key={key} className="article-body-block" dangerouslySetInnerHTML={{ __html: clean(block.value) }} />;
    if (block.type === "heading") {
      const value = block.value as { text?: string; level?: string };
      return value.level === "h3" ? <h3 key={key} className="mb-4 mt-10 font-display text-2xl">{value.text}</h3> : <h2 key={key} className="mb-4 mt-12 font-display text-3xl">{value.text}</h2>;
    }
    if (block.type === "image") return <CmsFigure key={key} image={block.value as CmsImage} />;
    if (block.type === "captioned_image") return <CmsFigure key={key} {...block.value as CaptionedImage} />;
    if (block.type === "two_images") {
      const value = block.value as { left_image: CmsImage; left_caption?: string; right_image: CmsImage; right_caption?: string };
      return <div key={key} className="my-9 grid gap-4 sm:grid-cols-2"><CmsFigure image={value.left_image} caption={value.left_caption} /><CmsFigure image={value.right_image} caption={value.right_caption} /></div>;
    }
    if (block.type === "gallery") {
      const items = block.value as CaptionedImage[];
      return <div key={key} className="my-10 grid gap-4 sm:grid-cols-2">{items.map((item, i) => <CmsFigure key={i} {...item} />)}</div>;
    }
    if (block.type === "quote") {
      const value = block.value as { quote?: string; attribution?: string };
      return <blockquote key={key} className="my-10 border-l-2 border-gold pl-6 font-display text-2xl leading-snug">{value.quote}{value.attribution && <cite className="mt-3 block font-nav text-xs not-italic uppercase tracking-widest2 text-gray-500">{value.attribution}</cite>}</blockquote>;
    }
    if (block.type === "highlight") {
      const value = block.value as { heading?: string; text?: string };
      return <aside key={key} className="my-10 border-y border-gold/50 bg-[#f8f5ed] p-7">{value.heading && <h3 className="mb-3 font-display text-2xl">{value.heading}</h3>}<div dangerouslySetInnerHTML={{ __html: clean(value.text) }} /></aside>;
    }
    if (block.type === "call_to_action") {
      const value = block.value as { heading?: string; text?: string; button_label?: string; button_url?: string; style?: string };
      const buttonClass = value.style === "outline" ? "border border-ink text-ink" : value.style === "gold" ? "bg-gold text-ink" : "bg-ink text-white";
      return <aside key={key} className="my-10 bg-[#f4f0e7] p-7 text-center">{value.heading && <h3 className="font-display text-2xl">{value.heading}</h3>}<div className="mt-3" dangerouslySetInnerHTML={{ __html: clean(value.text) }} />{value.button_url && <a href={value.button_url} className={`mt-5 inline-block px-6 py-3 font-nav text-xs uppercase tracking-widest2 ${buttonClass}`}>{value.button_label}</a>}</aside>;
    }
    if (block.type === "video") {
      const value = block.value as { url?: string; caption?: string };
      if (!value.url) return null;
      return <figure key={key} className="my-10"><div className="aspect-video overflow-hidden bg-black"><iframe src={embedUrl(value.url)} title={value.caption || "Article video"} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>{value.caption && <figcaption className="mt-2 text-xs text-gray-500">{value.caption}</figcaption>}</figure>;
    }
    if (block.type === "divider") return <hr key={key} className="my-12 border-ink/20" />;
    return null;
  })}</div>;
}

export function ArticleGallery({ items }: { items: ArticleGalleryItem[] }) {
  if (!items.length) return null;
  return <section className="mt-12 border-t border-ink/15 pt-10" aria-labelledby="story-gallery"><p id="story-gallery" className="eyebrow mb-6">Story Gallery</p><div className="grid gap-5 sm:grid-cols-2">{items.map((item, index) => <figure key={item.id ?? index} className="m-0">{item.kind === "image" && item.image ? <CmsFigure image={item.image} caption={item.caption} /> : item.video_file ? <><video src={item.video_file} controls preload="metadata" className="w-full bg-black" aria-label={item.caption || "Gallery video"} />{item.caption && <figcaption className="mt-2 text-xs text-gray-500">{item.caption}</figcaption>}</> : null}</figure>)}</div></section>;
}
