"use client";

import { Shield, Star, Award } from "lucide-react";
import ClientOnly from "@/components/ClientOnly";
import ContactForm from "@/app/(site)/contact-us/ContactForm";
import ContactInfoPanel from "@/app/(site)/contact-us/ContactInfoPanel";

export default function PreviewContactPage() {
  return (
    <div className="bg-white pt-20 md:pt-24 pb-16 md:pb-20">
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
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

          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-brand-charcoal mb-4">
                Contact Information
              </h2>
              <ClientOnly>
                <ContactInfoPanel />
              </ClientOnly>
            </div>

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
