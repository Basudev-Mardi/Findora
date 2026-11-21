const fs = require("fs");
const path = require("path");
const { Pool, Client } = require("pg");
const { attachDatabasePool } = require("@vercel/functions");
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

  try {
    attachDatabasePool(pool);
  } catch {
    // No-op outside Vercel Fluid compute runtime
  }
}

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
 * Lazily initializes PostgreSQL tables over the direct (unpooled) connection
 * only if a query reports missing tables (SQLSTATE 42P01), avoiding an extra
 * connection round-trip on every serverless cold start.
 */
async function ensurePostgresSchema() {
  if (!pool || testOverride) return;
  if (!schemaInitPromise) {
    schemaInitPromise = (async () => {
      const schemaSql = fs.readFileSync(
        path.join(__dirname, "../db/schema.sql"),
        "utf8"
      );
      const directClient = new Client({
        connectionString: env.databaseUrlUnpooled || env.databaseUrl,
        ssl: { rejectUnauthorized: false },
      });
      await directClient.connect();
      try {
        await directClient.query(schemaSql);
      } finally {
        await directClient.end();
      }
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

  try {
    return await pool.query(text, params);
  } catch (error) {
    if (error && error.code === "42P01") {
      await ensurePostgresSchema();
      return pool.query(text, params);
    }
    throw error;
  }
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
  ensurePostgresSchema,
  checkDatabaseConnection,
  setDatabaseTestOverride,
};
