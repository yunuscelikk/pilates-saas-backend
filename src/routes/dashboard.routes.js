const router = require("express").Router();
const dashboardController = require("../controllers/dashboard.controller");
const checkFeature = require("../middleware/checkFeature");

router.get("/", dashboardController.getStats);
router.get(
  "/advanced",
  checkFeature("advanced_reports"),
  dashboardController.getAdvancedStats,
);

module.exports = router;
