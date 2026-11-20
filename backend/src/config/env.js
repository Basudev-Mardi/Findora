const dotenv = require("dotenv");

dotenv.config();

function normalizeDatabaseUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  let value = raw.trim();
  // Strip accidental `psql ` prefix copied from Neon dashboard
  if (value.toLowerCase().startsWith("psql ")) {
    value = value.slice(5).trim();
  }
  // Strip accidental wrapping single or double quotes
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV || "development";
const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
const requestedMode = (process.env.DATA_MODE || "").trim().toLowerCase();
const dataMode =
  requestedMode === "postgres" && databaseUrl ? "postgres" : "demo";

const configuredAdminKey = process.env.ADMIN_API_KEY?.trim() || "";
const adminApiKey = configuredAdminKey || "findora-admin-demo-key";

const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  databaseUrl,
  dataMode,
  adminApiKey,
};

module.exports = { env };
