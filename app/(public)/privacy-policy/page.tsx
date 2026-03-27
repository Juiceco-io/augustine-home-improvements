import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Augustine Home Improvements',
  description: 'Privacy policy for augustinehomeimprovements.com',
  robots: { index: false },
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <section
        className="relative min-h-[30vh] flex items-center"
        style={{ background: 'linear-gradient(135deg, #4d1006 0%, #671609 40%, #8d1e0c 100%)' }}
      >
        <div className="container-xl py-20 pt-36">
          <h1 className="font-serif text-3xl md:text-4xl text-white font-bold">Privacy Policy</h1>
          <p className="text-white/70 text-sm mt-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container-xl max-w-3xl">
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed space-y-6">
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">Information We Collect</h2>
            <p>When you fill out our contact form, we collect your name, email address, phone number, location, and project description. This information is used solely to respond to your inquiry about home improvement services.</p>
            
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">How We Use Your Information</h2>
            <p>We use the information you provide to respond to your inquiry, schedule estimates, and communicate with you about your home improvement project. We do not sell, trade, or share your personal information with third parties except as required by law.</p>
            
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">Google Analytics</h2>
            <p>This website uses Google Analytics to understand how visitors use our site. Google Analytics collects anonymized usage data. You can opt out of Google Analytics tracking by installing the <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Google Analytics Opt-out Browser Add-on</a>.</p>
            
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">Cookies</h2>
            <p>Our website uses functional cookies for the admin panel. Google Analytics uses cookies for tracking. Most browsers allow you to refuse cookies via browser settings.</p>
            
            <h2 className="font-serif text-2xl font-bold text-brand-charcoal">Contact</h2>
            <p>If you have questions about this privacy policy, please <Link href="/contact-us/" className="text-brand-red hover:underline">contact us</Link> or call <a href="tel:+14844677925" className="text-brand-red hover:underline">484-467-7925</a>.</p>
          </div>
        </div>
      </section>
    </>
  )
}
