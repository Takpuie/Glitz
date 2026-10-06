"use client";

import { useEffect, useState } from "react";

export default function ArticleShare({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => setUrl(window.location.href), []);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(title);

  async function share() {
    if (!url) return;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copy();
  }

  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-ink/15 py-5 font-nav text-[11px] uppercase tracking-widest2">
      <span className="text-gray-500">Share</span>
      <button type="button" onClick={share} disabled={!url} className="link-underline disabled:opacity-40">
        Share article
      </button>
      <a href={url ? `https://x.com/intent/post?url=${encodedUrl}&text=${encodedText}` : undefined} target="_blank" rel="noopener noreferrer" className="link-underline">X</a>
      <a href={url ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` : undefined} target="_blank" rel="noopener noreferrer" className="link-underline">Facebook</a>
      <a href={url ? `https://wa.me/?text=${encodedText}%20${encodedUrl}` : undefined} target="_blank" rel="noopener noreferrer" className="link-underline">WhatsApp</a>
      <button type="button" onClick={copy} disabled={!url} className="link-underline disabled:opacity-40">
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
