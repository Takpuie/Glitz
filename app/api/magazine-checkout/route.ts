import { NextRequest, NextResponse } from "next/server";
import { noStoreJson, rejectUnsafeRequest } from "@/lib/request-security";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const rejected = rejectUnsafeRequest(request, 64 * 1024);
  if (rejected) return rejected;
  const body = await request.json().catch(() => null);
  const { items, buyer_email, ...shipping } = body ?? {};

  if (!Array.isArray(items) || items.length === 0 || !buyer_email) {
    return NextResponse.json({ detail: "Missing required fields." }, { status: 400 });
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/magazine/checkout/`, {
      method: "POST", headers: { "Content-Type": "application/json", Origin: request.nextUrl.origin },
      body: JSON.stringify({ items, buyer_email, ...shipping }),
      cache: "no-store", signal: AbortSignal.timeout(20000),
    });
    return noStoreJson(await res.json(), res.status);
  } catch {
    return noStoreJson({ detail: "Checkout is temporarily unavailable. Please try again." }, 503);
  }
}
