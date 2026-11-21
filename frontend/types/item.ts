export type ItemStatus = "lost" | "found";

export type ItemLifecycleState =
  | "available"
  | "claim_requested"
  | "under_verification"
  | "approved"
  | "recovered"
  | "rejected";

export type ItemSortOrder = "newest" | "oldest";

export type DateRangeFilter = "all" | "today" | "3d" | "7d" | "30d";

export interface LostFoundItem {
  id: string;
  userId?: string | null;
  title: string;
  category: string;
  campusZone: string;
  location: string;
  date: string;
  reportedAt: string; // ISO YYYY-MM-DD for sorting & date filtering
  status: ItemStatus;
  lifecycleState: ItemLifecycleState;
  shortDescription: string;
  fullDescription: string;
  handoffNote?: string;
  image: string;
  imageAlt: string;
}

export interface ItemFilterParams {
  status: ItemStatus;
  query?: string;
  category?: string;
  campusZone?: string;
  dateRange?: DateRangeFilter;
  sortOrder?: ItemSortOrder;
  limit?: number;
}

export interface StatMetric {
  label: string;
  value: string;
  detail: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
