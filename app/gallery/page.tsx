import type { Metadata } from "next";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import GalleryGrid from "./GalleryGrid";

export const metadata: Metadata = {
  title: "Project Gallery | Chester County PA | Augustine Home Improvements",
  description:
    "Browse completed home improvement projects by Augustine Home Improvements in Chester County PA — decks, kitchens, bathrooms, and more.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/gallery/",
  },
};

export default function GalleryPage() {
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
            <li className="text-brand-charcoal font-medium">Gallery</li>
          </ol>
        </nav>

        <ScrollReveal variant="fade-up">
          <div className="max-w-3xl mb-10">
            <h1 className="section-heading mb-4">Project Gallery</h1>
            <p className="section-subheading">
              A look at some of our recent work across Chester County PA — decks,
              kitchens, bathrooms, basements, and more.
            </p>
          </div>
        </ScrollReveal>

        {/* CMS-driven gallery grid — falls back to placeholders if no photos yet */}
        <GalleryGrid />

        <ScrollReveal variant="fade-up" delay={200}>
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-6">
              Ready to start your project?
            </p>
            <Link href="/contact-us/" className="btn-primary">
              Get a Free Estimate
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
