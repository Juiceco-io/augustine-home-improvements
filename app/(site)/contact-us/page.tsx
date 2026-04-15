import type { Metadata } from "next";
import { Shield, Star, Award } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import ContactForm from "./ContactForm";
import ContactInfoPanel from "./ContactInfoPanel";

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
    <div className="bg-white pt-20 md:pt-24 pb-16 md:pb-20">
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: form */}
          <div className="lg:col-span-3">
            <h1 className="section-heading mb-2">Get a Free Estimate</h1>
            <p className="text-gray-600 mb-8">
              Fill out the form below and a Augustine Home Improvements
              representative will contact you within the next business day. If
              you need immediate assistance, please call us.
            </p>

            <ClientOnly>
              <ContactForm />
            </ClientOnly>
          </div>

          {/* Right: contact info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-brand-charcoal mb-4">
                Contact Information
              </h2>
              {/* CMS-driven phone, email, and service area */}
              <ClientOnly>
                <ContactInfoPanel />
              </ClientOnly>
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
