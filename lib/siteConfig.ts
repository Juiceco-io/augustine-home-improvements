/**
 * Augustine CMS — shared site config types and default config.
 *
 * The public site fetches a live `/site-config.json` from the same site origin
 * at runtime.
 * This file provides:
 *   1. TypeScript types for the config shape
 *   2. A `defaultConfig` constant used as fallback when the CDN is unavailable
 *   3. A `normalizeSiteConfig()` helper that deep-merges live config onto the
 *      defaults so newly added CMS fields remain safe on older stored config
 */

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  category: string;
  active: boolean;
  order: number;
}

export interface HomepageStat {
  value: string;
  label: string;
}

export interface HomepageServiceCard {
  title: string;
  description: string;
  href: string;
}

export interface HomepageWhyChooseUsItem {
  title: string;
  description: string;
}

export interface HomepageFeaturedReviews {
  heading: string;
  subheading: string;
  countLabel: string;
  visibleCount: number;
}

export interface HomepageCtaBlock {
  title: string;
  body: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  footnote: string;
}

export interface CompanyHours {
  weekdays: string;
  saturday: string;
  sunday: string;
}

export interface CompanyValueItem {
  title: string;
  description: string;
}

export interface ReviewItem {
  name: string;
  location: string;
  service: string;
  text: string;
  rating: number;
  featured: boolean;
}

export interface ServiceAreaTown {
  name: string;
  slug: string;
}

export interface ServiceAreaCounty {
  name: string;
  state: string;
  towns: ServiceAreaTown[];
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

  homepage: {
    stats: HomepageStat[];
    servicesHeading: string;
    servicesSubheading: string;
    services: HomepageServiceCard[];
    whyChooseUsHeading: string;
    whyChooseUsItems: HomepageWhyChooseUsItem[];
    featuredReviews: HomepageFeaturedReviews;
    miniCta: HomepageCtaBlock;
    bottomCta: HomepageCtaBlock;
  };

  company: {
    aboutHeading: string;
    aboutSubheading: string;
    aboutBody: string[];
    valuesHeading: string;
    values: CompanyValueItem[];
    hours: CompanyHours;
    footerBlurb: string;
    trustBadges: string[];
  };

