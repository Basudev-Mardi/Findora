const dotenv = require("dotenv");

dotenv.config();

const databaseUrl = process.env.DATABASE_URL?.trim() || "";
const requestedMode = (process.env.DATA_MODE || "").trim().toLowerCase();
const dataMode =
  requestedMode === "postgres" && databaseUrl ? "postgres" : "demo";

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  databaseUrl,
  dataMode,
  adminApiKey: (process.env.ADMIN_API_KEY || "findora-admin-demo-key").trim(),
};

module.exports = { env };
