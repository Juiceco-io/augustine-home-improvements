import type { Metadata } from "next";
import Link from "next/link";
import {
  Layers,
  ChefHat,
  Bath,
  ArrowDownToLine,
  Home,
  Hammer,
  Phone,
  Mail,
  Star,
  CheckCircle,
} from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Augustine Home Improvements — Chester County PA Contractor",
  description:
    "Veteran-owned home improvement contractor serving Chester County PA. Specializing in decks, kitchens, bathrooms, basements, and full home renovations. Free estimates — call 484-467-7925.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/",
  },
};

const services = [
  {
    icon: Layers,
    title: "Deck Installation",
    description:
      "TrexPro Certified deck builder. Custom composite and wood decks designed for beauty and lasting durability.",
    href: "/deck-installation/",
  },
  {
    icon: ChefHat,
    title: "Kitchen Renovations",
    description:
      "Full kitchen remodels from layout redesign to the finishing touches — cabinets, counters, and everything in between.",
    href: "/kitchen-renovations/",
  },
  {
    icon: Bath,
    title: "Bathroom Remodeling",
    description:
      "Transform your bathroom into a personal retreat. Custom tile, fixtures, walk-in showers, and complete gut renovations.",
    href: "/bathroom-remodeling/",
  },
  {
    icon: ArrowDownToLine,
    title: "Basement Renovation",
    description:
      "Turn your unfinished basement into livable space — home offices, rec rooms, gyms, and in-law suites.",
    href: "/basement-renovation/",
  },
  {
    icon: Home,
    title: "Home Additions",
    description:
      "Need more space? We build seamless additions that match your home's architecture and expand your living area.",
    href: "/home-additions/",
  },
  {
    icon: Hammer,
    title: "Home Renovations",
    description:
      "Whole-home transformations and multi-room remodels. One contractor, one point of contact, start to finish.",
    href: "/home-renovations/",
  },
];

const reviews = [
  {
    name: "Sarah M.",
    location: "Phoenixville, PA",
    text: "Brandon and his crew did an amazing job on our deck. Professional, clean, and finished ahead of schedule. Highly recommend!",
    rating: 5,
  },
  {
    name: "Tom K.",
    location: "Malvern, PA",
    text: "We had our kitchen completely renovated. The quality of work is outstanding — we couldn't be happier with the results.",
    rating: 5,
  },
  {
    name: "Jennifer L.",
    location: "Downingtown, PA",
    text: "Augustine Home Improvements transformed our basement. Fair pricing, great communication, and excellent craftsmanship.",
    rating: 5,
  },
];

const stats = [
  { value: "100+", label: "Projects Completed" },
  { value: "5★", label: "Average Rating" },
  { value: "4+", label: "Years Experience" },
  { value: "Free", label: "Estimates" },
];

