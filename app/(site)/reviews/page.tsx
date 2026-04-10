import type { Metadata } from "next";
import Link from "next/link";
import ClientOnly from "@/components/ClientOnly";
import ReviewsPageContent from "./ReviewsPageContent";

export const metadata: Metadata = {
  title: "Customer Reviews | Chester County PA | Augustine Home Improvements",
  description:
    "Read reviews from Chester County PA homeowners who've worked with Augustine Home Improvements. 5-star rated contractor.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/reviews/",
  },
};

export default function ReviewsPage() {
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
            <li className="text-brand-charcoal font-medium">Reviews</li>
          </ol>
        </nav>

        <ClientOnly>
          <ReviewsPageContent />
        </ClientOnly>
      </div>
    </div>
  );
}
