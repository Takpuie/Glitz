"use client";

import { useState } from "react";

const CALLS = [
  "GAFW Young Designers Showcase",
  "Ghana Women of the Year — Nominate an Honouree",
  "Glitz Style Awards — Reader Nomination",
];

export default function NominationForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="border border-ink/15 p-10 text-center">
        <p className="eyebrow mb-3">Received</p>
        <h3 className="font-display text-2xl">Thank you — your submission is in.</h3>
        <p className="mt-3 text-sm text-gray-600">
          The review panel will be in touch by email with your status: received,
          shortlisted, or selected.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-8"
    >
      <div>
        <label className="eyebrow mb-2 block">Which open call?</label>
        <select required className="w-full border-b border-ink bg-transparent py-3 font-body text-sm focus:outline-none">
          <option value="">Select an open call</option>
          {CALLS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label className="eyebrow mb-2 block">Full name</label>
          <input required type="text" className="w-full border-b border-ink bg-transparent py-3 font-body text-sm focus:outline-none" />
        </div>
        <div>
          <label className="eyebrow mb-2 block">Email</label>
          <input required type="email" className="w-full border-b border-ink bg-transparent py-3 font-body text-sm focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="eyebrow mb-2 block">Portfolio / press link</label>
        <input type="url" placeholder="https://" className="w-full border-b border-ink bg-transparent py-3 font-body text-sm placeholder:text-gray-400 focus:outline-none" />
      </div>

      <div>
        <label className="eyebrow mb-2 block">Portfolio upload</label>
        <div className="border border-dashed border-ink/30 px-6 py-10 text-center text-sm text-gray-500">
          Drag files here or click to upload (PDF, JPG — max 20MB)
        </div>
      </div>

      <div>
        <label className="eyebrow mb-2 block">Written statement</label>
        <textarea
          required
          rows={5}
          placeholder="Tell us about your work and why this opportunity matters to you."
          className="w-full border-b border-ink bg-transparent py-3 font-body text-sm placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="btn-primary">Submit Application</button>
        <button type="button" className="btn-outline">Save Draft</button>
      </div>
    </form>
  );
}
