const { foundItemsService } = require("../services/foundItems.service");
const { sendSuccess } = require("../utils/apiResponse");

const foundItemsController = {
  async list(req, res, next) {
    try {
      const items = await foundItemsService.list(req.query);
      return sendSuccess(res, { items, total: items.length });
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const item = await foundItemsService.getById(req.params.id);
      return sendSuccess(res, item);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const created = await foundItemsService.create(req.body);
      return sendSuccess(res, created, "Found item reported successfully.", 201);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await foundItemsService.update(req.params.id, req.body);
      return sendSuccess(res, updated, "Found item updated successfully.");
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const result = await foundItemsService.remove(req.params.id);
      return sendSuccess(res, result, "Found item deleted successfully.");
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = { foundItemsController };
