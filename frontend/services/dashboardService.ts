import { apiClient } from "@/services/api";
import type { DashboardStats } from "@/types/api";

export const dashboardService = {
  async getStats(signal?: AbortSignal): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>("/dashboard/stats", {
      signal,
    });
    return res.data;
  },
};
