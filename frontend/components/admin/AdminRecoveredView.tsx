"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import { itemsService } from "@/services/itemsService";
import type { LostFoundItem } from "@/types/item";
import { StatusBadge } from "@/components/items/StatusBadge";

export function AdminRecoveredView() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [lostAll, foundAll] = await Promise.all([
          itemsService.list({ status: "lost", sortOrder: "newest" }, controller.signal),
          itemsService.list({ status: "found", sortOrder: "newest" }, controller.signal),
        ]);
        if (controller.signal.aborted) return;
        const recovered = [...lostAll, ...foundAll].filter(
          (item) => item.lifecycleState === "recovered"
        );
        setItems(recovered);
        setErrorMessage(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load recovered items."
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [refreshTick]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#142D3B]">
            Recovered Items Archive
          </h2>
          <p className="mt-1 text-sm text-[#7B858B]">
            Belongings verified and confirmed as physically returned to their
            rightful owners.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setRefreshTick((t) => t + 1);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7EBE8] bg-white px-4 py-2 text-xs font-semibold text-[#142D3B] hover:bg-[#F7F8F5]"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-[#E7EBE8] bg-white"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#D3DCD6] bg-white px-6 py-14 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-[#1F6B50]" />
          <h3 className="mt-3 text-base font-bold text-[#142D3B]">
            No recovered items yet
          </h3>
          <p className="mt-1 text-sm text-[#7B858B]">
            Items appear here once physical handover is confirmed in Claim
            Requests.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[#E7EBE8] bg-white p-5"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status="recovered" size="sm" />
                  <span className="rounded-full bg-[#F7F8F5] px-2 py-0.5 text-[11px] font-medium uppercase text-[#7B858B]">
                    {item.status}
                  </span>
                </div>
                <h3 className="mt-2 truncate text-base font-bold text-[#142D3B]">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-[#7B858B]">
                  {item.campusZone} &middot; {item.location} &middot; {item.date}
                </p>
              </div>
              <Link
                href={`/admin/items/${item.id}?from=recovered`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-3 py-2 text-xs font-semibold text-[#142D3B] hover:bg-white"
              >
                View
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
