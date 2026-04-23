const User = require("../models/User");
const Recipe = require("../models/Recipe");

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { displayName, bio, location, specialty, website, instagram, twitter } = req.body;
    const user = await User.findById(req.user._id);

    user.profile = {
      ...user.profile,
      ...(displayName !== undefined && { displayName }),
      ...(bio !== undefined && { bio }),
      ...(location !== undefined && { location }),
      ...(specialty !== undefined && { specialty }),
      ...(website !== undefined && { website }),
      ...(instagram !== undefined && { instagram }),
      ...(twitter !== undefined && { twitter }),
    };

    await user.save();
    res.json({ message: "Profile updated", profile: user.profile });
  } catch (err) {
    console.error("UpdateProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/users/avatar
exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }
    const { uploadToCloudinary } = require("../middleware/upload");
    const avatarUrl = await uploadToCloudinary(req.file.buffer, "recipenest/avatars");

    const user = await User.findById(req.user._id);
    user.profile.avatar = avatarUrl;
    await user.save();

    res.json({ message: "Avatar updated", avatar: avatarUrl });
  } catch (err) {
    console.error("UpdateAvatar error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users/save-recipe/:id
exports.toggleSaveRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const user = await User.findById(req.user._id);
    const idx = user.savedRecipes.indexOf(recipeId);

    if (idx > -1) {
      user.savedRecipes.splice(idx, 1);
      await user.save();
      return res.json({ message: "Recipe unsaved", saved: false, savedRecipes: user.savedRecipes });
    } else {
      user.savedRecipes.push(recipeId);
      await user.save();
      return res.json({ message: "Recipe saved", saved: true, savedRecipes: user.savedRecipes });
    }
  } catch (err) {
    console.error("ToggleSaveRecipe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/users/save-chef/:id
exports.toggleSaveChef = async (req, res) => {
  try {
    const chefId = req.params.id;
    const chef = await User.findOne({ _id: chefId, role: "chef" });
    if (!chef) {
      return res.status(404).json({ message: "Chef not found" });
    }

    const user = await User.findById(req.user._id);
    const idx = user.savedChefs.indexOf(chefId);

    if (idx > -1) {
      user.savedChefs.splice(idx, 1);
      await user.save();
      return res.json({ message: "Chef unsaved", saved: false, savedChefs: user.savedChefs });
    } else {
      user.savedChefs.push(chefId);
      await user.save();
      return res.json({ message: "Chef saved", saved: true, savedChefs: user.savedChefs });
    }
  } catch (err) {
    console.error("ToggleSaveChef error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users/saved-recipes
exports.getSavedRecipes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedRecipes",
      select: "title coverImage category chef views reviews createdAt",
      populate: { path: "chef", select: "name profile.avatar" },
    });

    res.json(user.savedRecipes);
  } catch (err) {
    console.error("GetSavedRecipes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/users/saved-chefs
exports.getSavedChefs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "savedChefs",
      select: "name profile verificationStatus",
    });

    res.json(user.savedChefs);
  } catch (err) {
    console.error("GetSavedChefs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
