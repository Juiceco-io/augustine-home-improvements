import type { NextConfig } from 'next'

// Static export mode — matches company-homepage deployment pattern.
// The site is built to `./out` and deployed to S3 + CloudFront.
//
// Admin panel (Cognito OAuth, server-side sessions) is deferred.
// Contact form POSTs go to NEXT_PUBLIC_CONTACT_API_URL (API Gateway + Lambda).
// If NEXT_PUBLIC_CONTACT_API_URL is not set the form falls back to showing
// a validation-only error (no SES dependency at build time).

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,

  images: {
    // Static export does not support Next.js image optimization.
    // Images are served from S3 as-is; use pre-optimized assets in /public.
    unoptimized: true,
  },
}

export default nextConfig