export default function HomePage() {
  return (
    <>
      {/* =================== HERO =================== */}
      <HeroSection />

      {/* =================== STATS STRIP =================== */}
      <section className="bg-white border-b border-gray-100 py-8 md:py-10">
        <div className="container-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} variant="fade-up" delay={i * 80}>
                <div className="stat-item cursor-default">
                  <div className="text-3xl md:text-4xl font-bold text-brand-red mb-1 stat-value">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =================== SERVICES =================== */}
      <section id="services" className="bg-brand-cream py-14 md:py-24">
        <div className="container-xl">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-16">
              <h2 className="section-heading mb-4">Our Services</h2>
              <p className="section-subheading max-w-2xl mx-auto">
                From a new deck to a full home renovation &mdash; we handle
                projects of every size with the same attention to detail.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
                <ScrollReveal key={service.href} variant="fade-up" delay={i * 70}>
                  <Link
                    href={service.href}
                    className="service-card group block h-full"
                  >
                    <div className="w-12 h-12 rounded-lg bg-brand-red/10 flex items-center justify-center mb-4 service-icon">
                      <Icon
                        size={24}
                        className="text-brand-red"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-brand-charcoal mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {service.description}
                    </p>
                    <div className="mt-4 text-brand-red text-sm font-semibold group-hover:underline">
                      Learn more →
                    </div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =================== WHY CHOOSE US =================== */}
      <section className="bg-white py-14 md:py-24">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <ScrollReveal variant="fade-left">
                <h2 className="section-heading mb-6">
                  Why Chester County Homeowners Choose Augustine
                </h2>
              </ScrollReveal>
              <div className="space-y-6">
                {[
                  {
                    title: "Veteran-Owned & Operated",
                    desc: "Founded by Brandon Augustine, a US veteran who brings discipline, attention to detail, and integrity to every project.",
                  },
                  {
                    title: "TrexPro Certified",
                    desc: "One of the few certified Trex installers in Chester County — your deck comes with manufacturer-backed installation quality.",
                  },
                  {
                    title: "Licensed & Fully Insured",
                    desc: "Your home is protected. We carry full liability coverage and workers' comp on every job.",
                  },
                  {
                    title: "Local, Not a Franchise",
                    desc: "We live and work in this community. Our reputation here matters — and it shows in the care we take.",
                  },
                ].map((item, i) => (
                  <ScrollReveal key={item.title} variant="fade-left" delay={i * 80}>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                        <CheckCircle
                          size={20}
                          className="text-brand-red"
                          aria-hidden="true"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-charcoal mb-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* Contact mini-CTA */}
            <ScrollReveal variant="fade-right">
              <div className="bg-brand-cream rounded-2xl p-6 sm:p-8 lg:p-10">
                <h3 className="font-serif text-2xl font-bold text-brand-charcoal mb-2">
                  Ready to Start Your Project?
                </h3>
                <p className="text-gray-600 mb-6">
                  Get a free, no-obligation estimate. We typically respond within
                  one business day.
                </p>
                <div className="space-y-3">
                  <Link href="/contact-us/" className="btn-primary w-full justify-center">
                    Request a Free Estimate
                  </Link>
                  <a
                    href="tel:+14844677925"
                    className="btn-outline w-full justify-center"
                  >
                    <Phone size={15} aria-hidden="true" />
                    Call 484-467-7925
                  </a>
                  <a
                    href="mailto:info@augustinehomeimprovements.com"
                    className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-red transition-colors mt-2"
                  >
                    <Mail size={14} aria-hidden="true" />
                    info@augustinehomeimprovements.com
                  </a>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Mon–Fri 8am–6pm · Sat 9am–3pm
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* =================== REVIEWS =================== */}
      <section className="bg-brand-charcoal py-14 md:py-24">
        <div className="container-xl">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                What Our Customers Say
              </h2>
              <div className="flex items-center justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-yellow-400 text-yellow-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-gray-400 text-sm">5.0 average · 3+ verified reviews</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, i) => (
              <ScrollReveal key={review.name} variant="fade-up" delay={i * 100}>
                <div className="review-card bg-white/5 border border-white/10 rounded-xl p-6 h-full">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star
                        key={j}
                        size={14}
                        className="fill-yellow-400 text-yellow-400"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    &ldquo;{review.text}&rdquo;
                  </p>
                  <div>
                    <div className="font-semibold text-white text-sm">
                      {review.name}
                    </div>
                    <div className="text-gray-500 text-xs">{review.location}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal variant="fade-up" delay={300}>
            <div className="text-center mt-10">
              <Link href="/reviews/" className="btn-outline border-white/30 text-white hover:bg-white hover:text-brand-charcoal">
                See All Reviews →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =================== CTA STRIP =================== */}
      <section
        className="py-14 md:py-20 text-center"
        style={{
          background:
            "linear-gradient(135deg, #4b776b 0%, #365c52 50%, #26463f 100%)",
        }}
      >
        <div className="container-xl">
          <ScrollReveal variant="fade-up">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Let&apos;s Build Something Together
            </h2>
            <p className="text-white/80 text-base md:text-lg mb-8 max-w-xl mx-auto">
              Free estimates, honest pricing, quality craftsmanship. Serving
              Chester County PA and surrounding areas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href="/contact-us/"
                className="bg-white text-brand-primary font-bold py-3.5 px-8 rounded-lg hover:bg-gray-100 transition-colors cta-link-white"
              >
                Get a Free Estimate
              </Link>
              <a
                href="tel:+14844677925"
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold py-3.5 px-8 rounded-lg transition-colors cta-link-white"
              >
                <Phone size={16} aria-hidden="true" />
                484-467-7925
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
