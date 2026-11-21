const crypto = require("crypto");
const { AppError } = require("./AppError");

const ALLOWED_ITEM_STATUSES = [
  "available",
  "claim_requested",
  "under_verification",
  "approved",
  "recovered",
  "archived",
];

const DEFAULT_CATEGORY_IMAGES = {
  electronics: "/images/default electronics.jpeg",
  wallets: "/images/default wallets.jpeg",
  bags: "/images/default bag.jpg",
  "id & cards": "/images/default id card.jpg",
  keys: "/images/default keys.jpeg",
  accessories: "/images/default accessories.jpeg",
  personal: "/images/default personal.jpg",
  stationery: "/images/default starionary.jpg",
  other: "/images/default others .jpg",
};

function getDefaultCategoryImage(category) {
  const key = String(category || "").trim().toLowerCase();
  return DEFAULT_CATEGORY_IMAGES[key] || "/images/default others .jpg";
}

const ALLOWED_CLAIM_STATUSES = [
  "claim_requested",
  "under_verification",
  "approved",
  "recovered",
  "rejected",
];

const ACTIVE_CLAIM_STATUSES = [
  "claim_requested",
  "under_verification",
  "approved",
];

const SENSITIVE_NUMBER_PATTERN = /\b\d{9,}\b/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeText(value, maxLength = 600) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function sanitizeOptionalText(value, maxLength = 400) {
  if (value === undefined || value === null) return null;
  const cleaned = sanitizeText(String(value), maxLength);
  return cleaned.length > 0 ? cleaned : null;
}

