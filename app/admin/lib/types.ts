/**
 * Shared types for the CMS admin.
 * Mirrors the shape in the public site's lib/siteConfig.ts.
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
    logoUrl: string;
    logoAlt: string;
  };

  hero: {
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
