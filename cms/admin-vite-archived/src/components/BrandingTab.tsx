import { useState } from "react";
import { uploadFile } from "../lib/api";
import type { SiteConfig } from "../lib/types";
import ImageUploader from "./ImageUploader";

interface Props {
  config: SiteConfig;
  onSave: (config: SiteConfig) => Promise<void>;
  saving: boolean;
}

export default function BrandingTab({ config, onSave, saving }: Props) {
  const [logoUrl, setLogoUrl] = useState(config.brand.logoUrl);
  const [logoAlt, setLogoAlt] = useState(config.brand.logoAlt);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleLogoUpload(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const cdnUrl = await uploadFile(file, "logo");
      setLogoUrl(cdnUrl);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    await onSave({
      ...config,
      brand: { logoUrl, logoAlt },
    });
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Branding</h2>
      <p className="text-sm text-gray-500 mb-8">
        Update the company logo shown in the navbar.
      </p>

      {/* Current logo preview */}
      {logoUrl && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Current Logo</p>
          <div className="inline-block bg-gray-100 rounded-lg p-4">
            <img
              src={logoUrl}
              alt={logoAlt}
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 break-all">{logoUrl}</p>
        </div>
      )}

      {/* Upload new logo */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2">Upload New Logo</p>
        <ImageUploader
          onFile={handleLogoUpload}
          accept="image/png,image/svg+xml,image/jpeg,image/webp"
          uploading={uploading}
        />
        {uploadError && (
          <p className="text-xs text-red-600 mt-2">{uploadError}</p>
        )}
      </div>

      {/* Alt text */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Logo Alt Text
        </label>
        <input
          type="text"
          value={logoAlt}
          onChange={(e) => setLogoAlt(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="Augustine Home Improvements"
        />
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
