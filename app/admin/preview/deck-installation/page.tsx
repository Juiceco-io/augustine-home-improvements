import ServicePage from "@/components/ServicePage";

export default function PreviewDeckInstallationPage() {
  return (
    <ServicePage
      basePath="/admin/preview"
      breadcrumb="Deck Installation"
      title="Deck Installation"
      subtitle="TrexPro Certified deck builder serving Chester County PA."
      description="Augustine Home Improvements is one of a select group of TrexPro Certified Installers in Chester County — meaning our deck installations meet Trex's highest standards and qualify for extended manufacturer warranties. Whether you're envisioning a simple pressure-treated deck or a multi-level composite outdoor living space, we design and build decks that complement your home and hold up for decades."
      highlights={[
        "Trex composite decking (TrexPro Certified Installer)",
        "Pressure-treated and hardwood options",
        "Custom railings, stairs, and built-in benches",
        "Multi-level and wraparound deck designs",
        "Pergolas and shade structures",
        "Deck replacement and board-by-board repair",
        "Permit acquisition and code-compliant construction",
        "Cleanup and haul-away of old deck materials",
      ]}
    />
  );
}
