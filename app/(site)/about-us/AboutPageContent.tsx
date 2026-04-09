"use client";

import { Shield, Award, Star, CheckCircle } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import AboutCta from "./AboutCta";
import { useSiteConfig } from "@/lib/useSiteConfig";

const icons = [Shield, CheckCircle, Award, Star];

export default function AboutPageContent() {
  const config = useSiteConfig();

  return (
    <>
      <ScrollReveal variant="fade-up">
        <div className="max-w-3xl mb-10 md:mb-16">
          <h1 className="section-heading mb-4">{config.company.aboutHeading}</h1>
          <p className="section-subheading">{config.company.aboutSubheading}</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-14 md:mb-20">
        <ScrollReveal variant="fade-left">
          <div className="space-y-6 text-gray-700 leading-relaxed">
            {config.company.aboutBody.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </ScrollReveal>

        <div>
          <ScrollReveal variant="fade-right">
            <h2 className="text-xl font-bold text-brand-charcoal mb-6">{config.company.valuesHeading}</h2>
          </ScrollReveal>
          <div className="space-y-5">
            {config.company.values.map((item, i) => {
              const Icon = icons[i] ?? CheckCircle;
              return (
                <ScrollReveal key={`${item.title}-${i}`} variant="fade-right" delay={i * 80}>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center service-icon">
                      <Icon size={18} className="text-brand-red" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-charcoal mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>

      <ScrollReveal variant="fade-up">
        <AboutCta />
      </ScrollReveal>
    </>
  );
}
