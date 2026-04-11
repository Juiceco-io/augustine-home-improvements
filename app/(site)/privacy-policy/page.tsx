import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Augustine Home Improvements",
  description:
    "Privacy policy for Augustine Home Improvements LLC.",
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPage() {
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
            <li className="text-brand-charcoal font-medium">Privacy Policy</li>
          </ol>
        </nav>

        <div className="max-w-3xl">
          <h1 className="section-heading mb-8">Privacy Policy</h1>

          <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
            <p className="text-sm text-gray-500">Last updated: March 2026</p>

            <section>
              <h2 className="text-xl font-bold text-brand-charcoal mb-3">
                1. Information We Collect
              </h2>
              <p>
                When you submit our contact form, we collect your name, email
                address, phone number, and project description. We use this
                information only to respond to your inquiry.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-charcoal mb-3">
                2. How We Use Your Information
              </h2>
              <p>
                We use the information you submit to contact you about your home
                improvement project. We do not sell, rent, or share your personal
                information with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-charcoal mb-3">
                3. Cookies
              </h2>
              <p>
                This website uses minimal cookies necessary for basic functionality.
                We do not use tracking or advertising cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-brand-charcoal mb-3">
                4. Contact
              </h2>
              <p>
                If you have questions about this privacy policy, please contact us
                at{" "}
                <a
                  href="mailto:info@augustinehomeimprovements.com"
                  className="text-brand-red hover:underline"
                >
                  info@augustinehomeimprovements.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