  reviews: {
    heading: string;
    subheading: string;
    averageLabel: string;
    ctaTitle: string;
    ctaBody: string;
    ctaLabel: string;
    items: ReviewItem[];
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

  serviceAreas: ServiceAreaCounty[];
}

export const defaultConfig: SiteConfig = {
  _version: 1,
  _updatedAt: "2026-03-31T00:00:00Z",
  _updatedBy: "system",

  brand: {
    logoUrl: "",
    logoAlt: "Augustine Home Improvements",
  },

  hero: {
    imageUrl: "",
    headline: "Expert Home Improvements",
    subheadline:
      "Serving Chester County PA and suburban Philadelphia. Decks, kitchens, bathrooms, basements, additions — one contractor you can trust from start to finish.",
  },

  homepage: {
    stats: [
      { value: "100+", label: "Projects Completed" },
      { value: "5★", label: "Average Rating" },
      { value: "4+", label: "Years Experience" },
      { value: "Free", label: "Estimates" },
    ],
    servicesHeading: "Our Services",
    servicesSubheading:
      "From a new deck to a full home renovation — we handle projects of every size with the same attention to detail.",
    services: [
      {
        title: "Deck Installation",
        description:
          "TrexPro Certified deck builder. Custom composite and wood decks designed for beauty and lasting durability.",
        href: "/deck-installation/",
      },
      {
        title: "Kitchen Renovations",
        description:
          "Full kitchen remodels from layout redesign to the finishing touches — cabinets, counters, and everything in between.",
        href: "/kitchen-renovations/",
      },
      {
        title: "Bathroom Remodeling",
        description:
          "Transform your bathroom into a personal retreat. Custom tile, fixtures, walk-in showers, and complete gut renovations.",
        href: "/bathroom-remodeling/",
      },
      {
        title: "Basement Renovation",
        description:
          "Turn your unfinished basement into livable space — home offices, rec rooms, gyms, and in-law suites.",
        href: "/basement-renovation/",
      },
      {
        title: "Home Additions",
        description:
          "Need more space? We build seamless additions that match your home's architecture and expand your living area.",
        href: "/home-additions/",
      },
      {
        title: "Home Renovations",
        description:
          "Whole-home transformations and multi-room remodels. One contractor, one point of contact, start to finish.",
        href: "/home-renovations/",
      },
    ],
    whyChooseUsHeading: "Why Chester County Homeowners Choose Augustine",
    whyChooseUsItems: [
      {
        title: "Veteran-Owned & Operated",
        description:
          "Founded by Brandon Augustine, a US veteran who brings discipline, attention to detail, and integrity to every project.",
      },
      {
        title: "TrexPro Certified",
        description:
          "One of the few certified Trex installers in Chester County — your deck comes with manufacturer-backed installation quality.",
      },
      {
        title: "Licensed & Fully Insured",
        description:
          "Your home is protected. We carry full liability coverage and workers' comp on every job.",
      },
      {
        title: "Local, Not a Franchise",
        description:
          "We live and work in this community. Our reputation here matters — and it shows in the care we take.",
      },
    ],
    featuredReviews: {
      heading: "What Our Customers Say",
      subheading: "5.0 average · 3+ verified reviews",
      countLabel: "verified reviews",
      visibleCount: 3,
    },
    miniCta: {
      title: "Ready to Start Your Project?",
      body: "Get a free, no-obligation estimate. We typically respond within one business day.",
      primaryLabel: "Request a Free Estimate",
      primaryHref: "/contact-us/",
      secondaryLabel: "Call 484-467-7925",
      secondaryHref: "tel:+14844677925",
      footnote: "Mon–Fri 8am–6pm · Sat 9am–3pm",
    },
    bottomCta: {
      title: "Let&apos;s Build Something Together",
      body: "Free estimates, honest pricing, quality craftsmanship. Serving Chester County PA and surrounding areas.",
      primaryLabel: "Get a Free Estimate",
      primaryHref: "/contact-us/",
      secondaryLabel: "484-467-7925",
      secondaryHref: "tel:+14844677925",
      footnote: "",
    },
  },

  company: {
    aboutHeading: "About Augustine Home Improvements",
    aboutSubheading:
      "A veteran-owned and operated home improvement company serving Chester County PA and suburban Philadelphia since 2020.",
    aboutBody: [
      "Augustine Home Improvements was founded by Brandon Augustine, a United States veteran who brings the same discipline, attention to detail, and commitment to excellence from his military service to every home improvement project he undertakes.",
      "Based in Chester County, Pennsylvania, we specialize in decks, kitchen renovations, bathroom remodeling, basement finishing, home additions, and full-home renovations. We serve homeowners throughout Chester County and the surrounding Philadelphia suburbs.",
      "As a TrexPro Certified Installer, Augustine Home Improvements is one of a select group of contractors in the region with factory training and authorization to install Trex composite decking — giving our customers access to extended warranties backed by the manufacturer.",
      "We&apos;re fully licensed and insured, and we&apos;re committed to honest pricing, clear communication, and work that stands the test of time. When you hire Augustine Home Improvements, you get Brandon — not a salesman who hands you off to a crew you&apos;ve never met.",
    ],
    valuesHeading: "Our Values",
    values: [
      {
        title: "Integrity First",
        description:
          "Honest estimates, no hidden fees, clear scope of work before we start.",
      },
      {
        title: "Quality Craftsmanship",
        description:
          "We take pride in every detail — from framing to finish work.",
      },
      {
        title: "Veteran Standard",
        description:
          "Military discipline means showing up on time, staying on schedule, and getting it right.",
      },
      {
        title: "Community Focus",
        description:
          "We live and work in Chester County. Our neighbors are our customers.",
      },
    ],
    hours: {
      weekdays: "Mon–Fri: 8:00am – 6:00pm",
      saturday: "Saturday: 9:00am – 3:00pm",
      sunday: "Sunday: Closed",
    },
    footerBlurb:
      "Veteran-owned home improvement contractor serving Chester County, PA and suburban Philadelphia since 2020.",
    trustBadges: [
      "Licensed & Insured",
      "TrexPro Certified Installer",
      "Veteran-Owned & Operated",
    ],
  },

  reviews: {
    heading: "Customer Reviews",
    subheading:
      "What Chester County homeowners say about working with Augustine Home Improvements.",
    averageLabel: "5.0 average",
    ctaTitle: "Ready to Be Our Next Happy Customer?",
    ctaBody: "Get a free estimate today — no obligation, no pressure.",
    ctaLabel: "Request a Free Estimate",
    items: [
      {
        name: "Sarah M.",
        location: "Phoenixville, PA",
        service: "Deck Installation",
        text: "Brandon and his crew did an amazing job on our deck. Professional, clean, and finished ahead of schedule. The composite decking looks beautiful and we couldn't be happier. Highly recommend!",
        rating: 5,
        featured: true,
      },
      {
        name: "Tom K.",
        location: "Malvern, PA",
        service: "Kitchen Renovation",
        text: "We had our kitchen completely renovated. The quality of work is outstanding — new cabinets, countertops, and backsplash. Brandon was great to work with, very communicative and professional.",
        rating: 5,
        featured: true,
      },
      {
        name: "Jennifer L.",
        location: "Downingtown, PA",
        service: "Basement Renovation",
        text: "Augustine Home Improvements transformed our unfinished basement into a beautiful family room. Fair pricing, great communication throughout, and excellent craftsmanship. We love it!",
        rating: 5,
        featured: true,
      },
    ],
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

  serviceAreas: [],
};

export function normalizeSiteConfig(config: Partial<SiteConfig> | null | undefined): SiteConfig {
  const incoming = config ?? {};

  return {
    ...defaultConfig,
    ...incoming,
    brand: { ...defaultConfig.brand, ...(incoming.brand ?? {}) },
    hero: { ...defaultConfig.hero, ...(incoming.hero ?? {}) },
    homepage: {
      ...defaultConfig.homepage,
      ...(incoming.homepage ?? {}),
      stats: incoming.homepage?.stats?.length
        ? incoming.homepage.stats.map((item) => ({ ...item }))
        : defaultConfig.homepage.stats.map((item) => ({ ...item })),
      services: incoming.homepage?.services?.length
        ? incoming.homepage.services.map((item) => ({ ...item }))
        : defaultConfig.homepage.services.map((item) => ({ ...item })),
      whyChooseUsItems: incoming.homepage?.whyChooseUsItems?.length
        ? incoming.homepage.whyChooseUsItems.map((item) => ({ ...item }))
        : defaultConfig.homepage.whyChooseUsItems.map((item) => ({ ...item })),
      featuredReviews: {
        ...defaultConfig.homepage.featuredReviews,
        ...(incoming.homepage?.featuredReviews ?? {}),
      },
      miniCta: {
        ...defaultConfig.homepage.miniCta,
        ...(incoming.homepage?.miniCta ?? {}),
      },
      bottomCta: {
        ...defaultConfig.homepage.bottomCta,
        ...(incoming.homepage?.bottomCta ?? {}),
      },
    },
    company: {
      ...defaultConfig.company,
      ...(incoming.company ?? {}),
      aboutBody: incoming.company?.aboutBody?.length
        ? [...incoming.company.aboutBody]
        : [...defaultConfig.company.aboutBody],
      values: incoming.company?.values?.length
        ? incoming.company.values.map((item) => ({ ...item }))
        : defaultConfig.company.values.map((item) => ({ ...item })),
      hours: {
        ...defaultConfig.company.hours,
        ...(incoming.company?.hours ?? {}),
      },
      trustBadges: incoming.company?.trustBadges?.length
        ? [...incoming.company.trustBadges]
        : [...defaultConfig.company.trustBadges],
    },
    reviews: {
      ...defaultConfig.reviews,
      ...(incoming.reviews ?? {}),
      items: incoming.reviews?.items?.length
        ? incoming.reviews.items.map((item) => ({ ...item }))
        : defaultConfig.reviews.items.map((item) => ({ ...item })),
    },
    gallery: incoming.gallery?.length
      ? incoming.gallery.map((item) => ({ ...item }))
      : defaultConfig.gallery.map((item) => ({ ...item })),
    contact: { ...defaultConfig.contact, ...(incoming.contact ?? {}) },
    features: { ...defaultConfig.features, ...(incoming.features ?? {}) },
    serviceAreas: incoming.serviceAreas?.length
      ? incoming.serviceAreas.map((county) => ({
          ...county,
          towns: county.towns?.length
            ? county.towns.map((town) => ({ ...town }))
            : [],
        }))
      : [],
  };
}
