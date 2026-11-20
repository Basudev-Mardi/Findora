"use client";

import { useRef, useState } from "react";
import { ImagePlus, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { formatFileSize } from "@/utils/reportValidation";

interface ImageUploadFieldProps {
  file: File | null;
  previewUrl: string | null;
  error?: string;
  disabled?: boolean;
  onSelect: (file: File | null) => void;
  onRemove: () => void;
}

export function ImageUploadField({
  file,
  previewUrl,
  error,
  disabled = false,
  onSelect,
  onRemove,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function openPicker() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected) {
      onSelect(selected);
    }
    // Reset native input so selecting the same filename again still triggers onChange.
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = e.dataTransfer.files?.[0] ?? null;
    if (dropped) {
      onSelect(dropped);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor="report-photo-input"
          className="block text-sm font-semibold text-[#142D3B]"
        >
          Item Photograph{" "}
          <span className="font-normal text-[#7B858B]">(Optional)</span>
        </label>
        <span className="text-xs text-[#7B858B]">JPG, PNG, or WEBP &middot; Max 5MB</span>
      </div>

      <input
        ref={inputRef}
        id="report-photo-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        onChange={handleFileChange}
        className="sr-only"
      />

      {previewUrl && file ? (
        <div className="mt-2.5 overflow-hidden rounded-2xl border border-[#E7EBE8] bg-[#F7F8F5]">
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#ECEFE9]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Selected item preview"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E7EBE8] bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#142D3B]">
                {file.name}
              </p>
              <p className="text-[11px] text-[#7B858B]">
                {formatFileSize(file.size)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={openPicker}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E7EBE8] bg-[#F7F8F5] px-3 py-1.5 text-xs font-semibold text-[#142D3B] transition-colors hover:border-[#142D3B]/30 hover:bg-white disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Replace
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={onRemove}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-2.5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-colors ${
            error
              ? "border-red-300 bg-red-50/40"
              : isDragging
                ? "border-[#1F6B50] bg-[#1F6B50]/[0.06]"
                : "border-[#D6DFD9] bg-[#F7F8F5] hover:border-[#1F6B50]/60 hover:bg-white"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E7EBE8] bg-white text-[#1F6B50]">
            <ImagePlus className="h-5 w-5" />
          </span>
          <p className="mt-3 text-sm font-semibold text-[#142D3B]">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-[#7B858B]">
            Avoid photos showing full student ID numbers, credit cards, or personal addresses.
          </p>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-600"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
