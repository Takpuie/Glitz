import { NextRequest, NextResponse } from "next/server";

// Proxies ticket checkout to Django server-side, per the build plan's
// pattern for anything that shouldn't call the backend directly from the
// browser — keeps BACKEND_API_URL and any future auth cookies off the client.
const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { slug, ticket_type_id, buyer_name, buyer_email } = body ?? {};

  if (!slug || !ticket_type_id || !buyer_name || !buyer_email) {
    return NextResponse.json({ detail: "Missing required fields." }, { status: 400 });
  }

  const res = await fetch(`${BACKEND_URL}/api/events/${encodeURIComponent(slug)}/checkout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticket_type_id, buyer_name, buyer_email }),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
