"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, MapPin } from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { readClientCache, writeClientCache } from "@/utils/clientCache";
import type { DashboardStats, LatestReunitedItem } from "@/types/api";

const STATS_CACHE_KEY = "findora_cache_dashboard_stats";

function formatBadgeText(item: LatestReunitedItem): {
  heading: string;
  subtitle: string;
} {
  if (item.status === "recovered") {
    const duration =
      item.returnedInHours < 24
        ? `Returned in ${item.returnedInHours} ${item.returnedInHours === 1 ? "hr" : "hrs"}`
        : `Returned in ${Math.max(1, Math.round(item.returnedInHours / 24))} days`;
    return {
      heading: "Recently Reunited",
      subtitle: `${item.title} · ${duration}`,
    };
  }

  if (item.status === "approved") {
    return {
      heading: "Claim Approved",
      subtitle: `${item.title} · Ready for pickup`,
    };
  }

  if (item.status === "under_verification") {
    return {
      heading: "Under Verification",
      subtitle: `${item.title} · ${item.campusZone}`,
    };
  }

  return {
    heading: "Recently Claimed",
    subtitle: `${item.title} · ${item.campusZone}`,
  };
}

export function HeroLiveBadge() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const cached = readClientCache<DashboardStats>(STATS_CACHE_KEY);

    async function load() {
      if (cached) {
        await Promise.resolve();
        if (!controller.signal.aborted) setStats(cached);
      }
      try {
        const data = await dashboardService.getStats(controller.signal);
        if (!controller.signal.aborted) {
          setStats(data);
          writeClientCache(STATS_CACHE_KEY, data);
        }
      } catch {
        // Keep cached/fallback display if API is temporarily unreachable
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  const latest = stats?.latestReunited ?? null;
  const badge = latest
    ? formatBadgeText(latest)
    : {
        heading: "Recently Reunited",
        subtitle: "Verified campus returns updated live",
      };

  const zoneNames =
    stats && stats.zoneBreakdown.length > 0
      ? stats.zoneBreakdown
          .slice(0, 3)
          .map((z) => z.name)
          .join(", ")
      : "Science Library, North Hall, Student Union";
  const extraZones =
    stats && stats.zoneBreakdown.length > 3
      ? stats.zoneBreakdown.length - 3
      : 0;

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col lg:items-end">
      <Link
        href={latest ? `/items/${latest.id}` : "/found"}
        className="w-full max-w-xs rounded-2xl border border-white/20 bg-[#142D3B]/75 p-4 text-white backdrop-blur-md transition-colors hover:border-[#C9FD04]/50 hover:bg-[#142D3B]/90"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1F6B50] text-[#C9FD04]">
            <CheckCircle2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white">{badge.heading}</p>
            <p className="truncate text-xs text-white/75">{badge.subtitle}</p>
          </div>
        </div>
      </Link>

      <div className="w-full max-w-xs rounded-2xl border border-white/20 bg-white/95 p-4 text-[#142D3B] shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-semibold text-[#1F6B50]">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Active Campus Zones
          </span>
          <span className="rounded-full bg-[#1F6B50]/10 px-2 py-0.5 text-[11px]">
            Live
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-[#7B858B]">
          {zoneNames}
          {extraZones > 0
            ? `, and ${extraZones} other active campus ${extraZones === 1 ? "zone" : "zones"}.`
            : " monitored daily."}
        </p>
      </div>
    </div>
  );
}
