"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { visitorRequest, type VisitorSession } from "@/lib/visitor";

type Dashboard = {
  saved: { id: number; title: string; slug: string }[];
  orders: { id: number; status: string; amount: string; date: string; items: { title: string; quantity: number; format: string; download: string | null }[] }[];
  tickets: { id: number; event: string; tier: string; date: string; status: string; code: string | null }[];
  applications: { reference: string; call: string; status: string; date: string }[];
};
const inputClass = "mt-2 block w-full border-b border-ink bg-transparent py-3 text-sm";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "G";
}

function Fields({ mode }: { mode: "login" | "register" | "forgot" }) {
  return <>
    {mode === "register" && <label className="block text-sm">Display name<input name="display_name" required maxLength={80} autoComplete="nickname" className={inputClass} /><span className="mt-1 block text-xs text-gray-500">This name appears beside your comments.</span></label>}
    <label className="block text-sm">Email<input name="email" type="email" required maxLength={254} autoComplete="email" className={inputClass} /></label>
    {mode !== "forgot" && <label className="block text-sm">Password<input name="password" type="password" required minLength={mode === "register" ? 8 : undefined} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} className={inputClass} /></label>}
  </>;
}

function formValues(form: HTMLFormElement): Record<string, unknown> {
  return Object.fromEntries(new FormData(form).entries());
}

