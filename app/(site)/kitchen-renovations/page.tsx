import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";

export const metadata: Metadata = {
  title: "Kitchen Renovations | Chester County PA | Augustine Home Improvements",
  description:
    "Full kitchen remodels in Chester County PA. Cabinets, countertops, layouts, and finishing touches — one contractor start to finish. Free estimates — call 484-467-7925.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/kitchen-renovations/",
  },
};

export default function KitchenRenovationsPage() {
  return (
    <ServicePage
      breadcrumb="Kitchen Renovations"
      title="Kitchen Renovations"
      subtitle="Full kitchen remodels in Chester County PA — from layout to the last cabinet pull."
      description="The kitchen is the heart of your home, and Augustine Home Improvements treats every kitchen project with the attention it deserves. From a simple cabinet refresh to a full gut renovation that reconfigures the entire layout, we manage every phase of the project — design, demo, rough work, and all finishing — so you have a single point of contact from start to finish."
      highlights={[
        "Full kitchen gut renovations and layout redesigns",
        "Custom and semi-custom cabinetry installation",
        "Countertop installation (quartz, granite, laminate)",
        "Tile backsplash and flooring",
        "Appliance installation and coordination",
        "Plumbing and electrical rough-in coordination",
        "Under-cabinet lighting",
        "Permit acquisition and code-compliant work",
      ]}
    />
  );
}
