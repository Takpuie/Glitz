"use client";

import Link from "next/link";
import { AccountLink } from "@/components/AccountModal";
import { useEffect, useState } from "react";
import { visitorRequest, type VisitorSession } from "@/lib/visitor";

type Comment = { id: number; name: string; body: string; created_at: string; hidden: boolean; own: boolean };
type CommentPage = { comments: Comment[]; next: number | null; saved: boolean };

export default function ReaderComments({ slug }: { slug: string }) {
  const [session, setSession] = useState<VisitorSession | null>(null);
  const [page, setPage] = useState<CommentPage>({ comments: [], next: null, saved: false });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [body, setBody] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [editBody, setEditBody] = useState("");
  const [reporting, setReporting] = useState<number | null>(null);
  const [reason, setReason] = useState("");
  const path = `comments/${encodeURIComponent(slug)}`;

  async function refresh() {
    const [nextSession, nextPage] = await Promise.all([visitorRequest<VisitorSession>("session"), visitorRequest<CommentPage>(path)]);
    setSession(nextSession); setPage(nextPage); setReady(true);
  }
  useEffect(() => { refresh().catch((err) => setError(err.message)); }, [slug]);

  async function act(action: () => Promise<unknown>) {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try { await action(); await refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Please try again."); }
    finally { setBusy(false); }
  }
  const reader = session?.reader;
  return (
    <section className="hairline" aria-labelledby="comments-heading">
      <div className="container-editorial max-w-3xl py-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 id="comments-heading" className="font-display text-3xl">Reader comments</h2>
          {reader ? <button disabled={busy} className="btn-outline" onClick={() => act(() => visitorRequest(`saved/${encodeURIComponent(slug)}`, { saved: !page.saved }))}>{page.saved ? "Remove from saved" : "Save article"}</button> : <AccountLink className="text-sm underline">Sign in to save or comment</AccountLink>}
        </div>
        <p className="mb-6 text-sm text-gray-600">Keep the conversation respectful. Comments appear immediately and may be moderated.</p>
        {reader && !reader.verified && <p className="mb-6 text-sm">Please <Link href="/account" className="underline">verify your email</Link> before commenting.</p>}
        {reader?.commenting_suspended && <p className="mb-6 text-sm">Your commenting privileges are suspended.</p>}
        {reader?.verified && !reader.commenting_suspended && <form className="mb-8 space-y-3" onSubmit={(event) => { event.preventDefault(); act(async () => { await visitorRequest(path, { body }); setBody(""); }); }}>
          <label className="block text-sm">Your comment<textarea required maxLength={2000} rows={4} value={body} onChange={(event) => setBody(event.target.value)} className="mt-2 block w-full border border-ink/20 p-3" /></label>
          <button disabled={busy} className="btn-primary">{busy ? "Please wait…" : "Post comment"}</button>
        </form>}
        {error && <p role="alert" className="mb-5 text-sm">{error} <button className="underline" onClick={() => act(async () => {})}>Retry</button></p>}
        {notice && <p role="status" className="mb-5 text-sm">{notice}</p>}
        {!ready && !error && <p>Loading comments…</p>}
        {ready && page.comments.length === 0 && <p className="text-sm text-gray-600">No comments yet. Start the conversation.</p>}
        <ul className="divide-y divide-ink/15">
          {page.comments.map((comment) => <li key={comment.id} className="py-6">
            <div className="flex flex-wrap items-baseline gap-3"><h3 className="font-medium">{comment.name}</h3><time className="text-xs text-gray-500" dateTime={comment.created_at}>{new Date(comment.created_at).toLocaleDateString()}</time></div>
            {comment.hidden && <p className="mt-2 text-xs text-gray-500">Hidden by moderation. Only you and staff can see this comment.</p>}
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed">{comment.body}</p>
            {reader?.verified && <div className="mt-3 flex gap-4 text-xs underline">
              {comment.own ? <><button disabled={busy || reader.commenting_suspended} onClick={() => { setEditing(comment.id); setEditBody(comment.body); }}>Edit</button><button disabled={busy} onClick={() => { if (window.confirm("Delete this comment?")) act(() => visitorRequest(`${path}/${comment.id}`, { action: "delete" })); }}>Delete</button></> : <button disabled={busy} onClick={() => { setReporting(comment.id); setReason(""); }}>Report</button>}
            </div>}
            {editing === comment.id && <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); act(async () => { await visitorRequest(`${path}/${comment.id}`, { action: "edit", body: editBody }); setEditing(null); }); }}>
              <label className="block text-sm">Edit comment<textarea required maxLength={2000} rows={4} value={editBody} onChange={(event) => setEditBody(event.target.value)} className="mt-2 block w-full border p-3" /></label><button disabled={busy} className="btn-primary">Save</button><button type="button" className="ml-4 text-sm underline" onClick={() => setEditing(null)}>Cancel</button>
            </form>}
            {reporting === comment.id && <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); act(async () => { await visitorRequest(`${path}/${comment.id}`, { action: "report", reason }); setReporting(null); setNotice("Report received. Our team will review it."); }); }}>
              <label className="block text-sm">Reason for reporting<textarea required maxLength={500} rows={2} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 block w-full border p-3" /></label><button disabled={busy} className="btn-primary">Send report</button><button type="button" className="ml-4 text-sm underline" onClick={() => setReporting(null)}>Cancel</button>
            </form>}
          </li>)}
        </ul>
        {page.next && <button disabled={busy} className="btn-outline mt-5" onClick={async () => {
          setBusy(true); setError("");
          try { const more = await visitorRequest<CommentPage>(`${path}?before=${page.next}`); setPage((current) => ({ ...more, comments: [...current.comments, ...more.comments] })); }
          catch (err) { setError(err instanceof Error ? err.message : "Please try again."); } finally { setBusy(false); }
        }}>Older comments</button>}
      </div>
    </section>
  );
}
