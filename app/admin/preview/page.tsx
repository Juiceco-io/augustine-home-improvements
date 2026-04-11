"use client";

import ClientOnly from "@/components/ClientOnly";
import HomePageContent from "@/app/(site)/HomePageContent";

export default function PreviewHomePage() {
  return (
    <ClientOnly>
      <HomePageContent />
    </ClientOnly>
  );
}
