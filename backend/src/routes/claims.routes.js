const { Router } = require("express");
const { claimsController } = require("../controllers/claims.controller");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = Router();

// Admin-only claim review endpoint (must be registered before /:id)
router.get("/admin/review", requireAdmin, claimsController.listForAdmin);

// Public claim endpoints (never expose private verification details)
router.get("/", claimsController.list);
router.get("/:id", claimsController.getById);
router.post("/", claimsController.create);

// Admin-only claim status & physical handover confirmation
router.patch("/:id/status", requireAdmin, claimsController.updateStatus);

module.exports = router;
