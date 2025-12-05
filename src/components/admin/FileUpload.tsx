"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileIcon, Loader2, CheckCircle2, Image as ImageIcon } from "lucide-react";

interface FileUploadProps {
  onUploadComplete: (url: string, filename: string, localPreviewUrl?: string) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  folder?: string;
  label?: string;
  description?: string;
}

export function FileUpload({
  onUploadComplete,
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
  maxSize = 50 * 1024 * 1024, // 50MB default
  folder = "uploads",
  label = "Upload File",
  description = "Drag and drop or click to select",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if the accept includes images
  const isImageUpload = Object.keys(accept).some(key => key.includes("image"));

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setUploading(true);

      // Create local preview for images (this won't change after upload)
      if (file.type.startsWith("image/")) {
        const preview = URL.createObjectURL(file);
        setLocalPreview(preview);
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Upload failed");
        }

        const data = await response.json();
        const previewToUse = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        setUploadedFile({ name: file.name, url: data.url });
        setLocalPreview(previewToUse || null);
        // Pass local preview URL for parent to use
        onUploadComplete(data.url, file.name, previewToUse);
      } catch (err: any) {
        setError(err.message || "Failed to upload file");
        setLocalPreview(null);
      } finally {
        setUploading(false);
      }
    },
    [folder, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const handleRemove = () => {
    setUploadedFile(null);
    setLocalPreview(null);
    setError(null);
  };

  return (
    <div>
      {label && <label className="mb-2 block text-sm font-medium text-zinc-300">{label}</label>}

      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragActive
            ? "border-brand bg-brand/10"
            : "border-white/10 bg-white/5 hover:border-brand/50 hover:bg-white/10"
            }`}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              {localPreview ? (
                <div className="relative">
                  <img
                    src={localPreview}
                    alt="Uploading..."
                    className="h-20 w-20 rounded-lg object-cover opacity-50"
                  />
                  <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-brand" />
                </div>
              ) : (
                <Loader2 className="h-10 w-10 animate-spin text-brand" />
              )}
              <p className="text-sm text-zinc-400">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="h-10 w-10 text-zinc-500" />
              <div>
                <p className="text-sm font-medium text-white">{description}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Max size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Image Preview */}
          {isImageUpload && localPreview && (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-800">
              <img
                src={localPreview}
                alt={uploadedFile.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* File Info */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                {isImageUpload ? (
                  <ImageIcon className="h-5 w-5 text-emerald-400" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{uploadedFile.name}</p>
                <p className="text-xs text-zinc-500">Uploaded successfully</p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="rounded-lg border border-white/10 bg-white/5 p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}
    </div>
  );
}

