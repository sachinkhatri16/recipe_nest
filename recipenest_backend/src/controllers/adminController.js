const User = require("../models/User");
const Recipe = require("../models/Recipe");
const cloudinary = require("../config/cloudinary");
const { decrypt } = require("../utils/crypto");

// GET /api/admin/users — list all users
exports.getUsers = async (req, res) => {
  try {
    const { search, role, status } = req.query;
    const filter = {};

    if (role && role !== "all") filter.role = role;
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("name email role status verificationStatus banReason banType createdAt profile.avatar")
      .sort({ createdAt: -1 })
      .lean();

    // Get recipe counts for chefs
    const chefIds = users.filter((u) => u.role === "chef").map((u) => u._id);
    const recipeCounts = await Recipe.aggregate([
      { $match: { chef: { $in: chefIds } } },
      { $group: { _id: "$chef", count: { $sum: 1 } } },
    ]);
    const recipeMap = {};
    recipeCounts.forEach((r) => {
      recipeMap[r._id.toString()] = r.count;
    });

    const enriched = users.map((u) => ({
      ...u,
      recipeCount: recipeMap[u._id.toString()] || 0,
    }));

    res.json(enriched);
  } catch (err) {
    console.error("AdminGetUsers error:", err);
    res.status(500).json({ message: err.message || "Server error while fetching users" });
  }
};

// POST /api/admin/ban/:id
exports.banUser = async (req, res) => {
  try {
    const { reason, banType } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot ban an admin" });
    }

    user.status = "banned";
    user.banReason = reason || "Violation of platform policies";
    user.banType = banType || "permanent";
    await user.save();

    res.json({ message: `${user.name} has been banned`, user });
  } catch (err) {
    console.error("BanUser error:", err);
    res.status(500).json({ message: err.message || "Server error while banning user" });
  }
};

// POST /api/admin/unban/:id
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.status = "active";
    user.banReason = "";
    user.banType = "";
    await user.save();

    res.json({ message: `${user.name} has been unbanned`, user });
  } catch (err) {
    console.error("UnbanUser error:", err);
    res.status(500).json({ message: err.message || "Server error while unbanning user" });
  }
};

// GET /api/admin/pending-verifications
exports.getPendingVerifications = async (req, res) => {
  try {
    const pending = await User.find({
      role: "chef",
      verificationStatus: "pending",
    })
      .select("name email verificationData verificationStatus createdAt profile")
      .sort({ "verificationData.submittedAt": 1 })
      .lean();

    // Map through the results to decrypt the citizenNumber & generate signed URLs for authenticated images
    const securePending = pending.map((user) => {
      let securePhotoUrl = user.verificationData?.idPhoto || "";
      let decryptedCitizenNumber = "";
      
      if (user.verificationData) {
        if (user.verificationData.idPhotoPublicId) {
          securePhotoUrl = cloudinary.url(user.verificationData.idPhotoPublicId, {
            type: "authenticated",
            secure: true,
            sign_url: true,
          });
        }
        if (user.verificationData.citizenNumber) {
          try {
             decryptedCitizenNumber = decrypt(user.verificationData.citizenNumber);
          } catch(e) {
             decryptedCitizenNumber = "Decryption Error";
          }
        }
      }

      return {
        ...user,
        verificationData: {
          ...user.verificationData,
          citizenNumber: decryptedCitizenNumber,
          idPhoto: securePhotoUrl, 
        },
      };
    });

    res.json(securePending);
  } catch (err) {
    console.error("GetPendingVerifications error:", err);
    res.status(500).json({ message: err.message || "Server error while fetching pending verifications" });
  }
};

// POST /api/admin/verify/:id/approve
exports.approveChef = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "chef") {
      return res.status(400).json({ message: "User is not a chef" });
    }

    user.verificationStatus = "verified";
    await user.save();

    res.json({ message: `${user.name} has been verified`, user });
  } catch (err) {
    console.error("ApproveChef error:", err);
    res.status(500).json({ message: err.message || "Server error while approving chef" });
  }
};

// POST /api/admin/verify/:id/reject
exports.rejectChef = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "chef") {
      return res.status(400).json({ message: "User is not a chef" });
    }

    user.verificationStatus = "rejected";
    user.verificationData.rejectionReason = reason || "Documents not acceptable";
    await user.save();

    res.json({ message: `${user.name} has been rejected`, user });
  } catch (err) {
    console.error("RejectChef error:", err);
    res.status(500).json({ message: err.message || "Server error while rejecting chef" });
  }
};

