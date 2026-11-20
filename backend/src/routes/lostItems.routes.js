const { Router } = require("express");
const { lostItemsController } = require("../controllers/lostItems.controller");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = Router();

router.get("/", lostItemsController.list);
router.get("/:id", lostItemsController.getById);
router.post("/", lostItemsController.create);
router.put("/:id", requireAdmin, lostItemsController.update);
router.delete("/:id", requireAdmin, lostItemsController.remove);

module.exports = router;
