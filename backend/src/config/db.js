const { Pool } = require("pg");
const { env } = require("./env");

let pool = null;

if (env.dataMode === "postgres" && env.databaseUrl) {
  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: { rejectUnauthorized: false },
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

async function query(text, params = []) {
  if (testOverride && typeof testOverride.query === "function") {
    return testOverride.query(text, params);
  }
  if (!pool) {
    throw new Error("Database pool is not initialized (running in demo mode).");
  }
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
    return { mode: "postgres", connected: false, error: error.message };
  }
}

module.exports = {
  pool,
  query,
  isDemoMode,
  checkDatabaseConnection,
  setDatabaseTestOverride,
};
