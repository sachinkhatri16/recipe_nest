import { useAuth } from "../context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  BookOpen,
  Star,
  LogOut,

  X,
  ChefHat,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  ImagePlus,
  MapPin,
  FileText,
  Save,
  ArrowRight,
  BarChart3,
  MessageSquare,
  Camera,
  Globe,
  Link2,
  AtSign,
  Shield,
  Lock,
} from "lucide-react";
import { recipeAPI, chefAPI, userAPI } from "../services/api";
import "./ChefDashboard.css";

/* ──────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────── */
const CATEGORIES = ["Nepali", "Indian", "Chinese", "Thai", "Italian", "Mexican", "Japanese", "Korean", "French", "American", "Mediterranean", "Other"];
const UNITS = ["g", "kg", "ml", "l", "cups", "tbsp", "tsp", "pieces", "whole", "pinch", "to taste"];

const EMPTY_RECIPE = {
  title: "",
  category: "",
  servings: "",
  prepTime: "",
  cookTime: "",
  description: "",
  tags: [],
  coverImage: "",
  ingredients: [
    { id: 1, amount: "", unit: "g", name: "", notes: "" },
    { id: 2, amount: "", unit: "g", name: "", notes: "" },
    { id: 3, amount: "", unit: "g", name: "", notes: "" },
  ],
  instructions: [{ id: 1, text: "", image: "" }],
  chefNote: "",
  isPublic: true,
  allowComments: true,
};

/* Mock data removed — recipes are loaded from the API */


const SIDEBAR_TABS = [
  { id: "my-recipes", label: "My Recipes", icon: BookOpen },
  { id: "add-recipe", label: "Add Recipe", icon: Plus },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "settings", label: "Profile Settings", icon: ChefHat },
];

/* ──────────────────────────────────────────
   COMPONENT
   ────────────────────────────────────────── */
