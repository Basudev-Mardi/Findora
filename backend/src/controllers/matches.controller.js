const { matchingService } = require("../services/matching.service");
const { sendSuccess } = require("../utils/apiResponse");

const matchesController = {
  async list(req, res, next) {
    try {
      const { itemType, id } = req.params;
      const limit = req.query.limit ? Number(req.query.limit) : 4;
      const result = await matchingService.findPotentialMatches(
        itemType,
        id,
        limit
      );
      return sendSuccess(res, result);
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = { matchesController };
