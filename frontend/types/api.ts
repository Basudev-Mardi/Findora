export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  details?: Record<string, string> | null;
}

export interface HealthStatus {
  status: string;
  service: string;
  mode: "demo" | "postgres";
  databaseConnected: boolean;
  timestamp: string;
}

export type BackendItemStatus =
  | "available"
  | "claim_requested"
  | "under_verification"
  | "approved"
  | "recovered"
  | "archived";

export type BackendClaimStatus =
  | "claim_requested"
  | "under_verification"
  | "approved"
  | "recovered"
  | "rejected";

export interface BackendLostItem {
  id: string;
  itemType: "lost";
  userId: string | null;
  title: string;
  category: string;
  campusZone: string;
  location: string;
  dateLost: string;
  publicDescription: string;
  imageUrl: string | null;
  status: BackendItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BackendFoundItem {
  id: string;
  itemType: "found";
  userId: string | null;
  title: string;
  category: string;
  campusZone: string;
  location: string;
  dateFound: string;
  publicDescription: string;
  additionalNotes: string | null;
  imageUrl: string | null;
  status: BackendItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BackendItemListResponse<T> {
  items: T[];
  total: number;
}

export interface PublicClaimSummary {
  id: string;
  itemType: "lost" | "found";
  itemId: string;
  status: BackendClaimStatus;
  handoverConfirmedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminClaimItemSummary {
  id: string;
  title: string;
  category: string;
  campusZone: string;
  location: string;
  status: BackendItemStatus;
  imageUrl: string | null;
  privateClues: string | null;
}

export interface AdminClaimRecord extends PublicClaimSummary {
  claimantUserId: string | null;
  claimantName: string;
  claimantEmail: string | null;
  approximateDateLost: string;
  locationLost: string;
  verificationDetails: string;
  additionalExplanation: string | null;
  reviewerNotes: string | null;
  itemSummary: AdminClaimItemSummary | null;
}

export interface ClaimListResponse<T> {
  claims: T[];
  total: number;
}

export interface DashboardBreakdownEntry {
  name: string;
  count: number;
}

export interface DashboardStats {
  mode: "demo" | "postgres";
  itemsReported: number;
  totalLostItems: number;
  totalFoundItems: number;
  itemsRecovered: number;
  activeListings: number;
  pendingClaims: number;
  approvedClaims: number;
  resolvedClaims: number;
  activeCommunityMembers: number;
  recoveryRate: number;
  categoryBreakdown: DashboardBreakdownEntry[];
  zoneBreakdown: DashboardBreakdownEntry[];
}
