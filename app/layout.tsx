import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import AnalyticsProvider from "@/components/AnalyticsProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default:
      "Augustine Home Improvements — Chester County PA Contractor",
    template: "%s | Augustine Home Improvements",
  },
  description:
    "Veteran-owned home improvement contractor serving Chester County PA and suburban Philadelphia. Specializing in decks, kitchens, bathrooms, basements, and full home renovations.",
  keywords: [
    "home improvements Chester County PA",
    "contractor Chester County",
    "deck installation Chester County",
    "kitchen remodeling Chester County",
    "bathroom remodeling Chester County PA",
    "home renovations Phoenixville PA",
    "TrexPro deck installer",
    "veteran owned contractor Pennsylvania",
    "suburban Philadelphia contractor",
  ],
  authors: [{ name: "Augustine Home Improvements LLC" }],
  creator: "Augustine Home Improvements LLC",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.augustinehomeimprovements.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://www.augustinehomeimprovements.com",
    title: "Augustine Home Improvements — Chester County PA Contractor",
    description:
      "Veteran-owned home improvement contractor serving Chester County PA. Decks, kitchens, bathrooms, basements, and full home renovations.",
    siteName: "Augustine Home Improvements",
    images: [
      {
        url: "/images/og-default.svg",
        width: 1200,
        height: 630,
        alt: "Augustine Home Improvements — Chester County PA",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Augustine Home Improvements — Chester County PA Contractor",
    description:
      "Veteran-owned home improvement contractor serving Chester County PA. Free estimates — call 484-467-7925.",
    images: ["/images/og-default.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || "https://www.augustinehomeimprovements.com",
  },
  icons: {
    icon: [{ url: "/images/logo.svg", type: "image/svg+xml" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  name: "Augustine Home Improvements LLC",
  url: "https://www.augustinehomeimprovements.com",
  logo: "https://www.augustinehomeimprovements.com/images/logo.svg",
  image: "https://www.augustinehomeimprovements.com/images/og-default.svg",
  description:
    "Veteran-owned home improvement contractor serving Chester County PA and suburban Philadelphia. Specializing in decks, kitchens, bathrooms, basements, and full home renovations.",
  telephone: "+14844677925",
  email: "info@augustinehomeimprovements.com",
  foundingDate: "2020-03",
  founder: { "@type": "Person", name: "Brandon Augustine" },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Chester County",
    addressRegion: "PA",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "City", name: "Phoenixville, PA" },
    { "@type": "City", name: "Malvern, PA" },
    { "@type": "City", name: "Downingtown, PA" },
    { "@type": "County", name: "Chester County, PA" },
    { "@type": "City", name: "Philadelphia, PA" },
  ],
  sameAs: ["https://www.facebook.com/augustinehomeimprovements"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  const STORAGE_KEY = "augustine.site-config";
  const CONFIG_URL = "/site-config.json";

  const normalize = (value) => {
    if (!value || typeof value !== "object") return null;
    return value;
  };

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = normalize(JSON.parse(stored));
      if (parsed) window.__AUGUSTINE_SITE_CONFIG__ = parsed;
    }
  } catch {}

  fetch(CONFIG_URL, { cache: "no-store" })
    .then((response) => (response.ok ? response.json() : null))
    .then((config) => {
      const parsed = normalize(config);
      if (!parsed) return;
      window.__AUGUSTINE_SITE_CONFIG__ = parsed;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch {}
    })
    .catch(() => {});
})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-white text-brand-charcoal min-h-screen flex flex-col font-sans antialiased">
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  );
}
