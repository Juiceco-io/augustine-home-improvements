import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";

export const metadata: Metadata = {
  title: "Basement Renovation | Chester County PA | Augustine Home Improvements",
  description:
    "Basement finishing and renovation in Chester County PA. Home offices, rec rooms, gyms, and in-law suites. Free estimates — call 484-467-7925.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/basement-renovation/",
  },
};

export default function BasementRenovationPage() {
  return (
    <ServicePage
      breadcrumb="Basement Renovation"
      title="Basement Renovation"
      subtitle="Turn your unfinished basement into livable, usable space."
      description="Your unfinished basement represents hundreds of square feet of untapped potential. Augustine Home Improvements specializes in transforming raw basements into polished living spaces — home offices, media rooms, gyms, guest suites, playrooms, and more. We manage framing, insulation, drywall, flooring, and all finishing work so you get a finished basement that feels like a natural extension of your home."
      highlights={[
        "Full basement finishing from framing to paint",
        "Home office and remote work spaces",
        "Media rooms and home theaters",
        "Home gyms and fitness spaces",
        "In-law suites and guest rooms",
        "Egress window installation",
        "Waterproofing coordination",
        "Bar and entertainment area builds",
      ]}
    />
  );
}
