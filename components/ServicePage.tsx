import Link from "next/link";
import { Phone, CheckCircle } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface ServicePageProps {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  breadcrumb: string;
  basePath?: string;
}

export default function ServicePage({
  title,
  subtitle,
  description,
  highlights,
  breadcrumb,
  basePath = "",
}: ServicePageProps) {
  return (
    <div className="bg-white pt-20 md:pt-24 pb-16 md:pb-20">
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Hero */}
            <ScrollReveal variant="fade-up">
              <div
                className="hero-gradient-animated rounded-2xl p-6 sm:p-8 md:p-10 mb-8 md:mb-10 text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #26463f 0%, #365c52 45%, #4b776b 100%)",
                }}
              >
                <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
                  {title}
                </h1>
                <p className="text-white/80 text-base md:text-lg">{subtitle}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={80}>
              <div className="prose prose-gray max-w-none mb-8 md:mb-10">
                <p className="text-gray-700 leading-relaxed text-base md:text-lg">{description}</p>
              </div>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={120}>
              <h2 className="text-xl font-bold text-brand-charcoal mb-4">
                What&apos;s Included
              </h2>
            </ScrollReveal>

            <ul className="space-y-3 mb-10">
              {highlights.map((item, i) => (
                <ScrollReveal key={item} variant="fade-left" delay={i * 60}>
                  <li className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      className="text-brand-red flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="text-gray-700">{item}</span>
                  </li>
                </ScrollReveal>
              ))}
            </ul>
          </div>

          {/* Sidebar — shown below content on mobile, sticky on desktop */}
          <div className="lg:col-span-1 order-first lg:order-none">
            <ScrollReveal variant="fade-right">
              <div className="bg-brand-cream rounded-xl p-5 sm:p-6 lg:sticky lg:top-28">
                <h2 className="font-bold text-brand-charcoal text-lg mb-3">
                  Get a Free Estimate
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Tell us about your project and we&apos;ll get back to you within
                  one business day.
                </p>
                <Link
                  href="/contact-us/"
                  className="btn-primary w-full justify-center mb-3"
                >
                  Request Estimate
                </Link>
                <a
                  href="tel:+14844677925"
                  className="btn-outline w-full justify-center text-sm"
                >
                  <Phone size={14} aria-hidden="true" />
                  484-467-7925
                </a>
                <p className="text-xs text-gray-400 text-center mt-4">
                  No obligation · Free quotes · Licensed &amp; insured
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
