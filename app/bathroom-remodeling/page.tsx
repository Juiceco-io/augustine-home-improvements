import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";

export const metadata: Metadata = {
  title: "Bathroom Remodeling | Chester County PA | Augustine Home Improvements",
  description:
    "Bathroom remodeling in Chester County PA. Custom tile, walk-in showers, fixtures, and complete gut renovations. Free estimates — call 484-467-7925.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/bathroom-remodeling/",
  },
};

export default function BathroomRemodelingPage() {
  return (
    <ServicePage
      breadcrumb="Bathroom Remodeling"
      title="Bathroom Remodeling"
      subtitle="Transform your bathroom in Chester County PA — from cosmetic updates to full gut renovations."
      description="A well-designed bathroom makes every morning better. Augustine Home Improvements handles bathroom remodels of all scopes — from updating fixtures and tile to completely reconfiguring the layout of a master bath. We work with you to design a space that's both functional and beautiful, and we handle all the trades so you don't have to coordinate a dozen different contractors."
      highlights={[
        "Complete gut renovations and layout changes",
        "Custom tile showers and tub surrounds",
        "Walk-in shower design and installation",
        "Vanity, sink, and fixture installation",
        "Heated floor installation",
        "Bathtub-to-shower conversions",
        "Accessible bathroom modifications",
        "Plumbing and electrical rough-in coordination",
      ]}
    />
  );
}
