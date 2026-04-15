import type { Metadata } from "next";
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
        <ClientOnly>
          <ReviewsPageContent />
        </ClientOnly>
      </div>
    </div>
  );
}
