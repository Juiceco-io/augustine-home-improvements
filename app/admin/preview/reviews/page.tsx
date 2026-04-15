"use client";

import ClientOnly from "@/components/ClientOnly";
import ReviewsPageContent from "@/app/(site)/reviews/ReviewsPageContent";

export default function PreviewReviewsPage() {
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
