/**
 * Augustine CMS — shared site config types and default config.
 *
 * The public site fetches a live `/site-config.json` from the same site origin
 * at runtime.
 * This file provides:
 *   1. TypeScript types for the config shape
 *   2. A `defaultConfig` constant used as fallback when the CDN is unavailable
 *
 * The admin SPA also imports these types to stay in sync with the same schema.
 */

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  category: string;
  active: boolean;
  order: number;
}

export interface SiteConfig {
  _version: number;
  _updatedAt: string;
  _updatedBy: string;

  brand: {
    /** CDN URL for the company logo. Falls back to static asset if absent. */
    logoUrl: string;
    logoAlt: string;
  };

  hero: {
    /** CDN URL for the hero background image. Empty string = use gradient fallback. */
    imageUrl: string;
    headline: string;
    subheadline: string;
  };

  gallery: GalleryItem[];

  contact: {
    phone: string;
    email: string;
    serviceArea: string;
  };

  features: {
    showVeteranBadge: boolean;
    showTrexProBadge: boolean;
    heroEnabled: boolean;
  };
}

/**
 * Last-known-good defaults. Matches the current hardcoded values in the site
 * so there's zero flash if the CDN is unavailable.
 */
export const defaultConfig: SiteConfig = {
  _version: 1,
  _updatedAt: "2026-03-31T00:00:00Z",
  _updatedBy: "system",

  brand: {
    logoUrl: "", // empty = use static /images/augustine-logo.png
    logoAlt: "Augustine Home Improvements",
  },

  hero: {
    imageUrl: "", // empty = use gradient background
    headline: "Expert Home Improvements",
    subheadline:
      "Serving Chester County PA and suburban Philadelphia. Decks, kitchens, bathrooms, basements, additions — one contractor you can trust from start to finish.",
  },

  gallery: [],

  contact: {
    phone: "484-467-7925",
    email: "info@augustinehomeimprovements.com",
    serviceArea:
      "Chester County, PA and surrounding communities including Phoenixville, Malvern, Downingtown, West Chester, and greater Philadelphia suburbs.",
  },

  features: {
    showVeteranBadge: true,
    showTrexProBadge: true,
    heroEnabled: true,
  },
};
