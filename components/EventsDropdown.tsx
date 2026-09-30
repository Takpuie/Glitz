"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export type EventLink = { name: string; slug: string };

export default function EventsDropdown({
  events,
  mobile = false,
  onNavigate,
}: {
  events: EventLink[];
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  function navigate() {
    setOpen(false);
    onNavigate?.();
  }

  return (
    <div
      ref={container}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
        className={mobile
          ? "flex w-full items-center justify-between py-4 text-left font-display text-xl"
          : "flex items-center gap-2 uppercase tracking-[0.14em] hover:text-ink"}
      >
        Glitz Events
        <svg aria-hidden="true" viewBox="0 0 12 12" fill="none" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="m2 4 4 4 4-4" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      <ul
        id={id}
        hidden={!open}
        className={mobile
          ? "mb-4 space-y-1 border-l border-ink/15 pl-4"
          : "absolute right-0 top-full z-50 mt-3 max-h-[65vh] w-80 overflow-y-auto border border-ink/15 bg-paper p-2 shadow-lg"}
      >
        <li>
          <Link href="/events" onClick={navigate} className="block border-b border-ink/10 px-3 py-3 font-nav text-xs font-semibold uppercase tracking-widest hover:bg-smoke focus-visible:bg-smoke">
            All Glitz Events
          </Link>
        </li>
        {events.map((event) => (
          <li key={event.slug}>
            <Link href={`/events/${encodeURIComponent(event.slug)}`} onClick={navigate} className="block px-3 py-3 font-nav text-sm normal-case leading-relaxed tracking-normal text-gray-700 hover:bg-smoke hover:text-ink focus-visible:bg-smoke">
              {event.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
