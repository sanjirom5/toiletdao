import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://wc.exchange";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "WC.exit — The Private Exchange for Restroom Access",
  description:
    "ToiletDAO operates a dynamic exchange for restroom access. Real-time liquidity, dynamic revaluation, and members-only settlement across a limited estate of two cabins.",
  keywords: [
    "ToiletDAO",
    "WC.exit",
    "restroom access exchange",
    "dynamic pricing",
    "private membership",
    "surge",
  ],
  authors: [{ name: "ToiletDAO" }],
  openGraph: {
    title: "WC.exit — The Private Exchange for Restroom Access",
    description:
      "A dynamic exchange for restroom access. Real-time liquidity. Dynamic revaluation. Settlement for members only.",
    url: SITE_URL,
    siteName: "WC.exit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WC.exit — The Private Exchange for Restroom Access",
    description: "Real-time liquidity. Dynamic revaluation. Settlement for members only.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B0C0E",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
