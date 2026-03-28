import type { Metadata } from "next";
import Link from "next/link";
import { Phone, Mail, Clock, MapPin, Shield, Star, Award } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Free Estimate | Chester County PA | 484-467-7925",
  description:
    "Contact Augustine Home Improvements for a free home improvement estimate in Chester County PA. Call 484-467-7925 or fill out our form. We respond within 1 business day.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/contact-us/",
  },
};

export default function ContactPage() {
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
            <li className="text-brand-charcoal font-medium">Contact Us</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left: form */}
          <div className="lg:col-span-3">
            <h1 className="section-heading mb-2">Get a Free Estimate</h1>
            <p className="text-gray-600 mb-8">
              Fill out the form below and a Augustine Home Improvements
              representative will contact you within the next business day. If
              you need immediate assistance, please call us.
            </p>

            <ContactForm />
          </div>

          {/* Right: contact info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-brand-charcoal mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                    <Phone size={18} className="text-brand-red" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-brand-charcoal">Phone</div>
                    <a
                      href="tel:+14844677925"
                      className="text-gray-600 hover:text-brand-red transition-colors"
                    >
                      484-467-7925
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                    <Mail size={18} className="text-brand-red" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-brand-charcoal">Email</div>
                    <a
                      href="mailto:info@augustinehomeimprovements.com"
                      className="text-gray-600 hover:text-brand-red transition-colors text-sm"
                    >
                      info@augustinehomeimprovements.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-brand-red" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-brand-charcoal">Hours</div>
                    <div className="text-gray-600 text-sm">
                      Mon–Fri: 8:00am – 6:00pm
                      <br />
                      Saturday: 9:00am – 3:00pm
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={18} className="text-brand-red" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-semibold text-brand-charcoal">Service Area</div>
                    <div className="text-gray-600 text-sm">
                      Chester County, PA and surrounding communities including
                      Phoenixville, Malvern, Downingtown, West Chester, and
                      greater Philadelphia suburbs.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="bg-brand-cream rounded-xl p-6">
              <h3 className="font-bold text-brand-charcoal mb-4">
                Why Choose Augustine?
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Shield, text: "Licensed & Insured" },
                  { icon: Star, text: "TrexPro Certified Installer" },
                  { icon: Award, text: "Veteran-Owned & Operated" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-gray-700">
                    <Icon size={14} className="text-brand-red flex-shrink-0" aria-hidden="true" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
