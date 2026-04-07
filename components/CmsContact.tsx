"use client";

/**
 * CmsContact — re-exports contact info from the live CMS config.
 *
 * Renders phone/email links and a service-area text block driven by CMS
 * `contact` fields.  Falls back to the hardcoded defaults in siteConfig.ts
 * when the CDN is unavailable, so the UI never shows empty strings.
 *
 * Exports:
 *   CmsPhoneLink    — <a href="tel:…"> with Phone icon
 *   CmsEmailLink    — <a href="mailto:…"> with Mail icon
 *   CmsServiceArea  — plain <span> / <p> with the service-area text
 *   CmsLogo         — logo image from CMS config with static fallback
 *   useCmsContact   — hook returning { phone, email, serviceArea } strings
 *
 * Usage: import { CmsPhoneLink, CmsEmailLink, CmsServiceArea, CmsLogo } from "@/components/CmsContact"
 */

import Image from "next/image";
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

/** Renders the service-area description text from CMS config. */
export function CmsServiceArea({ className }: Props) {
  const config = useSiteConfig();
  const serviceArea =
    config.contact.serviceArea ||
    "Chester County, PA and surrounding communities including Phoenixville, Malvern, Downingtown, West Chester, and greater Philadelphia suburbs.";
  return <span className={className}>{serviceArea}</span>;
}

export function CmsLogo({ className }: Props) {
  const config = useSiteConfig();
  const logoSrc = config.brand.logoUrl || "/images/augustine-logo.png";
  const logoAlt = config.brand.logoAlt || "Augustine Home Improvements";

  return (
    <Image
      src={logoSrc}
      alt={logoAlt}
      width={160}
      height={149}
      className={className}
      unoptimized={logoSrc.startsWith("http")}
    />
  );
}

/** Hook that returns raw contact strings for custom rendering. */
export function useCmsContact() {
  const config = useSiteConfig();
  return {
    phone: config.contact.phone || "484-467-7925",
    email: config.contact.email || "info@augustinehomeimprovements.com",
    serviceArea:
      config.contact.serviceArea ||
      "Chester County, PA and surrounding communities including Phoenixville, Malvern, Downingtown, West Chester, and greater Philadelphia suburbs.",
    logoUrl: config.brand.logoUrl || "/images/augustine-logo.png",
    logoAlt: config.brand.logoAlt || "Augustine Home Improvements",
  };
}
