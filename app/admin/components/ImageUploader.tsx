"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  onFile: (file: File) => void;
  accept?: string;
  uploading?: boolean;
}

export default function ImageUploader({
  onFile,
  accept = "image/*",
  uploading = false,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onFile(file);
    },
    [onFile]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be selected again
    e.target.value = "";
  }

  return (
    <div
      className={`upload-zone ${dragging ? "dragging" : ""} ${uploading ? "opacity-60 pointer-events-none" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      aria-label="Upload image"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Uploading…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xl">
            ↑
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Drop image here or{" "}
            <span className="text-green-600">browse</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {accept === "image/png,image/svg+xml,image/jpeg,image/webp"
              ? "PNG, SVG, JPG, WEBP"
              : "JPG, PNG, WEBP"}{" "}
            — max 10 MB
          </p>
        </div>
      )}
    </div>
  );
}
