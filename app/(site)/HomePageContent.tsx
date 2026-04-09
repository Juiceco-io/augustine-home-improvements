"use client";

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
import { useSiteConfig } from "@/lib/useSiteConfig";

const serviceIcons = [Layers, ChefHat, Bath, ArrowDownToLine, Home, Hammer];

export default function HomePageContent() {
  const config = useSiteConfig();
  const featured = config.reviews.items.filter((item) => item.featured).slice(0, config.homepage.featuredReviews.visibleCount);
  const miniCta = config.homepage.miniCta;
  const bottomCta = config.homepage.bottomCta;

  return (
    <>
      <HeroSection />

      <section className="bg-white border-b border-gray-100 py-8 md:py-10">
        <div className="container-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {config.homepage.stats.map((stat, i) => (
              <ScrollReveal key={`${stat.label}-${i}`} variant="fade-up" delay={i * 80}>
                <div className="stat-item cursor-default">
                  <div className="text-3xl md:text-4xl font-bold text-brand-red mb-1 stat-value">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="bg-brand-cream py-14 md:py-24">
        <div className="container-xl">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-16">
              <h2 className="section-heading mb-4">{config.homepage.servicesHeading}</h2>
              <p className="section-subheading max-w-2xl mx-auto">{config.homepage.servicesSubheading}</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.homepage.services.map((service, i) => {
              const Icon = serviceIcons[i] ?? Hammer;
              return (
                <ScrollReveal key={`${service.href}-${i}`} variant="fade-up" delay={i * 70}>
                  <Link href={service.href} className="service-card group block h-full">
                    <div className="w-12 h-12 rounded-lg bg-brand-red/10 flex items-center justify-center mb-4 service-icon">
                      <Icon size={24} className="text-brand-red" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-brand-charcoal mb-2">{service.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                    <div className="mt-4 text-brand-red text-sm font-semibold group-hover:underline">Learn more →</div>
                  </Link>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-24">
        <div className="container-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <ScrollReveal variant="fade-left">
                <h2 className="section-heading mb-6">{config.homepage.whyChooseUsHeading}</h2>
              </ScrollReveal>
              <div className="space-y-6">
                {config.homepage.whyChooseUsItems.map((item, i) => (
                  <ScrollReveal key={`${item.title}-${i}`} variant="fade-left" delay={i * 80}>
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 mt-0.5">
                        <CheckCircle size={20} className="text-brand-red" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-bold text-brand-charcoal mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            <ScrollReveal variant="fade-right">
              <div className="bg-brand-cream rounded-2xl p-6 sm:p-8 lg:p-10">
                <h3 className="font-serif text-2xl font-bold text-brand-charcoal mb-2">{miniCta.title}</h3>
                <p className="text-gray-600 mb-6">{miniCta.body}</p>
                <div className="space-y-3">
                  <Link href={miniCta.primaryHref} className="btn-primary w-full justify-center">{miniCta.primaryLabel}</Link>
                  <a href={miniCta.secondaryHref} className="btn-outline w-full justify-center">
                    <Phone size={15} aria-hidden="true" />
                    {miniCta.secondaryLabel}
                  </a>
                  <a href={`mailto:${config.contact.email}`} className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-brand-red transition-colors mt-2">
                    <Mail size={14} aria-hidden="true" />
                    {config.contact.email}
                  </a>
                </div>
                {miniCta.footnote && <p className="text-xs text-gray-400 mt-4 text-center">{miniCta.footnote}</p>}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="bg-brand-cream py-14 md:py-24">
        <div className="container-xl">
          <ScrollReveal variant="fade-up">
            <div className="text-center mb-12">
              <h2 className="section-heading mb-4">{config.homepage.featuredReviews.heading}</h2>
              <p className="section-subheading">{config.homepage.featuredReviews.subheading}</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-12">
            {featured.map((review, i) => (
              <ScrollReveal key={`${review.name}-${i}`} variant="fade-up" delay={i * 100}>
                <div className="review-card bg-white border border-gray-200 rounded-xl p-6 h-full">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} size={14} className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{review.text}&rdquo;</p>
                  <div>
                    <div className="font-bold text-brand-charcoal text-sm">{review.name}</div>
                    <div className="text-gray-500 text-xs">{review.location} &middot; {review.service}</div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            <Link href="/reviews/" className="font-semibold text-brand-red hover:underline">
              See all {config.reviews.items.length}+ {config.homepage.featuredReviews.countLabel}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-24">
        <div className="container-xl">
          <ScrollReveal variant="fade-up">
            <div className="hero-gradient-animated rounded-2xl p-6 sm:p-8 md:p-10 text-center text-white" style={{ background: "linear-gradient(135deg, #26463f 0%, #365c52 45%, #4b776b 100%)" }}>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">{bottomCta.title}</h2>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">{bottomCta.body}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link href={bottomCta.primaryHref} className="bg-white text-brand-red font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors w-full sm:w-auto text-center cta-link-white">{bottomCta.primaryLabel}</Link>
                <a href={bottomCta.secondaryHref} className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold py-3 px-8 rounded-lg transition-colors w-full sm:w-auto cta-link-white">
                  <Phone size={15} aria-hidden="true" />
                  {bottomCta.secondaryLabel}
                </a>
              </div>
              {bottomCta.footnote && <p className="text-white/70 text-sm mt-4">{bottomCta.footnote}</p>}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
