"use client";

import { useState } from "react";
import type { SiteConfig } from "../lib/types";
import type { ServiceAreaCounty } from "@/lib/siteConfig";

interface Props {
  config: SiteConfig;
  onSave: (config: SiteConfig) => Promise<void>;
  saving: boolean;
}

function toSlug(name: string, state: string): string {
  const namePart = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const statePart = state.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${namePart}-${statePart}`;
}

export default function ServiceAreasTab({ config, onSave, saving }: Props) {
  const [counties, setCounties] = useState<ServiceAreaCounty[]>(config.serviceAreas ?? []);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggleExpanded(ci: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(ci)) {
        next.delete(ci);
      } else {
        next.add(ci);
      }
      return next;
    });
  }

  function addCounty() {
    setCounties((prev) => {
      const next = [...prev, { name: "", state: "PA", towns: [] }];
      setExpanded((e) => new Set([...e, next.length - 1]));
      return next;
    });
  }

  function removeCounty(ci: number) {
    setCounties((prev) => prev.filter((_, i) => i !== ci));
  }

  function updateCounty(ci: number, field: "name" | "state", value: string) {
    setCounties((prev) =>
      prev.map((county, i) => {
        if (i !== ci) return county;
        // Re-generate all town slugs when state changes
        if (field === "state") {
          return {
            ...county,
            state: value,
            towns: county.towns.map((town) => ({
              ...town,
              slug: toSlug(town.name, value),
            })),
          };
        }
        return { ...county, [field]: value };
      })
    );
  }

  function addTown(ci: number) {
    setCounties((prev) =>
      prev.map((county, i) =>
        i === ci
          ? { ...county, towns: [...county.towns, { name: "", slug: "" }] }
          : county
      )
    );
  }

  function removeTown(ci: number, ti: number) {
    setCounties((prev) =>
      prev.map((county, i) =>
        i === ci
          ? { ...county, towns: county.towns.filter((_, j) => j !== ti) }
          : county
      )
    );
  }

  function updateTown(ci: number, ti: number, name: string) {
    setCounties((prev) =>
      prev.map((county, i) =>
        i === ci
          ? {
              ...county,
              towns: county.towns.map((town, j) =>
                j === ti ? { name, slug: toSlug(name, county.state) } : town
              ),
            }
          : county
      )
    );
  }

  async function handleSave() {
    await onSave({ ...config, serviceAreas: counties });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Service Areas</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Add counties and towns to generate local SEO pages for each service (e.g.{" "}
        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">
          /deck-installation/atglen-pa/
        </code>
        ).
      </p>
      <p className="text-sm text-amber-600 dark:text-amber-400 mb-8">
        After publishing, a site rebuild by the developer is required for new town pages to go live.
      </p>

      <div className="space-y-3 mb-8">
        {counties.map((county, ci) => {
          const isOpen = expanded.has(ci);
          return (
            <div
              key={ci}
              className="border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden"
            >
              {/* Collapsible header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700/50">
                <button
                  onClick={() => toggleExpanded(ci)}
                  className="flex items-center gap-2 flex-1 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-gray-400 dark:text-gray-500 text-xs w-4 text-center select-none">
                    {isOpen ? "▾" : "▸"}
                  </span>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {county.name || "Unnamed County"}{county.state ? ` ${county.state}` : ""}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {county.towns.length} {county.towns.length === 1 ? "town" : "towns"}
                  </span>
                </button>
                <button
                  onClick={() => removeCounty(ci)}
                  className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shrink-0"
                  title="Remove county"
                >
                  Remove
                </button>
              </div>

              {/* Expandable body */}
              {isOpen && (
                <div className="px-5 py-4">
                  {/* County name + state inputs */}
                  <div className="flex items-end gap-3 mb-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        County Name
                      </label>
                      <input
                        type="text"
                        value={county.name}
                        onChange={(e) => updateCounty(ci, "name", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Chester County"
                      />
                    </div>
                    <div className="w-20">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value={county.state}
                        onChange={(e) => updateCounty(ci, "state", e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 uppercase"
                        placeholder="PA"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  {/* Town list */}
                  <div className="space-y-2 mb-3">
                    {county.towns.length === 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                        No towns yet — add one below.
                      </p>
                    )}
                    {county.towns.map((town, ti) => (
                      <div key={ti} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={town.name}
                          onChange={(e) => updateTown(ci, ti, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Atglen"
                        />
                        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono w-44 truncate shrink-0">
                          /{toSlug(town.name || "town", county.state || "pa")}/
                        </span>
                        <button
                          onClick={() => removeTown(ci, ti)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm shrink-0"
                          title="Remove town"
                          aria-label="Remove town"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addTown(ci)}
                    className="text-sm text-green-700 dark:text-green-400 hover:underline"
                  >
                    + Add Town
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {counties.length === 0 && (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic">
            No counties added yet. Click &ldquo;Add County&rdquo; to get started.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={addCounty}
          className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          + Add County
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
          style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
