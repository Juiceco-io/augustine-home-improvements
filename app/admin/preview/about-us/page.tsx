"use client";

import ClientOnly from "@/components/ClientOnly";
import AboutPageContent from "@/app/(site)/about-us/AboutPageContent";

export default function PreviewAboutPage() {
  return (
    <div className="bg-white pt-20 md:pt-24 pb-16 md:pb-20">
      <div className="container-xl">
        <ClientOnly>
          <AboutPageContent />
        </ClientOnly>
      </div>
    </div>
  );
}
