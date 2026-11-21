import { apiClient, ApiClientError } from "@/services/api";
import type {
  BackendFoundItem,
  BackendItemListResponse,
  BackendItemStatus,
  BackendLostItem,
} from "@/types/api";
import type {
  DateRangeFilter,
  ItemFilterParams,
  ItemLifecycleState,
  ItemStatus,
  LostFoundItem,
} from "@/types/item";

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Electronics: "/images/default electronics.jpeg",
  Wallets: "/images/default wallets.jpeg",
  Bags: "/images/default bag.jpg",
  "ID & Cards": "/images/default id card.jpg",
  Keys: "/images/default keys.jpeg",
  Accessories: "/images/default accessories.jpeg",
  Personal: "/images/default personal.jpg",
  Stationery: "/images/default starionary.jpg",
  Other: "/images/default others .jpg",
};

const DEFAULT_FALLBACK_IMAGE = "/images/default others .jpg";

function formatDisplayDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function normalizeLifecycleState(status: BackendItemStatus): ItemLifecycleState {
  switch (status) {
    case "claim_requested":
    case "under_verification":
    case "approved":
    case "recovered":
      return status;
    default:
      return "available";
  }
}

function mapLostItem(raw: BackendLostItem): LostFoundItem {
  const image =
    raw.imageUrl ||
    CATEGORY_FALLBACK_IMAGES[raw.category] ||
    DEFAULT_FALLBACK_IMAGE;
  return {
    id: raw.id,
    userId: raw.userId,
    title: raw.title,
    category: raw.category,
    campusZone: raw.campusZone,
    location: raw.location,
    date: formatDisplayDate(raw.dateLost),
    reportedAt: raw.dateLost,
    status: "lost",
    lifecycleState: normalizeLifecycleState(raw.status),
    shortDescription: raw.publicDescription,
    fullDescription: raw.publicDescription,
    image,
    imageAlt: `${raw.title} reported lost near ${raw.campusZone}`,
  };
}

function mapFoundItem(raw: BackendFoundItem): LostFoundItem {
  const image =
    raw.imageUrl ||
    CATEGORY_FALLBACK_IMAGES[raw.category] ||
    DEFAULT_FALLBACK_IMAGE;
  return {
    id: raw.id,
    userId: raw.userId,
    title: raw.title,
    category: raw.category,
    campusZone: raw.campusZone,
    location: raw.location,
    date: formatDisplayDate(raw.dateFound),
    reportedAt: raw.dateFound,
    status: "found",
    lifecycleState: normalizeLifecycleState(raw.status),
    shortDescription: raw.publicDescription,
    fullDescription: raw.publicDescription,
    handoffNote: raw.additionalNotes ?? undefined,
    image,
    imageAlt: `${raw.title} found near ${raw.campusZone}`,
  };
}

function computeDateFrom(range?: DateRangeFilter): string | undefined {
  if (!range || range === "all") return undefined;
  const now = new Date();
  const days =
    range === "today" ? 0 : range === "3d" ? 3 : range === "7d" ? 7 : 30;
  now.setUTCDate(now.getUTCDate() - days);
  return now.toISOString().slice(0, 10);
}

function buildFilterQuery(params: ItemFilterParams): string {
  const searchParams = new URLSearchParams();
  if (params.query?.trim()) searchParams.set("search", params.query.trim());
  if (params.category && params.category !== "all") {
    searchParams.set("category", params.category);
  }
  if (params.campusZone && params.campusZone !== "all") {
    searchParams.set("location", params.campusZone);
  }
  const dateFrom = computeDateFrom(params.dateRange);
  if (dateFrom) searchParams.set("dateFrom", dateFrom);
  if (params.sortOrder) searchParams.set("sort", params.sortOrder);
  if (params.limit) searchParams.set("limit", String(params.limit));

  const qs = searchParams.toString();
  return qs ? `?${qs}` : "";
}

export const itemsService = {
  async list(
    params: ItemFilterParams,
    signal?: AbortSignal
  ): Promise<LostFoundItem[]> {
    const query = buildFilterQuery(params);

    if (params.status === "found") {
      const res = await apiClient.get<BackendItemListResponse<BackendFoundItem>>(
        `/found-items${query}`,
        { signal }
      );
      return res.data.items.map(mapFoundItem);
    }

    const res = await apiClient.get<BackendItemListResponse<BackendLostItem>>(
      `/lost-items${query}`,
      { signal }
    );
    return res.data.items.map(mapLostItem);
  },

  async getById(
    id: string,
    hintStatus?: ItemStatus,
    signal?: AbortSignal
  ): Promise<LostFoundItem | null> {
    const inferredStatus: ItemStatus =
      hintStatus ?? (id.startsWith("found-") ? "found" : "lost");
    const tryOrder: ItemStatus[] =
      inferredStatus === "found" ? ["found", "lost"] : ["lost", "found"];

    for (const status of tryOrder) {
      try {
        if (status === "found") {
          const res = await apiClient.get<BackendFoundItem>(
            `/found-items/${encodeURIComponent(id)}`,
            { signal }
          );
          return mapFoundItem(res.data);
        } else {
          const res = await apiClient.get<BackendLostItem>(
            `/lost-items/${encodeURIComponent(id)}`,
            { signal }
          );
          return mapLostItem(res.data);
        }
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 404) {
          continue;
        }
        throw error;
      }
    }

    return null;
  },

  async getRelated(
    item: LostFoundItem,
    limit = 4,
    signal?: AbortSignal
  ): Promise<LostFoundItem[]> {
    const items = await this.list(
      { status: item.status, sortOrder: "newest" },
      signal
    );
    return items.filter((candidate) => candidate.id !== item.id).slice(0, limit);
  },
};
