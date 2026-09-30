import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest, { params }: { params: { kind: string } }) {
  if (!["newsletter", "nominations", "enquiries"].includes(params.kind)) {
    return NextResponse.json({ detail: "Not found." }, { status: 404 });
  }
  // Includes multipart overhead in addition to the 20 MB attachment limit.
  if (Number(request.headers.get("content-length")) > 21 * 1024 * 1024) {
    return NextResponse.json({ detail: "The submission is too large. Files must be 20 MB or smaller." }, { status: 413 });
  }
  try {
    const form = await request.formData();
    if (form.get("event") === "") form.delete("event");
    const file = form.get("portfolio_file");
    if (file && typeof file !== "string" && file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ detail: "The portfolio must be 20 MB or smaller." }, { status: 413 });
    }
    if (file && typeof file !== "string" && !file.size) form.delete("portfolio_file");
    const response = await fetch(`${BACKEND_URL}/api/submissions/${params.kind}/`, {
      method: "POST", body: form, cache: "no-store",
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ detail: "We could not submit your form. Please try again shortly." }, { status: 503 });
  }
}
