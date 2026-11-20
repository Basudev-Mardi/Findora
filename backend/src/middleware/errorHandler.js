const { sendError } = require("../utils/apiResponse");

function notFoundHandler(req, res) {
  return sendError(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

function errorHandler(err, _req, res, _next) {
  // Malformed JSON payload from express.json()
  if (err && err.type === "entity.parse.failed") {
    return sendError(res, "Malformed JSON in request body.", 400);
  }

  // PostgreSQL error code mapping
  if (err && err.code) {
    if (err.code === "23505") {
      return sendError(
        res,
        "A duplicate record with these details already exists.",
        409
      );
    }
    if (err.code === "23503") {
      return sendError(res, "Referenced record does not exist.", 400);
    }
    if (err.code === "22P02" || err.code === "23514") {
      return sendError(res, "Invalid input data format.", 400);
    }
    if (
      err.code === "ECONNREFUSED" ||
      err.code === "ENOTFOUND" ||
      err.code === "57P01" ||
      err.code === "08006"
    ) {
      return sendError(
        res,
        "Database service is temporarily unavailable.",
        503
      );
    }
  }

  if (err && err.isOperational) {
    return sendError(res, err.message, err.statusCode || 400, err.details ?? null);
  }

  const statusCode = err?.statusCode || 500;
  const message =
    statusCode >= 500
      ? "Internal server error."
      : err?.message || "Request failed.";

  return sendError(res, message, statusCode);
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
