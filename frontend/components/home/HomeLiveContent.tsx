"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { itemsService } from "@/services/itemsService";
import type { DashboardStats } from "@/types/api";
import type { LostFoundItem } from "@/types/item";
import { ItemsShowcaseSection } from "./ItemsShowcaseSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { ItemGridSkeleton } from "@/components/items/ItemGridSkeleton";

export function HomeLiveContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lostItems, setLostItems] = useState<LostFoundItem[]>([]);
  const [foundItems, setFoundItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [statsData, lostData, foundData] = await Promise.all([
          dashboardService.getStats(controller.signal),
          itemsService.list(
            { status: "lost", sortOrder: "newest" },
            controller.signal
          ),
          itemsService.list(
            { status: "found", sortOrder: "newest" },
            controller.signal
          ),
        ]);

        if (controller.signal.aborted) return;

        setStats(statsData);
        setLostItems(lostData.slice(0, 4));
        setFoundItems(foundData.slice(0, 4));
        setErrorMessage(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to connect to the Findora API."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [refreshTick]);

  const overviewStats = [
    {
      label: "Items Reported",
      value: stats ? String(stats.itemsReported) : "—",
      detail: stats
        ? `${stats.totalLostItems} lost and ${stats.totalFoundItems} found across campus`
        : "Logged across campus buildings",
      Icon: ClipboardList,
    },
    {
      label: "Items Recovered",
      value: stats ? String(stats.itemsRecovered) : "—",
      detail: stats
        ? `${stats.pendingClaims} active claim(s) currently under verification`
        : "Verified and safely returned to owners",
      Icon: CheckCircle2,
    },
    {
      label: "Active Community Members",
      value: stats ? String(stats.activeCommunityMembers) : "—",
      detail: "Students, faculty, and campus desk coordinators",
      Icon: Users,
    },
  ];

  const communityImpactStats = [
    {
      label: "Recovery Rate",
      value: stats ? `${stats.recoveryRate}%` : "—",
      detail: "Of reported campus items safely reunited",
    },
    {
      label: "Active Listings",
      value: stats ? String(stats.activeListings) : "—",
      detail: "Currently open across lost and found feeds",
    },
    {
      label: "Campus Zones Covered",
      value: stats ? String(stats.zoneBreakdown.length) : "—",
      detail: "Libraries, lecture halls, quads, cafés, and dorms",
    },
    {
      label: "Pending Claims",
      value: stats ? String(stats.pendingClaims) : "—",
      detail: "Awaiting ownership verification and campus handoff",
    },
  ];

  return (
    <>
      {/* API Error Banner if Backend is Unreachable */}
      {errorMessage && (
        <div className="mx-auto max-w-7xl px-4 pt-2 sm:px-6 lg:px-8">
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm text-red-800"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setRefreshTick((t) => t + 1)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-200 hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Statistics Overview Strip */}
      <section className="px-4 py-6 sm:px-6 lg:px-8" aria-label="Platform Statistics">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {overviewStats.map(({ label, value, detail, Icon }) => (
              <div
                key={label}
                className="flex items-start gap-4 rounded-2xl border border-[#E7EBE8] bg-white p-6 shadow-[0_1px_2px_rgba(20,45,59,0.03)] transition-colors hover:border-[#1F6B50]/30"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] text-[#1F6B50]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  {isLoading ? (
                    <div className="h-8 w-20 animate-pulse rounded-lg bg-[#E7EBE8]" />
                  ) : (
                    <p className="text-3xl font-bold tracking-tight text-[#142D3B]">
                      {value}
                    </p>
                  )}
                  <p className="mt-0.5 text-sm font-semibold text-[#202B32]">
                    {label}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#7B858B]">
                    {detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Lost Items */}
      {isLoading ? (
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-[#E7EBE8]" />
            <ItemGridSkeleton count={4} />
          </div>
        </section>
      ) : (
        <ItemsShowcaseSection
          eyebrow="Missing on Campus"
          title="Recently Lost Items"
          description="Keep an eye out around libraries, lecture halls, and walkways—your quick tip could make someone's week."
          items={lostItems}
          viewAllHref="/lost"
          viewAllLabel="View All Lost Items"
        />
      )}

      {/* Recently Found Items */}
      {isLoading ? (
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-[#E7EBE8]" />
            <ItemGridSkeleton count={4} />
          </div>
        </section>
      ) : (
        <ItemsShowcaseSection
          eyebrow="Ready to Claim"
          title="Recently Found Items"
          description="Items recently turned in or spotted by fellow community members and waiting to be reunited with their owners."
          items={foundItems}
          viewAllHref="/found"
          viewAllLabel="View All Found Items"
        />
      )}

      <HowItWorksSection />

      {/* Campus Community Statistics (Live Backend Data) */}
      <section
        id="community-stats"
        className="scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-22"
      >
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl bg-[#142D3B] p-8 text-white shadow-[0_24px_60px_rgba(20,45,59,0.14)] sm:p-12 lg:p-16">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-[#C9FD04]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Campus Community Statistics
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Built on everyday campus kindness and accountability.
                </h2>

                <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
                  Live metrics powered directly by the Findora campus database so
                  students and staff can track real recovery progress across
                  every building.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/report"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#C9FD04] px-5 py-3 text-sm font-bold text-[#142D3B] transition-colors hover:bg-[#d6ff38]"
                  >
                    Report an Item
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/lost"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    Browse Lost Items
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
                {communityImpactStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:border-[#C9FD04]/30 hover:bg-white/[0.07]"
                  >
                    {isLoading ? (
                      <div className="h-9 w-20 animate-pulse rounded-lg bg-white/10" />
                    ) : (
                      <p className="text-3xl font-bold tracking-tight text-[#C9FD04] sm:text-4xl">
                        {stat.value}
                      </p>
                    )}
                    <p className="mt-2 text-sm font-semibold text-white">
                      {stat.label}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/65">
                      {stat.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
