"use client";

/**
 * NavbarLogo — renders the site logo from CMS config if available,
 * otherwise falls back to the static image asset.
 *
 * This is split into a tiny client component so the rest of Navbar
 * stays clean and we avoid making the whole Navbar re-render on config load.
 */

import Image from "next/image";
import { useSiteConfig } from "@/lib/useSiteConfig";

interface Props {
  isSolid: boolean;
}

export default function NavbarLogo({ isSolid }: Props) {
  const config = useSiteConfig();
  const logoSrc = config.brand.logoUrl || "/images/augustine-logo.png";
  const logoAlt = config.brand.logoAlt || "Augustine Home Improvements";

  return (
    <div
      className={`flex items-center transition-all duration-300 ${
        !isSolid
          ? "bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 shadow-sm"
          : ""
      }`}
    >
      <Image
        src={logoSrc}
        alt={logoAlt}
        width={160}
        height={149}
        className="h-9 lg:h-11 w-auto object-contain"
        priority
        unoptimized={logoSrc.startsWith("http")}
      />
    </div>
  );
}