export default function ChefDashboard() {
  const { user, isAuthenticated, loading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const coverInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("my-recipes");
  const isVerified = user?.verificationStatus === "verified";
  const isPending = user?.verificationStatus === "pending";
  const isRejected = user?.verificationStatus === "rejected";
  const [editingId, setEditingId] = useState(null);
  const [tagInput, setTagInput] = useState("");

  /* — Recipes state (loaded from API) — */
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(true);

  /* — New / Edit recipe form — */
  const [newRecipe, setNewRecipe] = useState(JSON.parse(JSON.stringify(EMPTY_RECIPE)));

  /* — Profile settings — */
  const [profile, setProfile] = useState({
    displayName: user?.name || "",
    bio: user?.profile?.bio || "",
    location: user?.profile?.location || "",
    specialty: user?.profile?.specialty || "",
    experience: user?.profile?.experience || "",
    website: user?.profile?.website || "",
    instagram: user?.profile?.instagram || "",
    twitter: user?.profile?.twitter || "",
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  /* — Auth guard — */
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate("/auth");
    else if (user?.role !== "chef") navigate("/profile");
  }, [loading, isAuthenticated, user, navigate]);

  /* — Load recipes from API — */
  useEffect(() => {
    if (!user) return;
    recipeAPI
      .getMyRecipes()
      .then((data) => setRecipes(data))
      .catch((err) => console.error("Failed to load recipes:", err))
      .finally(() => setRecipesLoading(false));
  }, [user]);

  if (loading) return null;
  if (!user || user.role !== "chef") return null;

  /* ──────────── Computed ──────────── */
  const publishedRecipes = recipes.filter((r) => r.status === "Published");
  const draftRecipes = recipes.filter((r) => r.status === "Draft");
  const getReviewCount = (recipe) =>
    Array.isArray(recipe?.reviews) ? recipe.reviews.length : Number(recipe?.reviews || 0);
  const totalReviews = recipes.reduce((sum, recipe) => sum + getReviewCount(recipe), 0);


  const filledIngredients = newRecipe.ingredients.filter((i) => i.name.trim());
  const filledSteps = newRecipe.instructions.filter((i) => i.text.trim());

  const checklist = [
    { label: "Recipe title", done: !!newRecipe.title.trim() },
    { label: "Category selected", done: !!newRecipe.category.trim() },
    { label: "Cover image included", done: !!newRecipe.coverImage.trim() },
    { label: "At least 3 ingredients", done: filledIngredients.length >= 3 },
    { label: "At least 2 steps", done: filledSteps.length >= 2 },
    { label: "Description added", done: !!newRecipe.description.trim() },
  ];
  const canPublish = checklist.every((c) => c.done);

  /* ──────────── Handlers ──────────── */
  const resetForm = () => {
    setNewRecipe(JSON.parse(JSON.stringify(EMPTY_RECIPE)));
    setEditingId(null);
    setTagInput("");
  };

  const handleTabChange = (tabId) => {
    if (tabId === "add-recipe" && editingId) {
      resetForm();
    }
    setActiveTab(tabId);
  };

  const handleSaveRecipe = async (status) => {
    if (!newRecipe.title.trim()) {
      toast.error("Recipe title is required");
      return;
    }
    if (!newRecipe.category.trim()) {
      toast.error("Recipe category is required");
      return;
    }
    const loadingToast = toast.loading(editingId ? "Updating recipe..." : "Creating recipe...");
    try {
      let payload = { ...newRecipe, status };
      
      // If we have a file, we MUST use FormData
      if (newRecipe.coverImageFile) {
        payload = new FormData();
        payload.append("title", newRecipe.title);
        payload.append("description", newRecipe.description || "");
        payload.append("category", newRecipe.category || "");
        payload.append("servings", newRecipe.servings || "");
        payload.append("prepTime", newRecipe.prepTime || "");
        payload.append("cookTime", newRecipe.cookTime || "");
        payload.append("tags", JSON.stringify(newRecipe.tags));
        payload.append("ingredients", JSON.stringify(newRecipe.ingredients));
        payload.append("instructions", JSON.stringify(newRecipe.instructions));
        payload.append("status", status);
        payload.append("coverImage", newRecipe.coverImageFile);
      }

      if (editingId) {
        const updated = await recipeAPI.update(editingId, payload);
        setRecipes(recipes.map((r) => (r._id || r.id) === editingId ? updated : r));
        toast.success("Recipe updated successfully", { id: loadingToast });
      } else {
        const created = await recipeAPI.create(payload);
        setRecipes([created, ...recipes]);
        toast.success("Recipe created successfully", { id: loadingToast });
      }
      resetForm();
      setActiveTab("my-recipes");
    } catch (err) {
      console.error("Save recipe failed:", err);
      toast.error(err.message || "Failed to save recipe", { id: loadingToast });
    }
  };

  const handleDiscard = () => {
    if (
      newRecipe.title ||
      newRecipe.description ||
      filledIngredients.length > 0
    ) {
      if (!window.confirm("Discard all changes?")) return;
    }
    resetForm();
    setActiveTab("my-recipes");
  };

  const handleEditRecipe = (recipe) => {
    setNewRecipe({ ...JSON.parse(JSON.stringify(recipe)) });
    setEditingId(recipe._id || recipe.id);
    setActiveTab("add-recipe");
  };

  const handleDeleteRecipe = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      const loadingToast = toast.loading("Deleting recipe...");
      try {
        await recipeAPI.delete(id);
        setRecipes(recipes.filter((r) => (r._id || r.id) !== id));
        toast.success("Recipe deleted", { id: loadingToast });
      } catch (err) {
        console.error("Delete recipe failed:", err);
        toast.error(err.message || "Failed to delete recipe", { id: loadingToast });
      }
    }
  };

  /* — Ingredient handlers — */
  const addIngredient = () => {
    const maxId = Math.max(0, ...newRecipe.ingredients.map((i) => i.id));
    setNewRecipe({
      ...newRecipe,
      ingredients: [
        ...newRecipe.ingredients,
        { id: maxId + 1, amount: "", unit: "g", name: "", notes: "" },
      ],
    });
  };
  const removeIngredient = (id) => {
    if (newRecipe.ingredients.length <= 1) return;
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.filter((i) => i.id !== id),
    });
  };
  const updateIngredient = (id, field, value) => {
    setNewRecipe({
      ...newRecipe,
      ingredients: newRecipe.ingredients.map((i) =>
        i.id === id ? { ...i, [field]: value } : i
      ),
    });
  };

  /* — Instruction handlers — */
  const addStep = () => {
    const maxId = Math.max(0, ...newRecipe.instructions.map((i) => i.id));
    setNewRecipe({
      ...newRecipe,
      instructions: [
        ...newRecipe.instructions,
        { id: maxId + 1, text: "", image: "" },
      ],
    });
  };
  const removeStep = (id) => {
    if (newRecipe.instructions.length <= 1) return;
    setNewRecipe({
      ...newRecipe,
      instructions: newRecipe.instructions.filter((i) => i.id !== id),
    });
  };
  const updateStep = (id, field, value) => {
    setNewRecipe({
      ...newRecipe,
      instructions: newRecipe.instructions.map((i) =>
        i.id === id ? { ...i, [field]: value } : i
      ),
    });
  };

  /* — Tag handlers — */
  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !newRecipe.tags.includes(tag)) {
      setNewRecipe({ ...newRecipe, tags: [...newRecipe.tags, tag] });
      setTagInput("");
    }
  };
  const removeTag = (t) => {
    setNewRecipe({ ...newRecipe, tags: newRecipe.tags.filter((x) => x !== t) });
  };

  /* — Profile — */
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const payload = {
        name: profile.displayName,
        bio: profile.bio,
        location: profile.location,
        specialty: profile.specialty,
        website: profile.website,
        instagram: profile.instagram,
        twitter: profile.twitter
      };
      await userAPI.updateProfile(payload);
      updateUser({
        name: profile.displayName,
        profile: { ...user.profile, ...payload }
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err) {
      console.error("Failed to update profile", err);
      toast.error("Failed to save profile settings");
    } finally {
      setProfileSaving(false);
    }
  };

  /* ══════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════ */
  return (
    <div className="cd-root">
      {/* ─── SIDEBAR ─── */}
      <aside className="cd-sidebar">
        <div className="cd-sidebar-top">
          <Link to="/" className="cd-brand">
            <span className="cd-brand-icon">
              <ChefHat className="cd-brand-hat" />
            </span>
            <span className="cd-brand-text">
              Recipe<span className="cd-brand-accent">Nest</span>
            </span>
          </Link>

          <div className="cd-chef-card">
            <div className="cd-chef-avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="cd-chef-info">
              <h3 className="cd-chef-name">{user.name || "Chef"}</h3>
              <span className="cd-chef-label">Home Chef</span>
            </div>
          </div>

          <nav className="cd-nav">
            {SIDEBAR_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`cd-nav-item ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <Icon className="cd-nav-icon" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="cd-sidebar-bottom">
          <Link to="/" className="cd-nav-item cd-nav-home">
            <Globe className="cd-nav-icon" />
            <span>Back to Site</span>
          </Link>
          <button onClick={logout} className="cd-nav-item cd-nav-logout">
            <LogOut className="cd-nav-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── MOBILE HEADER ─── */}
      <div className="cd-mobile-header">
        <Link to="/" className="cd-brand">
          <span className="cd-brand-icon-sm">
            <ChefHat className="cd-brand-hat-sm" />
          </span>
          <span className="cd-brand-text-sm">
            Recipe<span className="cd-brand-accent">Nest</span>
          </span>
        </Link>
        <div className="cd-mobile-tabs">
          {SIDEBAR_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`cd-mobile-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => handleTabChange(tab.id)}
                title={tab.label}
              >
                <Icon className="cd-mobile-tab-icon" />
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <main className="cd-main">
        {/* ─── VERIFICATION BANNER ─── */}
        {!isVerified && (
          <div className={`cd-verify-banner ${isPending ? 'cd-verify-pending' : isRejected ? 'cd-verify-rejected' : 'cd-verify-unverified'}`}>
            <div className="cd-verify-banner-content">
              <div className="cd-verify-banner-icon">
                {isPending ? <Clock size={20} /> : isRejected ? <X size={20} /> : <Shield size={20} />}
              </div>
              <div className="cd-verify-banner-text">
                <h4 className="cd-verify-banner-title">
                  {isPending ? 'Verification under review' : isRejected ? 'Verification was unsuccessful' : 'Identity verification required'}
                </h4>
                <p className="cd-verify-banner-desc">
                  {isPending
                    ? 'Your documents are being reviewed. You can draft recipes, but publishing is locked until approval.'
                    : isRejected
                    ? `Your verification was rejected${user?.verificationData?.rejectionReason ? `: ${user.verificationData.rejectionReason}` : '. Please resubmit your documents.'}`
                    : 'Complete identity verification to unlock recipe publishing.'}
                </p>
              </div>
              <button className="cd-verify-banner-btn" onClick={() => navigate('/chef-verification')}>
                {isPending ? 'View Status' : isRejected ? 'Resubmit' : 'Verify Now'}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            MY RECIPES TAB
            ═══════════════════════════════════ */}
        {activeTab === "my-recipes" && (
          <div className="cd-content cd-fade-in">
            <div className="cd-page-header">
              <div>
                <h1 className="cd-page-title">My Recipes</h1>
                <p className="cd-page-sub">
                  Manage your culinary creations
                </p>
              </div>
              <button
                className="cd-btn-primary"
                onClick={() => {
                  resetForm();
                  setActiveTab("add-recipe");
                }}
              >
                <Plus className="cd-btn-icon" /> New Recipe
              </button>
            </div>

            {/* Stats Row */}
            <div className="cd-stats-grid">
              <div className="cd-stat-card">
                <div className="cd-stat-icon-wrap cd-stat-emerald">
                  <BookOpen className="cd-stat-icon" />
                </div>
                <div className="cd-stat-data">
                  <span className="cd-stat-num">{recipes.length}</span>
                  <span className="cd-stat-label">Total Recipes</span>
                </div>
              </div>
              <div className="cd-stat-card">
                <div className="cd-stat-icon-wrap cd-stat-blue">
                  <Clock className="cd-stat-icon" />
                </div>
                <div className="cd-stat-data">
                  <span className="cd-stat-num">{draftRecipes.length}</span>
                  <span className="cd-stat-label">Drafts</span>
                </div>
              </div>
              <div className="cd-stat-card">
                <div className="cd-stat-icon-wrap cd-stat-rose">
                  <MessageSquare className="cd-stat-icon" />
                </div>
                <div className="cd-stat-data">
                  <span className="cd-stat-num">{totalReviews}</span>
                  <span className="cd-stat-label">Reviews</span>
                </div>
              </div>
              <div className="cd-stat-card">
                <div className="cd-stat-icon-wrap cd-stat-amber">
                  <Star className="cd-stat-icon" />
                </div>
                <div className="cd-stat-data">
                  <span className="cd-stat-num">
                    {publishedRecipes.length}
                  </span>
                  <span className="cd-stat-label">Published</span>
                </div>
              </div>
            </div>

            {/* Published Recipes */}
            {publishedRecipes.length > 0 && (
              <div className="cd-recipe-section">
                <h2 className="cd-section-title">
                  Published ({publishedRecipes.length})
                </h2>
                <div className="cd-recipe-list">
                  {publishedRecipes.map((recipe) => (
                    <div key={recipe.id} className="cd-recipe-row">
                      <div className="cd-recipe-left">
                        {recipe.coverImage ? (
                          <img
                            src={recipe.coverImage}
                            alt={recipe.title}
                            className="cd-recipe-thumb"
                          />
                        ) : (
                          <div className="cd-recipe-thumb-placeholder">
                            <ImagePlus className="cd-thumb-icon" />
                          </div>
                        )}
                        <div className="cd-recipe-info">
                          <h3 className="cd-recipe-name">{recipe.title}</h3>
                          <div className="cd-recipe-meta">
                            <span className="cd-recipe-origin">
                              {recipe.category}
                            </span>
                            {recipe.cookTime && (
                              <span className="cd-recipe-time">
                                {recipe.cookTime} min
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="cd-recipe-center">
                        <span className="cd-recipe-stat">
                          <MessageSquare className="cd-recipe-stat-icon" />
                          {getReviewCount(recipe)}
                        </span>
                      </div>
                      <div className="cd-recipe-right">
                        <span className="cd-status-pill published">
                          <CheckCircle2 className="cd-status-icon" />
                          Published
                        </span>
                        <span className="cd-recipe-date">
                          {recipe.lastUpdated}
                        </span>
                        <div className="cd-recipe-actions">
                          <button
                            className="cd-action-btn cd-action-edit"
                            onClick={() => handleEditRecipe(recipe)}
                            title="Edit"
                          >
                            <Pencil className="cd-action-icon" />
                          </button>
                          <button
                            className="cd-action-btn cd-action-delete"
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            title="Delete"
                          >
                            <Trash2 className="cd-action-icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Draft Recipes */}
            {draftRecipes.length > 0 && (
              <div className="cd-recipe-section">
                <h2 className="cd-section-title">
                  Drafts ({draftRecipes.length})
                </h2>
                <div className="cd-recipe-list">
                  {draftRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="cd-recipe-row cd-recipe-draft"
                    >
                      <div className="cd-recipe-left">
                        {recipe.coverImage ? (
                          <img
                            src={recipe.coverImage}
                            alt={recipe.title}
                            className="cd-recipe-thumb"
                          />
                        ) : (
                          <div className="cd-recipe-thumb-placeholder">
                            <ImagePlus className="cd-thumb-icon" />
                          </div>
                        )}
                        <div className="cd-recipe-info">
                          <h3 className="cd-recipe-name">{recipe.title}</h3>
                          <div className="cd-recipe-meta">
                            {recipe.category && (
                              <span className="cd-recipe-origin">
                                {recipe.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="cd-recipe-right">
                        <span className="cd-status-pill draft">
                          <Clock className="cd-status-icon" />
                          Draft
                        </span>
                        <span className="cd-recipe-date">
                          {recipe.lastUpdated}
                        </span>
                        <div className="cd-recipe-actions">
                          <button
                            className="cd-action-btn cd-action-edit"
                            onClick={() => handleEditRecipe(recipe)}
                            title="Edit"
                          >
                            <Pencil className="cd-action-icon" />
                          </button>
                          <button
                            className="cd-action-btn cd-action-delete"
                            onClick={() => handleDeleteRecipe(recipe.id)}
                            title="Delete"
                          >
                            <Trash2 className="cd-action-icon" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recipes.length === 0 && (
              <div className="cd-empty">
                <BookOpen className="cd-empty-icon" />
                <h3 className="cd-empty-title">No recipes yet</h3>
                <p className="cd-empty-text">
                  Start sharing your culinary expertise with the world.
                </p>
                <button
                  className="cd-btn-primary"
                  onClick={() => {
                    resetForm();
                    setActiveTab("add-recipe");
                  }}
                >
                  <Plus className="cd-btn-icon" /> Create Your First Recipe
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════
            ADD / EDIT RECIPE TAB
            ═══════════════════════════════════ */}
        {activeTab === "add-recipe" && (
          <div className="cd-content cd-fade-in">
            {/* Top bar with breadcrumb + actions */}
            <div className="cd-add-topbar">
              <div className="cd-breadcrumb">
                <button
                  className="cd-breadcrumb-link"
                  onClick={() => {
                    resetForm();
                    setActiveTab("my-recipes");
                  }}
                >
                  Dashboard
                </button>
                <ArrowRight size={14} className="cd-breadcrumb-sep" />
                <span className="cd-breadcrumb-current">
                  {editingId ? "Edit Recipe" : "Add New Recipe"}
                </span>
              </div>
              <div className="cd-add-topbar-actions">
                <button
                  type="button"
                  className="cd-btn-outline"
                  onClick={() => handleSaveRecipe("Draft")}
                  disabled={!newRecipe.title.trim()}
                >
                  <FileText size={16} /> Save Draft
                </button>
                <button
                  type="button"
                  className="cd-btn-primary"
                  onClick={() => handleSaveRecipe("Published")}
                  disabled={!canPublish || !isVerified}
                  title={!isVerified ? 'Publishing is locked until your identity is verified' : ''}
                >
                  {!isVerified && <Lock size={14} />}
                  Publish
                </button>
              </div>
            </div>

            {/* Page heading */}
            <div className="cd-add-heading">
              <h1 className="cd-page-title">
                {editingId ? "Edit Recipe" : "Add New Recipe"}
              </h1>
              <p className="cd-page-sub">
                Fill in the details below to{" "}
                {editingId ? "update" : "publish"} your recipe.
              </p>
            </div>

            {/* Two-column layout */}
            <div className="cd-add-layout">
              {/* ──── LEFT COLUMN (form) ──── */}
              <div className="cd-add-form">
                {/* — Basic Information — */}
                <div className="cd-card">
                  <div className="cd-card-header">
                    <FileText size={18} className="cd-card-header-icon" />
                    <h3>Basic Information</h3>
                  </div>
                  <div className="cd-card-body">
                    <div className="cd-field">
                      <label>
                        Recipe Title{" "}
                        <span className="cd-required">*</span>
                      </label>
                      <input
                        type="text"
                        className="cd-input"
                        value={newRecipe.title}
                        onChange={(e) =>
                          setNewRecipe({
                            ...newRecipe,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g. Classic Beef Bourguignon"
                      />
                    </div>

                    <div className="cd-field-row cd-field-row-3">
                      <div className="cd-field">
                        <label>Category</label>
                        <select
                          className="cd-input"
                          required
                          value={newRecipe.category}
                          onChange={(e) =>
                            setNewRecipe({
                              ...newRecipe,
                              category: e.target.value,
                            })
                          }
                        >
                          <option value="">Select...</option>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="cd-field">
                        <label>Servings</label>
                        <input
                          type="number"
                          className="cd-input"
                          value={newRecipe.servings}
                          onChange={(e) =>
                            setNewRecipe({
                              ...newRecipe,
                              servings: e.target.value,
                            })
                          }
                          placeholder="4"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="cd-field-row cd-field-row-2">
                      <div className="cd-field">
                        <label>Prep Time (minutes)</label>
                        <input
                          type="number"
                          className="cd-input"
                          value={newRecipe.prepTime}
                          onChange={(e) =>
                            setNewRecipe({
                              ...newRecipe,
                              prepTime: e.target.value,
                            })
                          }
                          placeholder="30"
                          min="0"
                        />
                      </div>
                      <div className="cd-field">
                        <label>Cook Time (minutes)</label>
                        <input
                          type="number"
                          className="cd-input"
                          value={newRecipe.cookTime}
                          onChange={(e) =>
                            setNewRecipe({
                              ...newRecipe,
                              cookTime: e.target.value,
                            })
                          }
                          placeholder="60"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="cd-field">
                      <label>Description</label>
                      <textarea
                        className="cd-input cd-textarea"
                        rows={3}
                        value={newRecipe.description}
                        onChange={(e) =>
                          setNewRecipe({
                            ...newRecipe,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your recipe..."
                      />
                    </div>

                    <div className="cd-field">
                      <label>Tags</label>
                      <div className="cd-tags-wrap">
                        {newRecipe.tags.map((tag) => (
                          <span key={tag} className="cd-tag">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="cd-tag-remove"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                        <input
                          type="text"
                          className="cd-tag-input"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === ",") {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          placeholder="Add tag, press Enter"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* — Cover Image — */}
                <div className="cd-card">
                  <div className="cd-card-header">
                    <Camera size={18} className="cd-card-header-icon" />
                    <h3>Cover Image</h3>
                  </div>
                  <div className="cd-card-body">
                    <div
                      className="cd-cover-dropzone"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      {newRecipe.coverImage ? (
                        <div className="cd-cover-preview">
                          <img src={newRecipe.coverImage} alt="Cover" />
                          <button
                            type="button"
                            className="cd-cover-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewRecipe({
                                ...newRecipe,
                                coverImage: "",
                                coverImageFile: null,
                              });
                              if (coverInputRef.current) coverInputRef.current.value = "";
                            }}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="cd-dropzone-empty">
                          <ImagePlus className="cd-dropzone-icon" />
                          <p className="cd-dropzone-text">
                            Drop & Drop or click to upload
                          </p>
                          <p className="cd-dropzone-hint">
                            PNG, JPG, WebP &middot; Recommended 1200x800
                          </p>
                          <span className="cd-dropzone-btn">
                            Browse Files
                          </span>
                        </div>
                      )}
                    </div>
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 3 * 1024 * 1024) {
                            alert("File must be under 3MB.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setNewRecipe({
                              ...newRecipe,
                              coverImage: ev.target.result,
                              coverImageFile: file,
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* — Ingredients — */}
                <div className="cd-card">
                  <div className="cd-card-header">
                    <BookOpen size={18} className="cd-card-header-icon" />
                    <h3>Ingredients</h3>
                    <span className="cd-card-header-count">
                      {filledIngredients.length} items
                    </span>
                  </div>
                  <div className="cd-card-body cd-card-body-flush">
                    <div className="cd-ing-table">
                      <div className="cd-ing-header">
                        <span className="cd-ing-col-num">#</span>
                        <span className="cd-ing-col-amount">Amount</span>
                        <span className="cd-ing-col-unit">Unit</span>
                        <span className="cd-ing-col-name">Ingredient</span>
                        <span className="cd-ing-col-notes">Notes</span>
                        <span className="cd-ing-col-action"></span>
                      </div>
                      {newRecipe.ingredients.map((ing, idx) => (
                        <div key={ing.id} className="cd-ing-row">
                          <span className="cd-ing-num">{idx + 1}</span>
                          <input
                            type="text"
                            className="cd-ing-amount"
                            value={ing.amount}
                            onChange={(e) =>
                              updateIngredient(
                                ing.id,
                                "amount",
                                e.target.value
                              )
                            }
                            placeholder="200"
                          />
                          <select
                            className="cd-ing-unit"
                            value={ing.unit}
                            onChange={(e) =>
                              updateIngredient(
                                ing.id,
                                "unit",
                                e.target.value
                              )
                            }
                          >
                            {UNITS.map((u) => (
                              <option key={u} value={u}>
                                {u}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            className="cd-ing-name"
                            value={ing.name}
                            onChange={(e) =>
                              updateIngredient(
                                ing.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Beef chuck, cubed"
                          />
                          <input
                            type="text"
                            className="cd-ing-notes"
                            value={ing.notes}
                            onChange={(e) =>
                              updateIngredient(
                                ing.id,
                                "notes",
                                e.target.value
                              )
                            }
                            placeholder="Optional..."
                          />
                          <button
                            type="button"
                            className="cd-ing-remove"
                            onClick={() => removeIngredient(ing.id)}
                            disabled={newRecipe.ingredients.length <= 1}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="cd-ing-add-wrap">
                      <button
                        type="button"
                        className="cd-btn-add"
                        onClick={addIngredient}
                      >
                        <Plus size={16} /> Add Ingredient
                      </button>
                    </div>
                  </div>
                </div>

                {/* — Instructions — */}
                <div className="cd-card">
                  <div className="cd-card-header">
                    <FileText size={18} className="cd-card-header-icon" />
                    <h3>Instructions</h3>
                    <span className="cd-card-header-count">
                      {filledSteps.length} steps
                    </span>
                  </div>
                  <div className="cd-card-body">
                    <div className="cd-steps-list">
                      {newRecipe.instructions.map((step, idx) => (
                        <div key={step.id} className="cd-step">
                          <div className="cd-step-num">{idx + 1}</div>
                          <div className="cd-step-content">
                            <textarea
                              className="cd-input cd-textarea"
                              rows={3}
                              value={step.text}
                              onChange={(e) =>
                                updateStep(
                                  step.id,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder={`Step ${idx + 1} instructions...`}
                            />
                            <div className="cd-step-image-wrap">
                              <Camera
                                size={14}
                                className="cd-step-img-icon"
                              />
                              <input
                                type="url"
                                className="cd-step-img-input"
                                value={step.image}
                                onChange={(e) =>
                                  updateStep(
                                    step.id,
                                    "image",
                                    e.target.value
                                  )
                                }
                                placeholder="Step image URL (optional)"
                              />
                            </div>
                            {step.image && (
                              <img
                                src={step.image}
                                alt={`Step ${idx + 1}`}
                                className="cd-step-img-preview"
                              />
                            )}
                          </div>
                          <button
                            type="button"
                            className="cd-step-remove"
                            onClick={() => removeStep(step.id)}
                            disabled={
                              newRecipe.instructions.length <= 1
                            }
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="cd-btn-add"
                      onClick={addStep}
                    >
                      <Plus size={16} /> Add Step
                    </button>
                  </div>
                </div>

                {/* — Chef Note — */}
                <div className="cd-card">
                  <div className="cd-card-header">
                    <MessageSquare
                      size={18}
                      className="cd-card-header-icon"
                    />
                    <h3>Chef's Note</h3>
                  </div>
                  <div className="cd-card-body">
                    <textarea
                      className="cd-input cd-textarea"
                      rows={4}
                      value={newRecipe.chefNote}
                      onChange={(e) =>
                        setNewRecipe({
                          ...newRecipe,
                          chefNote: e.target.value,
                        })
                      }
                      placeholder="Share tips, stories, or what makes this recipe special..."
                    />
                  </div>
                </div>

                {/* — Settings — */}
                <div className="cd-card">
                  <div className="cd-card-header">
                    <Star size={18} className="cd-card-header-icon" />
                    <h3>Settings</h3>
                  </div>
                  <div className="cd-card-body">
                    <div className="cd-toggle-wrap">
                      <div className="cd-toggle-info">
                        <h4>Public</h4>
                        <p>This recipe will be visible to all users</p>
                      </div>
                      <button
                        type="button"
                        className={`cd-toggle-switch ${newRecipe.isPublic ? "active" : ""}`}
                        onClick={() =>
                          setNewRecipe({
                            ...newRecipe,
                            isPublic: !newRecipe.isPublic,
                          })
                        }
                      />
                    </div>
                    <div className="cd-toggle-wrap cd-toggle-last">
                      <div className="cd-toggle-info">
                        <h4>Allow Comments</h4>
                        <p>
                          Readers can leave reviews and comments
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`cd-toggle-switch ${newRecipe.allowComments ? "active" : ""}`}
                        onClick={() =>
                          setNewRecipe({
                            ...newRecipe,
                            allowComments: !newRecipe.allowComments,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* — Bottom Action Bar — */}
                <div className="cd-bottom-bar">
                  <button
                    type="button"
                    className="cd-btn-discard"
                    onClick={handleDiscard}
                  >
                    Discard
                  </button>
                  <div className="cd-bottom-bar-right">
                    <button
                      type="button"
                      className="cd-btn-outline"
                      onClick={() => handleSaveRecipe("Draft")}
                      disabled={!newRecipe.title.trim()}
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      className="cd-btn-primary cd-btn-lg"
                      onClick={() => handleSaveRecipe("Published")}
                      disabled={!canPublish || !isVerified}
                      title={!isVerified ? 'Publishing is locked until your identity is verified' : ''}
                    >
                      {!isVerified && <Lock size={14} />}
                      {isVerified ? 'Publish Recipe' : 'Publish Locked'}
                    </button>
                  </div>
                </div>
              </div>

              {/* ──── RIGHT COLUMN (sidebar) ──── */}
              <div className="cd-add-sidebar">
                {/* Live Preview */}
                <div className="cd-card cd-sidebar-card">
                  <h4 className="cd-sidebar-title">Live Preview</h4>
                  <div className="cd-live-preview">
                    {newRecipe.coverImage ? (
                      <img
                        src={newRecipe.coverImage}
                        alt=""
                        className="cd-lp-cover"
                      />
                    ) : (
                      <div className="cd-lp-cover-ph">
                        <ImagePlus className="cd-lp-ph-icon" />
                      </div>
                    )}
                    <div className="cd-lp-body">
                      {newRecipe.category && (
                        <span className="cd-lp-category">
                          {newRecipe.category}
                        </span>
                      )}
                      <h5 className="cd-lp-title">
                        {newRecipe.title || "Your Recipe Title"}
                      </h5>
                      <div className="cd-lp-meta">
                        <span className="cd-lp-rating">
                          <Star size={14} /> 0.0
                        </span>
                        {newRecipe.cookTime && (
                          <span className="cd-lp-time">
                            <Clock size={14} /> {newRecipe.cookTime} min
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Publish Checklist */}
                <div className="cd-card cd-sidebar-card">
                  <h4 className="cd-sidebar-title">Publish Checklist</h4>
                  <div className="cd-checklist">
                    {checklist.map((item, i) => (
                      <div
                        key={i}
                        className={`cd-check-item ${item.done ? "done" : ""}`}
                      >
                        {item.done ? (
                          <CheckCircle2
                            size={18}
                            className="cd-check-icon done"
                          />
                        ) : (
                          <span className="cd-check-empty" />
                        )}
                        <span className="cd-check-label">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`cd-btn-publish-full ${canPublish && isVerified ? "" : "disabled"}`}
                    onClick={() =>
                      canPublish && isVerified && handleSaveRecipe("Published")
                    }
                    disabled={!canPublish || !isVerified}
                    title={!isVerified ? 'Publishing is locked until your identity is verified' : ''}
                  >
                    {!isVerified && <Lock size={14} />}
                    {isVerified ? 'Publish Recipe' : 'Publish Locked'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            ANALYTICS TAB
            ═══════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="cd-content cd-fade-in">
            <div className="cd-page-header">
              <div>
                <h1 className="cd-page-title">Analytics</h1>
                <p className="cd-page-sub">
                  Track your recipe performance
                </p>
              </div>
            </div>

            <div className="cd-stats-grid">
              <div className="cd-stat-card">
                <div className="cd-stat-icon-wrap cd-stat-emerald">
                  <BookOpen className="cd-stat-icon" />
                </div>
                <div className="cd-stat-data">
                  <span className="cd-stat-num">{recipes.length}</span>
                  <span className="cd-stat-label">Total Recipes</span>
                </div>
              </div>
              <div className="cd-stat-card">
                <div className="cd-stat-icon-wrap cd-stat-blue">
                  <Clock className="cd-stat-icon" />
                </div>
                <div className="cd-stat-data">
                  <span className="cd-stat-num">{draftRecipes.length}</span>
                  <span className="cd-stat-label">Drafts</span>
                </div>
              </div>
              <div className="cd-stat-card">
                <div className="cd-stat-icon-wrap cd-stat-rose">
                  <MessageSquare className="cd-stat-icon" />
                </div>
                <div className="cd-stat-data">
                  <span className="cd-stat-num">{totalReviews}</span>
                  <span className="cd-stat-label">Reviews</span>
                </div>
              </div>
              <div className="cd-stat-card">
                <div className="cd-stat-icon-wrap cd-stat-amber">
                  <Star className="cd-stat-icon" />
                </div>
                <div className="cd-stat-data">
                  <span className="cd-stat-num">
                    {publishedRecipes.length}
                  </span>
                  <span className="cd-stat-label">Published</span>
                </div>
              </div>
            </div>

            <div className="cd-card">
              <div className="cd-card-header">
                <BarChart3 size={18} className="cd-card-header-icon" />
                <h3>Recipe Performance</h3>
              </div>
              <div className="cd-card-body cd-card-body-flush">
                <div className="cd-analytics-table-wrap">
                  <table className="cd-analytics-table">
                    <thead>
                      <tr>
                        <th>Recipe</th>
                        <th>Status</th>
                        <th>Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes.map((r) => (
                        <tr key={r.id}>
                          <td className="cd-at-name">{r.title}</td>
                          <td>
                            <span
                              className={`cd-status-pill-sm ${r.status === "Published" ? "published" : "draft"}`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td>{getReviewCount(r)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            PROFILE SETTINGS TAB
            ═══════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="cd-content cd-fade-in">
            <div className="cd-page-header">
              <div>
                <h1 className="cd-page-title">Profile Settings</h1>
                <p className="cd-page-sub">
                  Customize how you appear to the community
                </p>
              </div>
              {profileSaved && (
                <span className="cd-saved-badge">
                  <CheckCircle2 size={16} /> Profile saved
                </span>
              )}
            </div>

            <div className="cd-settings-layout">
              {/* Preview */}
              <div className="cd-profile-preview">
                <div className="cd-pp-header">
                  <div className="cd-pp-avatar">
                    {user.name
                      ? user.name.charAt(0).toUpperCase()
                      : "C"}
                  </div>
                  <h3 className="cd-pp-name">
                    {profile.displayName || user.name}
                  </h3>
                  {profile.specialty && (
                    <p className="cd-pp-specialty">
                      {profile.specialty}
                    </p>
                  )}
                  {profile.location && (
                    <p className="cd-pp-location">
                      <MapPin size={14} /> {profile.location}
                    </p>
                  )}
                </div>
                {profile.bio && (
                  <p className="cd-pp-bio">{profile.bio}</p>
                )}
                <div className="cd-pp-stats">
                  <div className="cd-pp-stat">
                    <span className="cd-pp-stat-num">
                      {recipes.length}
                    </span>
                    <span className="cd-pp-stat-label">Recipes</span>
                  </div>
                  <div className="cd-pp-stat">
                    <span className="cd-pp-stat-num">{totalReviews}</span>
                    <span className="cd-pp-stat-label">Reviews</span>
                  </div>
                  <div className="cd-pp-stat">
                    <span className="cd-pp-stat-num">{draftRecipes.length}</span>
                    <span className="cd-pp-stat-label">Drafts</span>
                  </div>
                </div>
                {(profile.instagram ||
                  profile.twitter ||
                  profile.website) && (
                  <div className="cd-pp-socials">
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cd-pp-social-link"
                      >
                        <Globe size={14} /> Website
                      </a>
                    )}
                    {profile.instagram && (
                      <a
                        href={`https://instagram.com/${profile.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cd-pp-social-link"
                      >
                        <Link2 size={14} /> @{profile.instagram}
                      </a>
                    )}
                    {profile.twitter && (
                      <a
                        href={`https://twitter.com/${profile.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cd-pp-social-link"
                      >
                        <AtSign size={14} /> @{profile.twitter}
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="cd-settings-form">
                <div className="cd-card">
                  <div className="cd-card-header">
                    <ChefHat
                      size={18}
                      className="cd-card-header-icon"
                    />
                    <h3>Personal Information</h3>
                  </div>
                  <div className="cd-card-body">
                    <div className="cd-field">
                      <label>Display Name</label>
                      <input
                        type="text"
                        className="cd-input"
                        value={profile.displayName}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            displayName: e.target.value,
                          })
                        }
                        placeholder="How you want to be known"
                      />
                    </div>
                    <div className="cd-field">
                      <label>
                        Bio{" "}
                        <span className="cd-label-hint">
                          Tell your story
                        </span>
                      </label>
                      <textarea
                        className="cd-input cd-textarea"
                        rows={5}
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            bio: e.target.value,
                          })
                        }
                        placeholder="Share your culinary journey..."
                      />
                      <span className="cd-char-count">
                        {profile.bio.length} / 500
                      </span>
                    </div>
                    <div className="cd-field-row cd-field-row-2">
                      <div className="cd-field">
                        <label>
                          <MapPin size={14} className="cd-label-icon" />{" "}
                          Location
                        </label>
                        <input
                          type="text"
                          className="cd-input"
                          value={profile.location}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              location: e.target.value,
                            })
                          }
                          placeholder="e.g. Kathmandu, Nepal"
                        />
                      </div>
                      <div className="cd-field">
                        <label>
                          <ChefHat
                            size={14}
                            className="cd-label-icon"
                          />{" "}
                          Specialty
                        </label>
                        <input
                          type="text"
                          className="cd-input"
                          value={profile.specialty}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              specialty: e.target.value,
                            })
                          }
                          placeholder="e.g. Nepali Home Cooking"
                        />
                      </div>
                    </div>
                    <div className="cd-field">
                      <label>Years of Experience</label>
                      <input
                        type="text"
                        className="cd-input"
                        value={profile.experience}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            experience: e.target.value,
                          })
                        }
                        placeholder="e.g. 10+ years"
                      />
                    </div>
                  </div>
                </div>

                <div className="cd-card">
                  <div className="cd-card-header">
                    <Globe
                      size={18}
                      className="cd-card-header-icon"
                    />
                    <h3>Social Links</h3>
                  </div>
                  <div className="cd-card-body">
                    <div className="cd-field">
                      <label>
                        <Globe size={14} className="cd-label-icon" />{" "}
                        Website
                      </label>
                      <input
                        type="url"
                        className="cd-input"
                        value={profile.website}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            website: e.target.value,
                          })
                        }
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div className="cd-field-row cd-field-row-2">
                      <div className="cd-field">
                        <label>
                          <Link2
                            size={14}
                            className="cd-label-icon"
                          />{" "}
                          Instagram
                        </label>
                        <input
                          type="text"
                          className="cd-input"
                          value={profile.instagram}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              instagram: e.target.value,
                            })
                          }
                          placeholder="username"
                        />
                      </div>
                      <div className="cd-field">
                        <label>
                          <AtSign
                            size={14}
                            className="cd-label-icon"
                          />{" "}
                          Twitter / X
                        </label>
                        <input
                          type="text"
                          className="cd-input"
                          value={profile.twitter}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              twitter: e.target.value,
                            })
                          }
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="cd-form-footer">
                  <button
                    type="button"
                    className={`cd-btn-primary cd-btn-lg ${profileSaved ? "saved" : ""}`}
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                  >
                    {profileSaved ? (
                      <><CheckCircle2 size={16} /> Saved</>
                    ) : profileSaving ? (
                      <><Clock size={16} /> Saving...</>
                    ) : (
                      <><Save size={16} /> Save Profile</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
