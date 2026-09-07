import Link from "next/link";

export default function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "View all",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between border-b border-ink/15 pb-5 md:mb-10">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="link-underline hidden font-nav text-[11px] uppercase tracking-widest2 sm:block">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
