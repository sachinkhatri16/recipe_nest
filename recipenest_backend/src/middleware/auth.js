const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verify JWT token and attach user to request.
 * Usage: router.get("/protected", auth, handler)
 */
const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    if (user.status === "banned") {
      return res
        .status(403)
        .json({ message: "Account is banned", banReason: user.banReason });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Require admin role.
 * Must be used AFTER `auth` middleware.
 */
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

/**
 * Require chef role.
 * Must be used AFTER `auth` middleware.
 */
const chefOnly = (req, res, next) => {
  if (req.user.role !== "chef") {
    return res.status(403).json({ message: "Chef access required" });
  }
  next();
};

/**
 * Require verified chef.
 * Must be used AFTER `auth` middleware.
 */
const verifiedChefOnly = (req, res, next) => {
  if (req.user.role !== "chef") {
    return res.status(403).json({ message: "Chef access required" });
  }
  if (req.user.verificationStatus !== "verified") {
    return res
      .status(403)
      .json({ message: "Chef verification required to perform this action" });
  }
  next();
};

module.exports = { auth, adminOnly, chefOnly, verifiedChefOnly };
