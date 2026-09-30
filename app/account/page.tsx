import type { Metadata } from "next";
import AccountClient from "./AccountClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your account | Glitz Africa",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function AccountPage({ searchParams }: {
  searchParams: { action?: string; token?: string; error?: string };
}) {
  return <AccountClient action={searchParams.action} token={searchParams.token} initialError={searchParams.error} />;
}
