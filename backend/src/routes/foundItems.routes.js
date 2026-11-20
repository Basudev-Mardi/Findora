const { Router } = require("express");
const { foundItemsController } = require("../controllers/foundItems.controller");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = Router();

router.get("/", foundItemsController.list);
router.get("/:id", foundItemsController.getById);
router.post("/", foundItemsController.create);
router.put("/:id", requireAdmin, foundItemsController.update);
router.delete("/:id", requireAdmin, foundItemsController.remove);

module.exports = router;
