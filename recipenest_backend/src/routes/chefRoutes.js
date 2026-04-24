const router = require("express").Router();
const {
  getChefs,
  getChef,
  submitVerification,
  getVerificationStatus,
  getChefAnalytics,
} = require("../controllers/chefController");
const { auth, chefOnly } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

// Public
router.get("/", getChefs);
router.get("/verification-status", auth, chefOnly, getVerificationStatus);
router.get("/chef/analytics", auth, chefOnly, getChefAnalytics);
router.get("/:id", getChef);

// Chef only
router.post(
  "/verify",
  auth,
  chefOnly,
  upload.single("idPhoto"),
  submitVerification
);

module.exports = router;
