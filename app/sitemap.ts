import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

const BASE = 'https://www.augustinehomeimprovements.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/about-us/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/deck-installation/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/kitchen-renovations/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/bathroom-remodeling/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/basement-renovation/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/home-additions/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/home-renovations/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/gallery/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/reviews/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact-us/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE}/privacy-policy/`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ]
}
