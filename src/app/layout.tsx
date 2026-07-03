import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://toiletdao.exchange";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ToiletDAO — The Occupancy Exchange",
  description:
    "A dynamic exchange for restroom access. Real-time price discovery, on-chain settlement, and a full derivatives stack on the one resource you can't postpone.",
  keywords: [
    "ToiletDAO",
    "WC.exit",
    "occupancy exchange",
    "restroom derivatives",
    "surge pricing",
    "markets of inevitability",
  ],
  authors: [{ name: "ToiletDAO" }],
  openGraph: {
    title: "ToiletDAO — The Occupancy Exchange",
    description:
      "We tokenized the one resource you can't postpone. Real-time price discovery for restroom access, settled T+0.",
    url: SITE_URL,
    siteName: "ToiletDAO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ToiletDAO — The Occupancy Exchange",
    description:
      "We tokenized the one resource you can't postpone. Settlement T+0.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EEF1F2" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1013" },
  ],
};

// Apply the stored theme before paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('wc-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
