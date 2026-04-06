"use client";

/**
 * CmsContact — re-exports contact info from the live CMS config.
 *
 * Renders a phone link and email link driven by the CMS `contact` fields.
 * Falls back to the hardcoded defaults in siteConfig.ts when the CDN is
 * unavailable, so the UI never shows empty strings.
 *
 * Usage: import { CmsPhoneLink, CmsEmailLink } from "@/components/CmsContact"
 */

import { Phone, Mail } from "lucide-react";
import { useSiteConfig } from "@/lib/useSiteConfig";

interface Props {
  className?: string;
}

export function CmsPhoneLink({ className }: Props) {
  const config = useSiteConfig();
  const phone = config.contact.phone || "484-467-7925";
  const tel = `tel:+1${phone.replace(/\D/g, "")}`;
  return (
    <a href={tel} className={className}>
      <Phone size={15} aria-hidden="true" className="flex-shrink-0" />
      {phone}
    </a>
  );
}

export function CmsEmailLink({ className }: Props) {
  const config = useSiteConfig();
  const email = config.contact.email || "info@augustinehomeimprovements.com";
  return (
    <a href={`mailto:${email}`} className={className}>
      <Mail size={15} aria-hidden="true" className="flex-shrink-0 mt-0.5" />
      <span>{email}</span>
    </a>
  );
}
