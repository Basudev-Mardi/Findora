"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { itemsService } from "@/services/itemsService";
import { adminItemsService } from "@/services/adminItemsService";
import type { BackendItemStatus } from "@/types/api";
import type { ItemStatus, LostFoundItem } from "@/types/item";
import { StatusBadge } from "@/components/items/StatusBadge";
import { useAdminAuth } from "./AdminAuthContext";
import { ConfirmDialog } from "./ConfirmDialog";

interface AdminItemsManagerProps {
  type: ItemStatus;
  title: string;
  description: string;
}

const ITEM_STATUS_OPTIONS: { value: BackendItemStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "claim_requested", label: "Claim Requested" },
  { value: "under_verification", label: "Under Verification" },
  { value: "approved", label: "Approved" },
  { value: "recovered", label: "Recovered" },
];

export function AdminItemsManager({
  type,
  title,
  description,
}: AdminItemsManagerProps) {
  const { adminKey } = useAdminAuth();

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LostFoundItem | null>(null);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const list = await itemsService.list(
          { status: type, query, sortOrder: "newest" },
          controller.signal
        );
        if (!controller.signal.aborted) {
          setItems(list);
          setErrorMessage(null);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : `Failed to load ${type} items.`
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    if (!query.trim()) {
      void load();
      return () => controller.abort();
    }

    const timer = setTimeout(() => void load(), 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [type, query, refreshTick]);

  async function handleStatusChange(
    item: LostFoundItem,
    nextStatus: BackendItemStatus
  ) {
    if (!adminKey || busyId) return;
    setBusyId(item.id);
    setBanner(null);

    try {
      await adminItemsService.updateStatus(type, item.id, nextStatus, adminKey);
      setBanner({
        type: "success",
        text: `Updated "${item.title}" status to ${nextStatus.replace("_", " ")}.`,
      });
      setRefreshTick((t) => t + 1);
    } catch (error) {
      setBanner({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update item status.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!adminKey || !deleteTarget) return;
    setBusyId(deleteTarget.id);
    setBanner(null);

    try {
      await adminItemsService.remove(type, deleteTarget.id, adminKey);
      setBanner({
        type: "success",
        text: `Removed "${deleteTarget.title}" (${deleteTarget.id}) from listings.`,
      });
      setDeleteTarget(null);
      setRefreshTick((t) => t + 1);
    } catch (error) {
      setBanner({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to delete item report.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#142D3B]">
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#7B858B]">{description}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B858B]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items..."
              className="h-10 w-56 rounded-xl border border-[#E7EBE8] bg-white pl-9 pr-3 text-xs text-[#202B32] focus:border-[#1F6B50] focus:outline-none sm:w-64"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setRefreshTick((t) => t + 1);
            }}
            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E7EBE8] bg-white px-3.5 text-xs font-semibold text-[#142D3B] hover:bg-[#F7F8F5]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {banner && (
        <div
          role={banner.type === "error" ? "alert" : "status"}
          className={`flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
            banner.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-[#1F6B50]/25 bg-[#1F6B50]/[0.06] text-[#142D3B]"
          }`}
        >
          {banner.type === "error" ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#1F6B50]" />
          )}
          <span className="font-medium">{banner.text}</span>
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

      {/* Responsive Management Table */}
      <div className="overflow-hidden rounded-2xl border border-[#E7EBE8] bg-white shadow-[0_1px_2px_rgba(20,45,59,0.03)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#E7EBE8] text-left text-sm">
            <thead className="bg-[#F7F8F5] text-xs font-semibold uppercase tracking-wider text-[#7B858B]">
              <tr>
                <th className="px-5 py-3.5">Item</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Campus Location</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EBE8] bg-white">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-10 animate-pulse rounded-xl bg-[#F7F8F5]" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-sm text-[#7B858B]"
                  >
                    No {type} items match your current search.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isBusy = busyId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-[#F7F8F5]/70"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-[#E7EBE8] bg-[#ECEFE9]">
                            <Image
                              src={item.image}
                              alt={item.imageAlt}
                              fill
                              unoptimized={item.image.startsWith("data:")}
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-[#142D3B]">
                              {item.title}
                            </p>
                            <p className="font-mono text-[11px] text-[#7B858B]">
                              {item.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-[#202B32]">
                        {item.category}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#7B858B]">
                        <span className="font-medium text-[#202B32]">
                          {item.campusZone}
                        </span>
                        <span className="block truncate max-w-[200px]">
                          {item.location}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-[#7B858B]">
                        {item.date}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.lifecycleState} size="sm" />
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <select
                            aria-label={`Update status for ${item.title}`}
                            disabled={isBusy}
                            value={item.lifecycleState}
                            onChange={(e) =>
                              handleStatusChange(
                                item,
                                e.target.value as BackendItemStatus
                              )
                            }
                            className="h-8 rounded-lg border border-[#E7EBE8] bg-[#F7F8F5] px-2 text-xs font-medium text-[#142D3B] focus:border-[#1F6B50] focus:bg-white focus:outline-none disabled:opacity-50"
                          >
                            {ITEM_STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>

                          <Link
                            href={`/items/${item.id}`}
                            title="View public listing"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7EBE8] bg-white text-[#7B858B] hover:text-[#142D3B]"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setDeleteTarget(item)}
                            title="Delete report"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Item Report?"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.title}" (${deleteTarget.id})? Any linked claims will also be removed. This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Report"
        isBusy={Boolean(busyId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
