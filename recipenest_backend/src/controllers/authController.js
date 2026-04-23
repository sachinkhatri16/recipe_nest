const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Only allow foodlover or chef registration
    const allowedRoles = ["foodlover", "chef"];
    const userRole = allowedRoles.includes(role) ? role : "foodlover";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      verificationStatus: userRole === "chef" ? "unverified" : "none",
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        verificationStatus: user.verificationStatus,
        savedRecipes: user.savedRecipes,
        savedChefs: user.savedChefs,
        profile: user.profile,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Explicitly select password since it's excluded by default
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user.status === "banned") {
      return res
        .status(403)
        .json({ message: "Account is banned", banReason: user.banReason });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        verificationStatus: user.verificationStatus,
        savedRecipes: user.savedRecipes,
        savedChefs: user.savedChefs,
        profile: user.profile,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("savedRecipes", "title coverImage category")
      .populate("savedChefs", "name profile.avatar profile.specialty");

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      verificationStatus: user.verificationStatus,
      verificationData: user.verificationData,
      savedRecipes: user.savedRecipes,
      savedChefs: user.savedChefs,
      profile: user.profile,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
