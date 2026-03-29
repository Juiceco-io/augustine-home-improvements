import Link from "next/link";
import { Phone, CheckCircle } from "lucide-react";

interface ServicePageProps {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  breadcrumb: string;
}

export default function ServicePage({
  title,
  subtitle,
  description,
  highlights,
  breadcrumb,
}: ServicePageProps) {
  return (
    <div className="bg-white pt-24 pb-20">
      <div className="container-xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-brand-red transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/#services" className="hover:text-brand-red transition-colors">
                Services
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-brand-charcoal font-medium">{breadcrumb}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Hero */}
            <div
              className="rounded-2xl p-10 mb-10 text-white"
              style={{
                background:
                  "linear-gradient(135deg, #26463f 0%, #365c52 45%, #4b776b 100%)",
              }}
            >
              <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3">
                {title}
              </h1>
              <p className="text-white/80 text-lg">{subtitle}</p>
            </div>

            <div className="prose prose-gray max-w-none mb-10">
              <p className="text-gray-700 leading-relaxed text-lg">{description}</p>
            </div>

            <h2 className="text-xl font-bold text-brand-charcoal mb-4">
              What&apos;s Included
            </h2>
            <ul className="space-y-3 mb-10">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="text-brand-red flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-brand-cream rounded-xl p-6 sticky top-28">
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
          </div>
        </div>
      </div>
    </div>
  );
}
