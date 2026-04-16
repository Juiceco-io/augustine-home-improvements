import type { Metadata } from "next";
import { getStaticConfig } from "@/lib/getStaticConfig";
import ServicePage from "@/components/ServicePage";
import { content } from "../content";

export const dynamicParams = false;

export function generateStaticParams() {
  const { serviceAreas } = getStaticConfig();
  return serviceAreas.flatMap((county) =>
    county.towns.map((town) => ({ town: town.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ town: string }>;
}): Promise<Metadata> {
  const { town: townSlug } = await params;
  const { serviceAreas } = getStaticConfig();
  const townData = serviceAreas
    .flatMap((c) => c.towns.map((t) => ({ ...t, state: c.state })))
    .find((t) => t.slug === townSlug);
  const townLabel = townData ? `${townData.name}, ${townData.state}` : townSlug;

  return {
    title: `${content.title} in ${townLabel} | Augustine Home Improvements`,
    description: `${content.title} in ${townLabel}. ${content.subtitle} Free estimates — call 484-467-7925.`,
    alternates: {
      canonical: `https://www.augustinehomeimprovements.com/${content.serviceSlug}/${townSlug}/`,
    },
  };
}

export default async function HomeRenovationsTownPage({
  params,
}: {
  params: Promise<{ town: string }>;
}) {
  const { town: townSlug } = await params;
  const { serviceAreas } = getStaticConfig();
  const townData = serviceAreas
    .flatMap((c) => c.towns.map((t) => ({ ...t, state: c.state })))
    .find((t) => t.slug === townSlug);
  const townLabel = townData ? `${townData.name}, ${townData.state}` : townSlug;

  return (
    <ServicePage
      breadcrumb={`${content.breadcrumb} in ${townLabel}`}
      title={`${content.title} in ${townLabel}`}
      subtitle={`${content.subtitle}`}
      description={content.description}
      highlights={[...content.highlights]}
    />
  );
}
