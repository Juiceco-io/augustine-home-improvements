import type { Metadata } from "next";
import HomePageContent from "./HomePageContent";

export const metadata: Metadata = {
  title: "Augustine Home Improvements — Chester County PA Contractor",
  description:
    "Veteran-owned home improvement contractor serving Chester County PA. Specializing in decks, kitchens, bathrooms, basements, and full home renovations. Free estimates — call 484-467-7925.",
  alternates: {
    canonical: "https://www.augustinehomeimprovements.com/",
  },
};

export default function HomePage() {
  return <HomePageContent />;
}
