const { lostItemsService } = require("../services/lostItems.service");
const { sendSuccess } = require("../utils/apiResponse");

const lostItemsController = {
  async list(req, res, next) {
    try {
      const items = await lostItemsService.list(req.query);
      return sendSuccess(res, { items, total: items.length });
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const item = await lostItemsService.getById(req.params.id);
      return sendSuccess(res, item);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const created = await lostItemsService.create(req.body);
      return sendSuccess(res, created, "Lost item reported successfully.", 201);
    } catch (error) {
      return next(error);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await lostItemsService.update(req.params.id, req.body);
      return sendSuccess(res, updated, "Lost item updated successfully.");
    } catch (error) {
      return next(error);
    }
  },

  async remove(req, res, next) {
    try {
      const result = await lostItemsService.remove(req.params.id);
      return sendSuccess(res, result, "Lost item deleted successfully.");
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = { lostItemsController };