function computeSubmissionHash(parts) {
  const normalized = parts
    .map((part) => String(part || "").trim().toLowerCase())
    .join("|");
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

function isValidIsoDate(dateStr) {
  if (!ISO_DATE_PATTERN.test(dateStr)) return false;
  const parsed = new Date(`${dateStr}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(dateStr);
}

/**
 * Allows up to UTC+14 (earliest timezone on Earth) so a user selecting
 * "today" in their local timezone (e.g. IST UTC+5:30) is never falsely
 * rejected as a future date when UTC is still the previous calendar day.
 */
function getMaxAllowedIsoDate() {
  const maxDate = new Date(Date.now() + 14 * 60 * 60 * 1000);
  return maxDate.toISOString().slice(0, 10);
}

function validateItemPayload(payload, itemType, { partial = false } = {}) {
  if (!payload || typeof payload !== "object") {
    throw new AppError("Request body must be a JSON object.", 400);
  }

  const isFound = itemType === "found";
  const dateField = isFound ? "dateFound" : "dateLost";
  const errors = {};
  const data = {};

  if (!partial || payload.title !== undefined) {
    const title = sanitizeText(payload.title, 100);
    if (!title || title.length < 3) {
      errors.title = "Item title must be at least 3 characters.";
    } else {
      data.title = title;
    }
  }

  if (!partial || payload.category !== undefined) {
    const category = sanitizeText(payload.category, 50);
    if (!category) {
      errors.category = "Category is required.";
    } else {
      data.category = category;
    }
  }

  if (!partial || payload.campusZone !== undefined) {
    const campusZone = sanitizeText(payload.campusZone, 80);
    if (!campusZone) {
      errors.campusZone = "Campus zone is required.";
    } else {
      data.campusZone = campusZone;
    }
  }

  if (!partial || payload.location !== undefined) {
    const location = sanitizeText(payload.location, 160);
    if (!location || location.length < 3) {
      errors.location = "Location must be at least 3 characters.";
    } else {
      data.location = location;
    }
  }

  const rawDate = payload[dateField] ?? payload.incidentDate;
  if (!partial || rawDate !== undefined) {
    const dateValue = sanitizeText(rawDate, 20);
    if (!isValidIsoDate(dateValue)) {
      errors[dateField] = `${dateField} must be a valid YYYY-MM-DD date.`;
    } else {
      if (dateValue > getMaxAllowedIsoDate()) {
        errors[dateField] = `${dateField} cannot be in the future.`;
      } else {
        data[dateField] = dateValue;
      }
    }
  }

  const rawDesc = payload.publicDescription ?? payload.description;
  if (!partial || rawDesc !== undefined) {
    const publicDescription = sanitizeText(rawDesc, 600);
    if (!publicDescription || publicDescription.length < 15) {
      errors.publicDescription = "Description must be at least 15 characters.";
    } else if (SENSITIVE_NUMBER_PATTERN.test(publicDescription)) {
      errors.publicDescription =
        "Do not include full ID, card, or phone numbers in the public description.";
    } else {
      data.publicDescription = publicDescription;
    }
  }

  if (payload.status !== undefined) {
    const status = sanitizeText(payload.status, 30).toLowerCase();
    if (!ALLOWED_ITEM_STATUSES.includes(status)) {
      errors.status = `Status must be one of: ${ALLOWED_ITEM_STATUSES.join(", ")}.`;
    } else {
      data.status = status;
    }
  }

  if (payload.imageUrl !== undefined) {
    data.imageUrl = sanitizeOptionalText(payload.imageUrl, 10_000_000);
  }

  if (payload.userId !== undefined) {
    data.userId = sanitizeOptionalText(payload.userId, 80);
  }

  if (isFound) {
    if (payload.privateVerificationDetails !== undefined) {
      data.privateVerificationDetails = sanitizeOptionalText(
        payload.privateVerificationDetails,
        400
      );
    }
    if (payload.additionalNotes !== undefined) {
      data.additionalNotes = sanitizeOptionalText(payload.additionalNotes, 400);
    }
  } else if (payload.privateIdentifyingDetails !== undefined) {
    data.privateIdentifyingDetails = sanitizeOptionalText(
      payload.privateIdentifyingDetails,
      400
    );
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed.", 400, errors);
  }

  if (partial && Object.keys(data).length === 0) {
    throw new AppError("At least one valid field must be provided for update.", 400);
  }

  return data;
}

function validateClaimPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new AppError("Request body must be a JSON object.", 400);
  }

  const errors = {};
  const itemType = sanitizeText(payload.itemType || "found", 10).toLowerCase();
  const itemId = sanitizeText(payload.itemId, 80);
  const claimantName = sanitizeText(payload.claimantName, 120);
  const claimantUserId = sanitizeOptionalText(payload.claimantUserId, 80);
  const rawEmail = sanitizeOptionalText(payload.claimantEmail, 180);
  const claimantEmail = rawEmail ? rawEmail.toLowerCase() : null;
  const approximateDateLost = sanitizeText(payload.approximateDateLost, 20);
  const locationLost = sanitizeText(payload.locationLost, 160);
  const verificationDetails = sanitizeText(payload.verificationDetails, 600);
  const additionalExplanation = sanitizeOptionalText(
    payload.additionalExplanation,
    400
  );

  if (itemType !== "lost" && itemType !== "found") {
    errors.itemType = "itemType must be either 'lost' or 'found'.";
  }
  if (!itemId) {
    errors.itemId = "itemId is required.";
  }
  if (!claimantName || claimantName.length < 2) {
    errors.claimantName =
      "Claimant name or demo user ID must be at least 2 characters.";
  }
  if (claimantEmail && !EMAIL_PATTERN.test(claimantEmail)) {
    errors.claimantEmail = "Provide a valid campus email address.";
  }
  if (!isValidIsoDate(approximateDateLost)) {
    errors.approximateDateLost =
      "Approximate date lost must be a valid YYYY-MM-DD date.";
  } else if (approximateDateLost > getMaxAllowedIsoDate()) {
    errors.approximateDateLost = "Approximate date lost cannot be in the future.";
  }
  if (!locationLost || locationLost.length < 3) {
    errors.locationLost =
      "Location where the item was lost must be at least 3 characters.";
  }
  if (!verificationDetails || verificationDetails.length < 10) {
    errors.verificationDetails =
      "Private ownership verification answer must be at least 10 characters.";
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError("Claim validation failed.", 400, errors);
  }

  return {
    itemType,
    itemId,
    claimantUserId,
    claimantName,
    claimantEmail,
    approximateDateLost,
    locationLost,
    verificationDetails,
    additionalExplanation,
  };
}

function validateClaimStatusPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new AppError("Request body must be a JSON object.", 400);
  }

  const status = sanitizeText(payload.status, 30).toLowerCase();
  const reviewerNotes = sanitizeOptionalText(payload.reviewerNotes, 400);
  const handoverConfirmed = Boolean(payload.handoverConfirmed);

  if (!ALLOWED_CLAIM_STATUSES.includes(status)) {
    throw new AppError("Invalid claim status.", 400, {
      status: `Status must be one of: ${ALLOWED_CLAIM_STATUSES.join(", ")}.`,
    });
  }

  if (status === "recovered" && !handoverConfirmed) {
    throw new AppError(
      "Physical handover must be explicitly confirmed before marking an item as Recovered.",
      400,
      { handoverConfirmed: "Set handoverConfirmed to true to confirm physical handover." }
    );
  }

  return { status, reviewerNotes, handoverConfirmed };
}

function parseListFilters(query = {}) {
  const search = sanitizeText(query.search || query.q || "", 100);
  const category = sanitizeText(query.category || "", 50);
  const location = sanitizeText(query.location || query.campusZone || "", 80);
  const status = sanitizeText(query.status || "", 30).toLowerCase();
  const dateFrom = sanitizeText(query.dateFrom || "", 20);
  const dateTo = sanitizeText(query.dateTo || "", 20);
  const sort = sanitizeText(query.sort || "newest", 10).toLowerCase();
  const rawLimit = Number(query.limit);
  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : null;

  if (dateFrom && !isValidIsoDate(dateFrom)) {
    throw new AppError("Invalid dateFrom filter. Expected YYYY-MM-DD.", 400);
  }
  if (dateTo && !isValidIsoDate(dateTo)) {
    throw new AppError("Invalid dateTo filter. Expected YYYY-MM-DD.", 400);
  }
  if (status && !ALLOWED_ITEM_STATUSES.includes(status)) {
    throw new AppError(
      `Invalid status filter. Expected one of: ${ALLOWED_ITEM_STATUSES.join(", ")}.`,
      400
    );
  }

  return {
    search,
    category: category && category.toLowerCase() !== "all" ? category : "",
    location: location && location.toLowerCase() !== "all" ? location : "",
    status,
    dateFrom,
    dateTo,
    sort: sort === "oldest" ? "oldest" : "newest",
    limit,
  };
}

module.exports = {
  ALLOWED_ITEM_STATUSES,
  ALLOWED_CLAIM_STATUSES,
  ACTIVE_CLAIM_STATUSES,
  getDefaultCategoryImage,
  sanitizeText,
  sanitizeOptionalText,
  computeSubmissionHash,
  validateItemPayload,
  validateClaimPayload,
  validateClaimStatusPayload,
  parseListFilters,
};
