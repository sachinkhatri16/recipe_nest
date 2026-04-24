const router = require("express").Router();
const {
  updateProfile,
  updateAvatar,
  toggleSaveRecipe,
  toggleSaveChef,
  getSavedRecipes,
  getSavedChefs,
  getMyComments,
  becomeChef,
} = require("../controllers/userController");
const { auth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

router.put("/profile", auth, updateProfile);
router.put("/avatar", auth, upload.single("avatar"), updateAvatar);
router.post("/save-recipe/:id", auth, toggleSaveRecipe);
router.post("/save-chef/:id", auth, toggleSaveChef);
router.get("/saved-recipes", auth, getSavedRecipes);
router.get("/saved-chefs", auth, getSavedChefs);
router.get("/my-comments", auth, getMyComments);
router.put("/become-chef", auth, becomeChef);

module.exports = router;
