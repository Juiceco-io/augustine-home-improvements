import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-white pt-24 pb-20 min-h-[60vh] flex items-center">
      <div className="container-xl text-center">
        <h1 className="font-serif text-6xl font-bold text-brand-red mb-4">404</h1>
        <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. Let us help
          you get back on track.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/contact-us/" className="btn-outline">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
