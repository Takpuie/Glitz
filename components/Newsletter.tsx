"use client";

import { useState } from "react";

export default function Newsletter({ dark = false }: { dark?: boolean }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className={`mt-5 font-nav text-[11px] uppercase tracking-widest2 ${dark ? "text-paper" : "text-ink"}`}>
        You&rsquo;re on the list.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="mt-5 flex max-w-[260px] gap-2"
    >
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-email"
        type="email"
        required
        placeholder="Your email address"
        className={`w-full border-b bg-transparent py-2 font-body text-sm focus:outline-none ${
          dark
            ? "border-gray-600 text-paper placeholder:text-gray-500"
            : "border-ink text-ink placeholder:text-gray-500"
        }`}
      />
      <button
        type="submit"
        className={`shrink-0 font-nav text-[10.5px] uppercase tracking-widest2 underline underline-offset-4 ${
          dark ? "text-paper" : "text-ink"
        }`}
      >
        Join
      </button>
    </form>
  );
}
