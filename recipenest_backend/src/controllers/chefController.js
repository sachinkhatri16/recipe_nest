const User = require("../models/User");
const Recipe = require("../models/Recipe");
const { uploadToCloudinary } = require("../middleware/upload");
const { encrypt } = require("../utils/crypto");

// GET /api/chefs — list all verified chefs (public)
exports.getChefs = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { role: "chef", verificationStatus: "verified", status: "active" };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { "profile.specialty": { $regex: search, $options: "i" } },
      ];
    }

    const chefs = await User.find(filter)
      .select("name profile verificationStatus createdAt")
      .lean();

    // Attach recipe and review stats for each chef
    const chefIds = chefs.map((c) => c._id);
    const recipeStats = await Recipe.aggregate([
      { $match: { chef: { $in: chefIds }, status: "Published" } },
      {
        $group: {
          _id: "$chef",
          recipeCount: { $sum: 1 },
          totalReviews: { $sum: { $size: "$reviews" } },
        },
      },
    ]);

    const statsMap = {};
    recipeStats.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const enriched = chefs.map((chef) => {
      const stats = statsMap[chef._id.toString()] || {};
      return {
        ...chef,
        recipeCount: stats.recipeCount || 0,
        totalReviews: stats.totalReviews || 0,
      };
    });

    res.json(enriched);
  } catch (err) {
    console.error("GetChefs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/chefs/:id — single chef profile (public)
exports.getChef = async (req, res) => {
  try {
    const chef = await User.findOne({
      _id: req.params.id,
      role: "chef",
      verificationStatus: "verified",
    }).select("name profile verificationStatus createdAt");

    if (!chef) {
      return res.status(404).json({ message: "Chef not found" });
    }

    const recipes = await Recipe.find({ chef: chef._id, status: "Published" })
      .select("title coverImage category reviews createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = recipes.reduce(
      (sum, r) => sum + (r.reviews ? r.reviews.length : 0),
      0
    );

    res.json({
      ...chef.toObject(),
      recipes,
      recipeCount: recipes.length,
      totalReviews,
    });
  } catch (err) {
    console.error("GetChef error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/chefs/verify — submit verification documents
exports.submitVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.role !== "chef") {
      return res.status(403).json({ message: "Only chefs can submit verification" });
    }

    if (user.verificationStatus === "verified") {
      return res.status(400).json({ message: "Already verified" });
    }

    if (user.verificationStatus === "pending") {
      return res.status(400).json({ message: "Verification already pending" });
    }

    const { citizenNumber, specialty, experience, bio } = req.body;
    if (!citizenNumber) {
      return res.status(400).json({ message: "Citizen number is required" });
    }

    if (!bio || !bio.trim()) {
      return res.status(400).json({ message: "Bio is required for verification" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "ID photo is required" });
    }

    let idPhoto = "";
    let idPhotoPublicId = "";
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "recipenest/verification", {
        type: "authenticated",
        getFullResult: true,
      });
      idPhoto = uploadResult.secure_url;
      idPhotoPublicId = uploadResult.public_id;
    }

    user.verificationStatus = "pending";
    user.verificationData = {
      citizenNumber: encrypt(citizenNumber),
      idPhoto,
      idPhotoPublicId,
      specialty: specialty || "",
      experience: experience || "",
      submittedAt: new Date(),
      rejectionReason: "",
    };

    user.profile = {
      ...user.profile,
      bio: bio.trim(),
    };

    await user.save();

    res.json({
      message: "Verification submitted. Please wait for admin review.",
      verificationStatus: user.verificationStatus,
      verificationData: user.verificationData,
    });
  } catch (err) {
    console.error("SubmitVerification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/chefs/verification-status — check own status
exports.getVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "verificationStatus verificationData"
    );

    res.json({
      verificationStatus: user.verificationStatus,
      verificationData: user.verificationData,
    });
  } catch (err) {
    console.error("GetVerificationStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
