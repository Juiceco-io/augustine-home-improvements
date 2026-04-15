import type { ServiceAreaCounty } from "@/lib/siteConfig";

interface Props {
  serviceAreas: ServiceAreaCounty[];
  serviceSlug: string;
  serviceTitle: string;
}

export default function ServiceAreaAccordion({
  serviceAreas,
  serviceSlug,
  serviceTitle,
}: Props) {
  if (!serviceAreas.length) return null;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {serviceTitle} Service Area
      </h2>
      <div className="space-y-3">
        {serviceAreas.map((county) => (
          <details
            key={`${county.name}-${county.state}`}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer bg-orange-50 hover:bg-orange-100 transition-colors list-none select-none">
              <span className="font-semibold text-gray-900">
                {county.name} {county.state}
              </span>
              <span className="text-orange-700 text-xl font-bold">+</span>
            </summary>
            {county.towns.length > 0 && (
              <ul className="px-5 py-4 space-y-2">
                {county.towns.map((town) => (
                  <li key={town.slug}>
                    <a
                      href={`/${serviceSlug}/${town.slug}/`}
                      className="text-blue-700 hover:underline text-sm"
                    >
                      {serviceTitle} {town.name} {county.state}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </details>
        ))}
      </div>
    </section>
  );
}
