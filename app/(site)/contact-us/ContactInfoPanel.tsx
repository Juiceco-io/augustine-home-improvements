"use client";

/**
 * ContactInfoPanel — CMS-driven contact info block on the contact page.
 *
 * Pulls phone, email, and service area from live CMS config with defaultConfig
 * fallbacks. Rendered as a client component so it can use useSiteConfig().
 */

import { Phone, Mail, Clock, MapPin } from "lucide-react";
import { useSiteConfig } from "@/lib/useSiteConfig";

export default function ContactInfoPanel() {
  const config = useSiteConfig();
  const phone = config.contact.phone || "484-467-7925";
  const email = config.contact.email || "info@augustinehomeimprovements.com";
  const serviceArea =
    config.contact.serviceArea ||
    "Chester County, PA and surrounding communities including Phoenixville, Malvern, Downingtown, West Chester, and greater Philadelphia suburbs.";

  const tel = `tel:+1${phone.replace(/\D/g, "")}`;
  const hours = config.company.hours;

  return (
    <div className="space-y-4">
      {/* Phone */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
          <Phone size={18} className="text-brand-red" aria-hidden="true" />
        </div>
        <div>
          <div className="font-semibold text-brand-charcoal">Phone</div>
          <a
            href={tel}
            className="text-gray-600 hover:text-brand-red transition-colors"
          >
            {phone}
          </a>
        </div>
      </div>

      {/* Email */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
          <Mail size={18} className="text-brand-red" aria-hidden="true" />
        </div>
        <div>
          <div className="font-semibold text-brand-charcoal">Email</div>
          <a
            href={`mailto:${email}`}
            className="text-gray-600 hover:text-brand-red transition-colors text-sm break-all"
          >
            {email}
          </a>
        </div>
      </div>

      {/* Hours */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
          <Clock size={18} className="text-brand-red" aria-hidden="true" />
        </div>
        <div>
          <div className="font-semibold text-brand-charcoal">Hours</div>
          <div className="text-gray-600 text-sm">
            {hours.weekdays}
            <br />
            {hours.saturday}
            <br />
            {hours.sunday}
          </div>
        </div>
      </div>

      {/* Service Area */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
          <MapPin size={18} className="text-brand-red" aria-hidden="true" />
        </div>
        <div>
          <div className="font-semibold text-brand-charcoal">Service Area</div>
          <p className="text-gray-600 text-sm">{serviceArea}</p>
        </div>
      </div>
    </div>
  );
}
