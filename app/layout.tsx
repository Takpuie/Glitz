import type { Metadata } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${nav.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
