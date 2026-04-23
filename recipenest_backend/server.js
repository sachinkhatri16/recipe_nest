require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

// Route imports
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const recipeRoutes = require("./src/routes/recipeRoutes");
const chefRoutes = require("./src/routes/chefRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalOrigin = (origin = "") => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

// ─── Middleware ───────────────────────────────────────
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isLocalOrigin(origin) || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Health Check ─────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status: "running",
    name: "RecipeNest API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users",
      recipes: "/api/recipes",
      chefs: "/api/chefs",
      admin: "/api/admin",
    },
  });
});

// ─── API Routes ───────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/chefs", chefRoutes);
app.use("/api/admin", adminRoutes);

// ─── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ─── Start ────────────────────────────────────────────
const start = async () => {
  await connectDB();

  // Verify Cloudinary connection
  try {
    const cloudinary = require("./src/config/cloudinary");
    await cloudinary.api.ping();
    console.log("Cloudinary connected");
  } catch (err) {
    console.warn("Cloudinary not available:", err.message || err);
  }

  app.listen(PORT, () => {
    console.log(`\nRecipeNest API running on http://localhost:${PORT}`);
    console.log("─────────────────────────────────────────────");
  });
};

start();
