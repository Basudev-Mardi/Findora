import { apiClient } from "@/services/api";
import type { DashboardStats } from "@/types/api";

let inflightStatsPromise: Promise<DashboardStats> | null = null;

export const dashboardService = {
  /**
   * Deduplicates simultaneous dashboard stats requests (e.g. HeroLiveBadge
   * and HomeLiveContent mounting together) so only one API request is sent.
   */
  async getStats(signal?: AbortSignal): Promise<DashboardStats> {
    if (!inflightStatsPromise) {
      inflightStatsPromise = apiClient
        .get<DashboardStats>("/dashboard/stats")
        .then((res) => res.data)
        .finally(() => {
          inflightStatsPromise = null;
        });
    }

    const result = await inflightStatsPromise;
    if (signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    return result;
  },
};
