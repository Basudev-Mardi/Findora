import { apiClient } from "@/services/api";
import type {
  AdminClaimRecord,
  BackendClaimStatus,
  ClaimListResponse,
  PublicClaimSummary,
} from "@/types/api";
import type { ItemStatus } from "@/types/item";

export interface SubmitClaimPayload {
  itemType: ItemStatus;
  itemId: string;
  claimantUserId?: string;
  claimantName: string;
  claimantEmail?: string;
  approximateDateLost: string;
  locationLost: string;
  verificationDetails: string;
  additionalExplanation?: string;
}

export interface UpdateClaimStatusPayload {
  status: BackendClaimStatus;
  reviewerNotes?: string;
  handoverConfirmed?: boolean;
}

export const claimsService = {
  async listPublic(
    filters?: {
      itemId?: string;
      status?: BackendClaimStatus;
      claimantUserId?: string;
    },
    signal?: AbortSignal
  ): Promise<PublicClaimSummary[]> {
    const params = new URLSearchParams();
    if (filters?.itemId) params.set("itemId", filters.itemId);
    if (filters?.status) params.set("status", filters.status);
    if (filters?.claimantUserId) {
      params.set("claimantUserId", filters.claimantUserId);
    }
    const qs = params.toString() ? `?${params.toString()}` : "";

    const res = await apiClient.get<ClaimListResponse<PublicClaimSummary>>(
      `/claims${qs}`,
      { signal }
    );
    return res.data.claims;
  },

  async create(payload: SubmitClaimPayload): Promise<PublicClaimSummary> {
    const res = await apiClient.post<PublicClaimSummary>("/claims", payload);
    return res.data;
  },

  async listForAdmin(
    adminKey: string,
    status?: BackendClaimStatus | "all",
    signal?: AbortSignal
  ): Promise<AdminClaimRecord[]> {
    const qs = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
    const res = await apiClient.get<ClaimListResponse<AdminClaimRecord>>(
      `/claims/admin/review${qs}`,
      {
        signal,
        headers: {
          "x-admin-key": adminKey,
        },
      }
    );
    return res.data.claims;
  },

  async updateStatus(
    claimId: string,
    payload: UpdateClaimStatusPayload,
    adminKey: string
  ): Promise<AdminClaimRecord> {
    const res = await apiClient.patch<AdminClaimRecord>(
      `/claims/${encodeURIComponent(claimId)}/status`,
      payload,
      {
        headers: {
          "x-admin-key": adminKey,
        },
      }
    );
    return res.data;
  },
};
