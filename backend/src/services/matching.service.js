const { lostItemsModel } = require("../models/lostItems.model");
const { foundItemsModel } = require("../models/foundItems.model");
const { AppError } = require("../utils/AppError");

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "near",
  "that",
  "this",
  "left",
  "found",
  "lost",
  "item",
  "campus",
  "hall",
  "floor",
  "room",
  "desk",
  "table",
  "area",
]);

function extractKeywords(text) {
  return new Set(
    String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 3 && !STOPWORDS.has(word))
  );
}

function getItemDate(item) {
  return item.dateLost || item.dateFound || "";
}

function scoreCandidate(source, candidate) {
  let score = 0;
  const reasons = [];

  if (
    source.category &&
    candidate.category &&
    source.category.toLowerCase() === candidate.category.toLowerCase()
  ) {
    score += 45;
    reasons.push("Same category");
  }

  if (
    source.campusZone &&
    candidate.campusZone &&
    source.campusZone.toLowerCase() === candidate.campusZone.toLowerCase()
  ) {
    score += 25;
    reasons.push("Same campus zone");
  }

  const sourceDate = new Date(`${getItemDate(source)}T12:00:00Z`).getTime();
  const candDate = new Date(`${getItemDate(candidate)}T12:00:00Z`).getTime();
  if (!Number.isNaN(sourceDate) && !Number.isNaN(candDate)) {
    const diffDays = Math.abs(sourceDate - candDate) / (1000 * 60 * 60 * 24);
    if (diffDays <= 3) {
      score += 15;
      reasons.push("Within 3 days");
    } else if (diffDays <= 7) {
      score += 8;
      reasons.push("Within 7 days");
    }
  }

  const sourceKeywords = extractKeywords(
    `${source.title} ${source.publicDescription}`
  );
  const candKeywords = extractKeywords(
    `${candidate.title} ${candidate.publicDescription}`
  );
  const shared = [];
  for (const kw of sourceKeywords) {
    if (candKeywords.has(kw)) shared.push(kw);
  }
  if (shared.length > 0) {
    score += Math.min(30, shared.length * 10);
    reasons.push(`Keyword match (${shared.slice(0, 2).join(", ")})`);
  }

  return {
    matchScore: Math.min(99, score),
    matchReasons: reasons,
  };
}

const matchingService = {
  async findPotentialMatches(itemType, id, limit = 4) {
    const normalizedType = String(itemType || "").toLowerCase();
    if (normalizedType !== "lost" && normalizedType !== "found") {
      throw new AppError("itemType must be 'lost' or 'found'.", 400);
    }

    const sourceModel =
      normalizedType === "lost" ? lostItemsModel : foundItemsModel;
    const oppositeModel =
      normalizedType === "lost" ? foundItemsModel : lostItemsModel;

    const sourceItem = await sourceModel.findById(id);
    if (!sourceItem) {
      throw new AppError(`${normalizedType} item '${id}' not found.`, 404);
    }

    const candidates = await oppositeModel.findAll({
      search: "",
      category: "",
      location: "",
      status: "",
      dateFrom: "",
      dateTo: "",
      sort: "newest",
      limit: null,
    });

    const maxResults = Math.min(Math.max(1, Number(limit) || 4), 10);

    const scored = candidates
      .filter((c) => c.status !== "recovered" && c.status !== "archived")
      .map((candidate) => {
        const { matchScore, matchReasons } = scoreCandidate(
          sourceItem,
          candidate
        );
        return {
          item: candidate,
          matchScore,
          matchReasons,
        };
      })
      .filter((entry) => entry.matchScore >= 30)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, maxResults);

    return {
      sourceId: sourceItem.id,
      sourceType: normalizedType,
      matches: scored,
      total: scored.length,
    };
  },
};

module.exports = { matchingService };
