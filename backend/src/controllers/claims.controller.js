const { claimsService } = require("../services/claims.service");
const { sendSuccess } = require("../utils/apiResponse");

const claimsController = {
  async list(req, res, next) {
    try {
      const claims = await claimsService.listPublic(req.query);
      return sendSuccess(res, { claims, total: claims.length });
    } catch (error) {
      return next(error);
    }
  },

  async listForAdmin(req, res, next) {
    try {
      const claims = await claimsService.listForAdmin(req.query);
      return sendSuccess(res, { claims, total: claims.length });
    } catch (error) {
      return next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const claim = await claimsService.getByIdPublic(req.params.id);
      return sendSuccess(res, claim);
    } catch (error) {
      return next(error);
    }
  },

  async create(req, res, next) {
    try {
      const created = await claimsService.create(req.body);
      return sendSuccess(res, created, "Claim request submitted successfully.", 201);
    } catch (error) {
      return next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const updated = await claimsService.updateStatus(req.params.id, req.body);
      return sendSuccess(res, updated, "Claim status updated successfully.");
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = { claimsController };
