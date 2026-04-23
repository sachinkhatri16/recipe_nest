/**
 * Seed script — populates the database with initial data
 * matching the frontend's existing mock data.
 *
 * Usage:  node src/seed.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Recipe = require("./models/Recipe");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/recipenest";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for seeding...");

  // Clean existing data
  await User.deleteMany({});
  await Recipe.deleteMany({});
  console.log("Cleared existing data.");

  const hashedPw = await bcrypt.hash("password123", 12);
  const adminPw = await bcrypt.hash("admin123", 12);

  // ─── Create Users ──────────────────────────────────
  const admin = await User.create({
    name: "admin",
    email: "admin@gmail.com",
    password: adminPw,
    role: "admin",
    status: "active",
    verificationStatus: "none",
  });

  const asha = await User.create({
    name: "Asha Tamang",
    email: "asha@mail.com",
    password: hashedPw,
    role: "chef",
    status: "active",
    verificationStatus: "verified",
    verificationData: {
      citizenNumber: "NP-2045-1234",
      idPhoto: "",
      specialty: "Nepali Home Cooking",
      experience: "15 years",
      submittedAt: new Date("2025-01-10"),
    },
    profile: {
      displayName: "Asha Tamang",
      bio: "Passionate about preserving traditional Nepali recipes and sharing them with the world.",
      location: "Kathmandu, Nepal",
      specialty: "Nepali Home Cooking",
    },
  });

  const priya = await User.create({
    name: "Priya Sharma",
    email: "priya@mail.com",
    password: hashedPw,
    role: "chef",
    status: "active",
    verificationStatus: "verified",
    verificationData: {
      citizenNumber: "IN-MH-5678",
      idPhoto: "",
      specialty: "North Indian Classics",
      experience: "12 years",
      submittedAt: new Date("2024-12-15"),
    },
    profile: {
      displayName: "Priya Sharma",
      bio: "Bringing authentic North Indian flavors from my grandmother's kitchen to yours.",
      location: "Mumbai, India",
      specialty: "North Indian Classics",
    },
  });

  const arjun = await User.create({
    name: "Arjun Nair",
    email: "arjun@mail.com",
    password: hashedPw,
    role: "chef",
    status: "banned",
    banReason: "Content policy violation",
    banType: "temporary",
    verificationStatus: "verified",
    verificationData: {
      citizenNumber: "IN-KL-9012",
      idPhoto: "",
      specialty: "South Indian & Vegetarian",
      experience: "8 years",
      submittedAt: new Date("2025-02-01"),
    },
    profile: {
      displayName: "Arjun Nair",
      bio: "South Indian vegetarian specialist with a modern twist.",
      location: "Kochi, India",
      specialty: "South Indian & Vegetarian",
    },
  });

  const rajan = await User.create({
    name: "Rajan Shrestha",
    email: "rajan@mail.com",
    password: hashedPw,
    role: "foodlover",
    status: "active",
    verificationStatus: "none",
    profile: {
      displayName: "Rajan Shrestha",
      location: "Pokhara, Nepal",
    },
  });

  const sita = await User.create({
    name: "Sita Gurung",
    email: "sita@mail.com",
    password: hashedPw,
    role: "foodlover",
    status: "active",
    verificationStatus: "none",
    profile: {
      displayName: "Sita Gurung",
      location: "Lalitpur, Nepal",
    },
  });

  const bikash = await User.create({
    name: "Bikash Lama",
    email: "bikash@mail.com",
    password: hashedPw,
    role: "chef",
    status: "active",
    verificationStatus: "verified",
    verificationData: {
      citizenNumber: "NP-2046-7890",
      idPhoto: "",
      specialty: "Asian Fusion",
      experience: "10 years",
      submittedAt: new Date("2025-03-01"),
    },
    profile: {
      displayName: "Bikash Lama",
      bio: "Exploring the boundaries between Nepali, Thai, and Japanese cuisine.",
      location: "Bhaktapur, Nepal",
      specialty: "Asian Fusion",
    },
  });

  const deepak = await User.create({
    name: "Deepak Kc",
    email: "deepak@mail.com",
    password: hashedPw,
    role: "chef",
    status: "suspended",
    verificationStatus: "verified",
    verificationData: {
      citizenNumber: "NP-2044-3456",
      idPhoto: "",
      specialty: "Nepali Street Food",
      experience: "6 years",
      submittedAt: new Date("2025-03-15"),
    },
    profile: {
      displayName: "Deepak Kc",
      location: "Chitwan, Nepal",
      specialty: "Nepali Street Food",
    },
  });

  // Pending verification chefs
  const binod = await User.create({
    name: "Binod Thapa",
    email: "binod@mail.com",
    password: hashedPw,
    role: "chef",
    status: "active",
    verificationStatus: "pending",
    verificationData: {
      citizenNumber: "NP-2047-1111",
      idPhoto: "",
      specialty: "Thakali Cuisine",
      experience: "5 years",
      submittedAt: new Date("2025-04-20"),
    },
  });

  const meera = await User.create({
    name: "Meera Joshi",
    email: "meera@mail.com",
    password: hashedPw,
    role: "chef",
    status: "active",
    verificationStatus: "pending",
    verificationData: {
      citizenNumber: "NP-2048-2222",
      idPhoto: "",
      specialty: "Newari Cuisine",
      experience: "7 years",
      submittedAt: new Date("2025-04-21"),
    },
  });

  const kamal = await User.create({
    name: "Kamal Gurung",
    email: "kamal@mail.com",
    password: hashedPw,
    role: "chef",
    status: "active",
    verificationStatus: "pending",
    verificationData: {
      citizenNumber: "NP-2049-3333",
      idPhoto: "",
      specialty: "Mountain Cuisine",
      experience: "4 years",
      submittedAt: new Date("2025-04-22"),
    },
  });

  console.log("Users created.");

  // ─── Create Recipes ──────────────────────────────────
  const recipes = await Recipe.insertMany([
    {
      title: "Momo",
      description: "Traditional Nepali steamed dumplings filled with spiced chicken and served with tomato chutney.",
      longDescription: "Momo is arguably the most beloved street food in Nepal. These delicate steamed dumplings are filled with a fragrant mixture of minced chicken, onions, garlic, ginger, and a blend of Nepali spices. Served piping hot with a fiery tomato-based chutney (achar), momos represent the perfect harmony of simplicity and flavor that defines Nepali cuisine.",
      category: "Nepali",
      origin: "Nepali",
      servings: "4",
      prepTime: "30",
      cookTime: "15",
      level: "Medium",
      calories: 320,
      coverImage: "/images/recipes/momo.png",
      tags: ["nepali", "dumplings", "steamed"],
      ingredients: [
        { amount: "2", unit: "cups", name: "All-purpose flour" },
        { amount: "500", unit: "g", name: "Chicken mince" },
        { amount: "1", unit: "whole", name: "Onion, finely chopped" },
        { amount: "3", unit: "pieces", name: "Garlic cloves, minced" },
        { amount: "2", unit: "tbsp", name: "Soy sauce" },
      ],
      instructions: [
        { text: "Make dough by combining flour with water and knead until smooth. Rest for 30 minutes." },
        { text: "Prepare filling by mixing chicken mince with onions, garlic, ginger, soy sauce, and spices." },
        { text: "Roll dough into thin circles, fill with the mixture, and pleat to seal." },
        { text: "Steam for 15-20 minutes until cooked through. Serve with tomato chutney." },
      ],
      chefNote: "Serve hot with spicy tomato chutney for the authentic experience.",
      tips: ["Keep the dough covered while working to prevent drying", "Don't overfill the momos"],
      status: "Published",
      chef: asha._id,
      views: 1240,
      isPublic: true,
      allowComments: true,
    },
    {
      title: "Dal Bhat",
      description: "The national dish of Nepal - steamed rice served with lentil soup and various accompaniments.",
      category: "Nepali",
      origin: "Nepali",
      servings: "4",
      prepTime: "15",
      cookTime: "45",
      level: "Easy",
      calories: 450,
      coverImage: "/images/recipes/dal-bhat.png",
      tags: ["nepali", "staple", "lentils", "rice"],
      ingredients: [
        { amount: "2", unit: "cups", name: "Basmati rice" },
        { amount: "1", unit: "cups", name: "Yellow lentils (moong dal)" },
        { amount: "2", unit: "tbsp", name: "Ghee" },
        { amount: "1", unit: "tsp", name: "Turmeric" },
        { amount: "1", unit: "tsp", name: "Cumin seeds" },
      ],
      instructions: [
        { text: "Wash and cook rice until fluffy." },
        { text: "Boil lentils with turmeric until soft." },
        { text: "Prepare tadka with ghee, cumin, garlic, and chili." },
        { text: "Serve rice with dal and accompaniments." },
      ],
      chefNote: "Dal Bhat power, 24 hour! - A beloved Nepali saying.",
      status: "Published",
      chef: asha._id,
      views: 980,
      isPublic: true,
    },
    {
      title: "Sel Roti",
      description: "Traditional ring-shaped sweet bread made during festivals.",
      category: "Nepali",
      origin: "Nepali",
      servings: "6",
      prepTime: "20",
      cookTime: "30",
      level: "Medium",
      calories: 280,
      coverImage: "/images/recipes/sel-roti.png",
      tags: ["nepali", "festive", "bread"],
      ingredients: [
        { amount: "3", unit: "cups", name: "Rice flour" },
        { amount: "1", unit: "cups", name: "Sugar" },
        { amount: "1", unit: "tsp", name: "Cardamom powder" },
        { amount: "3", unit: "tbsp", name: "Ghee", notes: "melted" },
      ],
      instructions: [
        { text: "Mix rice flour with sugar, cardamom, and melted ghee." },
        { text: "Add enough water to make a thick, smooth batter." },
        { text: "Heat oil. Pour batter in a ring shape and deep fry until golden." },
      ],
      chefNote: "Traditional festive bread best enjoyed during Dashain and Tihar.",
      status: "Published",
      chef: asha._id,
      views: 890,
      isPublic: true,
    },
    {
      title: "Butter Chicken",
      description: "Creamy, rich tomato-based curry with tender chicken pieces. A North Indian classic.",
      category: "Indian",
      origin: "Indian",
      servings: "4",
      prepTime: "20",
      cookTime: "40",
      level: "Medium",
      calories: 490,
      coverImage: "/images/recipes/butter-chicken.png",
      tags: ["indian", "curry", "chicken"],
      ingredients: [
        { amount: "500", unit: "g", name: "Chicken breast, cubed" },
        { amount: "200", unit: "ml", name: "Heavy cream" },
        { amount: "400", unit: "g", name: "Tomato puree" },
        { amount: "3", unit: "tbsp", name: "Butter" },
        { amount: "1", unit: "tbsp", name: "Garam masala" },
      ],
      instructions: [
        { text: "Marinate chicken in yogurt and spices for 30 minutes." },
        { text: "Grill or pan-fry chicken until golden." },
        { text: "Make sauce with butter, tomatoes, cream, and spices." },
        { text: "Add chicken to sauce and simmer for 10 minutes." },
      ],
      status: "Published",
      chef: priya._id,
      views: 2100,
      isPublic: true,
    },
    {
      title: "Masala Dosa",
      description: "Crispy fermented crepe filled with spiced potato mixture.",
      category: "Indian",
      origin: "Indian",
      servings: "3",
      prepTime: "30",
      cookTime: "20",
      level: "Hard",
      calories: 350,
      coverImage: "/images/recipes/masala-dosa.png",
      tags: ["indian", "south-indian", "vegetarian"],
      ingredients: [
        { amount: "2", unit: "cups", name: "Rice" },
        { amount: "1", unit: "cups", name: "Urad dal" },
        { amount: "3", unit: "pieces", name: "Potatoes, boiled" },
        { amount: "1", unit: "tsp", name: "Mustard seeds" },
      ],
      instructions: [
        { text: "Soak and grind rice and dal. Ferment overnight." },
        { text: "Prepare potato filling with mustard seeds, curry leaves, and turmeric." },
        { text: "Spread batter thin on hot griddle and cook until crispy." },
        { text: "Fill with potato mixture, fold, and serve with chutney and sambar." },
      ],
      status: "Draft",
      chef: arjun._id,
      views: 0,
      isPublic: true,
    },
    {
      title: "Pad Thai",
      description: "Thailand's iconic stir-fried rice noodles with a perfect balance of sweet, sour, and savory.",
      category: "Thai",
      origin: "Thai",
      servings: "2",
      prepTime: "15",
      cookTime: "10",
      level: "Medium",
      calories: 380,
      coverImage: "/images/recipes/pad-thai.png",
      tags: ["thai", "noodles", "stir-fry"],
      ingredients: [
        { amount: "200", unit: "g", name: "Rice noodles" },
        { amount: "2", unit: "tbsp", name: "Tamarind paste" },
        { amount: "2", unit: "tbsp", name: "Fish sauce" },
        { amount: "1", unit: "tbsp", name: "Palm sugar" },
        { amount: "100", unit: "g", name: "Shrimp" },
      ],
      instructions: [
        { text: "Soak noodles in warm water until pliable." },
        { text: "Make sauce by mixing tamarind, fish sauce, and palm sugar." },
        { text: "Stir-fry shrimp, add noodles and sauce." },
        { text: "Toss with bean sprouts and peanuts. Serve with lime." },
      ],
      status: "Published",
      chef: bikash._id,
      views: 560,
      isPublic: true,
    },
    {
      title: "Chicken Tikka",
      description: "Smoky, spiced yogurt-marinated chicken grilled to perfection.",
      category: "Indian",
      origin: "Indian",
      servings: "4",
      prepTime: "25",
      cookTime: "20",
      level: "Easy",
      calories: 280,
      coverImage: "/images/recipes/chicken-tikka.png",
      tags: ["indian", "grilled", "chicken"],
      ingredients: [
        { amount: "500", unit: "g", name: "Chicken thigh, boneless" },
        { amount: "200", unit: "ml", name: "Yogurt" },
        { amount: "2", unit: "tbsp", name: "Tikka masala" },
        { amount: "1", unit: "tbsp", name: "Lemon juice" },
      ],
      instructions: [
        { text: "Mix yogurt with spices and lemon juice." },
        { text: "Marinate chicken for at least 2 hours." },
        { text: "Thread onto skewers and grill for 15-20 minutes." },
        { text: "Serve with mint chutney and onion rings." },
      ],
      status: "Published",
      chef: priya._id,
      views: 1850,
      isPublic: true,
    },
    {
      title: "Chatamari",
      description: "Newari rice crepe topped with minced meat and egg - Nepal's pizza.",
      category: "Nepali",
      origin: "Nepali",
      servings: "2",
      prepTime: "10",
      cookTime: "15",
      level: "Easy",
      calories: 260,
      coverImage: "/images/recipes/chatamari.png",
      tags: ["nepali", "newari", "crepe"],
      ingredients: [
        { amount: "1", unit: "cups", name: "Rice flour" },
        { amount: "200", unit: "g", name: "Minced meat" },
        { amount: "1", unit: "whole", name: "Egg" },
        { amount: "1", unit: "whole", name: "Onion, chopped" },
      ],
      instructions: [
        { text: "Make a thin batter from rice flour and water." },
        { text: "Spread on a hot skillet like a crepe." },
        { text: "Top with seasoned minced meat and egg." },
        { text: "Cover and cook until set. Serve hot." },
      ],
      status: "Published",
      chef: asha._id,
      views: 430,
      isPublic: true,
    },
    {
      title: "Thakali Thali",
      description: "A complete meal platter from the Thakali community of Nepal.",
      category: "Nepali",
      origin: "Nepali",
      servings: "2",
      prepTime: "30",
      cookTime: "60",
      level: "Hard",
      coverImage: "",
      tags: ["nepali", "thakali", "thali"],
      ingredients: [
        { amount: "2", unit: "cups", name: "Rice" },
        { amount: "1", unit: "cups", name: "Dal" },
        { amount: "200", unit: "g", name: "Mixed vegetables" },
      ],
      instructions: [
        { text: "Prepare rice, dal, and multiple vegetable dishes." },
        { text: "Arrange on a thali plate with pickles and papad." },
      ],
      status: "Draft",
      chef: asha._id,
      views: 0,
      isPublic: false,
    },
  ]);

  console.log(`${recipes.length} recipes created.`);
  console.log("\n--- Seed Complete ---");
  console.log("Admin login:  admin@gmail.com / admin123");
  console.log("Chef login:   asha@mail.com / password123");
  console.log("User login:   rajan@mail.com / password123");
  console.log("---");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
