const { lostItemsModel } = require("../models/lostItems.model");
const { AppError } = require("../utils/AppError");
const {
  parseListFilters,
  validateItemPayload,
} = require("../utils/validators");

const lostItemsService = {
  async list(queryParams) {
    const filters = parseListFilters(queryParams);
    return lostItemsModel.findAll(filters);
  },

  async getById(id) {
    const item = await lostItemsModel.findById(id);
    if (!item) {
      throw new AppError(`Lost item '${id}' not found.`, 404);
    }
    return item;
  },

  async create(payload) {
    const validated = validateItemPayload(payload, "lost");
    return lostItemsModel.create(validated);
  },

  async update(id, payload) {
    const validated = validateItemPayload(payload, "lost", { partial: true });
    const updated = await lostItemsModel.update(id, validated);
    if (!updated) {
      throw new AppError(`Lost item '${id}' not found.`, 404);
    }
    return updated;
  },

  async remove(id) {
    const deleted = await lostItemsModel.remove(id);
    if (!deleted) {
      throw new AppError(`Lost item '${id}' not found.`, 404);
    }
    return { id, deleted: true };
  },
};

module.exports = { lostItemsService };
