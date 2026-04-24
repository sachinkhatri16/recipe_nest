require("dotenv").config();
const connectDB = require("./src/config/db");
const app = require("./src/app");

const PORT = process.env.PORT || 5000;

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
