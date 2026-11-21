"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { claimsService } from "@/services/claimsService";
import { getTodayIsoDate } from "@/utils/reportValidation";
import type { PublicClaimSummary } from "@/types/api";
import type { ItemStatus } from "@/types/item";
import { StatusBadge } from "./StatusBadge";

interface ItemDetailActionsProps {
  itemId: string;
  itemTitle: string;
  status: ItemStatus;
  isRecovered?: boolean;
  initialOpen?: boolean;
  onClaimSuccess?: () => void;
}

export function ItemDetailActions({
  itemId,
  itemTitle,
  status,
  isRecovered = false,
  initialOpen = false,
  onClaimSuccess,
}: ItemDetailActionsProps) {
  const isFound = status === "found";
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const [showForm, setShowForm] = useState(initialOpen);

  useEffect(() => {
    if (showForm && dateInputRef.current) {
      dateInputRef.current.max = getTodayIsoDate();
    }
  }, [showForm]);
  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [approximateDateLost, setApproximateDateLost] = useState("");
  const [locationLost, setLocationLost] = useState("");
  const [verificationDetails, setVerificationDetails] = useState("");
  const [additionalExplanation, setAdditionalExplanation] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdClaim, setCreatedClaim] = useState<PublicClaimSummary | null>(
    null
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const storedUserId =
      typeof window !== "undefined"
        ? window.localStorage.getItem("findora_active_demo_user_id") || "usr-demo-1"
        : undefined;
    const claimantUserId =
      storedUserId && storedUserId !== "usr-demo-empty"
        ? storedUserId
        : undefined;

    try {
      const created = await claimsService.create({
        itemType: status,
        itemId,
        claimantUserId,
        claimantName: claimantName.trim(),
        claimantEmail: claimantEmail.trim() || undefined,
        approximateDateLost,
        locationLost: locationLost.trim(),
        verificationDetails: verificationDetails.trim(),
        additionalExplanation: additionalExplanation.trim() || undefined,
      });
      setCreatedClaim(created);
      onClaimSuccess?.();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit claim request right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isRecovered && !createdClaim) {
    return (
      <div className="rounded-2xl border border-[#142D3B]/15 bg-[#F7F8F5] p-5 text-xs text-[#202B32]">
        <p className="font-bold text-[#142D3B]">Item Recovered</p>
        <p className="mt-1 text-[#7B858B]">
          Physical handover has been confirmed by a campus administrator. This
          listing is closed and no longer accepts claims.
        </p>
      </div>
    );
  }

  if (createdClaim) {
    return (
      <div
        role="status"
        className="rounded-2xl border border-[#1F6B50]/30 bg-[#1F6B50]/[0.06] p-6"
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#1F6B50]" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[#142D3B]">
                Claim Request Submitted
              </h3>
              <StatusBadge status={createdClaim.status} size="sm" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#202B32]/80">
              Your private ownership verification for{" "}
              <strong className="text-[#142D3B]">{itemTitle}</strong> has been
              recorded securely (Ref:{" "}
              <span className="font-mono font-semibold">{createdClaim.id}</span>
              ). An authorized campus administrator will review your answers
              before approving physical handover.
            </p>
            <button
              type="button"
              onClick={() => {
                setCreatedClaim(null);
                setShowForm(false);
                setClaimantName("");
                setClaimantEmail("");
                setApproximateDateLost("");
                setLocationLost("");
                setVerificationDetails("");
                setAdditionalExplanation("");
              }}
              className="mt-3 text-xs font-semibold text-[#1F6B50] underline underline-offset-4 hover:text-[#142D3B]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition-all duration-200 ${
            isFound
              ? "bg-[#1F6B50] text-white hover:bg-[#142D3B]"
              : "bg-[#C9FD04] text-[#142D3B] hover:bg-[#d6ff38]"
          }`}
        >
          {isFound ? (
            <>
              <ShieldCheck className="h-4 w-4" />
              Request Claim
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4" />
              Report Match / Contact Owner
            </>
          )}
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#E7EBE8] bg-[#F7F8F5] p-5"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[#142D3B]">
              {isFound ? "Request Claim & Verify Ownership" : "Submit Match Verification"}
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setErrorMessage(null);
              }}
              className="text-xs font-medium text-[#7B858B] hover:text-[#142D3B]"
            >
              Cancel
            </button>
          </div>

          {/* Selected Item Read-Only Chip */}
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-[#E7EBE8] bg-white px-3.5 py-2 text-xs">
            <span className="truncate font-semibold text-[#142D3B]">
              Selected Item: {itemTitle}
            </span>
            <span className="shrink-0 font-mono text-[11px] text-[#7B858B]">
              {itemId}
            </span>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#1F6B50]/20 bg-[#1F6B50]/[0.05] px-3 py-2 text-[11px] leading-relaxed text-[#142D3B]">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1F6B50]" />
            <span>
              Your verification answers are kept strictly private and reviewed
              only by authorized campus administrators. Claims are never
              auto-approved.
            </span>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div>
              <label
                htmlFor="claim-name"
                className="block text-xs font-semibold text-[#142D3B]"
              >
                Claimant Name or Demo User ID{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                id="claim-name"
                type="text"
                required
                minLength={2}
                disabled={isSubmitting}
                value={claimantName}
                onChange={(e) => setClaimantName(e.target.value)}
                placeholder="e.g., Jordan Patel or usr-demo-1"
                className="mt-1 h-10 w-full rounded-xl border border-[#E7EBE8] bg-white px-3.5 text-sm text-[#202B32] focus:border-[#1F6B50] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="claim-email"
                className="block text-xs font-semibold text-[#142D3B]"
              >
                Campus Email{" "}
                <span className="font-normal text-[#7B858B]">(Optional)</span>
              </label>
              <input
                id="claim-email"
                type="email"
                disabled={isSubmitting}
                value={claimantEmail}
                onChange={(e) => setClaimantEmail(e.target.value)}
                placeholder="you@university.edu"
                className="mt-1 h-10 w-full rounded-xl border border-[#E7EBE8] bg-white px-3.5 text-sm text-[#202B32] focus:border-[#1F6B50] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="claim-date"
                  className="block text-xs font-semibold text-[#142D3B]"
                >
                  Approximate Date Lost <span className="text-red-500">*</span>
                </label>
                <input
                  ref={dateInputRef}
                  id="claim-date"
                  type="date"
                  required
                  disabled={isSubmitting}
                  value={approximateDateLost}
                  onChange={(e) => setApproximateDateLost(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-[#E7EBE8] bg-white px-3 text-sm text-[#202B32] focus:border-[#1F6B50] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="claim-location"
                  className="block text-xs font-semibold text-[#142D3B]"
                >
                  Location Where Lost <span className="text-red-500">*</span>
                </label>
                <input
                  id="claim-location"
                  type="text"
                  required
                  minLength={3}
                  disabled={isSubmitting}
                  value={locationLost}
                  onChange={(e) => setLocationLost(e.target.value)}
                  placeholder="e.g., Science Library 2nd floor"
                  className="mt-1 h-10 w-full rounded-xl border border-[#E7EBE8] bg-white px-3.5 text-sm text-[#202B32] focus:border-[#1F6B50] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="claim-verification"
                className="block text-xs font-semibold text-[#142D3B]"
              >
                Private Ownership Verification Answer{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                id="claim-verification"
                rows={3}
                required
                minLength={10}
                disabled={isSubmitting}
                value={verificationDetails}
                onChange={(e) => setVerificationDetails(e.target.value)}
                placeholder="Describe a unique detail not visible in the public listing (e.g., contents, engraving, sticker, or scratches)..."
                className="mt-1 w-full rounded-xl border border-[#E7EBE8] bg-white p-3.5 text-sm text-[#202B32] focus:border-[#1F6B50] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="claim-explanation"
                className="block text-xs font-semibold text-[#142D3B]"
              >
                Additional Explanation{" "}
                <span className="font-normal text-[#7B858B]">(Optional)</span>
              </label>
              <textarea
                id="claim-explanation"
                rows={2}
                maxLength={400}
                disabled={isSubmitting}
                value={additionalExplanation}
                onChange={(e) => setAdditionalExplanation(e.target.value)}
                placeholder="Any extra context for the campus administrator..."
                className="mt-1 w-full rounded-xl border border-[#E7EBE8] bg-white p-3 text-sm text-[#202B32] focus:border-[#1F6B50] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#142D3B] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting Claim Request...
                </>
              ) : (
                "Submit Claim Request"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
