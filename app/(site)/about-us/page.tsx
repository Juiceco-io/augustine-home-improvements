import type { Metadata } from "next";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";
import AboutPageContent from "./AboutPageContent";

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

        <ClientOnly>
          <AboutPageContent />
        </ClientOnly>
      </div>
    </div>
  );
}
