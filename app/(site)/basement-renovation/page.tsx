import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import ServiceAreaAccordion from "@/components/ServiceAreaAccordion";
import { getStaticConfig } from "@/lib/getStaticConfig";
import { content } from "./content";

export const metadata: Metadata = {
  title: "Basement Renovation | Chester County PA | Augustine Home Improvements",
  description:
    "Basement finishing and renovation in Chester County PA. Home offices, rec rooms, gyms, and in-law suites. Free estimates — call 484-467-7925.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/basement-renovation/",
  },
};

export default function BasementRenovationPage() {
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
