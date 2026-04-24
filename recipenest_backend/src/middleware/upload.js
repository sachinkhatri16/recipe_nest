const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const path = require("path");

// Use memory storage — files go to buffer, then straight to Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Upload a buffer to Cloudinary and return the secure URL or full result.
 * @param {Buffer} buffer  File buffer from multer
 * @param {string} folder  Cloudinary folder name
 * @param {object} options Cloudinary specific upload options and return controls
 * @returns {Promise<string|object>} Secure URL of the uploaded image or full upload result
 */
const uploadToCloudinary = (buffer, folder = "recipenest", options = {}) => {
  const type = options.type || "upload";
  const getFullResult = options.getFullResult || false;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        type, // "upload" is public, "authenticated" is restricted
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(getFullResult ? result : result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = { upload, uploadToCloudinary };
