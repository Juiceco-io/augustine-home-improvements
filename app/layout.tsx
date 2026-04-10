import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StickyCtaMobile from '@/components/ui/StickyCtaMobile'
import GoogleAnalytics from '@/components/ui/GoogleAnalytics'
import PreviewBanner from '@/components/ui/PreviewBanner'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const SITE_URL = 'https://www.augustinehomeimprovements.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Augustine Home Improvements | Chester County PA | 484-467-7925',
    template: '%s | Augustine Home Improvements',
  },
  description:
    'Veteran-owned home improvement contractor serving Chester County PA & suburban Philadelphia. Decks, kitchens, bathrooms, basements & full renovations. Call 484-467-7925.',
  keywords: [
    'home improvements Chester County PA',
    'contractor Chester County',
    'deck installation Chester County',
    'kitchen remodeling Chester County',
    'bathroom remodeling Chester County PA',
    'home renovations Phoenixville PA',
    'TrexPro deck installer',
    'veteran owned contractor Pennsylvania',
    'suburban Philadelphia contractor',
  ],
  authors: [{ name: 'Augustine Home Improvements LLC' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Augustine Home Improvements',
    url: SITE_URL,
    images: [
      {
        url: '/images/og-default.svg',
        width: 1200,
        height: 630,
        alt: 'Augustine Home Improvements — Chester County PA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <head>
        {/* Preconnect to Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Schema: Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HomeAndConstructionBusiness',
              name: 'Augustine Home Improvements LLC',
              url: SITE_URL,
              logo: `${SITE_URL}/images/logo.svg`,
              image: `${SITE_URL}/images/og-default.svg`,
              description:
                'Veteran-owned home improvement contractor serving Chester County PA and suburban Philadelphia. Specializing in decks, kitchens, bathrooms, basements, and full home renovations.',
              telephone: '+14844677925',
              email: 'info@augustinehomeimprovements.com',
              foundingDate: '2020-03',
              founder: {
                '@type': 'Person',
                name: 'Brandon Augustine',
              },
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Chester County',
                addressRegion: 'PA',
                addressCountry: 'US',
              },
              areaServed: [
                { '@type': 'City', name: 'Phoenixville, PA' },
                { '@type': 'City', name: 'Malvern, PA' },
                { '@type': 'City', name: 'Downingtown, PA' },
                { '@type': 'County', name: 'Chester County, PA' },
                { '@type': 'City', name: 'Philadelphia, PA' },
              ],
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                  ],
                  opens: '08:00',
                  closes: '18:00',
                },
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: 'Saturday',
                  opens: '09:00',
                  closes: '15:00',
                },
              ],
              paymentAccepted: ['Cash', 'Check'],
              priceRange: '$$',
              hasCredential: [
                {
                  '@type': 'EducationalOccupationalCredential',
                  credentialCategory: 'TrexPro Certified Installer',
                },
              ],
              sameAs: [
                'https://www.facebook.com/augustinehomeimprovements',
              ],
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5',
                reviewCount: '3',
              },
            }),
          }}
        />
      </head>
      <body>
        {gaId && <GoogleAnalytics gaId={gaId} />}
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <StickyCtaMobile />
        <PreviewBanner />
      </body>
    </html>
  )
}
