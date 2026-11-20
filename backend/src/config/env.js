const path = require("path");
const dotenv = require("dotenv");

// Load backend/.env first, then root .env.local (populated by `neon deploy`)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

function normalizeDatabaseUrl(raw) {
  if (!raw || typeof raw !== "string") return "";
  let value = raw.trim();
  if (value.toLowerCase().startsWith("psql ")) {
    value = value.slice(5).trim();
  }
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
const databaseUrlUnpooled =
  normalizeDatabaseUrl(process.env.DATABASE_URL_UNPOOLED) || databaseUrl;
const requestedMode = (process.env.DATA_MODE || "").trim().toLowerCase();

// Use Neon PostgreSQL whenever DATABASE_URL is configured, unless DATA_MODE=demo is explicitly set.
const dataMode =
  databaseUrl && requestedMode !== "demo" ? "postgres" : "demo";

const configuredAdminKey = process.env.ADMIN_API_KEY?.trim() || "";
const adminApiKey = configuredAdminKey || "findora-admin-demo-key";

const env = {
  nodeEnv,
  port: Number(process.env.PORT) || 5000,
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  databaseUrl,
  databaseUrlUnpooled,
  dataMode,
  adminApiKey,
};

module.exports = { env };
