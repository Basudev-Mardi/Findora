const { checkDatabaseConnection } = require("../config/db");
const { sendSuccess } = require("../utils/apiResponse");

async function getHealth(_req, res, next) {
  try {
    const database = await checkDatabaseConnection();

    return sendSuccess(res, {
      status: "ok",
      service: "findora-backend",
      mode: database.mode,
      databaseConnected: database.connected,
      ...(database.errorCode ? { databaseErrorCode: database.errorCode } : {}),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getHealth };
