import { apiClient } from "@/services/api";
import type {
  BackendFoundItem,
  BackendItemStatus,
  BackendLostItem,
} from "@/types/api";
import type { ItemStatus } from "@/types/item";

export const adminItemsService = {
  async updateStatus(
    type: ItemStatus,
    id: string,
    status: BackendItemStatus,
    adminKey: string
  ): Promise<BackendLostItem | BackendFoundItem> {
    const endpoint =
      type === "found"
        ? `/found-items/${encodeURIComponent(id)}`
        : `/lost-items/${encodeURIComponent(id)}`;

    const res = await apiClient.put<BackendLostItem | BackendFoundItem>(
      endpoint,
      { status },
      {
        headers: {
          "x-admin-key": adminKey,
        },
      }
    );
    return res.data;
  },

  async remove(
    type: ItemStatus,
    id: string,
    adminKey: string
  ): Promise<{ id: string; deleted: boolean }> {
    const endpoint =
      type === "found"
        ? `/found-items/${encodeURIComponent(id)}`
        : `/lost-items/${encodeURIComponent(id)}`;

    const res = await apiClient.delete<{ id: string; deleted: boolean }>(
      endpoint,
      {
        headers: {
          "x-admin-key": adminKey,
        },
      }
    );
    return res.data;
  },
};
