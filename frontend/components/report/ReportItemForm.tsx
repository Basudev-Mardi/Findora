"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Lock,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useReportForm } from "@/hooks/useReportForm";
import type { ReportType } from "@/types/report";
import {
  CAMPUS_ZONES,
  getTodayIsoDate,
  REPORT_CATEGORIES,
} from "@/utils/reportValidation";
import { ImageUploadField } from "./ImageUploadField";

interface ReportItemFormProps {
  type: ReportType;
}

export function ReportItemForm({ type }: ReportItemFormProps) {
  const router = useRouter();
  const isFound = type === "found";
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (dateInputRef.current) {
      dateInputRef.current.max = getTodayIsoDate();
    }
  }, []);

  const {
    values,
    errors,
    previewUrl,
    isSubmitting,
    submissionResult,
    setFieldValue,
    handleBlur,
    handlePhotoSelect,
    handleRemovePhoto,
    handleSubmit,
    resetForm,
  } = useReportForm(type);

  const isSuccess = submissionResult?.ok === true;

  // Refresh Next.js router cache so listings & dashboard reflect the new item without full reload.
  useEffect(() => {
    if (isSuccess) {
      router.refresh();
    }
  }, [isSuccess, router]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#E7EBE8] pb-8 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F6B50]">
            {isFound ? "Found Belonging Report" : "Lost Belonging Report"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#142D3B] sm:text-4xl">
            {isFound ? "Report Found Item" : "Report Lost Item"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#7B858B] sm:text-base">
            {isFound
              ? "Log an item you discovered on campus so its rightful owner can verify and reclaim it safely."
              : "Share clear details about your misplaced item so fellow students and campus staff can help return it."}
          </p>
        </div>

        <div
          className="inline-flex self-start rounded-xl border border-[#E7EBE8] bg-white p-1 sm:self-auto"
          role="tablist"
          aria-label="Report type"
        >
          <Link
            href="/report/lost"
            role="tab"
            aria-selected={!isFound}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              !isFound
                ? "bg-[#142D3B] text-white"
                : "text-[#7B858B] hover:text-[#142D3B]"
            }`}
          >
            Lost Item
          </Link>
          <Link
            href="/report/found"
            role="tab"
            aria-selected={isFound}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              isFound
                ? "bg-[#1F6B50] text-white"
                : "text-[#7B858B] hover:text-[#142D3B]"
            }`}
          >
            Found Item
          </Link>
        </div>
      </div>

      {/* Privacy & Safety Reminder */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#1F6B50]/20 bg-[#1F6B50]/[0.05] px-4 py-3.5 text-xs leading-relaxed text-[#142D3B] sm:text-sm">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1F6B50]" />
        <p>
          <span className="font-semibold">Privacy first:</span> Public
          descriptions are visible across campus. Never enter complete student
          ID numbers, bank card details, or personal phone numbers in public
          fields—keep ownership-verification details in the private section
          below.
        </p>
      </div>

      {/* Success State */}
      {isSuccess && submissionResult ? (
        <div
          role="status"
          className="mt-8 rounded-3xl border border-[#1F6B50]/30 bg-white p-8 shadow-[0_8px_28px_rgba(20,45,59,0.06)]"
        >
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1F6B50]/10 text-[#1F6B50]">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#1F6B50]">
                Report Recorded
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#142D3B]">
                {values.itemName}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#7B858B]">
                {submissionResult.message}
              </p>

              <div className="mt-5 inline-flex flex-wrap items-center gap-3 rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-4 py-2.5 text-xs">
                <span className="text-[#7B858B]">Reference ID:</span>
                <strong className="font-mono font-bold text-[#142D3B]">
                  {submissionResult.referenceId}
                </strong>
                <span className="rounded-full bg-[#1F6B50]/10 px-2 py-0.5 font-semibold text-[#1F6B50]">
                  {submissionResult.mode === "demo" ? "Local Demo Mode" : "Synced"}
                </span>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={`/items/${submissionResult.referenceId}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#1F6B50] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#142D3B]"
                >
                  View Listing
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={isFound ? "/found" : "/lost"}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#142D3B] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50]"
                >
                  Browse {isFound ? "Found" : "Lost"} Items
                </Link>
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#E7EBE8] bg-white px-5 py-2.5 text-sm font-semibold text-[#142D3B] transition-colors hover:bg-[#F7F8F5]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Submit Another Report
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-8">
          {/* Submission Error Banner */}
          {submissionResult && !submissionResult.ok && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <p className="font-medium">{submissionResult.message}</p>
            </div>
          )}

          {/* Section 1: Public Listing Information */}
          <section className="rounded-3xl border border-[#E7EBE8] bg-white p-6 shadow-[0_1px_3px_rgba(20,45,59,0.03)] sm:p-8">
            <div className="border-b border-[#E7EBE8] pb-4">
              <h2 className="text-base font-bold text-[#142D3B]">
                1. Public Listing Details
              </h2>
              <p className="mt-1 text-xs text-[#7B858B]">
                Visible to campus members browsing the{" "}
                {isFound ? "Found Items" : "Lost Items"} feed.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {/* Item Name & Category */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="item-name"
                    className="block text-sm font-semibold text-[#142D3B]"
                  >
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="item-name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={values.itemName}
                    onChange={(e) => setFieldValue("itemName", e.target.value)}
                    onBlur={() => handleBlur("itemName")}
                    placeholder={
                      isFound
                        ? "e.g., Tortoiseshell Reading Glasses"
                        : "e.g., Apple AirPods Case"
                    }
                    aria-invalid={Boolean(errors.itemName)}
                    className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-sm text-[#202B32] placeholder:text-[#7B858B] transition-colors focus:outline-none ${
                      errors.itemName
                        ? "border-red-400 bg-red-50/30 focus:border-red-500"
                        : "border-[#E7EBE8] bg-[#F7F8F5] focus:border-[#1F6B50] focus:bg-white"
                    }`}
                  />
                  {errors.itemName && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.itemName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="item-category"
                    className="block text-sm font-semibold text-[#142D3B]"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="item-category"
                    required
                    disabled={isSubmitting}
                    value={values.category}
                    onChange={(e) => setFieldValue("category", e.target.value)}
                    onBlur={() => handleBlur("category")}
                    aria-invalid={Boolean(errors.category)}
                    className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-sm text-[#202B32] transition-colors focus:outline-none ${
                      errors.category
                        ? "border-red-400 bg-red-50/30 focus:border-red-500"
                        : "border-[#E7EBE8] bg-[#F7F8F5] focus:border-[#1F6B50] focus:bg-white"
                    }`}
                  >
                    <option value="">Select a category</option>
                    {REPORT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>

              {/* Campus Zone, Specific Location, Date */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="campus-zone"
                    className="block text-sm font-semibold text-[#142D3B]"
                  >
                    Campus Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="campus-zone"
                    required
                    disabled={isSubmitting}
                    value={values.campusZone}
                    onChange={(e) => setFieldValue("campusZone", e.target.value)}
                    onBlur={() => handleBlur("campusZone")}
                    aria-invalid={Boolean(errors.campusZone)}
                    className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-sm text-[#202B32] transition-colors focus:outline-none ${
                      errors.campusZone
                        ? "border-red-400 bg-red-50/30 focus:border-red-500"
                        : "border-[#E7EBE8] bg-[#F7F8F5] focus:border-[#1F6B50] focus:bg-white"
                    }`}
                  >
                    <option value="">Select building/zone</option>
                    {CAMPUS_ZONES.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                  {errors.campusZone && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.campusZone}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="location-detail"
                    className="block text-sm font-semibold text-[#142D3B]"
                  >
                    {isFound ? "Found Location" : "Last Seen Location"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="location-detail"
                    type="text"
                    required
                    disabled={isSubmitting}
                    value={values.locationDetail}
                    onChange={(e) =>
                      setFieldValue("locationDetail", e.target.value)
                    }
                    onBlur={() => handleBlur("locationDetail")}
                    placeholder={
                      isFound
                        ? "e.g., 2nd floor quiet study desk"
                        : "e.g., Room 104, middle row"
                    }
                    aria-invalid={Boolean(errors.locationDetail)}
                    className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-sm text-[#202B32] placeholder:text-[#7B858B] transition-colors focus:outline-none ${
                      errors.locationDetail
                        ? "border-red-400 bg-red-50/30 focus:border-red-500"
                        : "border-[#E7EBE8] bg-[#F7F8F5] focus:border-[#1F6B50] focus:bg-white"
                    }`}
                  />
                  {errors.locationDetail && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.locationDetail}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="incident-date"
                    className="block text-sm font-semibold text-[#142D3B]"
                  >
                    {isFound ? "Date Found" : "Date Lost"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    ref={dateInputRef}
                    id="incident-date"
                    type="date"
                    required
                    disabled={isSubmitting}
                    value={values.incidentDate}
                    onChange={(e) =>
                      setFieldValue("incidentDate", e.target.value)
                    }
                    onBlur={() => handleBlur("incidentDate")}
                    aria-invalid={Boolean(errors.incidentDate)}
                    className={`mt-1.5 h-11 w-full rounded-xl border px-3.5 text-sm text-[#202B32] transition-colors focus:outline-none ${
                      errors.incidentDate
                        ? "border-red-400 bg-red-50/30 focus:border-red-500"
                        : "border-[#E7EBE8] bg-[#F7F8F5] focus:border-[#1F6B50] focus:bg-white"
                    }`}
                  />
                  {errors.incidentDate && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.incidentDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Public Description */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="public-description"
                    className="block text-sm font-semibold text-[#142D3B]"
                  >
                    Public Description <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-[#7B858B]">
                    {values.publicDescription.length}/600
                  </span>
                </div>
                <textarea
                  id="public-description"
                  rows={4}
                  required
                  disabled={isSubmitting}
                  value={values.publicDescription}
                  onChange={(e) =>
                    setFieldValue("publicDescription", e.target.value)
                  }
                  onBlur={() => handleBlur("publicDescription")}
                  placeholder={
                    isFound
                      ? "Describe general appearance (color, material, size) without revealing private contents or serial/ID numbers..."
                      : "Describe color, brand, size, and any helpful context about where you last had it..."
                  }
                  aria-invalid={Boolean(errors.publicDescription)}
                  className={`mt-1.5 w-full rounded-xl border p-3.5 text-sm text-[#202B32] placeholder:text-[#7B858B] transition-colors focus:outline-none ${
                    errors.publicDescription
                      ? "border-red-400 bg-red-50/30 focus:border-red-500"
                      : "border-[#E7EBE8] bg-[#F7F8F5] focus:border-[#1F6B50] focus:bg-white"
                  }`}
                />
                {errors.publicDescription && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.publicDescription}
                  </p>
                )}
              </div>

              {/* Photograph Upload */}
              <ImageUploadField
                file={values.photo}
                previewUrl={previewUrl}
                error={errors.photo}
                disabled={isSubmitting}
                onSelect={handlePhotoSelect}
                onRemove={handleRemovePhoto}
              />
            </div>
          </section>

          {/* Section 2: Private Verification / Additional Notes */}
          <section className="rounded-3xl border border-[#E7EBE8] bg-white p-6 shadow-[0_1px_3px_rgba(20,45,59,0.03)] sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E7EBE8] pb-4">
              <div>
                <h2 className="text-base font-bold text-[#142D3B]">
                  {isFound
                    ? "2. Private Verification & Handoff Notes"
                    : "2. Private Identifying Details"}
                </h2>
                <p className="mt-1 text-xs text-[#7B858B]">
                  {isFound
                    ? "Kept separate from public listings to verify the rightful owner safely."
                    : "Optional details kept private to help confirm ownership when a match is found."}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#142D3B]/8 px-3 py-1 text-[11px] font-semibold text-[#142D3B]">
                <Lock className="h-3 w-3 text-[#1F6B50]" />
                Private &middot; Not Published
              </span>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="private-details"
                    className="block text-sm font-semibold text-[#142D3B]"
                  >
                    {isFound
                      ? "Private Verification Clues"
                      : "Additional Identifying Details"}{" "}
                    <span className="font-normal text-[#7B858B]">(Optional)</span>
                  </label>
                  <span className="text-xs text-[#7B858B]">
                    {values.privateIdentifyingDetails.length}/400
                  </span>
                </div>
                <textarea
                  id="private-details"
                  rows={3}
                  disabled={isSubmitting}
                  value={values.privateIdentifyingDetails}
                  onChange={(e) =>
                    setFieldValue("privateIdentifyingDetails", e.target.value)
                  }
                  onBlur={() => handleBlur("privateIdentifyingDetails")}
                  placeholder={
                    isFound
                      ? "e.g., Specific sticker inside lid, initials on tag, or items inside pocket (never shared publicly)..."
                      : "e.g., Unique scratch near hinge, keychain charm, or sticker inside cover..."
                  }
                  className="mt-1.5 w-full rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] p-3.5 text-sm text-[#202B32] placeholder:text-[#7B858B] transition-colors focus:border-[#1F6B50] focus:bg-white focus:outline-none"
                />
                {errors.privateIdentifyingDetails && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.privateIdentifyingDetails}
                  </p>
                )}
              </div>

              {isFound && (
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="additional-notes"
                      className="block text-sm font-semibold text-[#142D3B]"
                    >
                      Additional Notes / Drop-Off Location{" "}
                      <span className="font-normal text-[#7B858B]">
                        (Optional)
                      </span>
                    </label>
                    <span className="text-xs text-[#7B858B]">
                      {values.additionalNotes.length}/400
                    </span>
                  </div>
                  <textarea
                    id="additional-notes"
                    rows={3}
                    disabled={isSubmitting}
                    value={values.additionalNotes}
                    onChange={(e) =>
                      setFieldValue("additionalNotes", e.target.value)
                    }
                    onBlur={() => handleBlur("additionalNotes")}
                    placeholder="e.g., Turned in to the Main Library Circulation Desk or available for campus pickup..."
                    className="mt-1.5 w-full rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] p-3.5 text-sm text-[#202B32] placeholder:text-[#7B858B] transition-colors focus:border-[#1F6B50] focus:bg-white focus:outline-none"
                  />
                  {errors.additionalNotes && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.additionalNotes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Actions Bar */}
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <Link
              href={isFound ? "/found" : "/lost"}
              className="inline-flex items-center justify-center rounded-xl border border-[#E7EBE8] bg-white px-5 py-3 text-sm font-semibold text-[#142D3B] transition-colors hover:bg-[#F7F8F5]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-65 ${
                isFound
                  ? "bg-[#1F6B50] text-white hover:bg-[#142D3B]"
                  : "bg-[#142D3B] text-white hover:bg-[#1F6B50]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Report...
                </>
              ) : (
                <>
                  {isFound ? "Submit Found Item Report" : "Submit Lost Item Report"}
                  <ArrowRight className="h-4 w-4 text-[#C9FD04]" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
