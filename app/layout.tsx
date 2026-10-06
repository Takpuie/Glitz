import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AccountModalProvider } from "@/components/AccountModal";
import { CartProvider } from "@/lib/cart-context";
import { getBackendEvents } from "@/lib/backend";
import { events } from "@/data/events";

const display = localFont({
  src: [
    { path: "./fonts/BodoniModa-Variable.ttf", weight: "400 900", style: "normal" },
    { path: "./fonts/BodoniModa-Italic-Variable.ttf", weight: "400 900", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});

const body = localFont({
  src: [
    { path: "./fonts/Inter-Variable.ttf", weight: "100 900", style: "normal" },
    { path: "./fonts/Inter-Italic-Variable.ttf", weight: "100 900", style: "italic" },
  ],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.FRONTEND_BASE_URL ?? "https://glitzafrica.com"),
  title: {
    default: "Glitz Africa — Fashion. Power. Culture.",
    template: "%s | Glitz Africa",
  },
  description:
    "Glitz Africa is the Pan-African home for fashion, culture and business — the magazine and the stage for GAFW, Ghana Women of the Year, the Female CEO Summit, SheBoss Global and the Glitz Style Awards.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Glitz Africa",
    title: "Glitz Africa — Fashion. Power. Culture.",
    description: "The Pan-African home for fashion, culture, business and the people shaping what comes next.",
    images: [{ url: "/images/gafw/hero-designer-and-model.jpg", width: 1600, height: 1000, alt: "Glitz Africa" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Glitz Africa — Fashion. Power. Culture.",
    description: "The Pan-African home for fashion, culture, business and the people shaping what comes next.",
    images: ["/images/gafw/hero-designer-and-model.jpg"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let eventLinks = events.map(({ name, slug }) => ({ name, slug }));
  try {
    eventLinks = (await getBackendEvents()).map(({ name, slug }) => ({ name, slug }));
  } catch (error) {
    // Keep navigation usable if the CMS is temporarily unavailable.
    console.error("Unable to load navigation events", error);
  }

  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <CartProvider>
          <AccountModalProvider>
          <Nav events={eventLinks} />
          <main>{children}</main>
          <Footer />
          </AccountModalProvider>
        </CartProvider>
      </body>
    </html>
  );
}
