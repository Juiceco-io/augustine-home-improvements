import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import ServiceAreaAccordion from "@/components/ServiceAreaAccordion";
import { getStaticConfig } from "@/lib/getStaticConfig";
import { content } from "./content";

export const metadata: Metadata = {
  title: "Home Renovations | Chester County PA | Augustine Home Improvements",
  description:
    "Whole-home renovations and multi-room remodels in Chester County PA. One contractor, start to finish. Free estimates — call 484-467-7925.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/home-renovations/",
  },
};

export default function HomeRenovationsPage() {
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
