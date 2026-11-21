"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  X,
} from "lucide-react";
import { itemsService } from "@/services/itemsService";
import { readClientCache, writeClientCache } from "@/utils/clientCache";
import { CAMPUS_ZONES, REPORT_CATEGORIES } from "@/utils/reportValidation";
import type {
  DateRangeFilter,
  ItemSortOrder,
  ItemStatus,
  LostFoundItem,
} from "@/types/item";
import { CatalogItemCard } from "./CatalogItemCard";
import { ItemGridSkeleton } from "./ItemGridSkeleton";

interface ItemsCatalogViewProps {
  status: ItemStatus;
  eyebrow: string;
  title: string;
  description: string;
}

const DATE_RANGE_OPTIONS: { value: DateRangeFilter; label: string }[] = [
  { value: "all", label: "Any Date" },
  { value: "today", label: "Today" },
  { value: "3d", label: "Last 3 Days" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

export function ItemsCatalogView({
  status,
  eyebrow,
  title,
  description,
}: ItemsCatalogViewProps) {
  const isFound = status === "found";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [campusZone, setCampusZone] = useState("all");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("all");
  const [sortOrder, setSortOrder] = useState<ItemSortOrder>("newest");

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Debounce search text to avoid firing a request on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 250);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    const isDefaultView =
      !debouncedQuery.trim() &&
      category === "all" &&
      campusZone === "all" &&
      dateRange === "all" &&
      sortOrder === "newest";
    const cacheKey = `findora_cache_catalog_${status}`;

    async function load() {
      if (isDefaultView) {
        const cached = readClientCache<LostFoundItem[]>(cacheKey);
        if (cached) {
          await Promise.resolve();
          if (!controller.signal.aborted) {
            setItems(cached);
            setIsLoading(false);
          }
        }
      }

      try {
        const result = await itemsService.list(
          {
            status,
            query: debouncedQuery,
            category,
            campusZone,
            dateRange,
            sortOrder,
          },
          controller.signal
        );
        if (!controller.signal.aborted) {
          setItems(result);
          setErrorMessage(null);
          if (isDefaultView) {
            writeClientCache(cacheKey, result);
          }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setItems([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load campus items from the server."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => controller.abort();
  }, [status, debouncedQuery, category, campusZone, dateRange, sortOrder, refreshKey]);

  const activeFilterCount =
    (query.trim() ? 1 : 0) +
    (category !== "all" ? 1 : 0) +
    (campusZone !== "all" ? 1 : 0) +
    (dateRange !== "all" ? 1 : 0) +
    (sortOrder !== "newest" ? 1 : 0);

  function handleClearFilters() {
    setQuery("");
    setDebouncedQuery("");
    setCategory("all");
    setCampusZone("all");
    setDateRange("all");
    setSortOrder("newest");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      {/* Editorial Page Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#E7EBE8] pb-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1F6B50]">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#142D3B] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#7B858B] sm:text-base">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={isFound ? "/lost" : "/found"}
            className="inline-flex items-center justify-center rounded-xl border border-[#E7EBE8] bg-white px-4 py-2.5 text-sm font-semibold text-[#142D3B] transition-colors hover:border-[#142D3B]/30 hover:bg-[#F7F8F5]"
          >
            Browse {isFound ? "Lost" : "Found"} Items
          </Link>
          <Link
            href={isFound ? "/report/found" : "/report/lost"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#142D3B] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50]"
          >
            <Plus className="h-4 w-4 text-[#C9FD04]" />
            Report {isFound ? "Found" : "Lost"} Item
          </Link>
        </div>
      </div>

      {/* Privacy Notice on Found Items */}
      {isFound && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#1F6B50]/20 bg-[#1F6B50]/[0.05] px-4 py-3.5 text-xs text-[#142D3B] sm:items-center sm:text-sm">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1F6B50] sm:mt-0" />
          <p>
            <span className="font-semibold">Privacy protected:</span>{" "}
            Identifying details (such as ID numbers, serial codes, or inner
            contents) are intentionally withheld on found listings until
            ownership is verified.
          </p>
        </div>
      )}

      {/* Search & Filter Controls */}
      <section
        aria-label="Search and filter items"
        className="mt-8 rounded-2xl border border-[#E7EBE8] bg-white p-4 shadow-[0_1px_2px_rgba(20,45,59,0.03)] sm:p-5"
      >
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Search Input */}
          <div className="relative lg:col-span-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7B858B]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${isFound ? "found" : "lost"} items by name or description...`}
              aria-label="Search items by name or description"
              className="h-11 w-full rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] pl-10 pr-9 text-sm text-[#202B32] placeholder:text-[#7B858B] transition-colors focus:border-[#1F6B50] focus:bg-white focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-[#7B858B] hover:bg-[#E7EBE8]/60 hover:text-[#142D3B]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative lg:col-span-2">
            <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7B858B]" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
              className="h-11 w-full appearance-none rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] pl-9 pr-8 text-sm font-medium text-[#202B32] transition-colors focus:border-[#1F6B50] focus:bg-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              {REPORT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="relative lg:col-span-2">
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7B858B]" />
            <select
              value={campusZone}
              onChange={(e) => setCampusZone(e.target.value)}
              aria-label="Filter by campus location"
              className="h-11 w-full appearance-none rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] pl-9 pr-8 text-sm font-medium text-[#202B32] transition-colors focus:border-[#1F6B50] focus:bg-white focus:outline-none"
            >
              <option value="all">All Locations</option>
              {CAMPUS_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative lg:col-span-2">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7B858B]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeFilter)}
              aria-label="Filter by date"
              className="h-11 w-full appearance-none rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] pl-9 pr-8 text-sm font-medium text-[#202B32] transition-colors focus:border-[#1F6B50] focus:bg-white focus:outline-none"
            >
              {DATE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Filter */}
          <div className="relative lg:col-span-2">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7B858B]" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as ItemSortOrder)}
              aria-label="Sort items by date"
              className="h-11 w-full appearance-none rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] pl-9 pr-8 text-sm font-medium text-[#202B32] transition-colors focus:border-[#1F6B50] focus:bg-white focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Results Meta & Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#E7EBE8] pt-3.5 text-xs text-[#7B858B]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#1F6B50]" />
            <span>
              Showing{" "}
              <strong className="font-semibold text-[#142D3B]">
                {items.length}
              </strong>{" "}
              {items.length === 1 ? "item" : "items"}
            </span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-[#1F6B50]/10 px-2 py-0.5 font-semibold text-[#1F6B50]">
                {activeFilterCount} active{" "}
                {activeFilterCount === 1 ? "filter" : "filters"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold text-[#7B858B] transition-colors hover:bg-[#F7F8F5] hover:text-[#142D3B] disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold text-[#142D3B] transition-colors hover:bg-[#F7F8F5] hover:text-[#1F6B50]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Catalog Grid / Skeleton / Error / Empty State */}
      <section className="mt-8" aria-label={`${title} listing`}>
        {isLoading ? (
          <ItemGridSkeleton count={8} />
        ) : errorMessage ? (
          <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-white px-6 py-16 text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-100">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#142D3B]">
              Unable to load {isFound ? "found" : "lost"} items
            </h2>
            <p className="mt-2 max-w-md text-sm text-[#7B858B]">
              {errorMessage}
            </p>
            <button
              type="button"
              onClick={() => setRefreshKey((k) => k + 1)}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#142D3B] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50]"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#D3DCD6] bg-white px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F8F5] text-[#1F6B50] border border-[#E7EBE8]">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-[#142D3B]">
              No matching {isFound ? "found" : "lost"} items
            </h2>
            <p className="mt-2 max-w-md text-sm text-[#7B858B]">
              We couldn&apos;t find any listings matching your current search or
              filter criteria. Try broadening your filters or clearing them to
              see all campus listings.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#142D3B] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1F6B50]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear All Filters
                </button>
              )}
              <Link
                href={isFound ? "/report/found" : "/report/lost"}
                className="inline-flex items-center gap-2 rounded-xl border border-[#E7EBE8] bg-[#F7F8F5] px-5 py-2.5 text-sm font-semibold text-[#142D3B] transition-colors hover:bg-white"
              >
                Report an Item
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <CatalogItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
