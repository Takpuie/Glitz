"use client";

import { useId, useRef, useState } from "react";

export default function SubmissionForm({
  kind, children, buttonLabel = "Send message", className = "space-y-6", successMessage = "Thank you. Your submission has been received.",
}: {
  kind: "newsletter" | "nominations" | "enquiries";
  children: React.ReactNode;
  buttonLabel?: string;
  className?: string;
  successMessage?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const submissionId = useRef("");
  const submitting = useRef(false);
  const id = useId();

  if (submitted) return <div role="status" className="space-y-2 py-5"><p>{successMessage}</p>{reference && <p className="break-all text-xs">Reference: {reference}</p>}</div>;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      if (kind !== "newsletter") {
        if (!submissionId.current) submissionId.current = crypto.randomUUID();
        form.set("submission_id", submissionId.current);
      }
      const response = await fetch(`/api/submissions/${kind}`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) {
        const messages = Object.entries(result).map(([field, value]) => `${field === "detail" || field === "non_field_errors" ? "" : field.replaceAll("_", " ") + ": "}${Array.isArray(value) ? value.join(" ") : String(value)}`);
        throw new Error(messages.join(" "));
      }
      setReference(result.reference ?? null);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit. Please try again.");
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  }

  return (
    <form onSubmit={submit} className={className} aria-busy={busy}>
      <fieldset disabled={busy} className="min-w-0 space-y-6 disabled:opacity-60">
        {children}
        <div hidden><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="flex items-start gap-3 text-xs leading-relaxed">
          <input className="mt-1" type="checkbox" name="consent" value="true" required />
          <span>{kind === "newsletter" ? "I agree to receive the Glitz Africa newsletter." : "I agree that Glitz Africa may store my submission and contact me about it."}</span>
        </label>
        {error && <p id={`${id}-error`} role="alert" className="text-sm">{error}</p>}
        <button type="submit" className="btn-primary disabled:cursor-wait disabled:opacity-60" disabled={busy} aria-describedby={error ? `${id}-error` : undefined}>{busy ? "Submitting…" : buttonLabel}</button>
      </fieldset>
    </form>
  );
}
