import type { NextConfig } from 'next'

// AWS-first deployment mode:
//   The public marketing site is served via CloudFront (CDN caching).
//   The Next.js server (handles admin panel, Cognito OAuth, ISR) runs in a
//   container (ECS/Fargate or EC2) behind CloudFront using `output: 'standalone'`.
//
//   Contact form POSTs go directly to API Gateway + Lambda — the frontend uses
//   NEXT_PUBLIC_CONTACT_API_URL instead of the /api/contact Next.js route.
//
//   Static-only export (output: 'export') is NOT supported for this app because
//   the admin panel requires server-side execution (Cognito OAuth callback,
//   httpOnly session cookies, ISR revalidation). Public marketing pages are
//   cached at CloudFront edge using standard Next.js cache headers.

const nextConfig: NextConfig = {
  // 'standalone' produces a self-contained Node.js server in .next/standalone/
  // suitable for Docker / ECS / Lambda containers.
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'augustine-media-prod.s3.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Security headers — also configure as a CloudFront response headers policy
  // for CloudFront-served responses that bypass the Next.js server.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
          {
            key: 'Cache-Control',
            value: 'no-store',
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      '/deck-installation',
      '/kitchen-renovations',
      '/bathroom-remodeling',
      '/basement-renovation',
      '/home-additions',
      '/home-renovations',
    ].map((source) => ({
      source,
      destination: `${source}/`,
      permanent: true,
    }))
  },
}

export default nextConfig
