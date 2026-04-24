const router = require("express").Router();
const {
  getUsers,
  banUser,
  unbanUser,
  getPendingVerifications,
  approveChef,
  rejectChef,
  getAllRecipes,
  deleteRecipe,
  getAnalytics,
  clearSampleData,
} = require("../controllers/adminController");
const { auth, adminOnly } = require("../middleware/auth");

// All routes require admin
router.use(auth, adminOnly);

router.get("/users", getUsers);
router.post("/ban/:id", banUser);
router.post("/unban/:id", unbanUser);

router.get("/pending-verifications", getPendingVerifications);
router.post("/verify/:id/approve", approveChef);
router.post("/verify/:id/reject", rejectChef);

router.get("/recipes", getAllRecipes);
router.delete("/recipes/:id", deleteRecipe);

router.get("/analytics", getAnalytics);
router.delete("/sample-data", clearSampleData);

module.exports = router;
