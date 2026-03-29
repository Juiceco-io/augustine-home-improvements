import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Award, Star, CheckCircle, Phone } from "lucide-react";

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
    <div className="bg-white pt-24 pb-20">
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
        <div className="max-w-3xl mb-16">
          <h1 className="section-heading mb-4">About Augustine Home Improvements</h1>
          <p className="section-subheading">
            A veteran-owned and operated home improvement company serving Chester
            County PA and suburban Philadelphia since 2020.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
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

          {/* Values */}
          <div>
            <h2 className="text-xl font-bold text-brand-charcoal mb-6">
              Our Values
            </h2>
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
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center">
                    <Icon size={18} className="text-brand-red" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-charcoal mb-1">{title}</h3>
                    <p className="text-gray-600 text-sm">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-10 text-center text-white"
          style={{
            background:
              "linear-gradient(135deg, #26463f 0%, #365c52 45%, #4b776b 100%)",
          }}
        >
          <h2 className="font-serif text-3xl font-bold mb-3">
            Ready to Work with Us?
          </h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            Get a free, no-obligation estimate. We&apos;ll come to your home,
            assess the project, and give you a clear, written quote.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/contact-us/"
              className="bg-white text-brand-red font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Request a Free Estimate
            </Link>
            <a
              href="tel:+14844677925"
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              <Phone size={15} aria-hidden="true" />
              484-467-7925
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
