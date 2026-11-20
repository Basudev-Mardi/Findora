const crypto = require("crypto");
const { isDemoMode, query } = require("../config/db");
const { demoStore } = require("./demoStore");
const { AppError } = require("../utils/AppError");
const {
  ACTIVE_CLAIM_STATUSES,
  computeSubmissionHash,
} = require("../utils/validators");

function toIsoDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  return String(val).slice(0, 10);
}

function toIsoTimestamp(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString();
  return String(val);
}

/**
 * Public claim summary — NEVER exposes private verification answers,
 * additional explanations, or claimant contact details.
 */
function toPublicClaim(row) {
  return {
    id: row.id,
    itemType: row.item_type ?? row.itemType,
    itemId:
      row.lost_item_id ??
      row.found_item_id ??
      row.lostItemId ??
      row.foundItemId,
    status: row.status,
    handoverConfirmedAt: toIsoTimestamp(
      row.handover_confirmed_at ?? row.handoverConfirmedAt
    ),
    createdAt: toIsoTimestamp(row.created_at ?? row.createdAt),
    updatedAt: toIsoTimestamp(row.updated_at ?? row.updatedAt),
  };
}

/**
 * Admin-only claim record — includes private verification details for
 * authorized administrator review.
 */
function toAdminClaim(row) {
  return {
    ...toPublicClaim(row),
    claimantUserId: row.claimant_user_id ?? row.claimantUserId ?? null,
    claimantName: row.claimant_name ?? row.claimantName,
    claimantEmail: row.claimant_email ?? row.claimantEmail ?? null,
    approximateDateLost: toIsoDate(
      row.approximate_date_lost ?? row.approximateDateLost
    ),
    locationLost: row.location_lost ?? row.locationLost,
    verificationDetails: row.verification_details ?? row.verificationDetails,
    additionalExplanation:
      row.additional_explanation ?? row.additionalExplanation ?? null,
    reviewerNotes: row.reviewer_notes ?? row.reviewerNotes ?? null,
  };
}

