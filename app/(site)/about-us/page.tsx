import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Award, Star, CheckCircle } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import AboutCta from "./AboutCta";

export const metadata: Metadata = {
  title: "About Us | Veteran-Owned Chester County Contractor",
  description:
    "Learn about Augustine Home Improvements — a veteran-owned home improvement contractor serving Chester County PA. Founded by Brandon Augustine in 2020.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/about-us/",
  },
};

export default function AboutPage() {
  return (
    <div className="bg-white pt-20 md:pt-24 pb-16 md:pb-20">
      <div className="container-xl">
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-brand-red transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-brand-charcoal font-medium">About Us</li>
          </ol>
        </nav>

        {/* Hero */}
        <ScrollReveal variant="fade-up">
          <div className="max-w-3xl mb-10 md:mb-16">
            <h1 className="section-heading mb-4">About Augustine Home Improvements</h1>
            <p className="section-subheading">
              A veteran-owned and operated home improvement company serving Chester
              County PA and suburban Philadelphia since 2020.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-14 md:mb-20">
          <ScrollReveal variant="fade-left">
            <div className="space-y-6 text-gray-700 leading-relaxed">
              <p>
                Augustine Home Improvements was founded by Brandon Augustine, a
                United States veteran who brings the same discipline, attention to
                detail, and commitment to excellence from his military service to
                every home improvement project he undertakes.
              </p>
              <p>
                Based in Chester County, Pennsylvania, we specialize in decks,
                kitchen renovations, bathroom remodeling, basement finishing, home
                additions, and full-home renovations. We serve homeowners throughout
                Chester County and the surrounding Philadelphia suburbs.
              </p>
              <p>
                As a TrexPro Certified Installer, Augustine Home Improvements is
                one of a select group of contractors in the region with factory
                training and authorization to install Trex composite decking — giving
                our customers access to extended warranties backed by the manufacturer.
              </p>
              <p>
                We&apos;re fully licensed and insured, and we&apos;re committed to
                honest pricing, clear communication, and work that stands the test
                of time. When you hire Augustine Home Improvements, you get Brandon
                — not a salesman who hands you off to a crew you&apos;ve never met.
              </p>
            </div>
          </ScrollReveal>

          {/* Values */}
          <div>
            <ScrollReveal variant="fade-right">
              <h2 className="text-xl font-bold text-brand-charcoal mb-6">
                Our Values
              </h2>
            </ScrollReveal>
            <div className="space-y-5">
              {[
                {
                  icon: Shield,
                  title: "Integrity First",
                  desc: "Honest estimates, no hidden fees, clear scope of work before we start.",
                },
                {
                  icon: CheckCircle,
                  title: "Quality Craftsmanship",
                  desc: "We take pride in every detail — from framing to finish work.",
                },
                {
                  icon: Award,
                  title: "Veteran Standard",
                  desc: "Military discipline means showing up on time, staying on schedule, and getting it right.",
                },
                {
                  icon: Star,
                  title: "Community Focus",
                  desc: "We live and work in Chester County. Our neighbors are our customers.",
                },
              ].map(({ icon: Icon, title, desc }, i) => (
                <ScrollReveal key={title} variant="fade-right" delay={i * 80}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center service-icon">
                      <Icon size={18} className="text-brand-red" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-charcoal mb-1">{title}</h3>
                      <p className="text-gray-600 text-sm">{desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>

        {/* CTA — CMS-driven phone */}
        <ScrollReveal variant="fade-up">
          <AboutCta />
        </ScrollReveal>
      </div>
    </div>
  );
}
