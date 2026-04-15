import type { Metadata } from "next";
import ClientOnly from "@/components/ClientOnly";
import AboutPageContent from "./AboutPageContent";

export const metadata: Metadata = {
  title: "About Us | Veteran-Owned Chester County Contractor",
  description:
    "Learn about Augustine Home Improvements — a veteran-owned home improvement contractor serving Chester County PA. Founded by Brandon Augustine in 2020.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/about-us/",
  },
};

export default function AboutPage() {
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
