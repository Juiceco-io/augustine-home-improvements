"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSiteConfig } from "@/lib/useSiteConfig";
import { trackEvent } from "@/lib/analytics";

type Status =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success" }
  | { type: "error"; message: string };

const SERVICES = [
  "Home Additions",
  "Kitchen Renovations",
  "Bathroom Remodeling",
  "Outdoor Living Space / Deck",
  "Siding or Roofing",
  "Basement Renovation",
  "Whole-Home Renovation",
  "Other",
];

const CALL_TIMES = ["Morning (8am–12pm)", "Afternoon (12pm–5pm)", "Evening (5pm–7pm)"];

const initialForm = {
  name: "",
  email: "",
  phone: "",
  location: "",
  callTime: "",
  services: [] as string[],
  description: "",
  // honeypot
  website: "",
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const siteConfig = useSiteConfig();
  const cmsPhone = siteConfig.contact.phone || "484-467-7925";

  const apiUrl = useMemo(
    () => process.env.NEXT_PUBLIC_CONTACT_API_URL?.trim() ?? "",
    []
  );

  const toggleService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Honeypot check
    if (form.website) return;

    setStatus({ type: "submitting" });

    if (!apiUrl) {
      // Fake success when API isn't wired yet
      await new Promise((r) => setTimeout(r, 800));
      setStatus({ type: "success" });
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
          callTime: form.callTime,
          services: form.services,
          description: form.description,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Unable to send your message right now.");
      }

      trackEvent("FORM_SUBMIT", { services: form.services.join(",") });
      setStatus({ type: "success" });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : `Unable to send your message. Please call us at ${cmsPhone}.`,
      });
    }
  };

  if (status.type === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Message Received!
        </h3>
        <p className="text-gray-600">
          Thanks for reaching out. A member of our team will contact you within
          the next business day. If you need immediate assistance, please call{" "}
          <a
            href={`tel:+1${cmsPhone.replace(/\D/g, "")}`}
            className="text-brand-red font-semibold hover:underline"
          >
            {cmsPhone}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={onSubmit}
      noValidate
      aria-label="Contact form"
    >
      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        name="website"
        value={form.website}
        onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Name */}
      <div>
        <label htmlFor="name" className="form-label">
          Full Name <span className="text-brand-red" aria-label="required">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          autoComplete="name"
          className="form-input"
          placeholder="John Smith"
          name="name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="form-label">
          Email Address <span className="text-brand-red" aria-label="required">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          className="form-input"
          placeholder="john@example.com"
          name="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="phone" className="form-label">
          Phone Number <span className="text-brand-red" aria-label="required">*</span>
        </label>
        <input
          id="phone"
          type="tel"
          required
          autoComplete="tel"
          className="form-input"
          placeholder="(555) 555-5555"
          name="phone"
          value={form.phone}
          onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
        />
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="form-label">
          Location / City <span className="text-brand-red" aria-label="required">*</span>
        </label>
        <input
          id="location"
          type="text"
          required
          className="form-input"
          placeholder="Phoenixville, PA"
          name="location"
          value={form.location}
          onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
        />
      </div>

      {/* Best time to call */}
      <div>
        <p className="form-label">Best Time to Call</p>
        <div className="flex flex-wrap gap-3 mt-1" role="group" aria-label="Best time to call">
          {CALL_TIMES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  callTime: p.callTime === time ? "" : time,
                }))
              }
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                form.callTime === time
                  ? "bg-brand-red text-white border-brand-red"
                  : "bg-white text-gray-700 border-gray-300 hover:border-brand-red hover:text-brand-red"
              }`}
              aria-pressed={form.callTime === time}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Services */}
      <div>
        <p className="form-label">Services You Are Interested In</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {SERVICES.map((service) => {
            const checked = form.services.includes(service);
            return (
              <label
                key={service}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ${
                  checked
                    ? "border-brand-red bg-brand-cream text-brand-red"
                    : "border-gray-200 hover:border-brand-brick text-gray-700"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  aria-label={service}
                  checked={checked}
                  onChange={() => toggleService(service)}
                />
                <span
                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${
                    checked ? "bg-brand-red border-brand-red" : "border-gray-300"
                  }`}
                  aria-hidden="true"
                >
                  {checked && (
                    <svg
                      className="w-2.5 h-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                {service}
              </label>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="form-label">
          Project Description <span className="text-brand-red" aria-label="required">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="form-input resize-none"
          placeholder="Tell us about your project — size, timeline, any specific requirements..."
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
        />
      </div>

      {status.type === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {status.message}
        </div>
      )}

      <p className="text-xs text-gray-500">
        * Indicates required fields. We typically respond within the next business day.
      </p>

      <button
        type="submit"
        disabled={status.type === "submitting"}
        className="btn-primary w-full justify-center text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status.type === "submitting" ? "Sending..." : "Submit Request"}
      </button>
    </form>
  );
}
