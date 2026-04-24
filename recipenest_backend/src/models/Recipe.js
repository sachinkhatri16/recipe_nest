const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
  {
    amount: { type: String, default: "" },
    unit: { type: String, default: "g" },
    name: { type: String, required: true },
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const instructionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: { type: String, required: true, maxlength: 1000 },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Recipe title is required"],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      default: "",
      maxlength: 2000,
    },
    longDescription: {
      type: String,
      default: "",
      maxlength: 5000,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Nepali",
        "Indian",
        "Chinese",
        "Thai",
        "Italian",
        "Mexican",
        "Japanese",
        "Korean",
        "French",
        "American",
        "Mediterranean",
        "Other",
      ],
    },
    origin: { type: String, default: "" },
    servings: { type: String, default: "" },
    prepTime: { type: String, default: "" },
    cookTime: { type: String, default: "" },
    level: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },
    calories: { type: Number, default: 0 },

    coverImage: { type: String, default: "" }, // Cloudinary URL
    tags: [{ type: String, trim: true }],

    ingredients: [ingredientSchema],
    instructions: [instructionSchema],
    chefNote: { type: String, default: "", maxlength: 500 },
    tips: [{ type: String }],

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    views: { type: Number, default: 0 },
    reviews: [reviewSchema],

    isPublic: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Indexes
recipeSchema.index({ title: "text", description: "text", tags: "text", "ingredients.name": "text" });
recipeSchema.index({ chef: 1, status: 1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ status: 1, createdAt: -1 });

// Virtual for review count
recipeSchema.virtual("reviewCount").get(function () {
  return this.reviews ? this.reviews.length : 0;
});

recipeSchema.set("toJSON", { virtuals: true });
recipeSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Recipe", recipeSchema);
