const { isDemoMode, query } = require("../config/db");
const { demoStore } = require("./demoStore");

function buildBreakdown(items, key) {
  const counts = {};
  for (const item of items) {
    const value = item[key] || "Other";
    counts[value] = (counts[value] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function computeReturnHours(createdAt, updatedAt) {
  const start = new Date(createdAt).getTime();
  const end = new Date(updatedAt).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 1;
  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
}

const CLAIM_ACTIVITY_STATUSES = [
  "recovered",
  "approved",
  "under_verification",
  "claim_requested",
];

const dashboardModel = {
  async getStats() {
    if (isDemoMode()) {
      const allItems = [...demoStore.lostItems, ...demoStore.foundItems];
      const totalLostItems = demoStore.lostItems.length;
      const totalFoundItems = demoStore.foundItems.length;
      const itemsReported = totalLostItems + totalFoundItems;
      const itemsRecovered = allItems.filter(
        (item) => item.status === "recovered"
      ).length;
      const activeListings = allItems.filter(
        (item) => item.status !== "recovered" && item.status !== "archived"
      ).length;
      const pendingClaims = demoStore.claims.filter(
        (claim) =>
          claim.status === "claim_requested" ||
          claim.status === "under_verification"
      ).length;
      const approvedClaims = demoStore.claims.filter(
        (claim) => claim.status === "approved"
      ).length;
      const resolvedClaims = demoStore.claims.filter(
        (claim) => claim.status === "recovered"
      ).length;

      const latestActivityItem = allItems
        .filter((item) => CLAIM_ACTIVITY_STATUSES.includes(item.status))
        .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))[0];

      const latestReunited = latestActivityItem
        ? {
            id: latestActivityItem.id,
            title: latestActivityItem.title,
            campusZone: latestActivityItem.campusZone,
            status: latestActivityItem.status,
            returnedInHours: computeReturnHours(
              latestActivityItem.createdAt,
              latestActivityItem.updatedAt
            ),
            updatedAt: latestActivityItem.updatedAt,
          }
        : null;

      return {
        mode: "demo",
        itemsReported,
        totalLostItems,
        totalFoundItems,
        itemsRecovered,
        activeListings,
        pendingClaims,
        approvedClaims,
        resolvedClaims,
        activeCommunityMembers: demoStore.users.length,
        recoveryRate:
          itemsReported > 0
            ? Number(((itemsRecovered / itemsReported) * 100).toFixed(1))
            : 0,
        latestReunited,
        categoryBreakdown: buildBreakdown(allItems, "category"),
        zoneBreakdown: buildBreakdown(allItems, "campusZone"),
      };
    }

    const [lostRes, foundRes, claimsRes, usersRes, catRes, zoneRes, latestRes] =
      await Promise.all([
        query(
          `SELECT COUNT(*)::int AS total,
                  COUNT(*) FILTER (WHERE status = 'recovered')::int AS recovered,
                  COUNT(*) FILTER (WHERE status NOT IN ('recovered', 'archived'))::int AS active
           FROM lost_items`
        ),
        query(
          `SELECT COUNT(*)::int AS total,
                  COUNT(*) FILTER (WHERE status = 'recovered')::int AS recovered,
                  COUNT(*) FILTER (WHERE status NOT IN ('recovered', 'archived'))::int AS active
           FROM found_items`
        ),
        query(
          `SELECT COUNT(*) FILTER (WHERE status IN ('claim_requested', 'under_verification'))::int AS pending,
                  COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
                  COUNT(*) FILTER (WHERE status = 'recovered')::int AS resolved
           FROM claims`
        ),
        query(`SELECT COUNT(*)::int AS total FROM users`),
        query(
          `SELECT category AS name, COUNT(*)::int AS count
           FROM (
             SELECT category FROM lost_items
             UNION ALL
             SELECT category FROM found_items
           ) combined
           GROUP BY category
           ORDER BY count DESC`
        ),
        query(
          `SELECT campus_zone AS name, COUNT(*)::int AS count
           FROM (
             SELECT campus_zone FROM lost_items
             UNION ALL
             SELECT campus_zone FROM found_items
           ) combined
           GROUP BY campus_zone
           ORDER BY count DESC`
        ),
        query(
          `SELECT id, title, campus_zone, status, created_at, updated_at
           FROM (
             SELECT id, title, campus_zone, status, created_at, updated_at FROM found_items
             UNION ALL
             SELECT id, title, campus_zone, status, created_at, updated_at FROM lost_items
           ) all_items
           WHERE status IN ('recovered', 'approved', 'under_verification', 'claim_requested')
           ORDER BY updated_at DESC
           LIMIT 1`
        ),
      ]);

    const totalLostItems = lostRes.rows[0].total;
    const totalFoundItems = foundRes.rows[0].total;
    const itemsReported = totalLostItems + totalFoundItems;
    const itemsRecovered =
      lostRes.rows[0].recovered + foundRes.rows[0].recovered;
    const activeListings = lostRes.rows[0].active + foundRes.rows[0].active;

    const latestRow = latestRes.rows[0];
    const latestReunited = latestRow
      ? {
          id: latestRow.id,
          title: latestRow.title,
          campusZone: latestRow.campus_zone,
          status: latestRow.status,
          returnedInHours: computeReturnHours(
            latestRow.created_at,
            latestRow.updated_at
          ),
          updatedAt:
            latestRow.updated_at instanceof Date
              ? latestRow.updated_at.toISOString()
              : String(latestRow.updated_at),
        }
      : null;

    return {
      mode: "postgres",
      itemsReported,
      totalLostItems,
      totalFoundItems,
      itemsRecovered,
      activeListings,
      pendingClaims: claimsRes.rows[0].pending,
      approvedClaims: claimsRes.rows[0].approved,
      resolvedClaims: claimsRes.rows[0].resolved,
      activeCommunityMembers: usersRes.rows[0].total,
      recoveryRate:
        itemsReported > 0
          ? Number(((itemsRecovered / itemsReported) * 100).toFixed(1))
          : 0,
      latestReunited,
      categoryBreakdown: catRes.rows,
      zoneBreakdown: zoneRes.rows,
    };
  },
};

module.exports = { dashboardModel };
