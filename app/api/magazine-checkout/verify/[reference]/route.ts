import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function GET(request: NextRequest, { params }: { params: { reference: string } }) {
  const res = await fetch(
    `${BACKEND_URL}/api/orders/verify/${encodeURIComponent(params.reference)}/`,
    { cache: "no-store" }
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
