const { dashboardService } = require("../services/dashboard.service");
const { sendSuccess } = require("../utils/apiResponse");

const dashboardController = {
  async getStats(_req, res, next) {
    try {
      const stats = await dashboardService.getStats();
      return sendSuccess(res, stats);
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = { dashboardController };
