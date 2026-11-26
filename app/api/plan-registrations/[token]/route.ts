import { NextRequest } from "next/server";
import { frontendOrigin, noStoreJson, rejectUnsafeRequest } from "@/lib/request-security";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

function backendUrl(token: string, suffix = "") {
  return `${BACKEND_URL}/api/plan-registrations/${encodeURIComponent(token)}/${suffix}`;
}

export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const res = await fetch(backendUrl(params.token), { cache: "no-store", signal: AbortSignal.timeout(20000) });
    return noStoreJson(await res.json().catch(() => ({ detail: "Not found." })), res.status);
  } catch {
    return noStoreJson({ detail: "Temporarily unavailable." }, 503);
  }
}

/** Starts a payment for the next installment(s), or the whole balance. */
export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  const rejected = rejectUnsafeRequest(request, 4 * 1024);
  if (rejected) return rejected;
  const body = await request.json().catch(() => null);
  const { provider, pay_all } = body ?? {};
  if (!provider) return noStoreJson({ detail: "Choose a payment method." }, 400);

  try {
    const res = await fetch(backendUrl(params.token, "pay/"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: frontendOrigin(request) },
      body: JSON.stringify({ provider, pay_all: Boolean(pay_all) }),
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    return noStoreJson(await res.json().catch(() => ({ detail: "Payment failed." })), res.status);
  } catch {
    return noStoreJson({ detail: "Payments are temporarily unavailable. Please try again." }, 503);
  }
}