// GET /api/admin/recipes — all recipes (any status)
exports.getAllRecipes = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (category && category !== "All") filter.category = category;
    if (status && status !== "All") filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
      ];
    }

    const recipes = await Recipe.find(filter)
      .populate("chef", "name email profile.avatar")
      .sort({ createdAt: -1 })
      .lean();

    res.json(recipes);
  } catch (err) {
    console.error("AdminGetAllRecipes error:", err);
    res.status(500).json({ message: err.message || "Server error while fetching recipes" });
  }
};

// DELETE /api/admin/recipes/:id — admin can delete any recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Also remove recipe from saved recipes in users
    await User.updateMany(
      { savedRecipes: recipe._id },
      { $pull: { savedRecipes: recipe._id } }
    );

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted by admin" });
  } catch (err) {
    console.error("AdminDeleteRecipe error:", err);
    res.status(500).json({ message: err.message || "Server error while deleting recipe" });
  }
};

// GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalChefs,
      totalRecipes,
      publishedRecipes,
      activeUsers,
      bannedUsers,
      pendingVerifications,
      verifiedChefs,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "chef" }),
      Recipe.countDocuments(),
      Recipe.countDocuments({ status: "Published" }),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "banned" }),
      User.countDocuments({ role: "chef", verificationStatus: "pending" }),
      User.countDocuments({ role: "chef", verificationStatus: "verified" }),
    ]);

    const reviewsAgg = await Recipe.aggregate([
      { $project: { reviewCount: { $size: "$reviews" } } },
      { $group: { _id: null, totalReviews: { $sum: "$reviewCount" } } },
    ]);
    const totalReviews = reviewsAgg[0]?.totalReviews || 0;

    // Category distribution
    const categoryDist = await Recipe.aggregate([
      { $match: { status: "Published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const topRecipes = await Recipe.aggregate([
      { $match: { status: "Published" } },
      { $addFields: { reviewCount: { $size: "$reviews" } } },
      { $sort: { reviewCount: -1, createdAt: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "chef",
          foreignField: "_id",
          as: "chef",
        },
      },
      {
        $project: {
          title: 1,
          category: 1,
          createdAt: 1,
          reviewCount: 1,
          chef: { $arrayElemAt: ["$chef", 0] },
        },
      },
    ]);

    // Top chefs by recipe count
    const topChefs = await Recipe.aggregate([
      { $match: { status: "Published" } },
      {
        $group: {
          _id: "$chef",
          recipeCount: { $sum: 1 },
          totalReviews: { $sum: { $size: "$reviews" } },
        },
      },
      { $sort: { recipeCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "chef",
        },
      },
      { $unwind: "$chef" },
      {
        $project: {
          name: "$chef.name",
          avatar: "$chef.profile.avatar",
          recipeCount: 1,
          totalReviews: 1,
        },
      },
    ]);

    // User saves count (how many times chefs have been saved)
    const savesAgg = await User.aggregate([
      { $unwind: "$savedChefs" },
      { $group: { _id: "$savedChefs", saves: { $sum: 1 } } },
      { $sort: { saves: -1 } },
      { $limit: 10 },
    ]);
    const savesMap = {};
    savesAgg.forEach((s) => {
      savesMap[s._id.toString()] = s.saves;
    });

    // Monthly user growth (last 12 months)
    const monthlyGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Monthly recipe uploads
    const monthlyRecipes = await Recipe.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    res.json({
      overview: {
        totalUsers,
        totalChefs,
        totalRecipes,
        publishedRecipes,
        totalReviews,
        activeUsers,
        bannedUsers,
        pendingVerifications,
        verifiedChefs,
      },
      categoryDistribution: categoryDist,
      topRecipes: topRecipes.map((recipe) => ({
        ...recipe,
        chef: recipe.chef
          ? {
              _id: recipe.chef._id,
              name: recipe.chef.name,
            }
          : null,
      })),
      topChefs: topChefs.map((c) => ({
        ...c,
        saves: savesMap[c._id.toString()] || 0,
      })),
      monthlyGrowth,
      monthlyRecipes,
    });
  } catch (err) {
    console.error("GetAnalytics error:", err);
    res.status(500).json({ message: err.message || "Server error while fetching analytics" });
  }
};