const claimsModel = {
  async findAllPublic(filters = {}) {
    if (isDemoMode()) {
      return demoStore.claims
        .filter((claim) => {
          if (filters.status && claim.status !== filters.status) return false;
          if (filters.itemType && claim.itemType !== filters.itemType) return false;
          const refId = claim.lostItemId || claim.foundItemId;
          if (filters.itemId && refId !== filters.itemId) return false;
          if (
            filters.claimantUserId &&
            claim.claimantUserId !== filters.claimantUserId
          ) {
            return false;
          }
          return true;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(toPublicClaim);
    }

    const conditions = [];
    const params = [];

    if (filters.status) {
      params.push(filters.status);
      conditions.push(`status = $${params.length}`);
    }
    if (filters.itemType) {
      params.push(filters.itemType);
      conditions.push(`item_type = $${params.length}`);
    }
    if (filters.itemId) {
      params.push(filters.itemId);
      const idx = params.length;
      conditions.push(`(lost_item_id = $${idx} OR found_item_id = $${idx})`);
    }
    if (filters.claimantUserId) {
      params.push(filters.claimantUserId);
      conditions.push(`claimant_user_id = $${params.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await query(
      `SELECT id, item_type, lost_item_id, found_item_id, status,
              handover_confirmed_at, created_at, updated_at
       FROM claims
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );
    return result.rows.map(toPublicClaim);
  },

  async findAllAdmin(filters = {}) {
    if (isDemoMode()) {
      return demoStore.claims
        .filter((claim) => {
          if (filters.status && claim.status !== filters.status) return false;
          if (filters.itemType && claim.itemType !== filters.itemType) return false;
          return true;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map(toAdminClaim);
    }

    const conditions = [];
    const params = [];

    if (filters.status) {
      params.push(filters.status);
      conditions.push(`status = $${params.length}`);
    }
    if (filters.itemType) {
      params.push(filters.itemType);
      conditions.push(`item_type = $${params.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await query(
      `SELECT id, item_type, lost_item_id, found_item_id, claimant_user_id,
              claimant_name, claimant_email, approximate_date_lost,
              location_lost, verification_details, additional_explanation,
              status, reviewer_notes, handover_confirmed_at, created_at, updated_at
       FROM claims
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );
    return result.rows.map(toAdminClaim);
  },

  async findByIdPublic(id) {
    if (isDemoMode()) {
      const found = demoStore.claims.find((claim) => claim.id === id);
      return found ? toPublicClaim(found) : null;
    }

    const result = await query(
      `SELECT id, item_type, lost_item_id, found_item_id, status,
              handover_confirmed_at, created_at, updated_at
       FROM claims
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? toPublicClaim(result.rows[0]) : null;
  },

  async findByIdAdmin(id) {
    if (isDemoMode()) {
      const found = demoStore.claims.find((claim) => claim.id === id);
      return found ? toAdminClaim(found) : null;
    }

    const result = await query(
      `SELECT id, item_type, lost_item_id, found_item_id, claimant_user_id,
              claimant_name, claimant_email, approximate_date_lost,
              location_lost, verification_details, additional_explanation,
              status, reviewer_notes, handover_confirmed_at, created_at, updated_at
       FROM claims
       WHERE id = $1`,
      [id]
    );
    return result.rows[0] ? toAdminClaim(result.rows[0]) : null;
  },

  async create(data) {
    const id = `clm-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const lostItemId = data.itemType === "lost" ? data.itemId : null;
    const foundItemId = data.itemType === "found" ? data.itemId : null;
    const claimantIdentity =
      data.claimantEmail || data.claimantUserId || data.claimantName;

    const submissionHash = computeSubmissionHash([
      "claim",
      data.itemType,
      data.itemId,
      claimantIdentity,
    ]);

    if (isDemoMode()) {
      const duplicateActive = demoStore.claims.find(
        (claim) =>
          claim.submissionHash === submissionHash &&
          ACTIVE_CLAIM_STATUSES.includes(claim.status)
      );
      if (duplicateActive) {
        throw new AppError(
          "An active claim for this item has already been submitted by this claimant.",
          409
        );
      }

      const record = {
        id,
        itemType: data.itemType,
        lostItemId,
        foundItemId,
        claimantUserId: data.claimantUserId ?? null,
        claimantName: data.claimantName,
        claimantEmail: data.claimantEmail ?? null,
        approximateDateLost: data.approximateDateLost,
        locationLost: data.locationLost,
        verificationDetails: data.verificationDetails,
        additionalExplanation: data.additionalExplanation ?? null,
        status: "claim_requested",
        reviewerNotes: null,
        handoverConfirmedAt: null,
        submissionHash,
        createdAt: now,
        updatedAt: now,
      };
      demoStore.claims.unshift(record);
      return toPublicClaim(record);
    }

    const dupCheck = await query(
      `SELECT id FROM claims
       WHERE submission_hash = $1
         AND status = ANY($2::text[])
       LIMIT 1`,
      [submissionHash, ACTIVE_CLAIM_STATUSES]
    );
    if (dupCheck.rows.length > 0) {
      throw new AppError(
        "An active claim for this item has already been submitted by this claimant.",
        409
      );
    }

    const result = await query(
      `INSERT INTO claims (
         id, item_type, lost_item_id, found_item_id, claimant_user_id,
         claimant_name, claimant_email, approximate_date_lost, location_lost,
         verification_details, additional_explanation, status, reviewer_notes,
         handover_confirmed_at, submission_hash, created_at, updated_at
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'claim_requested',NULL,NULL,$12,$13,$14)
       RETURNING id, item_type, lost_item_id, found_item_id, status,
                 handover_confirmed_at, created_at, updated_at`,
      [
        id,
        data.itemType,
        lostItemId,
        foundItemId,
        data.claimantUserId ?? null,
        data.claimantName,
        data.claimantEmail ?? null,
        data.approximateDateLost,
        data.locationLost,
        data.verificationDetails,
        data.additionalExplanation ?? null,
        submissionHash,
        now,
        now,
      ]
    );
    return toPublicClaim(result.rows[0]);
  },

  async updateStatus(id, { status, reviewerNotes, handoverConfirmed }) {
    const now = new Date().toISOString();
    const handoverTimestamp =
      status === "recovered" && handoverConfirmed ? now : null;

    if (isDemoMode()) {
      const claim = demoStore.claims.find((entry) => entry.id === id);
      if (!claim) return null;
      claim.status = status;
      if (reviewerNotes !== undefined && reviewerNotes !== null) {
        claim.reviewerNotes = reviewerNotes;
      }
      if (handoverTimestamp) {
        claim.handoverConfirmedAt = handoverTimestamp;
      }
      claim.updatedAt = now;
      return toAdminClaim(claim);
    }

    const result = await query(
      `UPDATE claims
       SET status = $1,
           reviewer_notes = COALESCE($2, reviewer_notes),
           handover_confirmed_at = COALESCE($3, handover_confirmed_at),
           updated_at = $4
       WHERE id = $5
       RETURNING id, item_type, lost_item_id, found_item_id, claimant_user_id,
                 claimant_name, claimant_email, approximate_date_lost,
                 location_lost, verification_details, additional_explanation,
                 status, reviewer_notes, handover_confirmed_at, created_at, updated_at`,
      [status, reviewerNotes ?? null, handoverTimestamp, now, id]
    );
    return result.rows[0] ? toAdminClaim(result.rows[0]) : null;
  },

  async hasOtherActiveClaims(itemType, itemId, excludeClaimId) {
    if (isDemoMode()) {
      return demoStore.claims.some((claim) => {
        const refId = claim.lostItemId || claim.foundItemId;
        return (
          claim.id !== excludeClaimId &&
          claim.itemType === itemType &&
          refId === itemId &&
          ACTIVE_CLAIM_STATUSES.includes(claim.status)
        );
      });
    }

    const column = itemType === "lost" ? "lost_item_id" : "found_item_id";
    const result = await query(
      `SELECT id FROM claims
       WHERE ${column} = $1
         AND id <> $2
         AND status = ANY($3::text[])
       LIMIT 1`,
      [itemId, excludeClaimId, ACTIVE_CLAIM_STATUSES]
    );
    return result.rows.length > 0;
  },
};

module.exports = { claimsModel };
