const Recipe = require("../models/Recipe");
const { uploadToCloudinary } = require("../middleware/upload");

// GET /api/recipes — public, published only
exports.getRecipes = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 20 } = req.query;
    const filter = { status: "Published" };

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") sortOption = { createdAt: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [recipes, total] = await Promise.all([
      Recipe.find(filter)
        .populate("chef", "name profile.avatar profile.specialty verificationStatus")
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Recipe.countDocuments(filter),
    ]);

    res.json({
      recipes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error("GetRecipes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recipes/:id — public
exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("chef", "name email profile verificationStatus")
      .populate("reviews.user", "name profile.avatar");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (err) {
    console.error("GetRecipe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/recipes — chef only (verified)
exports.createRecipe = async (req, res) => {
  try {
    const {
      title,
      description,
      longDescription,
      category,
      origin,
      servings,
      prepTime,
      cookTime,
      level,
      calories,
      tags,
      ingredients,
      instructions,
      chefNote,
      tips,
      status,
      isPublic,
      allowComments,
    } = req.body;

    let coverImage = "";
    if (req.file) {
      coverImage = await uploadToCloudinary(req.file.buffer, "recipenest/recipes");
    }

    const recipe = await Recipe.create({
      title,
      description,
      longDescription,
      category,
      origin: origin || category,
      servings,
      prepTime,
      cookTime,
      level,
      calories,
      coverImage,
      tags: typeof tags === "string" ? JSON.parse(tags) : tags || [],
      ingredients:
        typeof ingredients === "string"
          ? JSON.parse(ingredients)
          : ingredients || [],
      instructions:
        typeof instructions === "string"
          ? JSON.parse(instructions)
          : instructions || [],
      chefNote,
      tips: typeof tips === "string" ? JSON.parse(tips) : tips || [],
      status: status || "Draft",
      isPublic: isPublic !== undefined ? isPublic : true,
      allowComments: allowComments !== undefined ? allowComments : true,
      chef: req.user._id,
    });

    await recipe.populate("chef", "name profile.avatar");

    res.status(201).json(recipe);
  } catch (err) {
    console.error("CreateRecipe error:", err);
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors || {})[0];
      return res
        .status(400)
        .json({ message: firstError?.message || "Invalid recipe data" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/recipes/:id — owner chef only
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.chef.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Handle cover image update
    if (req.file) {
      recipe.coverImage = await uploadToCloudinary(
        req.file.buffer,
        "recipenest/recipes"
      );
    }

    const updateFields = [
      "title",
      "description",
      "longDescription",
      "category",
      "origin",
      "servings",
      "prepTime",
      "cookTime",
      "level",
      "calories",
      "chefNote",
      "status",
      "isPublic",
      "allowComments",
    ];

    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        recipe[field] = req.body[field];
      }
    });

    // Handle JSON array fields
    ["tags", "ingredients", "instructions", "tips"].forEach((field) => {
      if (req.body[field] !== undefined) {
        recipe[field] =
          typeof req.body[field] === "string"
            ? JSON.parse(req.body[field])
            : req.body[field];
      }
    });

    await recipe.save();
    await recipe.populate("chef", "name profile.avatar");

    res.json(recipe);
  } catch (err) {
    console.error("UpdateRecipe error:", err);
    if (err.name === "ValidationError") {
      const firstError = Object.values(err.errors || {})[0];
      return res
        .status(400)
        .json({ message: firstError?.message || "Invalid recipe data" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/recipes/:id — owner chef only
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (recipe.chef.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    console.error("DeleteRecipe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/recipes/chef/my-recipes — chef's own recipes
exports.getMyRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ chef: req.user._id })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(recipes);
  } catch (err) {
    console.error("GetMyRecipes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/recipes/:id/review — any authenticated user
exports.addReview = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Review text is required" });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    if (!recipe.allowComments) {
      return res.status(403).json({ message: "Comments are disabled" });
    }

    recipe.reviews.push({
      user: req.user._id,
      text: text.trim(),
    });

    await recipe.save();
    await recipe.populate("reviews.user", "name profile.avatar");

    res.status(201).json(recipe.reviews);
  } catch (err) {
    console.error("AddReview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
