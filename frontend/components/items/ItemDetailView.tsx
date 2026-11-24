"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Hash,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import { claimsService } from "@/services/claimsService";
import { itemsService, type PotentialMatch } from "@/services/itemsService";
import type { PublicClaimSummary } from "@/types/api";
import type { LostFoundItem } from "@/types/item";
import { CatalogItemCard } from "./CatalogItemCard";
import { ItemDetailActions } from "./ItemDetailActions";
import { StatusBadge } from "./StatusBadge";

interface ItemDetailViewProps {
  id: string;
  initialAction?: string;
  adminContext?: {
    from?: string;
  };
}

const ADMIN_ORIGIN_MAP: Record<
  string,
  { href: string; label: string; section: string }
> = {
  "lost-items": {
    href: "/admin/lost-items",
    label: "Back to Lost Items",
    section: "Lost Items",
  },
  "found-items": {
    href: "/admin/found-items",
    label: "Back to Found Items",
    section: "Found Items",
  },
  claims: {
    href: "/admin/claims",
    label: "Back to Claim Requests",
    section: "Claim Requests",
  },
  recovered: {
    href: "/admin/recovered",
    label: "Back to Recovered Items",
    section: "Recovered Items",
  },
};

export function ItemDetailView({
  id,
  initialAction,
  adminContext,
}: ItemDetailViewProps) {
  const isAdmin = Boolean(adminContext);
  const originEntry = adminContext?.from
    ? ADMIN_ORIGIN_MAP[adminContext.from]
    : undefined;
  const containerClass = isAdmin
    ? "mx-auto max-w-7xl"
    : "mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12";
  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [itemClaims, setItemClaims] = useState<PublicClaimSummary[]>([]);
  const [potentialMatches, setPotentialMatches] = useState<PotentialMatch[]>([]);
  const [relatedItems, setRelatedItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const fetched = await itemsService.getById(
          id,
          undefined,
          controller.signal
        );
        if (controller.signal.aborted) return;

        if (!fetched) {
          setItem(null);
          setNotFoundState(true);
          setErrorMessage(null);
          return;
        }

        setItem(fetched);
        setNotFoundState(false);
        setErrorMessage(null);

        const [claimsResult, matchesResult, relatedResult] =
          await Promise.allSettled([
            claimsService.listPublic({ itemId: fetched.id }, controller.signal),
            itemsService.getPotentialMatches(fetched, 4, controller.signal),
            itemsService.getRelated(fetched, 4, controller.signal),
          ]);

        if (!controller.signal.aborted) {
          setItemClaims(
            claimsResult.status === "fulfilled" ? claimsResult.value : []
          );
          setPotentialMatches(
            matchesResult.status === "fulfilled" ? matchesResult.value : []
          );
          setRelatedItems(
            relatedResult.status === "fulfilled" ? relatedResult.value : []
          );
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load item details from the server."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [id, refreshTick]);

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className="h-9 w-40 animate-pulse rounded-xl bg-[#E7EBE8]" />
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="aspect-[4/3] w-full animate-pulse rounded-3xl bg-[#E7EBE8]" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-[460px] animate-pulse rounded-3xl border border-[#E7EBE8] bg-white p-8" />
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border border-red-200 bg-white p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-[#142D3B]">
            Could not load item details
          </h1>
          <p className="mt-2 text-sm text-[#7B858B]">{errorMessage}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setRefreshTick((t) => t + 1)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#142D3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1F6B50]"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <Link
              href={isAdmin ? (originEntry?.href ?? "/admin") : "/lost"}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E7EBE8] px-5 py-2.5 text-sm font-semibold text-[#142D3B] hover:bg-[#F7F8F5]"
            >
              {isAdmin ? (originEntry?.label ?? "Back to Admin") : "Back to Listings"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (notFoundState || !item) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-3xl border border-[#E7EBE8] bg-white p-10">
          <h1 className="text-2xl font-bold text-[#142D3B]">Item Not Found</h1>
          <p className="mt-2 text-sm text-[#7B858B]">
            The listing you&apos;re looking for may have been removed or the
            reference ID is invalid.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href={isAdmin ? "/admin/lost-items" : "/lost"}
              className="rounded-xl bg-[#142D3B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1F6B50]"
            >
              Browse Lost Items
            </Link>
            <Link
              href={isAdmin ? "/admin/found-items" : "/found"}
              className="rounded-xl border border-[#E7EBE8] px-5 py-2.5 text-sm font-semibold text-[#142D3B] hover:bg-[#F7F8F5]"
            >
              Browse Found Items
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isFound = item.status === "found";
  const defaultAdminHref = isFound ? "/admin/found-items" : "/admin/lost-items";
  const defaultAdminLabel = isFound ? "Back to Found Items" : "Back to Lost Items";
  const backHref = isAdmin
    ? (originEntry?.href ?? defaultAdminHref)
    : isFound
      ? "/found"
      : "/lost";
  const backLabel = isAdmin
    ? (originEntry?.label ?? defaultAdminLabel)
    : isFound
      ? "Back to Found Items"
      : "Back to Lost Items";
  const oppositeBrowseHref = isAdmin
    ? isFound
      ? "/admin/lost-items"
      : "/admin/found-items"
    : isFound
      ? "/lost"
      : "/found";
  const sameBrowseHref = isAdmin ? defaultAdminHref : isFound ? "/found" : "/lost";

  return (
    <div className={containerClass}>
      {/* Breadcrumb / Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 rounded-xl border border-[#E7EBE8] bg-white px-3.5 py-2 text-xs font-semibold text-[#142D3B] transition-colors hover:border-[#142D3B]/30 hover:bg-[#142D3B] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7B858B]">
          <Hash className="h-3.5 w-3.5" />
          Ref: {item.id.toUpperCase()}
        </span>
      </div>

      {/* Primary Detail Card */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-[#E7EBE8] bg-[#ECEFE9] shadow-[0_12px_36px_rgba(20,45,59,0.08)]">
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              priority
              unoptimized={item.image.startsWith("data:")}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur-md ${
                  isFound
                    ? "bg-[#1F6B50]/92 text-white"
                    : "bg-[#142D3B]/92 text-[#C9FD04]"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#C9FD04]" />
                {isFound ? "Found Item" : "Lost Item"}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-3xl border border-[#E7EBE8] bg-white p-6 shadow-[0_1px_3px_rgba(20,45,59,0.04)] sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E7EBE8] bg-[#F7F8F5] px-3 py-1 text-xs font-semibold text-[#202B32]">
                <Tag className="h-3 w-3 text-[#1F6B50]" />
                {item.category}
              </span>
              <StatusBadge status={item.lifecycleState} size="md" />
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#142D3B] sm:text-3xl">
              {item.title}
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-[#202B32]/85 sm:text-base">
              {item.fullDescription}
            </p>

            <dl className="mt-6 space-y-3 rounded-2xl border border-[#E7EBE8] bg-[#F7F8F5] p-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#1F6B50]" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#7B858B]">
                    Campus Zone
                  </dt>
                  <dd className="font-semibold text-[#142D3B]">
                    {item.campusZone}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1F6B50]" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#7B858B]">
                    {isFound ? "Found Location" : "Last Seen Location"}
                  </dt>
                  <dd className="font-semibold text-[#142D3B]">
                    {item.location}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-[#1F6B50]" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#7B858B]">
                    {isFound ? "Date Found" : "Date Reported"}
                  </dt>
                  <dd className="font-semibold text-[#142D3B]">{item.date}</dd>
                </div>
              </div>
            </dl>

            {/* Public Claim Status Tracker (No Private Details Exposed) */}
            {itemClaims.length > 0 && (
              <div className="mt-5 rounded-2xl border border-[#E7EBE8] bg-[#F7F8F5] p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#142D3B]">
                  <Clock className="h-3.5 w-3.5 text-[#1F6B50]" />
                  Claim Activity ({itemClaims.length})
                </div>
                <ul className="mt-2.5 space-y-2">
                  {itemClaims.slice(0, 3).map((claim) => (
                    <li
                      key={claim.id}
                      className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2 text-xs border border-[#E7EBE8]"
                    >
                      <span className="font-mono text-[11px] text-[#7B858B]">
                        {claim.id}
                      </span>
                      <StatusBadge status={claim.status} size="sm" />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isFound && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#1F6B50]/20 bg-[#1F6B50]/[0.05] p-4 text-xs leading-relaxed text-[#142D3B]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1F6B50]" />
                <div>
                  <p className="font-semibold">
                    Ownership Verification Protected
                  </p>
                  <p className="mt-0.5 text-[#202B32]/80">
                    Private identifying details are intentionally omitted.{" "}
                    {item.handoffNote ||
                      "Physical handover is confirmed by a campus administrator after verification."}
                  </p>
                </div>
              </div>
            )}

            {isFound && (
              <div className="mt-6">
                <ItemDetailActions
                  itemId={item.id}
                  itemTitle={item.title}
                  status={item.status}
                  isRecovered={item.lifecycleState === "recovered"}
                  initialOpen={initialAction === "claim"}
                  onClaimSuccess={() => setRefreshTick((t) => t + 1)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Potential Opposite-Type Matches */}
      {potentialMatches.length > 0 && (
        <section className="mt-14 border-t border-[#E7EBE8] pt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[#1F6B50]">
                <Sparkles className="h-3.5 w-3.5" />
                Smart Campus Matching
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#142D3B]">
                Potential {isFound ? "Lost" : "Found"} Matches
              </h2>
              <p className="mt-1 text-xs text-[#7B858B] sm:text-sm">
                Opposite-type campus listings matched by category, location,
                date proximity, and keywords.
              </p>
            </div>
            <Link
              href={oppositeBrowseHref}
              className="text-sm font-semibold text-[#1F6B50] hover:text-[#142D3B]"
            >
              Browse all {isFound ? "lost" : "found"} &rarr;
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {potentialMatches.map((match) => (
              <div key={match.item.id} className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1.5 px-1">
                  <span className="rounded-full bg-[#142D3B] px-2.5 py-0.5 text-[11px] font-bold text-[#C9FD04]">
                    {match.matchScore}% Match
                  </span>
                  {match.matchReasons.slice(0, 2).map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full border border-[#E7EBE8] bg-white px-2 py-0.5 text-[10px] font-medium text-[#202B32]"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
                <CatalogItemCard
                  item={match.item}
                  detailBasePath={isAdmin ? "/admin/items" : undefined}
                  detailQuery={
                    isAdmin
                      ? `from=${match.item.status === "found" ? "found-items" : "lost-items"}`
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <section className="mt-16 border-t border-[#E7EBE8] pt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F6B50]">
                Keep Browsing
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#142D3B]">
                More {isFound ? "Found" : "Lost"} Items on Campus
              </h2>
            </div>
            <Link
              href={sameBrowseHref}
              className="text-sm font-semibold text-[#1F6B50] hover:text-[#142D3B]"
            >
              View all &rarr;
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedItems.map((related) => (
              <CatalogItemCard
                key={related.id}
                item={related}
                detailBasePath={isAdmin ? "/admin/items" : undefined}
                detailQuery={
                  isAdmin
                    ? `from=${related.status === "found" ? "found-items" : "lost-items"}`
                    : undefined
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
