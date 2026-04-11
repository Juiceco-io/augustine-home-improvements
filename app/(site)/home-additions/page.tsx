import type { Metadata } from "next";
import ServicePage from "@/components/ServicePage";

export const metadata: Metadata = {
  title: "Home Additions | Chester County PA | Augustine Home Improvements",
  description:
    "Home additions in Chester County PA. Seamless additions that match your home's architecture. Free estimates — call 484-467-7925.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/home-additions/",
  },
};

export default function HomeAdditionsPage() {
  return (
    <ServicePage
      breadcrumb="Home Additions"
      title="Home Additions"
      subtitle="Expand your living space with a seamless addition that looks like it was always there."
      description="When you love your neighborhood but need more space, a home addition is often the smartest investment you can make. Augustine Home Improvements builds additions that integrate seamlessly with your existing home's architecture, materials, and style. We handle everything from foundation work to final trim — and we make sure the addition is code-compliant and properly permitted every step of the way."
      highlights={[
        "Room additions and bump-outs",
        "Sunrooms and four-season additions",
        "Garage conversions",
        "Second-story additions",
        "Master suite additions",
        "In-law suite additions",
        "Foundation, framing, and structural work",
        "Full interior finishing to match existing home",
      ]}
    />
  );
}
