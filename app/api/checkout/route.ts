import { NextRequest, NextResponse } from "next/server";
import { frontendOrigin, noStoreJson, rejectUnsafeRequest } from "@/lib/request-security";

// Proxies ticket checkout to Django server-side, per the build plan's
// pattern for anything that shouldn't call the backend directly from the
// browser — keeps BACKEND_API_URL and any future auth cookies off the client.
const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const rejected = rejectUnsafeRequest(request, 32 * 1024);
  if (rejected) return rejected;
  const body = await request.json().catch(() => null);
  const { slug, ticket_type_id, buyer_name, buyer_email, payment_provider } = body ?? {};

  if (!slug || !ticket_type_id || !buyer_name || !buyer_email) {
    return NextResponse.json({ detail: "Missing required fields." }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/events/${encodeURIComponent(slug)}/checkout/`, {
      method: "POST", headers: { "Content-Type": "application/json", Origin: frontendOrigin(request) },
      body: JSON.stringify({ ticket_type_id, buyer_name, buyer_email, payment_provider }),
      cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    return noStoreJson(await res.json(), res.status);
  } catch {
    return noStoreJson({ detail: "Checkout is temporarily unavailable. Please try again." }, 503);
  }
}
