const { Router } = require("express");
const { matchesController } = require("../controllers/matches.controller");

const router = Router();

router.get("/:itemType/:id", matchesController.list);

module.exports = router;
