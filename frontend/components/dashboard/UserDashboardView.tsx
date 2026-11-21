"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  PackageSearch,
  Plus,
  RefreshCw,
  Search,
  UserCircle2,
} from "lucide-react";
import { itemsService } from "@/services/itemsService";
import { claimsService } from "@/services/claimsService";
import type { PublicClaimSummary } from "@/types/api";
import type { LostFoundItem } from "@/types/item";
import { StatusBadge } from "@/components/items/StatusBadge";

const DEMO_USER_STORAGE_KEY = "findora_active_demo_user_id";

const DEMO_PROFILES = [
  { id: "usr-demo-1", name: "Aarav Sharma", role: "Student (Demo)" },
  { id: "usr-demo-2", name: "Maya Lin", role: "Student (Demo)" },
  { id: "usr-demo-empty", name: "New Student", role: "Empty State Demo" },
];

export function UserDashboardView() {
  const [selectedUserId, setSelectedUserId] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (saved && DEMO_PROFILES.some((p) => p.id === saved)) {
        return saved;
      }
    }
    return DEMO_PROFILES[0].id;
  });
  const [allLost, setAllLost] = useState<LostFoundItem[]>([]);
  const [allFound, setAllFound] = useState<LostFoundItem[]>([]);
  const [myClaims, setMyClaims] = useState<PublicClaimSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [lostList, foundList, claimsList] = await Promise.all([
          itemsService.list(
            { status: "lost", sortOrder: "newest" },
            controller.signal
          ),
          itemsService.list(
            { status: "found", sortOrder: "newest" },
            controller.signal
          ),
          claimsService.listPublic(
            { claimantUserId: selectedUserId },
            controller.signal
          ),
        ]);

        if (controller.signal.aborted) return;

        setAllLost(lostList);
        setAllFound(foundList);
        setMyClaims(claimsList);
        setErrorMessage(null);
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load your dashboard from the Findora API."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [selectedUserId, refreshTick]);

  const myLostReports = useMemo(
    () => allLost.filter((item) => item.userId === selectedUserId),
    [allLost, selectedUserId]
  );

  const myFoundReports = useMemo(
    () => allFound.filter((item) => item.userId === selectedUserId),
    [allFound, selectedUserId]
  );

  const recentlyReported = useMemo(
    () =>
      [...myLostReports, ...myFoundReports]
        .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))
        .slice(0, 4),
    [myLostReports, myFoundReports]
  );

  const itemTitleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of [...allLost, ...allFound]) {
      map.set(item.id, item.title);
    }
    return map;
  }, [allLost, allFound]);

  const successfulRecoveries = useMemo(() => {
    const recoveredItems = [...myLostReports, ...myFoundReports].filter(
      (i) => i.lifecycleState === "recovered"
    ).length;
    const recoveredClaims = myClaims.filter(
      (c) => c.status === "recovered"
    ).length;
    return recoveredItems + recoveredClaims;
  }, [myLostReports, myFoundReports, myClaims]);

  const recoveryCounts = useMemo(() => {
    const combined = [...myLostReports, ...myFoundReports];
    return {
      available: combined.filter((i) => i.lifecycleState === "available").length,
      claimRequested: combined.filter(
        (i) => i.lifecycleState === "claim_requested"
      ).length,
      underVerification: combined.filter(
        (i) => i.lifecycleState === "under_verification"
      ).length,
      approved: combined.filter((i) => i.lifecycleState === "approved").length,
      recovered: combined.filter((i) => i.lifecycleState === "recovered").length,
    };
  }, [myLostReports, myFoundReports]);

  const recentActivity = useMemo(() => {
    const events: {
      id: string;
      label: string;
      meta: string;
      status: LostFoundItem["lifecycleState"];
      href: string;
      sortKey: string;
    }[] = [];

    for (const item of [...myLostReports, ...myFoundReports]) {
      events.push({
        id: `item-${item.id}`,
        label: `Reported ${item.status === "found" ? "found" : "lost"}: ${item.title}`,
        meta: `${item.campusZone} · ${item.date}`,
        status: item.lifecycleState,
        href: `/items/${item.id}`,
        sortKey: item.reportedAt,
      });
    }

    for (const claim of myClaims) {
      events.push({
        id: `claim-${claim.id}`,
        label: `Claim ${claim.id} for ${itemTitleById.get(claim.itemId) || claim.itemId}`,
        meta: `Updated ${claim.updatedAt.slice(0, 10)}`,
        status: claim.status,
        href: `/items/${claim.itemId}`,
        sortKey: claim.updatedAt.slice(0, 10),
      });
    }

    return events
      .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
      .slice(0, 6);
  }, [myLostReports, myFoundReports, myClaims, itemTitleById]);

  const stats = [
    {
      label: "My Lost Reports",
      value: myLostReports.length,
      icon: Search,
    },
    {
      label: "My Found Reports",
      value: myFoundReports.length,
      icon: PackageSearch,
    },
    {
      label: "My Claim Requests",
      value: myClaims.length,
      icon: ClipboardCheck,
    },
    {
      label: "Successful Recoveries",
      value: successfulRecoveries,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Header & Demo Profile Switcher */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#E7EBE8] pb-8 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F6B50]">
            Personal Workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#142D3B] sm:text-4xl">
            User Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#7B858B] sm:text-base">
            Track your lost and found reports, monitor active claims, and check
            campus recovery progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#E7EBE8] bg-white px-3 py-2">
            <UserCircle2 className="h-4 w-4 text-[#1F6B50]" />
            <label htmlFor="demo-user-select" className="sr-only">
              Select Demo Student Profile
            </label>
            <select
              id="demo-user-select"
              value={selectedUserId}
              onChange={(e) => {
                const nextId = e.target.value;
                if (typeof window !== "undefined") {
                  window.localStorage.setItem(DEMO_USER_STORAGE_KEY, nextId);
                }
                setIsLoading(true);
                setSelectedUserId(nextId);
              }}
              className="bg-transparent text-xs font-semibold text-[#142D3B] focus:outline-none"
            >
              {DEMO_PROFILES.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name} — {profile.role}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setRefreshTick((t) => t + 1);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7EBE8] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#142D3B] hover:bg-[#F7F8F5]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <Link
            href="/report/lost"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#142D3B] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1F6B50]"
          >
            <Plus className="h-3.5 w-3.5 text-[#C9FD04]" />
            Report Lost
          </Link>
          <Link
            href="/report/found"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1F6B50] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#142D3B]"
          >
            <Plus className="h-3.5 w-3.5 text-[#C9FD04]" />
            Report Found
          </Link>
        </div>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
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
            className="rounded-lg border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Statistics Cards */}
      <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-[#E7EBE8] bg-white p-6 shadow-[0_1px_2px_rgba(20,45,59,0.03)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] text-[#1F6B50]">
              <Icon className="h-5 w-5" />
            </span>
            {isLoading ? (
              <div className="mt-4 h-8 w-14 animate-pulse rounded-lg bg-[#E7EBE8]" />
            ) : (
              <p className="mt-4 text-3xl font-bold tracking-tight text-[#142D3B]">
                {value}
              </p>
            )}
            <p className="mt-1 text-xs font-semibold text-[#7B858B]">{label}</p>
          </div>
        ))}
      </section>

      {/* Section 1: Recently Reported Items + Section 5: Current Recovery Status */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-[#E7EBE8] bg-white p-6 lg:col-span-7">
          <div className="flex items-center justify-between border-b border-[#E7EBE8] pb-4">
            <h2 className="text-base font-bold text-[#142D3B]">
              1. Recently Reported Items
            </h2>
            <Link
              href="/report"
              className="text-xs font-semibold text-[#1F6B50] hover:text-[#142D3B]"
            >
              New Report &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-[#F7F8F5]" />
              ))}
            </div>
          ) : recentlyReported.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-[#142D3B]">
                No reports yet
              </p>
              <p className="mt-1 text-xs text-[#7B858B]">
                Items you report as lost or found will appear here.
              </p>
              <Link
                href="/report"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#142D3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1F6B50]"
              >
                Create First Report
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mt-4 divide-y divide-[#E7EBE8]">
              {recentlyReported.map((item) => (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  className="flex items-center justify-between gap-3 py-3.5 transition-colors hover:bg-[#F7F8F5]/70"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#142D3B]">
                      {item.title}
                    </p>
                    <p className="text-xs text-[#7B858B]">
                      <span className="uppercase font-semibold">{item.status}</span>{" "}
                      &middot; {item.campusZone} &middot; {item.date}
                    </p>
                  </div>
                  <StatusBadge status={item.lifecycleState} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#E7EBE8] bg-white p-6 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#E7EBE8] pb-4">
            <h2 className="text-base font-bold text-[#142D3B]">
              Current Recovery Status
            </h2>
            <Clock className="h-4 w-4 text-[#1F6B50]" />
          </div>

          <dl className="mt-4 space-y-3 text-xs">
            {[
              { label: "Available", status: "available" as const, count: recoveryCounts.available },
              { label: "Claim Requested", status: "claim_requested" as const, count: recoveryCounts.claimRequested },
              { label: "Under Verification", status: "under_verification" as const, count: recoveryCounts.underVerification },
              { label: "Approved (Ready for Pickup)", status: "approved" as const, count: recoveryCounts.approved },
              { label: "Recovered", status: "recovered" as const, count: recoveryCounts.recovered },
            ].map((row) => (
              <div
                key={row.status}
                className="flex items-center justify-between rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-3.5 py-2.5"
              >
                <StatusBadge status={row.status} size="sm" />
                <span className="text-sm font-bold text-[#142D3B]">
                  {isLoading ? "—" : row.count}
                </span>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {/* Section 2: My Lost Reports & Section 3: My Found Reports */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E7EBE8] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#E7EBE8] pb-4">
            <h2 className="text-base font-bold text-[#142D3B]">
              My Lost Reports
            </h2>
            <Link
              href="/report/lost"
              className="text-xs font-semibold text-[#1F6B50] hover:text-[#142D3B]"
            >
              + Report Lost
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-4 h-28 animate-pulse rounded-xl bg-[#F7F8F5]" />
          ) : myLostReports.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-[#142D3B]">
                No lost reports submitted
              </p>
              <p className="mt-1 text-xs text-[#7B858B]">
                Misplaced something on campus? Log it so others can help.
              </p>
              <Link
                href="/report/lost"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-4 py-2 text-xs font-semibold text-[#142D3B] hover:bg-white"
              >
                Report Lost Item
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#E7EBE8]">
              {myLostReports.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/items/${item.id}`}
                      className="truncate text-sm font-semibold text-[#142D3B] hover:text-[#1F6B50]"
                    >
                      {item.title}
                    </Link>
                    <p className="truncate text-xs text-[#7B858B]">
                      {item.location} &middot; {item.date}
                    </p>
                  </div>
                  <StatusBadge status={item.lifecycleState} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#E7EBE8] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#E7EBE8] pb-4">
            <h2 className="text-base font-bold text-[#142D3B]">
              My Found Reports
            </h2>
            <Link
              href="/report/found"
              className="text-xs font-semibold text-[#1F6B50] hover:text-[#142D3B]"
            >
              + Report Found
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-4 h-28 animate-pulse rounded-xl bg-[#F7F8F5]" />
          ) : myFoundReports.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-[#142D3B]">
                No found reports submitted
              </p>
              <p className="mt-1 text-xs text-[#7B858B]">
                Found a belonging on campus? Help reunite it with its owner.
              </p>
              <Link
                href="/report/found"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-4 py-2 text-xs font-semibold text-[#142D3B] hover:bg-white"
              >
                Report Found Item
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#E7EBE8]">
              {myFoundReports.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/items/${item.id}`}
                      className="truncate text-sm font-semibold text-[#142D3B] hover:text-[#1F6B50]"
                    >
                      {item.title}
                    </Link>
                    <p className="truncate text-xs text-[#7B858B]">
                      {item.location} &middot; {item.date}
                    </p>
                  </div>
                  <StatusBadge status={item.lifecycleState} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Section 4: My Claim Requests & Section 6: Recent Activity */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E7EBE8] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#E7EBE8] pb-4">
            <h2 className="text-base font-bold text-[#142D3B]">
              My Claim Requests
            </h2>
            <Link
              href="/found"
              className="text-xs font-semibold text-[#1F6B50] hover:text-[#142D3B]"
            >
              Browse Found Items &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-4 h-28 animate-pulse rounded-xl bg-[#F7F8F5]" />
          ) : myClaims.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-[#142D3B]">
                No claim requests yet
              </p>
              <p className="mt-1 text-xs text-[#7B858B]">
                Spot your belonging in Found Items and click Request Claim.
              </p>
              <Link
                href="/found"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-4 py-2 text-xs font-semibold text-[#142D3B] hover:bg-white"
              >
                Explore Found Items
              </Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#E7EBE8]">
              {myClaims.map((claim) => (
                <li
                  key={claim.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/items/${claim.itemId}`}
                      className="truncate text-sm font-semibold text-[#142D3B] hover:text-[#1F6B50]"
                    >
                      {itemTitleById.get(claim.itemId) || claim.itemId}
                    </Link>
                    <p className="font-mono text-[11px] text-[#7B858B]">
                      {claim.id} &middot; Submitted {claim.createdAt.slice(0, 10)}
                    </p>
                  </div>
                  <StatusBadge status={claim.status} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#E7EBE8] bg-white p-6">
          <div className="flex items-center justify-between border-b border-[#E7EBE8] pb-4">
            <h2 className="text-base font-bold text-[#142D3B]">
              Recent Activity
            </h2>
            <Activity className="h-4 w-4 text-[#1F6B50]" />
          </div>

          {isLoading ? (
            <div className="mt-4 h-28 animate-pulse rounded-xl bg-[#F7F8F5]" />
          ) : recentActivity.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-[#142D3B]">
                No recent activity
              </p>
              <p className="mt-1 text-xs text-[#7B858B]">
                Your reports, claims, and recovery updates will appear here.
              </p>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-[#E7EBE8]">
              {recentActivity.map((event) => (
                <li
                  key={event.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={event.href}
                      className="truncate text-sm font-medium text-[#142D3B] hover:text-[#1F6B50]"
                    >
                      {event.label}
                    </Link>
                    <p className="text-xs text-[#7B858B]">{event.meta}</p>
                  </div>
                  <StatusBadge status={event.status} size="sm" />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
