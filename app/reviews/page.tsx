import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Customer Reviews | Chester County PA | Augustine Home Improvements",
  description:
    "Read reviews from Chester County PA homeowners who've worked with Augustine Home Improvements. 5-star rated contractor.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/reviews/",
  },
};

const reviews = [
  {
    name: "Sarah M.",
    location: "Phoenixville, PA",
    service: "Deck Installation",
    text: "Brandon and his crew did an amazing job on our deck. Professional, clean, and finished ahead of schedule. The composite decking looks beautiful and we couldn't be happier. Highly recommend!",
    rating: 5,
  },
  {
    name: "Tom K.",
    location: "Malvern, PA",
    service: "Kitchen Renovation",
    text: "We had our kitchen completely renovated. The quality of work is outstanding — new cabinets, countertops, and backsplash. Brandon was great to work with, very communicative and professional.",
    rating: 5,
  },
  {
    name: "Jennifer L.",
    location: "Downingtown, PA",
    service: "Basement Renovation",
    text: "Augustine Home Improvements transformed our unfinished basement into a beautiful family room. Fair pricing, great communication throughout, and excellent craftsmanship. We love it!",
    rating: 5,
  },
];

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

        <div className="max-w-2xl mb-8 md:mb-12">
          <h1 className="section-heading mb-4">Customer Reviews</h1>
          <div className="flex items-center gap-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={22}
                className="fill-yellow-400 text-yellow-400"
                aria-hidden="true"
              />
            ))}
            <span className="text-gray-600 text-sm ml-1">5.0 average</span>
          </div>
          <p className="section-subheading">
            What Chester County homeowners say about working with Augustine Home
            Improvements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 mb-12 md:mb-16">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-brand-cream border border-gray-200 rounded-xl p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-yellow-400 text-yellow-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                &ldquo;{review.text}&rdquo;
              </p>
              <div>
                <div className="font-bold text-brand-charcoal text-sm">
                  {review.name}
                </div>
                <div className="text-gray-500 text-xs">
                  {review.location} &middot; {review.service}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="rounded-2xl p-6 sm:p-8 md:p-10 text-center text-white"
          style={{
            background:
              "linear-gradient(135deg, #4d1006 0%, #671609 45%, #8d1e0c 100%)",
          }}
        >
          <h2 className="font-serif text-xl sm:text-2xl font-bold mb-3">
            Ready to Be Our Next Happy Customer?
          </h2>
          <p className="text-white/80 mb-6">
            Get a free estimate today — no obligation, no pressure.
          </p>
          <Link
            href="/contact-us/"
            className="bg-white text-brand-red font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors inline-block"
          >
            Request a Free Estimate
          </Link>
        </div>
      </div>
    </div>
  );
}
