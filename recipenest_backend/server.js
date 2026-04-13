require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get("/", (req, res) => {
  res.send("Recipe Nest Backend is running!");
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB!"))
  .catch(err => console.error("MongoDB connection error:", err));

// Cloudinary verify test
const cloudinary = require("./src/config/cloudinary");
cloudinary.api.ping()
  .then(res => console.log("Cloudinary is connected! (Ping OK)"))
  .catch(err => console.error("Cloudinary connection error (check credentials):", err.message || err));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
