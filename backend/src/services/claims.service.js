const { claimsModel } = require("../models/claims.model");
const { lostItemsModel } = require("../models/lostItems.model");
const { foundItemsModel } = require("../models/foundItems.model");
const { AppError } = require("../utils/AppError");
const {
  ALLOWED_CLAIM_STATUSES,
  sanitizeText,
  validateClaimPayload,
  validateClaimStatusPayload,
} = require("../utils/validators");

const claimsService = {
  async listPublic(queryParams = {}) {
    const status = sanitizeText(queryParams.status || "", 30).toLowerCase();
    const itemType = sanitizeText(queryParams.itemType || "", 10).toLowerCase();
    const itemId = sanitizeText(queryParams.itemId || "", 80);
    const claimantUserId = sanitizeText(queryParams.claimantUserId || "", 80);

    if (status && !ALLOWED_CLAIM_STATUSES.includes(status)) {
      throw new AppError(
        `Invalid status filter. Expected one of: ${ALLOWED_CLAIM_STATUSES.join(", ")}.`,
        400
      );
    }
    if (itemType && itemType !== "lost" && itemType !== "found") {
      throw new AppError(
        "Invalid itemType filter. Expected 'lost' or 'found'.",
        400
      );
    }

    return claimsModel.findAllPublic({
      status,
      itemType,
      itemId,
      claimantUserId,
    });
  },

  async listForAdmin(queryParams = {}) {
    const status = sanitizeText(queryParams.status || "", 30).toLowerCase();
    const itemType = sanitizeText(queryParams.itemType || "", 10).toLowerCase();

    if (status && !ALLOWED_CLAIM_STATUSES.includes(status)) {
      throw new AppError(
        `Invalid status filter. Expected one of: ${ALLOWED_CLAIM_STATUSES.join(", ")}.`,
        400
      );
    }
    if (itemType && itemType !== "lost" && itemType !== "found") {
      throw new AppError(
        "Invalid itemType filter. Expected 'lost' or 'found'.",
        400
      );
    }

    const claims = await claimsModel.findAllAdmin({ status, itemType });

    // Enrich each admin claim with referenced item summary & private clues for verification.
    const enriched = await Promise.all(
      claims.map(async (claim) => {
        const targetModel =
          claim.itemType === "found" ? foundItemsModel : lostItemsModel;
        const item = await targetModel.findPrivateById(claim.itemId);

        return {
          ...claim,
          itemSummary: item
            ? {
                id: item.id,
                title: item.title,
                category: item.category,
                campusZone: item.campusZone,
                location: item.location,
                status: item.status,
                imageUrl: item.imageUrl,
                privateClues:
                  item.privateVerificationDetails ??
                  item.privateIdentifyingDetails ??
                  null,
              }
            : null,
        };
      })
    );

    return enriched;
  },

  async getByIdPublic(id) {
    const claim = await claimsModel.findByIdPublic(id);
    if (!claim) {
      throw new AppError(`Claim '${id}' not found.`, 404);
    }
    return claim;
  },

  async create(payload) {
    const validated = validateClaimPayload(payload);
    const targetModel =
      validated.itemType === "found" ? foundItemsModel : lostItemsModel;

    const targetItem = await targetModel.findById(validated.itemId);
    if (!targetItem) {
      throw new AppError(
        `Referenced ${validated.itemType} item '${validated.itemId}' not found.`,
        404
      );
    }

    if (targetItem.status === "recovered") {
      throw new AppError(
        "This item has already been recovered and cannot accept new claims.",
        409
      );
    }

    // Never auto-approve: every new claim starts at 'claim_requested'.
    const createdClaim = await claimsModel.create(validated);

    if (targetItem.status === "available") {
      await targetModel.updateStatus(validated.itemId, "claim_requested");
    }

    return createdClaim;
  },

  async updateStatus(id, payload) {
    const validated = validateClaimStatusPayload(payload);
    const existing = await claimsModel.findByIdAdmin(id);
    if (!existing) {
      throw new AppError(`Claim '${id}' not found.`, 404);
    }

    // Enforce physical handover workflow: only an Approved claim can be marked Recovered.
    if (validated.status === "recovered" && existing.status !== "approved") {
      throw new AppError(
        "A claim must be approved by an administrator before confirming physical handover and marking as Recovered.",
        400
      );
    }

    if (existing.status === "recovered" && validated.status !== "recovered") {
      throw new AppError(
        "A recovered claim cannot be transitioned back to another status.",
        409
      );
    }

    const updated = await claimsModel.updateStatus(id, validated);
    const targetModel =
      updated.itemType === "found" ? foundItemsModel : lostItemsModel;

    if (validated.status === "under_verification") {
      await targetModel.updateStatus(updated.itemId, "under_verification");
    } else if (validated.status === "approved") {
      await targetModel.updateStatus(updated.itemId, "approved");
    } else if (validated.status === "recovered") {
      await targetModel.updateStatus(updated.itemId, "recovered");
    } else if (validated.status === "rejected") {
      const otherActive = await claimsModel.hasOtherActiveClaims(
        updated.itemType,
        updated.itemId,
        updated.id
      );
      if (!otherActive) {
        await targetModel.updateStatus(updated.itemId, "available");
      }
    }

    return updated;
  },
};

module.exports = { claimsService };
