"use client";

import { useState } from "react";
import { uploadFile } from "../lib/api";
import type { SiteConfig, GalleryItem } from "../lib/types";
import ImageUploader from "./ImageUploader";

interface Props {
  config: SiteConfig;
  onSave: (config: SiteConfig) => Promise<void>;
  saving: boolean;
}

const CATEGORIES = [
  "decks",
  "kitchens",
  "bathrooms",
  "basements",
  "additions",
  "other",
];

export default function GalleryTab({ config, onSave, saving }: Props) {
  const [gallery, setGallery] = useState<GalleryItem[]>(
    [...config.gallery].sort((a, b) => a.order - b.order)
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function updateItem(id: string, patch: Partial<GalleryItem>) {
    setGallery((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function removeItem(id: string) {
    setGallery((prev) => prev.filter((item) => item.id !== id));
  }

  function moveItem(id: string, direction: "up" | "down") {
    setGallery((prev) => {
      const idx = prev.findIndex((item) => item.id === id);
      if (idx < 0) return prev;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      // Re-assign order values
      return next.map((item, i) => ({ ...item, order: i + 1 }));
    });
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const cdnUrl = await uploadFile(file, "gallery");
      const newItem: GalleryItem = {
        id: `g-${Date.now()}`,
        url: cdnUrl,
        caption: "",
        category: "decks",
        active: true,
        order: gallery.length + 1,
      };
      setGallery((prev) => [...prev, newItem]);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    await onSave({ ...config, gallery });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Gallery</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Upload project photos. Toggle active/inactive to show or hide on the
        site. Reorder using the arrows.
      </p>

      {/* Upload new photo */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Photo</p>
        <ImageUploader
          onFile={handleUpload}
          accept="image/jpeg,image/png,image/webp"
          uploading={uploading}
        />
        {uploadError && (
          <p className="text-xs text-red-600 mt-2">{uploadError}</p>
        )}
      </div>

      {/* Gallery items */}
      {gallery.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
          No photos yet. Upload one above to get started.
        </p>
      )}

      <div className="space-y-4">
        {gallery.map((item, idx) => (
          <div
            key={item.id}
            className={`border rounded-xl p-4 flex gap-4 ${
              item.active
                ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                : "border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-900/30"
            }`}
          >
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.caption || "Gallery photo"}
                className="w-24 h-16 object-cover rounded-lg"
              />
            </div>

            {/* Fields */}
            <div className="flex-1 min-w-0 space-y-2">
              <input
                type="text"
                value={item.caption}
                onChange={(e) =>
                  updateItem(item.id, { caption: e.target.value })
                }
                placeholder="Caption (e.g. Trex Composite Deck — Malvern, PA)"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex items-center gap-3">
                <select
                  value={item.category}
                  onChange={(e) =>
                    updateItem(item.id, { category: e.target.value })
                  }
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.active}
                    onChange={(e) =>
                      updateItem(item.id, { active: e.target.checked })
                    }
                    className="rounded"
                  />
                  Active
                </label>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <button
                onClick={() => moveItem(item.id, "up")}
                disabled={idx === 0}
                className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 text-xs"
                title="Move up"
              >
                ▲
              </button>
              <button
                onClick={() => moveItem(item.id, "down")}
                disabled={idx === gallery.length - 1}
                className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 text-xs"
                title="Move down"
              >
                ▼
              </button>
              <button
                onClick={() => removeItem(item.id)}
                className="p-1 rounded text-gray-400 hover:text-red-500 text-xs"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || uploading}
        className="mt-6 px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
        style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
      >
        {saving ? "Saving…" : "Save Gallery"}
      </button>
    </div>
  );
}
