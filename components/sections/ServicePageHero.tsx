import Link from 'next/link'
import { Phone, ChevronRight } from 'lucide-react'

interface ServicePageHeroProps {
  title: string
  subtitle: string
  breadcrumb: string
  badge?: string
}

export default function ServicePageHero({
  title,
  subtitle,
  breadcrumb,
  badge,
}: ServicePageHeroProps) {
  return (
    <section
      className="relative min-h-[50vh] flex items-center"
      style={{
        background: 'linear-gradient(135deg, #4d1006 0%, #671609 40%, #8d1e0c 100%)',
      }}
    >
      {/* Pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden="true"
      />

      <div className="container-xl relative z-10 py-24 md:py-32 pt-36 md:pt-40">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-sm text-white/60">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight size={14} />
            </li>
            <li className="text-white/80" aria-current="page">
              {breadcrumb}
            </li>
          </ol>
        </nav>

        {badge && (
          <div className="inline-block bg-white/15 text-white text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-4">
            {badge}
          </div>
        )}

        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight max-w-3xl">
          {title}
        </h1>
        <p className="mt-4 text-white/80 text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link href="/contact-us/" className="btn-primary">
            Get a Free Estimate
          </Link>
          <a href="tel:+14844677925" className="btn-outline">
            <Phone size={16} aria-hidden="true" />
            Call 484-467-7925
          </a>
        </div>
      </div>
    </section>
  )
}
