'use client'

import { useState, useRef } from 'react'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import clsx from 'clsx'

const SERVICES = [
  'Home Additions',
  'Kitchen Renovations',
  'Bathroom Remodeling',
  'Outdoor Living Space / Deck',
  'Siding or Roofing',
  'Basement Renovation',
  'Whole-Home Renovation',
  'Other',
]

const CALL_TIMES = ['Morning', 'Afternoon', 'Evening']

// Honeypot + digit challenge for spam prevention
const CHALLENGE_NUMBER = 7 // Static challenge: "click the 7 button"
const CHALLENGE_OPTIONS = [3, 5, 7, 2, 9, 1, 4]

type FormState = 'idle' | 'loading' | 'success' | 'error'

export default function ContactForm({ className }: { className?: string }) {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [callTime, setCallTime] = useState('')
  const [challenge, setChallenge] = useState<number | null>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)

  function toggleService(service: string) {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Check honeypot
    if (honeypotRef.current?.value) return

    // Check spam challenge
    if (challenge !== CHALLENGE_NUMBER) {
      setErrorMsg('Please click the correct number to verify you are not a robot.')
      setFormState('error')
      return
    }

    const form = e.currentTarget
    const data = new FormData(form)

    const payload = {
      name: data.get('name') as string,
      email: data.get('email') as string,
      phone: data.get('phone') as string,
      location: data.get('location') as string,
      callTime,
      services: selectedServices,
      description: data.get('description') as string,
    }

    setFormState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Failed to send message')
      }

      setFormState('success')
    } catch (err) {
      setFormState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please call us directly.')
    }
  }

  if (formState === 'success') {
    return (
      <div className={clsx('flex flex-col items-center justify-center py-16 text-center gap-4', className)}>
        <CheckCircle size={56} className="text-green-600" aria-hidden="true" />
        <h3 className="font-serif text-2xl font-bold text-brand-charcoal">
          Thank You!
        </h3>
        <p className="text-gray-600 max-w-md">
          We received your inquiry and will contact you within the next business day to schedule your free estimate. If you need immediate assistance, call{' '}
          <a href="tel:+14844677925" className="text-brand-red font-semibold hover:underline">
            484-467-7925
          </a>.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx('space-y-5', className)}
      noValidate
      aria-label="Contact form"
    >
      {/* Honeypot (hidden from real users) */}
      <div className="sr-only" aria-hidden="true">
        <input
          ref={honeypotRef}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="form-label">
            Full Name <span className="text-brand-red" aria-label="required">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="form-input"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label htmlFor="email" className="form-label">
            Email Address <span className="text-brand-red" aria-label="required">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="form-input"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="form-label">
            Phone Number <span className="text-brand-red" aria-label="required">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className="form-input"
            placeholder="(555) 555-5555"
          />
        </div>
        <div>
          <label htmlFor="location" className="form-label">
            Location / City <span className="text-brand-red" aria-label="required">*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            className="form-input"
            placeholder="Phoenixville, PA"
          />
        </div>
      </div>

      {/* Best time to call */}
      <div>
        <p className="form-label">Best Time to Call</p>
        <div className="flex flex-wrap gap-3 mt-1" role="group" aria-label="Best time to call">
          {CALL_TIMES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setCallTime(time)}
              className={clsx(
                'px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all',
                callTime === time
                  ? 'bg-brand-red text-white border-brand-red'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-red hover:text-brand-red'
              )}
              aria-pressed={callTime === time}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Services interested in */}
      <div>
        <p className="form-label">Services You Are Interested In</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {SERVICES.map((service) => (
            <label
              key={service}
              className={clsx(
                'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium',
                selectedServices.includes(service)
                  ? 'border-brand-red bg-red-50 text-brand-red'
                  : 'border-gray-200 hover:border-brand-brick text-gray-700'
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedServices.includes(service)}
                onChange={() => toggleService(service)}
                aria-label={service}
              />
              <div
                className={clsx(
                  'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                  selectedServices.includes(service)
                    ? 'bg-brand-red border-brand-red'
                    : 'border-gray-300'
                )}
                aria-hidden="true"
              >
                {selectedServices.includes(service) && (
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M3.5 8L1.5 6 0 7.5l3.5 3.5 8-8L10 1.5z" />
                  </svg>
                )}
              </div>
              {service}
            </label>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="form-label">
          Job Description <span className="text-brand-red" aria-label="required">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="form-input resize-none"
          placeholder="Tell us about your project — size, timeline, any specific requirements..."
        />
      </div>

      {/* Spam challenge */}
      <div>
        <p className="form-label">
          To prevent spam, please click the{' '}
          <strong className="text-brand-red">{CHALLENGE_NUMBER}</strong> button:
        </p>
        <div className="flex flex-wrap gap-2 mt-2" role="group" aria-label="Spam prevention">
          {CHALLENGE_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setChallenge(n)}
              className={clsx(
                'w-12 h-12 rounded-full font-bold text-lg border-2 transition-all',
                challenge === n
                  ? 'bg-brand-red text-white border-brand-red'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-red'
              )}
              aria-pressed={challenge === n}
              aria-label={`Number ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Error message */}
      {formState === 'error' && errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p>{errorMsg}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={formState === 'loading'}
        className="btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {formState === 'loading' ? (
          <>
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
            Sending…
          </>
        ) : (
          <>
            <Send size={18} aria-hidden="true" />
            Send My Request
          </>
        )}
      </button>

      <p className="text-xs text-gray-500">
        * Required fields. We typically respond within 1 business day.
      </p>
    </form>
  )
}
