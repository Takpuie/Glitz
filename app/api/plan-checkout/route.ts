import { NextRequest } from "next/server";
import { frontendOrigin, noStoreJson, rejectUnsafeRequest } from "@/lib/request-security";

// Starts an on-site payment-plan registration. Proxied server-side so the
// browser never talks to Django directly (same pattern as /api/checkout).
const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const rejected = rejectUnsafeRequest(request, 16 * 1024);
  if (rejected) return rejected;
  const body = await request.json().catch(() => null);
  const { slug, plan_id, name, email, phone, provider } = body ?? {};

  if (typeof slug !== "string" || !Number.isInteger(plan_id) || !name || !email || !provider) {
    return noStoreJson({ detail: "Missing required fields." }, 400);
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/events/${encodeURIComponent(slug)}/plans/${plan_id}/register/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: frontendOrigin(request) },
        body: JSON.stringify({ name, email, phone: phone ?? "", provider }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      },
    );
    return noStoreJson(await res.json().catch(() => ({ detail: "Checkout failed." })), res.status);
  } catch {
    return noStoreJson({ detail: "Checkout is temporarily unavailable. Please try again." }, 503);
  }
}
