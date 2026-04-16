import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import ServiceAreaAccordion from "@/components/ServiceAreaAccordion";
import { getStaticConfig } from "@/lib/getStaticConfig";
import { content } from "./content";

export const metadata: Metadata = {
  title: "Bathroom Remodeling | Chester County PA | Augustine Home Improvements",
  description:
    "Bathroom remodeling in Chester County PA. Custom tile, walk-in showers, fixtures, and complete gut renovations. Free estimates — call 484-467-7925.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/bathroom-remodeling/",
  },
};

export default function BathroomRemodelingPage() {
  const { serviceAreas } = getStaticConfig();
  return (
    <>
      <ServicePage
        breadcrumb={content.breadcrumb}
        title={content.title}
        subtitle={content.subtitle}
        description={content.description}
        highlights={[...content.highlights]}
      />
      <ServiceAreaAccordion
        serviceAreas={serviceAreas}
        serviceSlug={content.serviceSlug}
        serviceTitle={content.title}
      />
    </>
  );
}
