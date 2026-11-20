const { dashboardModel } = require("../models/dashboard.model");

const dashboardService = {
  async getStats() {
    return dashboardModel.getStats();
  },
};

module.exports = { dashboardService };
