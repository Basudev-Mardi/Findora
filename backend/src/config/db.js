const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");
const { env } = require("./env");

let pool = null;
let schemaInitPromise = null;

if (env.dataMode === "postgres" && env.databaseUrl) {
  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
}

// Optional test override for simulating PostgreSQL mode/errors cleanly in unit tests.
let testOverride = null;

function setDatabaseTestOverride(override) {
  testOverride = override;
}

function isDemoMode() {
  if (testOverride && typeof testOverride.isDemoMode === "boolean") {
    return testOverride.isDemoMode;
  }
  return env.dataMode === "demo" || !pool;
}

/**
 * Ensures PostgreSQL tables exist on first serverless cold start so a fresh
 * Neon database works out of the box without manual SQL setup.
 */
async function ensurePostgresSchema() {
  if (!pool || testOverride) return;
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      const schemaSql = fs.readFileSync(
        path.join(__dirname, "../db/schema.sql"),
        "utf8"
      );
      await pool.query(schemaSql);
    })().catch((err) => {
      schemaInitPromise = null;
      throw err;
    });
  }
  return schemaInitPromise;
}

async function query(text, params = []) {
  if (testOverride && typeof testOverride.query === "function") {
    return testOverride.query(text, params);
  }
  if (!pool) {
    throw new Error("Database pool is not initialized (running in demo mode).");
  }
  await ensurePostgresSchema();
  return pool.query(text, params);
}

async function checkDatabaseConnection() {
  if (isDemoMode()) {
    return { mode: "demo", connected: true };
  }

  try {
    await query("SELECT 1");
    return { mode: "postgres", connected: true };
  } catch (error) {
    return {
      mode: "postgres",
      connected: false,
      errorCode: error.code || "DB_CONNECTION_ERROR",
    };
  }
}

module.exports = {
  pool,
  query,
  isDemoMode,
  checkDatabaseConnection,
  setDatabaseTestOverride,
};
