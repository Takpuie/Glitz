import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";
const COOKIE_MAP = { sessionid: "glitz_visitor_session", csrftoken: "glitz_visitor_csrf" } as const;
const ROUTES = /^(session|register|login|logout|profile|dashboard|verification\/(resend|confirm)|password\/(request|reset|change)|google\/(start|callback)|saved\/[\w-]+|comments\/[\w-]+(?:\/\d+)?|download\/\d+)$/;

async function proxy(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  if (!ROUTES.test(path)) return NextResponse.json({ detail: "Not found." }, { status: 404 });
  const origin = process.env.FRONTEND_BASE_URL ?? request.nextUrl.origin;
  if (request.method === "POST" && request.headers.get("origin") !== new URL(origin).origin) {
    return NextResponse.json({ detail: "Invalid request origin." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length")) > 16384) return NextResponse.json({ detail: "Request is too large." }, { status: 413 });
  const headers = new Headers();
  const cookies = Object.entries(COOKIE_MAP).map(([backend, frontend]) => {
    const value = request.cookies.get(frontend)?.value;
    return value && /^[A-Za-z0-9]+$/.test(value) ? `${backend}=${value}` : "";
  }).filter(Boolean).join("; ");
  if (cookies) headers.set("Cookie", cookies);
  if (request.method === "POST") {
    headers.set("Content-Type", "application/json");
    headers.set("Origin", new URL(BACKEND_URL).origin);
    headers.set("X-CSRFToken", request.headers.get("x-csrftoken") ?? "");
  }
  try {
    const body = request.method === "POST" ? await request.text() : undefined;
    if (body && new TextEncoder().encode(body).length > 16384) return NextResponse.json({ detail: "Request is too large." }, { status: 413 });
    const upstream = await fetch(`${BACKEND_URL}/api/visitor/${path}/${request.nextUrl.search}`, {
      method: request.method, headers, body, cache: "no-store", redirect: "manual",
    });
    const responseHeaders = new Headers({ "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" });
    for (const key of ["content-type", "content-disposition"]) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    const location = upstream.headers.get("location");
    if (location) {
      // Only the fixed account return path may be used by the OAuth callback.
      const destination = new URL(location, origin);
      if (destination.origin !== new URL(origin).origin || destination.pathname !== "/account") {
        return NextResponse.json({ detail: "Unexpected sign-in redirect." }, { status: 502 });
      }
      responseHeaders.set("Location", destination.toString());
    }
    const response = new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
    for (const cookie of upstream.headers.getSetCookie()) {
      const [pair, ...attributes] = cookie.split(";");
      const index = pair.indexOf("=");
      const name = pair.slice(0, index).trim() as keyof typeof COOKIE_MAP;
      if (!(name in COOKIE_MAP)) continue;
      const maxAge = attributes.find((item) => item.trim().toLowerCase().startsWith("max-age="))?.split("=")[1];
      response.cookies.set(COOKIE_MAP[name], pair.slice(index + 1), {
        httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
        ...(maxAge !== undefined ? { maxAge: Number(maxAge) } : {}),
      });
    }
    return response;
  } catch {
    return NextResponse.json({ detail: "Account services are temporarily unavailable. Please try again." }, { status: 503 });
  }
}

export const GET = proxy;
export const POST = proxy;
