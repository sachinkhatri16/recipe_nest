const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password by default
    },
    role: {
      type: String,
      enum: ["admin", "chef", "foodlover"],
      default: "foodlover",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
    },
    banReason: { type: String, default: "" },
    banType: {
      type: String,
      enum: ["", "temporary", "permanent"],
      default: "",
    },

    // Chef verification
    verificationStatus: {
      type: String,
      enum: ["none", "unverified", "pending", "verified", "rejected"],
      default: "none",
    },
    verificationData: {
      citizenNumber: { type: String, default: "" }, // Encrypted at rest
      idPhoto: { type: String, default: "" }, // Cloudinary URL
      idPhotoPublicId: { type: String, default: "" }, // Store public ID for generating signed URLs
      specialty: { type: String, default: "" },
      experience: { type: String, default: "" },
      submittedAt: { type: Date },
      rejectionReason: { type: String, default: "" },
    },

    // Save lists (no likes, no followers — only saves)
    savedRecipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recipe",
      },
    ],
    savedChefs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Public profile
    profile: {
      displayName: { type: String, default: "" },
      bio: { type: String, default: "", maxlength: 500 },
      location: { type: String, default: "" },
      specialty: { type: String, default: "" },
      experience: { type: String, default: "" },
      website: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      avatar: { type: String, default: "" }, // Cloudinary URL
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
userSchema.index({ name: "text", email: "text" });

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});
// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive fields in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
