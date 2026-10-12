import { NextRequest, NextResponse } from "next/server";

export function frontendOrigin(request: NextRequest) {
  return new URL(process.env.FRONTEND_BASE_URL ?? request.nextUrl.origin).origin;
}

export function rejectUnsafeRequest(request: NextRequest, maxBytes: number) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== frontendOrigin(request)) {
    return NextResponse.json({ detail: "Invalid request origin." }, { status: 403 });
  }
  const length = Number(request.headers.get("content-length") ?? "0");
  if (!Number.isFinite(length) || length < 0 || length > maxBytes) {
    return NextResponse.json({ detail: "Request is too large." }, { status: 413 });
  }
  return null;
}

export function noStoreJson(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" },
  });
}
