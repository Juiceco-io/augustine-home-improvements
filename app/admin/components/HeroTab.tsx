"use client";

import { useState } from "react";
import { uploadFile } from "../lib/api";
import type { SiteConfig } from "../lib/types";
import ImageUploader from "./ImageUploader";

interface Props {
  config: SiteConfig;
  onSave: (config: SiteConfig) => Promise<void>;
  saving: boolean;
}

export default function HeroTab({ config, onSave, saving }: Props) {
  const [imageUrl, setImageUrl] = useState(config.hero.imageUrl);
  const [headline, setHeadline] = useState(config.hero.headline);
  const [subheadline, setSubheadline] = useState(config.hero.subheadline);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleHeroUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const cdnUrl = await uploadFile(file, "hero");
      setImageUrl(cdnUrl);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    await onSave({
      ...config,
      hero: { imageUrl, headline, subheadline },
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Hero Section</h2>
      <p className="text-sm text-gray-500 mb-8">
        Update the headline, subheadline, and background image on the home page.
      </p>

      {/* Headline */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Headline
        </label>
        <input
          type="text"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Expert Home Improvements"
        />
      </div>

      {/* Subheadline */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Subheadline
        </label>
        <textarea
          value={subheadline}
          onChange={(e) => setSubheadline(e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          placeholder="Serving Chester County PA…"
        />
      </div>

      {/* Hero image */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Hero Background Image{" "}
          <span className="text-gray-400 font-normal">
            (optional — leave blank for gradient)
          </span>
        </p>
        {imageUrl && (
          <div className="mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Hero preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            <p className="text-xs text-gray-400 mt-1 break-all">{imageUrl}</p>
            <button
              onClick={() => setImageUrl("")}
              className="text-xs text-red-500 hover:underline mt-1"
            >
              Remove image (use gradient)
            </button>
          </div>
        )}
        <ImageUploader
          onFile={handleHeroUpload}
          accept="image/jpeg,image/png,image/webp"
          uploading={uploading}
        />
        {uploadError && (
          <p className="text-xs text-red-600 mt-2">{uploadError}</p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || uploading}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
        style={{ background: "linear-gradient(135deg, #26463f, #4b776b)" }}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}
