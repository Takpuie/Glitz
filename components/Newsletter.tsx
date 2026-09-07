"use client";

import { useState } from "react";

export default function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="grid grid-cols-1 items-end gap-6 border-b border-ink/15 pb-14 md:grid-cols-2">
      <div>
        <p className="eyebrow mb-3">Newsletter</p>
        <h3 className="font-display text-3xl leading-tight sm:text-4xl">
          The world of Glitz, straight to your inbox.
        </h3>
        <p className="mt-3 max-w-md text-sm text-gray-600">
          Fashion, business and event news across Ghana and the continent —
          plus first access to GAFW tickets and open calls.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        {submitted ? (
          <p className="font-nav text-[11px] uppercase tracking-widest2">
            You&rsquo;re on the list — thank you.
          </p>
        ) : (
          <>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="Email address"
              className="w-full border-b border-ink bg-transparent px-1 py-3 font-body text-sm placeholder:text-gray-500 focus:outline-none sm:min-w-[280px]"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              Subscribe
            </button>
          </>
        )}
      </form>
    </div>
  );
}
