"use client";

export default function PreviewPrivacyPolicyPage() {
  return (
    <div className="bg-white pt-20 md:pt-24 pb-16 md:pb-20">
      <div className="container-xl">
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
