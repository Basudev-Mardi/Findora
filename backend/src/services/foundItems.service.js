const { foundItemsModel } = require("../models/foundItems.model");
const { AppError } = require("../utils/AppError");
const {
  parseListFilters,
  validateItemPayload,
} = require("../utils/validators");

const foundItemsService = {
  async list(queryParams) {
    const filters = parseListFilters(queryParams);
    return foundItemsModel.findAll(filters);
  },

  async getById(id) {
    const item = await foundItemsModel.findById(id);
    if (!item) {
      throw new AppError(`Found item '${id}' not found.`, 404);
    }
    return item;
  },

  async create(payload) {
    const validated = validateItemPayload(payload, "found");
    return foundItemsModel.create(validated);
  },

  async update(id, payload) {
    const validated = validateItemPayload(payload, "found", { partial: true });
    const updated = await foundItemsModel.update(id, validated);
    if (!updated) {
      throw new AppError(`Found item '${id}' not found.`, 404);
    }
    return updated;
  },

  async remove(id) {
    const deleted = await foundItemsModel.remove(id);
    if (!deleted) {
      throw new AppError(`Found item '${id}' not found.`, 404);
    }
    return { id, deleted: true };
  },
};

module.exports = { foundItemsService };
