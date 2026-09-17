import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const { slug, format, buyer_email, shipping_address } = body ?? {};

  if (!slug || !format || !buyer_email) {
    return NextResponse.json({ detail: "Missing required fields." }, { status: 400 });
  }

  const res = await fetch(`${BACKEND_URL}/api/magazine-issues/${encodeURIComponent(slug)}/checkout/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format, buyer_email, shipping_address }),
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
