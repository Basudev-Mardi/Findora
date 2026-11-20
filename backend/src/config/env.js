const dotenv = require("dotenv");

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const databaseUrl = process.env.DATABASE_URL?.trim() || "";
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
