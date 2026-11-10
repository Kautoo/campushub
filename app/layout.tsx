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
  metadataBase: new URL("https://campushub.hyria.top"),
  title: {
    default: "CampusHub 2.0 — Campus Events & Student Commerce",
    template: "%s | CampusHub 2.0",
  },
  description:
    "AI-powered campus event and commerce platform: multi-page student storefront, Bryntum Scheduler 8.0 venue timelines, AG Grid Community 36 ledgers, PayPal Orders v2 escrow settlement, and Astropods autonomous intelligence.",
  keywords: [
    "CampusHub",
    "Campus Events",
    "Student Ticketing",
    "Student Society Marketplace",
    "University Commerce",
    "Bryntum Scheduler",
    "AG Grid",
    "PayPal Campus Payments",
    "Collegiate Merch",
    "Hackathon Passes",
  ],
  authors: [{ name: "CampusHub Platform Engineering" }],
  creator: "CampusHub 2.0",
  publisher: "CampusHub 2.0",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CampusHub 2.0 — Campus Events & Student Commerce",
    description:
      "Autonomous student ticketing, faculty-licensed club merchandise drops, venue scheduling, and verified PayPal Orders v2 escrow settlement.",
    url: "https://campushub.hyria.top",
    siteName: "CampusHub 2.0",
    images: [
      {
        url: "/brand/campushub-mark.svg",
        width: 1254,
        height: 1254,
        alt: "CampusHub 2.0 Official Logo",
      },
    ],
    locale: "en_MY",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusHub 2.0 — Campus Events & Student Commerce",
    description:
      "Autonomous student ticketing, club merchandise storefronts, venue scheduling, and PayPal Orders v2 settlement.",
    images: ["/brand/campushub-mark.svg"],
    creator: "@campushub",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/brand/campushub-mark.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/brand/campushub-mark.svg",
  },
};

/**
 * Applies the persisted theme before first paint to avoid a flash and
 * hydration mismatch. Reads `data-theme` cookie; defaults to light.
 */
const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )ch-theme=(light|dark)/);var t=m?m[1]:(window.localStorage?localStorage.getItem("ch-theme"):"light")||"light";document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

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
        <link rel="icon" href="/brand/campushub-mark.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/brand/campushub-mark.svg" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
