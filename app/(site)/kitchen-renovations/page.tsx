import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";
import ServiceAreaAccordion from "@/components/ServiceAreaAccordion";
import { getStaticConfig } from "@/lib/getStaticConfig";
import { content } from "./content";

export const metadata: Metadata = {
  title: "Kitchen Renovations | Chester County PA | Augustine Home Improvements",
  description:
    "Full kitchen remodels in Chester County PA. Cabinets, countertops, layouts, and finishing touches — one contractor start to finish. Free estimates — call 484-467-7925.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/kitchen-renovations/",
  },
};

export default function KitchenRenovationsPage() {
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
