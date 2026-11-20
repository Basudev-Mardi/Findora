const dotenv = require("dotenv");

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const databaseUrl = process.env.DATABASE_URL?.trim() || "";
const requestedMode = (process.env.DATA_MODE || "").trim().toLowerCase();
const dataMode =
  requestedMode === "postgres" && databaseUrl ? "postgres" : "demo";

// Never fall back to a default demo admin key in production.
const configuredAdminKey = process.env.ADMIN_API_KEY?.trim() || "";
const adminApiKey =
  configuredAdminKey ||
  (nodeEnv === "production" ? "" : "findora-admin-demo-key");

const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  databaseUrl,
  dataMode,
  adminApiKey,
};

module.exports = { env };
