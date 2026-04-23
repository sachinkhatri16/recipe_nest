const router = require("express").Router();
const {
  getRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getMyRecipes,
  addReview,
} = require("../controllers/recipeController");
const { auth, verifiedChefOnly } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

// Public
router.get("/", getRecipes);
router.get("/chef/my-recipes", auth, getMyRecipes); // must be before /:id
router.get("/:id", getRecipe);

// Chef only (verified)
router.post("/", auth, verifiedChefOnly, upload.single("coverImage"), createRecipe);
router.put("/:id", auth, verifiedChefOnly, upload.single("coverImage"), updateRecipe);
router.delete("/:id", auth, verifiedChefOnly, deleteRecipe);

// Any authenticated user
router.post("/:id/review", auth, addReview);

module.exports = router;
