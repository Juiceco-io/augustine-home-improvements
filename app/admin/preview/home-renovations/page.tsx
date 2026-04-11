import ServicePage from "@/components/ServicePage";

export default function PreviewHomeRenovationsPage() {
  return (
    <ServicePage
      basePath="/admin/preview"
      breadcrumb="Home Renovations"
      title="Home Renovations"
      subtitle="Whole-home transformations and multi-room remodels — one point of contact, start to finish."
      description="Sometimes a single-room project turns into something bigger — or you know from the start that you want to transform your entire home. Augustine Home Improvements manages large-scale renovation projects with the same discipline and attention to detail as smaller jobs. We coordinate all trades, keep to schedule, and give you one contractor to call throughout the entire process."
      highlights={[
        "Whole-home renovation planning and management",
        "Multi-room remodels and phased projects",
        "Historic home renovations and updates",
        "Interior reconfiguration and layout changes",
        "New flooring throughout",
        "Interior painting and trim work",
        "Door and window replacement",
        "Coordination with plumbing, electrical, and HVAC trades",
      ]}
    />
  );
}
