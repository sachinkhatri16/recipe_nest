const User = require("../models/User");
const Recipe = require("../models/Recipe");

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
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
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

    res.json(pending);
  } catch (err) {
    console.error("GetPendingVerifications error:", err);
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/recipes/:id — admin can delete any recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    await recipe.deleteOne();
    res.json({ message: "Recipe deleted by admin" });
  } catch (err) {
    console.error("AdminDeleteRecipe error:", err);
    res.status(500).json({ message: "Server error" });
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

    // Total views across all recipes
    const viewsAgg = await Recipe.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const totalViews = viewsAgg[0]?.totalViews || 0;

    // Category distribution
    const categoryDist = await Recipe.aggregate([
      { $match: { status: "Published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Top recipes by views
    const topRecipes = await Recipe.find({ status: "Published" })
      .populate("chef", "name")
      .sort({ views: -1 })
      .limit(10)
      .select("title chef views reviews category")
      .lean();

    // Top chefs by recipe count
    const topChefs = await Recipe.aggregate([
      { $match: { status: "Published" } },
      {
        $group: {
          _id: "$chef",
          recipeCount: { $sum: 1 },
          totalViews: { $sum: "$views" },
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
          totalViews: 1,
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
        totalViews,
        activeUsers,
        bannedUsers,
        pendingVerifications,
        verifiedChefs,
      },
      categoryDistribution: categoryDist,
      topRecipes,
      topChefs: topChefs.map((c) => ({
        ...c,
        saves: savesMap[c._id.toString()] || 0,
      })),
      monthlyGrowth,
      monthlyRecipes,
    });
  } catch (err) {
    console.error("GetAnalytics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
