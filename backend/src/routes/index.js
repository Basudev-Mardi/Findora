const { Router } = require("express");
const healthRoutes = require("./health.routes");
const lostItemsRoutes = require("./lostItems.routes");
const foundItemsRoutes = require("./foundItems.routes");
const claimsRoutes = require("./claims.routes");
const dashboardRoutes = require("./dashboard.routes");
const matchesRoutes = require("./matches.routes");

const router = Router();

router.use("/health", healthRoutes);
router.use("/lost-items", lostItemsRoutes);
router.use("/found-items", foundItemsRoutes);
router.use("/claims", claimsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/matches", matchesRoutes);

module.exports = router;
