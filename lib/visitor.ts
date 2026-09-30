export type Reader = {
  id: number;
  email: string;
  display_name: string;
  verified: boolean;
  google_connected: boolean;
  commenting_suspended: boolean;
};
export type VisitorSession = { reader: Reader | null; csrf: string; google_enabled: boolean; email_enabled: boolean };

export async function visitorRequest<T>(path: string, body?: Record<string, unknown>): Promise<T> {
  let csrf: string | undefined;
  if (body !== undefined) csrf = (await visitorRequest<VisitorSession>("session")).csrf;
  const response = await fetch(`/api/visitor/${path}`, {
    method: body === undefined ? "GET" : "POST", credentials: "same-origin", cache: "no-store",
    headers: body === undefined ? {} : { "Content-Type": "application/json", "X-CSRFToken": csrf! },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({ detail: "The request could not be completed. Please refresh and try again." }));
  if (!response.ok) throw new Error(result.detail ?? "The request could not be completed.");
  return result;
}
