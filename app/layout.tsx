import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { AccountModalProvider } from "@/components/AccountModal";
import { CartProvider } from "@/lib/cart-context";
import { getBackendEvents } from "@/lib/backend";
import { events } from "@/data/events";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const nav = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-nav",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Glitz Africa — Fashion. Power. Culture.",
  description:
    "Glitz Africa is the Pan-African home for fashion, culture and business — the magazine, the shop, and the stage for GAFW, Ghana Women of the Year, the Female CEO Summit, SheBoss Global and the Glitz Style Awards.",
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
    <html lang="en" className={`${display.variable} ${body.variable} ${nav.variable}`}>
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
