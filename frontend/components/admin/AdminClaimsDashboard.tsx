"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { claimsService } from "@/services/claimsService";
import type { AdminClaimRecord, BackendClaimStatus } from "@/types/api";
import { StatusBadge } from "@/components/items/StatusBadge";
import { useAdminAuth } from "./AdminAuthContext";

const FILTER_TABS: { value: BackendClaimStatus | "all"; label: string }[] = [
  { value: "all", label: "All Claims" },
  { value: "claim_requested", label: "Claim Requested" },
  { value: "under_verification", label: "Under Verification" },
  { value: "approved", label: "Approved" },
  { value: "recovered", label: "Recovered" },
  { value: "rejected", label: "Rejected" },
];

export function AdminClaimsDashboard() {
  const { adminKey } = useAdminAuth();

  const [statusFilter, setStatusFilter] = useState<BackendClaimStatus | "all">(
    "all"
  );
  const [claims, setClaims] = useState<AdminClaimRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const [notesByClaim, setNotesByClaim] = useState<Record<string, string>>({});
  const [handoverCheckedByClaim, setHandoverCheckedByClaim] = useState<
    Record<string, boolean>
  >({});
  const [busyClaimId, setBusyClaimId] = useState<string | null>(null);
  const [actionBanner, setActionBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!adminKey) return;
    const controller = new AbortController();

    async function loadClaims() {
      try {
        const list = await claimsService.listForAdmin(
          adminKey as string,
          statusFilter,
          controller.signal
        );
        if (!controller.signal.aborted) {
          setClaims(list);
          setErrorMessage(null);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load claims for review."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadClaims();
    return () => controller.abort();
  }, [adminKey, statusFilter, refreshTick]);

  async function handleTransition(
    claimId: string,
    nextStatus: BackendClaimStatus,
    handoverConfirmed = false
  ) {
    if (!adminKey || busyClaimId) return;

    setBusyClaimId(claimId);
    setActionBanner(null);

    try {
      await claimsService.updateStatus(
        claimId,
        {
          status: nextStatus,
          reviewerNotes: notesByClaim[claimId]?.trim() || undefined,
          handoverConfirmed,
        },
        adminKey
      );
      setActionBanner({
        type: "success",
        text: `Claim ${claimId} updated to "${nextStatus.replace("_", " ")}".`,
      });
      setRefreshTick((t) => t + 1);
    } catch (error) {
      setActionBanner({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update claim status.",
      });
    } finally {
      setBusyClaimId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#142D3B]">
            Claim Requests &amp; Verification
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-[#7B858B]">
            Review private ownership verification answers against confidential
            item clues. Mark items Recovered only after confirmed physical
            handover.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setRefreshTick((t) => t + 1);
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-[#E7EBE8] bg-white px-4 py-2 text-xs font-semibold text-[#142D3B] hover:bg-[#F7F8F5] sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          const active = statusFilter === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setIsLoading(true);
                setStatusFilter(tab.value);
              }}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                active
                  ? "bg-[#142D3B] text-white"
                  : "border border-[#E7EBE8] bg-white text-[#202B32] hover:bg-[#F7F8F5]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {actionBanner && (
        <div
          role={actionBanner.type === "error" ? "alert" : "status"}
          className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
            actionBanner.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-[#1F6B50]/25 bg-[#1F6B50]/[0.06] text-[#142D3B]"
          }`}
        >
          {actionBanner.type === "error" ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1F6B50]" />
          )}
          <span className="font-medium">{actionBanner.text}</span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Claims Queue */}
      <div className="space-y-5">
        {isLoading && claims.length === 0 ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-52 animate-pulse rounded-2xl border border-[#E7EBE8] bg-white"
              />
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D3DCD6] bg-white px-6 py-14 text-center">
            <ClipboardCheck className="mx-auto h-8 w-8 text-[#1F6B50]" />
            <h3 className="mt-3 text-base font-bold text-[#142D3B]">
              No claims in this queue
            </h3>
            <p className="mt-1 text-sm text-[#7B858B]">
              Switch status filters or check back after new student claims are
              submitted.
            </p>
          </div>
        ) : (
          claims.map((claim) => {
            const isBusy = busyClaimId === claim.id;
            const handoverChecked = Boolean(handoverCheckedByClaim[claim.id]);

            return (
              <article
                key={claim.id}
                className="rounded-2xl border border-[#E7EBE8] bg-white p-6 shadow-[0_1px_3px_rgba(20,45,59,0.03)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E7EBE8] pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-semibold text-[#7B858B]">
                        {claim.id}
                      </span>
                      <StatusBadge status={claim.status} size="md" />
                      <span className="text-xs text-[#7B858B]">
                        Submitted {claim.createdAt.slice(0, 10)}
                      </span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold text-[#142D3B]">
                      {claim.itemSummary?.title || claim.itemId}
                    </h3>
                    <p className="mt-1 text-xs text-[#7B858B]">
                      Claimant:{" "}
                      <strong className="text-[#202B32]">
                        {claim.claimantName}
                      </strong>
                      {claim.claimantEmail ? ` (${claim.claimantEmail})` : ""}{" "}
                      &middot; Lost approx.{" "}
                      <strong className="text-[#202B32]">
                        {claim.approximateDateLost}
                      </strong>{" "}
                      at{" "}
                      <strong className="text-[#202B32]">
                        {claim.locationLost}
                      </strong>
                    </p>
                  </div>

                  <Link
                    href={`/admin/items/${claim.itemId}?from=claims`}
                    className="rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-3.5 py-2 text-xs font-semibold text-[#142D3B] hover:bg-white"
                  >
                    View Listing &rarr;
                  </Link>
                </div>

                {/* Private Side-by-Side Comparison */}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#1F6B50]/20 bg-[#1F6B50]/[0.04] p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#1F6B50]">
                      <Lock className="h-3.5 w-3.5" />
                      Confidential Item Clue
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#142D3B]">
                      {claim.itemSummary?.privateClues ||
                        "No private clue recorded on this item."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#142D3B]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#1F6B50]" />
                      Claimant&apos;s Private Verification Answer
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#202B32]">
                      {claim.verificationDetails}
                    </p>
                    {claim.additionalExplanation && (
                      <p className="mt-2 border-t border-[#E7EBE8] pt-2 text-xs text-[#7B858B]">
                        <strong>Additional note:</strong>{" "}
                        {claim.additionalExplanation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Review Actions */}
                {claim.status !== "recovered" && (
                  <div className="mt-5 space-y-3 border-t border-[#E7EBE8] pt-4">
                    <input
                      type="text"
                      disabled={isBusy}
                      aria-label={`Reviewer notes for ${claim.id}`}
                      value={notesByClaim[claim.id] ?? claim.reviewerNotes ?? ""}
                      onChange={(e) =>
                        setNotesByClaim((prev) => ({
                          ...prev,
                          [claim.id]: e.target.value,
                        }))
                      }
                      placeholder="Optional administrator review notes..."
                      className="h-10 w-full rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-3.5 text-xs text-[#202B32] focus:border-[#1F6B50] focus:bg-white focus:outline-none"
                    />

                    <div className="flex flex-wrap items-center gap-2.5">
                      {claim.status === "claim_requested" && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            handleTransition(claim.id, "under_verification")
                          }
                          className="rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-semibold text-sky-800 hover:bg-sky-100 disabled:opacity-50"
                        >
                          Mark Under Verification
                        </button>
                      )}

                      {(claim.status === "claim_requested" ||
                        claim.status === "under_verification") && (
                        <>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              handleTransition(claim.id, "approved")
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1F6B50] px-4 py-2 text-xs font-semibold text-white hover:bg-[#142D3B] disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Approve Claim
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              handleTransition(claim.id, "rejected")
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject Claim
                          </button>
                        </>
                      )}

                      {claim.status === "approved" && (
                        <div className="flex w-full flex-col gap-3 rounded-xl border border-[#142D3B]/15 bg-[#F7F8F5] p-3.5 sm:flex-row sm:items-center sm:justify-between">
                          <label className="flex items-center gap-2 text-xs font-medium text-[#142D3B]">
                            <input
                              type="checkbox"
                              checked={handoverChecked}
                              onChange={(e) =>
                                setHandoverCheckedByClaim((prev) => ({
                                  ...prev,
                                  [claim.id]: e.target.checked,
                                }))
                              }
                              className="h-4 w-4 rounded accent-[#1F6B50]"
                            />
                            I confirm physical handover to the verified owner.
                          </label>

                          <button
                            type="button"
                            disabled={isBusy || !handoverChecked}
                            onClick={() =>
                              handleTransition(claim.id, "recovered", true)
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#142D3B] px-4 py-2 text-xs font-bold text-[#C9FD04] hover:bg-[#1F6B50] hover:text-white disabled:opacity-45"
                          >
                            {isBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ShieldCheck className="h-3.5 w-3.5" />
                            )}
                            Confirm Handover &amp; Mark Recovered
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {claim.status === "recovered" && claim.handoverConfirmedAt && (
                  <div className="mt-4 flex items-center gap-2 border-t border-[#E7EBE8] pt-3.5 text-xs font-medium text-[#1F6B50]">
                    <CheckCircle2 className="h-4 w-4" />
                    Physical handover confirmed on{" "}
                    {new Date(claim.handoverConfirmedAt).toLocaleString()}.
                    {claim.reviewerNotes ? ` Notes: ${claim.reviewerNotes}` : ""}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
