const LUMA_HOSTS = new Set(["lu.ma", "luma.com", "www.luma.com", "embed.lu.ma"]);

/** Only Luma URLs are ever framed, whatever ends up in the config. */
export function isLumaUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && LUMA_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export default function LumaEmbed({ src, title }: { src: string; title: string }) {
  if (!isLumaUrl(src)) return null;
  return (
    <div className="w-full overflow-hidden rounded-md border border-ink/15 bg-paper">
      <iframe
        src={src}
        title={title}
        className="block h-[820px] w-full sm:h-[600px]"
        loading="lazy"
        allow="fullscreen; payment"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