export default function AccountClient({ action, token, initialError, modal = false, onAuthenticated }: { action?: string; token?: string; initialError?: string; modal?: boolean; onAuthenticated?: () => void }) {
  const [session, setSession] = useState<VisitorSession | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const reader = session?.reader;

  async function load() {
    const nextSession = await visitorRequest<VisitorSession>("session");
    setSession(nextSession);
    window.dispatchEvent(new CustomEvent("glitz:reader-updated", { detail: nextSession.reader }));
    if (nextSession.reader && onAuthenticated) { onAuthenticated(); return; }
    setDashboard(nextSession.reader ? await visitorRequest<Dashboard>("dashboard") : null);
  }
  useEffect(() => { load().catch((err) => setError(err.message)); }, []);

  async function run(fn: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true); setError(""); setMessage("");
    try { await fn(); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : "Please try again."); }
    finally { setBusy(false); }
  }
  async function submit(path: string, data: Record<string, unknown>) {
    const result = await visitorRequest<{ detail?: string }>(path, data);
    if (result.detail) setMessage(result.detail);
  }
  async function google(link = false) {
    if (!session?.google_enabled) {
      setMessage("Google sign-in is awaiting connection. Please use email for now.");
      return;
    }
    const result = await visitorRequest<{ url: string }>("google/start", { link });
    window.location.assign(result.url);
  }

  return (
    <div className={modal ? "pt-6" : "container-editorial py-12 md:py-16"}>
      <header className={reader && !modal ? "mb-8 overflow-hidden rounded-2xl bg-ink px-6 py-8 text-white md:px-10 md:py-10" : "mb-10 border-b border-ink/15 pb-8"}>
        {reader && !modal ? <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[#d4af37]/60 bg-white/5 font-display text-2xl text-[#d4af37]">{initials(reader.display_name)}</div><div><p className="font-nav text-[10px] uppercase tracking-[0.28em] text-[#d4af37]">Reader dashboard</p><h1 className="mt-2 font-display text-3xl sm:text-4xl">Welcome, {reader.display_name}</h1><p className="mt-1 text-sm text-white/60">{reader.email}</p></div></div>
          <div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1.5 font-nav text-[10px] uppercase tracking-widest ${reader.verified ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-400/15 text-amber-200"}`}>{reader.verified ? "Verified member" : "Verification needed"}</span><button disabled={busy} className="rounded-full border border-white/25 px-4 py-2 font-nav text-[10px] uppercase tracking-widest hover:border-white" onClick={() => run(() => submit("logout", {}))}>Sign out</button></div>
        </div> : <><p className="eyebrow mb-3">My account</p><h1 className={modal ? "font-display text-3xl" : "font-display text-4xl sm:text-5xl"}>{reader ? `Welcome, ${reader.display_name}` : "Join the Glitz community"}</h1></>}
      </header>
      {error && <p role="alert" className="mb-6 border border-ink/20 p-4 text-sm">{error}</p>}
      {message && <p role="status" className="mb-6 border border-ink/20 p-4 text-sm">{message}</p>}
      {!session && !error && <p>Loading your account…</p>}
      {!session && error && <button className="btn-outline" disabled={busy} onClick={() => run(async () => {})}>Retry</button>}

      {!complete && token && (action === "verify" || action === "reset") && <section className="mb-10 max-w-md border border-ink/15 p-6">
        <h2 className="mb-6 font-display text-2xl">{action === "verify" ? "Verify your email" : "Reset your password"}</h2>
        <form onSubmit={(event) => {
          event.preventDefault(); const data = formValues(event.currentTarget);
          run(async () => { await submit(action === "verify" ? "verification/confirm" : "password/reset", { ...data, token }); setComplete(true); window.history.replaceState({}, "", "/account"); });
        }}><fieldset disabled={busy} className="space-y-6">
          {action === "reset" && <label className="block text-sm">New password<input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required className={inputClass} /></label>}
          <button className="btn-primary" disabled={busy}>{busy ? "Please wait…" : action === "verify" ? "Confirm my email" : "Set new password"}</button>
        </fieldset></form>
      </section>}

      {session && !reader && <section className="max-w-md">
        <div className="mb-8 flex flex-wrap gap-5 text-sm">
          <button className={mode === "login" ? "font-semibold underline" : ""} onClick={() => setMode("login")}>Sign in</button>
          <button className={mode === "register" ? "font-semibold underline" : ""} onClick={() => setMode("register")}>Create account</button>
          <button className={mode === "forgot" ? "font-semibold underline" : ""} onClick={() => setMode("forgot")}>Forgot password?</button>
        </div>
        {mode !== "forgot" && <div className="mb-6">
          <button type="button" disabled={busy} onClick={() => run(() => google())} className="flex min-h-11 w-full items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5 shrink-0">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55Z" />
              <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.78-4.59l-7.98-6.19A23.86 23.86 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z" />
            </svg>
            Continue with Google
          </button>
          <div className="mt-6 flex items-center gap-4 text-xs text-gray-500"><span className="h-px flex-1 bg-ink/15" />Or continue with email<span className="h-px flex-1 bg-ink/15" /></div>
        </div>}
        <form key={mode} onSubmit={(event) => {
          event.preventDefault(); const data = formValues(event.currentTarget);
          run(() => submit(mode === "forgot" ? "password/request" : mode, data));
        }}><fieldset disabled={busy} className="space-y-6">
          <Fields mode={mode} />
          <button className="btn-primary" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : mode === "forgot" ? "Request reset link" : "Sign in"}</button>
        </fieldset></form>
      </section>}

      {reader && <>
        {!reader.verified && <section className="mb-10 border border-ink/15 p-6">
          <h2 className="font-display text-2xl">Verify your email</h2>
          <p className="mt-3 text-sm">Verify {reader.email} to view purchases, tickets and applications, and to comment on articles.</p>
          <button disabled={busy} onClick={() => run(() => submit("verification/resend", {}))} className="btn-outline mt-5">Resend verification email</button>
        </section>}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[["Saved stories", dashboard?.saved.length ?? 0], ["Orders", dashboard?.orders.length ?? 0], ["Tickets", dashboard?.tickets.length ?? 0], ["Applications", dashboard?.applications.length ?? 0]].map(([label, count]) => <div key={String(label)} className="rounded-xl border border-ink/10 bg-smoke/60 p-5"><p className="font-display text-3xl">{count}</p><p className="mt-1 font-nav text-[10px] uppercase tracking-widest text-gray-500">{label}</p></div>)}
        </div>
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
              <h2 className="mb-5 font-display text-2xl">Profile</h2>
              <p className="mb-4 break-words text-sm text-gray-600">{reader.email}</p>
              <form onSubmit={(event) => { event.preventDefault(); const data = formValues(event.currentTarget); run(() => submit("profile", data)); }}><fieldset disabled={busy} className="space-y-5">
                <label className="block text-sm">Display name<input key={reader.display_name} name="display_name" defaultValue={reader.display_name} required maxLength={80} autoComplete="nickname" className={inputClass} /></label>
                <button className="btn-primary" disabled={busy}>Save profile</button>
              </fieldset></form>
              {reader.google_connected ? <p className="mt-5 text-sm">Google account connected.</p> : session.google_enabled && reader.verified && <button disabled={busy} onClick={() => run(() => google(true))} className="btn-outline mt-5">Connect Google</button>}
            </section>
            {reader.verified && <details className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm"><summary className="cursor-pointer font-display text-xl">Security &amp; password</summary>
              <form className="mt-5" onSubmit={(event) => { event.preventDefault(); const data = formValues(event.currentTarget); run(() => submit("password/change", data)); }}><fieldset disabled={busy} className="space-y-5">
                <label className="block text-sm">Current password<input name="current_password" type="password" autoComplete="current-password" required maxLength={128} className={inputClass} /></label>
                <label className="block text-sm">New password<input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} className={inputClass} /></label>
                <button className="btn-primary" disabled={busy}>Update password</button>
                <p className="text-xs text-gray-500">If you only use Google, request a password reset from the sign-in screen to set a password.</p>
              </fieldset></form>
            </details>}
          </aside>
          <div className="space-y-6">
            <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm md:p-8"><div className="mb-5 flex items-end justify-between"><div><p className="eyebrow mb-2">Your library</p><h2 className="font-display text-3xl">Saved articles</h2></div><Link href="/articles" className="hidden text-xs underline sm:block">Browse stories</Link></div>
              {!dashboard?.saved.length && <p className="text-sm text-gray-600">Save articles while reading to find them here.</p>}
              <ul className="divide-y divide-ink/15">{dashboard?.saved.map((article) => <li key={article.id} className="flex items-center justify-between gap-5 py-4"><Link className="font-display text-xl hover:underline" href={`/articles/${article.slug}`}>{article.title}</Link><button disabled={busy} className="text-xs underline" onClick={() => run(() => visitorRequest(`saved/${article.slug}`, { saved: false }))}>Remove</button></li>)}</ul>
            </section>
            {reader.verified && <>
              <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm md:p-8"><p className="eyebrow mb-2">Glitz shop</p><h2 className="mb-5 font-display text-3xl">Orders &amp; downloads</h2>
                {!dashboard?.orders.length && <p className="text-sm text-gray-600">No orders for this email address yet. <Link href="/magazine" className="underline">Browse magazines</Link>.</p>}
                {dashboard?.orders.map((order) => <article key={order.id} className="border-t border-ink/15 py-5"><p className="text-sm">Order #{order.id} · {order.status} · GHS {order.amount}</p><p className="mt-1 text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p><ul className="mt-3 space-y-3">{order.items.map((item, index) => <li key={index} className="text-sm">{item.title} × {item.quantity} ({item.format}){item.download && <a className="ml-4 underline" href={item.download}>Download PDF</a>}</li>)}</ul></article>)}
              </section>
              <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm md:p-8"><p className="eyebrow mb-2">Your access</p><h2 className="mb-5 font-display text-3xl">Event tickets</h2>
                {!dashboard?.tickets.length && <p className="text-sm text-gray-600">No tickets for this email address yet.</p>}
                {dashboard?.tickets.map((ticket) => <article key={ticket.id} className="border-t border-ink/15 py-5"><h3 className="font-display text-xl">{ticket.event}</h3><p className="mt-2 text-sm">{ticket.tier} · {ticket.date} · {ticket.status}</p>{ticket.code && <p className="mt-3 text-sm">Check-in code: <strong className="font-mono">{ticket.code}</strong></p>}</article>)}
              </section>
              <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm md:p-8"><p className="eyebrow mb-2">Submissions</p><h2 className="mb-5 font-display text-3xl">Applications</h2>
                {!dashboard?.applications.length && <p className="text-sm text-gray-600">No applications for this email address yet.</p>}
                {dashboard?.applications.map((application) => <article key={application.reference} className="border-t border-ink/15 py-5"><h3 className="font-display text-xl">{application.call}</h3><p className="mt-2 text-sm">{application.status}</p><p className="mt-2 break-all text-xs text-gray-500">Reference: {application.reference}</p></article>)}
              </section>
            </>}
          </div>
        </div>
      </>}
    </div>
  );
}
