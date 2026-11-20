"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  PackageSearch,
  RefreshCw,
  Search,
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { claimsService } from "@/services/claimsService";
import type { AdminClaimRecord, DashboardStats } from "@/types/api";
import { StatusBadge } from "@/components/items/StatusBadge";
import { useAdminAuth } from "./AdminAuthContext";

export function AdminOverviewView() {
  const { adminKey } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentClaims, setRecentClaims] = useState<AdminClaimRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!adminKey) return;
    const controller = new AbortController();

    async function load() {
      try {
        const [statsRes, claimsRes] = await Promise.all([
          dashboardService.getStats(controller.signal),
          claimsService.listForAdmin(adminKey as string, "all", controller.signal),
        ]);
        if (controller.signal.aborted) return;
        setStats(statsRes);
        setRecentClaims(claimsRes.slice(0, 5));
        setErrorMessage(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard overview."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [adminKey, refreshTick]);

  const kpis = [
    {
      label: "Total Lost Items",
      value: stats ? String(stats.totalLostItems) : "—",
      href: "/admin/lost-items",
      icon: Search,
      accent: "text-[#142D3B]",
    },
    {
      label: "Total Found Items",
      value: stats ? String(stats.totalFoundItems) : "—",
      href: "/admin/found-items",
      icon: PackageSearch,
      accent: "text-[#1F6B50]",
    },
    {
      label: "Pending Claims",
      value: stats ? String(stats.pendingClaims) : "—",
      href: "/admin/claims",
      icon: Clock,
      accent: "text-amber-700",
    },
    {
      label: "Successful Recoveries",
      value: stats ? String(stats.itemsRecovered) : "—",
      href: "/admin/recovered",
      icon: CheckCircle2,
      accent: "text-[#1F6B50]",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#142D3B]">
            Campus Operations Overview
          </h2>
          <p className="mt-1 text-sm text-[#7B858B]">
            Real-time metrics across lost reports, found inventory, and claim
            verifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setRefreshTick((t) => t + 1);
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E7EBE8] bg-white px-4 py-2 text-xs font-semibold text-[#142D3B] hover:bg-[#F7F8F5] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            {errorMessage}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setRefreshTick((t) => t + 1);
            }}
            className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-red-700 border border-red-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, href, icon: Icon, accent }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-[#E7EBE8] bg-white p-6 shadow-[0_1px_2px_rgba(20,45,59,0.03)] transition-all hover:-translate-y-0.5 hover:border-[#1F6B50]/35 hover:shadow-[0_10px_24px_rgba(20,45,59,0.06)]"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] text-[#1F6B50]">
                <Icon className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-[#7B858B] transition-transform group-hover:translate-x-0.5 group-hover:text-[#142D3B]" />
            </div>
            {isLoading ? (
              <div className="mt-4 h-9 w-16 animate-pulse rounded-lg bg-[#E7EBE8]" />
            ) : (
              <p className={`mt-4 text-3xl font-bold tracking-tight ${accent}`}>
                {value}
              </p>
            )}
            <p className="mt-1 text-xs font-semibold text-[#7B858B]">{label}</p>
          </Link>
        ))}
      </div>

      {/* Breakdown & Recent Claims */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Claim Requests */}
        <section className="rounded-2xl border border-[#E7EBE8] bg-white p-6 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#E7EBE8] pb-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#1F6B50]" />
              <h3 className="text-sm font-bold text-[#142D3B]">
                Recent Claim Requests
              </h3>
            </div>
            <Link
              href="/admin/claims"
              className="text-xs font-semibold text-[#1F6B50] hover:text-[#142D3B]"
            >
              Review all &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 animate-pulse rounded-xl bg-[#F7F8F5]"
                />
              ))}
            </div>
          ) : recentClaims.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#7B858B]">
              No claim requests submitted yet.
            </p>
          ) : (
            <div className="mt-4 divide-y divide-[#E7EBE8]">
              {recentClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#142D3B]">
                      {claim.itemSummary?.title || claim.itemId}
                    </p>
                    <p className="text-xs text-[#7B858B]">
                      <span className="font-mono">{claim.id}</span> &middot;{" "}
                      {claim.claimantName} &middot;{" "}
                      {claim.createdAt.slice(0, 10)}
                    </p>
                  </div>
                  <StatusBadge status={claim.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Campus Zone Breakdown */}
        <section className="rounded-2xl border border-[#E7EBE8] bg-white p-6 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#E7EBE8] pb-4">
            <h3 className="text-sm font-bold text-[#142D3B]">
              Reports by Campus Zone
            </h3>
            <span className="rounded-full bg-[#F7F8F5] px-2.5 py-0.5 text-[11px] font-semibold text-[#1F6B50]">
              {stats ? `${stats.recoveryRate}% Recovery Rate` : "—"}
            </span>
          </div>

          {isLoading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-lg bg-[#F7F8F5]"
                />
              ))}
            </div>
          ) : !stats || stats.zoneBreakdown.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#7B858B]">
              No campus zone data yet.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stats.zoneBreakdown.slice(0, 6).map((zone) => {
                const maxCount = stats.zoneBreakdown[0]?.count || 1;
                const widthPct = Math.max(
                  12,
                  Math.round((zone.count / maxCount) * 100)
                );
                return (
                  <li key={zone.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#202B32]">
                        {zone.name}
                      </span>
                      <span className="font-semibold text-[#142D3B]">
                        {zone.count}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[#F7F8F5]">
                      <div
                        className="h-full rounded-full bg-[#1F6B50]"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
