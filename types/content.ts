export type ServicePageSlug =
  | 'deck-installation'
  | 'kitchen-renovations'
  | 'bathroom-remodeling'
  | 'basement-renovation'
  | 'home-additions'
  | 'home-renovations'

export const SERVICE_PAGE_SLUGS: ServicePageSlug[] = [
  'deck-installation',
  'kitchen-renovations',
  'bathroom-remodeling',
  'basement-renovation',
  'home-additions',
  'home-renovations',
]

export const SERVICE_PAGE_LABELS: Record<ServicePageSlug, string> = {
  'deck-installation': 'Deck Installation',
  'kitchen-renovations': 'Kitchen Renovations',
  'bathroom-remodeling': 'Bathroom Remodeling',
  'basement-renovation': 'Basement Renovation',
  'home-additions': 'Home Additions',
  'home-renovations': 'Home Renovations',
}

export interface Review {
  id: string
  name: string
  project: string
  location: string
  rating: number
  text: string
  source?: string
}

export interface GalleryItem {
  id: string
  src: string
  alt: string
  caption: string
  category: string
}

export interface ServicePageContent {
  title: string
  subtitle: string
  badge?: string
  included: string[]
  reviewQuote?: {
    text: string
    name: string
  }
}

export interface AboutPageContent {
  values: Array<{ label: string; desc: string }>
  stats: Array<{ value: string; label: string }>
  whatWeDo: string[]
}

export interface ContactPageContent {
  phone: string
  hours: string
}

