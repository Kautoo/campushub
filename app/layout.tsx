import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CampusHub 2.0 — Campus events & commerce",
  description:
    "AI-powered campus event and commerce platform: ticketing, storefront, PayPal payments, and grounded AI insights.",
};

/**
 * Applies the persisted theme before first paint to avoid a flash and
 * hydration mismatch. Reads `data-theme` cookie; defaults to light.
 */
const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )ch-theme=(light|dark)/);var t=m?m[1]:"light";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        {/* Icon font (Material Symbols), not a text font — loaded app-wide via
            next/font is unsupported for icon stylesheets, hence the raw link. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display -- icon font, intentionally app-wide */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
