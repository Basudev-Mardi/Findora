const crypto = require("crypto");
const { env } = require("../config/env");
const { AppError } = require("../utils/AppError");

function safeEqual(a, b) {
  const bufA = Buffer.from(String(a || ""), "utf8");
  const bufB = Buffer.from(String(b || ""), "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Restricts claim review, approval, rejection, and handover confirmation
 * to authorized administrators via the x-admin-key header.
 */
function requireAdmin(req, _res, next) {
  const providedKey = req.headers["x-admin-key"];

  if (!providedKey || typeof providedKey !== "string" || !providedKey.trim()) {
    return next(
      new AppError(
        "Administrator authorization required. Provide a valid x-admin-key header.",
        401
      )
    );
  }

  if (!safeEqual(providedKey.trim(), env.adminApiKey)) {
    return next(
      new AppError(
        "Forbidden: invalid administrator credentials.",
        403
      )
    );
  }

  return next();
}

module.exports = { requireAdmin };