export interface SiteContent {
  reviews: Review[]
  gallery: GalleryItem[]
  servicePages: Record<ServicePageSlug, ServicePageContent>
  aboutPage: AboutPageContent
  contactPage: ContactPageContent
  meta: {
    draftLastModified: string | null
    publishedLastModified: string | null
  }
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  reviews: [
    {
      id: 'review-1',
      name: 'Matthew G.',
      project: 'Full Home Renovation',
      location: 'Chester County, PA',
      rating: 5,
      text: 'Augustine Home Improvement LLC did a great job with our home renovation. Our house was a full gut job and Brandon and his team did an excellent job all around. The work was timely, professional and done well. My house was a full gut job that cost us over $200K. It included taking down load bearing walls (with engineering approval), replacing all flooring, two total bathroom replacements, drywall and wood panel removal, and almost a full house of drywall replacement as well as extensive electrical and plumbing work. I highly recommend them for any of your home improvement needs!',
      source: 'Facebook',
    },
    {
      id: 'review-2',
      name: 'Charmaine P.',
      project: 'Kitchen Remodel',
      location: 'Chester County, PA',
      rating: 5,
      text: 'From start to finish of our kitchen remodel, Brandon kept us informed of the time frame. His crews were courteous and efficient. Work area was cleaned after every day. His suggestions were eye opening and welcomed. We love our kitchen and look forward to other projects completed by Augustine Home Improvements.',
      source: 'Facebook',
    },
    {
      id: 'review-3',
      name: 'Jeff Van de M.',
      project: 'Home Improvement Project',
      location: 'Chester County, PA',
      rating: 5,
      text: "Can't say enough about working with Brandon Augustine. On time, great work, great attitude from the entire team. Will be my first call for next project.",
      source: 'Facebook',
    },
  ],
  gallery: [],
  servicePages: {
    'deck-installation': {
      title: 'Custom Deck Installation in Chester County, PA',
      subtitle:
        'TrexPro certified deck builders creating beautiful, durable outdoor living spaces for homeowners across Chester County and suburban Philadelphia.',
      badge: 'TrexPro Certified',
      included: [
        'Full design consultation and layout planning',
        'Trex composite or treated wood deck materials',
        'Custom railings, stairs, and built-in seating',
        'Pergolas and shade structures',
        'Deck lighting integration',
        'Proper permits and code compliance',
        'Post-build cleanup and inspection',
      ],
      reviewQuote: {
        text: "Can't say enough about working with Brandon Augustine. On time, great work, great attitude from the entire team. Will be my first call for next project.",
        name: 'Jeff Van de M.',
      },
    },
    'kitchen-renovations': {
      title: 'Kitchen Renovations in Chester County, PA',
      subtitle:
        'From modern appliances to custom cabinetry — our licensed pros design and build your ultimate kitchen to meet your needs and budget.',
      included: [
        'Custom cabinetry and hardware selection',
        'Countertop installation (granite, quartz, laminate)',
        'Appliance installation and plumbing fixtures',
        'Tile backsplash and flooring',
        'Lighting design and electrical updates',
        'Pantry and storage optimization',
        'Full design-to-build project management',
      ],
    },
    'bathroom-remodeling': {
      title: 'Bathroom Remodeling in Chester County, PA',
      subtitle:
        "If you've had your home for years and your bathroom is looking less than stellar, the time may be right for a remodeling job. You deserve a luxurious one.",
      included: [
        'Walk-in showers and soaking tubs',
        'Vanity and fixture replacement',
        'Custom tile work (floors, walls, showers)',
        'Accessibility upgrades (grab bars, walk-in options)',
        'Lighting and ventilation improvements',
        'Plumbing updates and re-piping',
        'Full gut and rebuild available',
      ],
    },
    'basement-renovation': {
      title: 'Basement Renovation & Finishing in Chester County, PA',
      subtitle:
        'If your growing family no longer has the living space that everyone needs, we can help add space to your home by refinishing your basement.',
      included: [
        'Framing and insulation',
        'Drywall installation and finishing',
        'Flooring (LVP, carpet, tile)',
        'Custom bars and entertainment areas',
        'Home office and bedroom builds',
        'Egress window installation',
        'Electrical, plumbing, and HVAC coordination',
      ],
    },
    'home-additions': {
      title: 'Home Additions in Chester County, PA',
      subtitle:
        'Need more space? We design and build seamless structural additions that complement your existing home — beautifully integrated and built to last.',
      included: [
        'Full structural engineering coordination',
        'Foundation and framing',
        'Roofline integration and weatherproofing',
        'Electrical, plumbing, and HVAC extension',
        'Interior finishing to match existing home',
        'Permit acquisition and code compliance',
        'Architectural design assistance',
      ],
    },
    'home-renovations': {
      title: 'Whole-Home Renovations in Chester County, PA',
      subtitle:
        'Large-scale renovations handled with precision. From full gut jobs to major multi-room remodels — Augustine Home Improvements manages every phase.',
      included: [
        'Full home gut jobs and strip-outs',
        'Load-bearing wall removal (with engineering)',
        'New flooring throughout',
        'Full drywall replacement',
        'Electrical and plumbing updates',
        'Multi-bathroom and kitchen renovation',
        'Painting — interior and exterior',
      ],
    },
  },
  aboutPage: {
    values: [
      { label: 'Honor', desc: 'We stand behind our work and our word, always.' },
      { label: 'Courage', desc: 'We tackle the toughest projects with confidence.' },
      { label: 'Commitment', desc: 'Every project receives our full dedication.' },
      { label: 'Craftsmanship', desc: 'We take pride in quality that lasts a lifetime.' },
    ],
    stats: [
      { value: '2020', label: 'Year Founded' },
      { value: '5★', label: 'Customer Rating' },
      { value: 'TrexPro', label: 'Certified Installer' },
      { value: 'US Navy', label: 'Veteran-Owned' },
    ],
    whatWeDo: [
      'Whole Home Renovations',
      'Kitchen Renovations',
      'Bathroom Remodeling',
      'Deck Installation (TrexPro Certified)',
      'Basement Finishing',
      'Home Additions',
      'Painting — Interior & Exterior',
      'Estate & Rental Property Maintenance',
    ],
  },
  contactPage: {
    phone: '484-467-7925',
    hours: 'Mon–Fri 8am–6pm, Sat 9am–3pm',
  },
  meta: {
    draftLastModified: null,
    publishedLastModified: null,
  },
}
