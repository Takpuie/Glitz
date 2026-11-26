import { NextRequest } from "next/server";
import { noStoreJson } from "@/lib/request-security";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function GET(_request: NextRequest, { params }: { params: { reference: string } }) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/plan-payments/verify/${encodeURIComponent(params.reference)}/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    return noStoreJson(await res.json().catch(() => ({ detail: "Not found." })), res.status);
  } catch {
    return noStoreJson({ detail: "Could not confirm the payment right now." }, 503);
  }
}
