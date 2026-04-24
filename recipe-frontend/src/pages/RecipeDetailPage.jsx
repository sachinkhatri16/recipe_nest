import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  ChefHat,
  Clock3,
  Flame,
  Star,
  Users,
  UtensilsCrossed,
  Bookmark,
  BookmarkCheck,
  MessageSquare
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { recipeAPI } from "../services/api";
import "./RecipeDetailPage.css";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function RecipeDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, user, toggleSaveRecipe, toggleSaveChef } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [activeTab, setActiveTab] = useState("ingredients");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    recipeAPI
      .getOne(id)
      .then((data) => setRecipe(data))
      .catch((err) => {
        console.error("Failed to load recipe:", err);
        setRecipe(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isRecipeSaved = user?.savedRecipes?.some(r => (r._id || r) === id);
  const isChefSaved = user?.savedChefs?.some(c => (c._id || c) === recipe?.chef?._id);

  const getInitials = (name) =>
    (name || "")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const avgRating =
    recipe?.reviews && recipe.reviews.length > 0
      ? (recipe.reviews.reduce((s, r) => s + (r.rating || 5), 0) / recipe.reviews.length).toFixed(1)
      : null;

  const totalTime = recipe ? parseInt(recipe.prepTime || 0) + parseInt(recipe.cookTime || 0) : 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const updatedReviews = await recipeAPI.addReview(id, reviewText);
      setRecipe(prev => ({ ...prev, reviews: updatedReviews }));
      setReviewText("");
    } catch (err) {
      console.error("Comment failed:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="rd-root">
        <Navbar activeItem="Recipes" />
        <main className="rd-not-found">
          <p className="rd-not-found-title">Loading recipe...</p>
        </main>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="rd-root">
        <Navbar activeItem="Recipes" />
        <main className="rd-not-found">
          <h1 className="rd-not-found-title">Recipe not found</h1>
          <p className="rd-not-found-sub">
            The recipe you are looking for does not exist.
          </p>
          <Link to="/recipes" className="rd-not-found-link">
            <ArrowLeft className="rd-back-icon" />
            Back to recipes
          </Link>
        </main>
      </div>
    );
  }

  const levelClass =
    recipe.level === "Easy"
      ? "rd-level-easy"
      : recipe.level === "Medium"
        ? "rd-level-medium"
        : "rd-level-hard";

  const chef = recipe.chef || {};
  const chefName = chef.name || "Chef";
  const chefInitials = getInitials(chefName);
  const chefSpecialty = chef.profile?.specialty || "Home Chef";
  const chefVerified = chef.verificationStatus === "verified";

  return (
    <div className="rd-root">
      <Navbar activeItem="Recipes" />

      {/* ============================================================ */}
      {/*  Hero image band                                             */}
      {/* ============================================================ */}
      <section className="rd-hero">
        <div className="rd-hero-bg">
          <img
            src={recipe.coverImage || "/images/recipes/momo.png"}
            alt={recipe.title}
            className="rd-hero-bg-img"
          />
          <div className="rd-hero-overlay" />
        </div>

        <div className="rd-hero-inner">
          <div className="rd-hero-top">
            <Link to="/recipes" className="rd-back">
              <ArrowLeft className="rd-back-icon" />
              All Recipes
            </Link>
            
            {isAuthenticated && user?.role === "foodlover" ? (
              <button 
                className={`rd-save-btn ${isRecipeSaved ? 'saved' : ''}`}
                onClick={() => toggleSaveRecipe(id)}
              >
                <Bookmark className="rd-save-icon" fill={isRecipeSaved ? "currentColor" : "none"} />
                {isRecipeSaved ? "Saved" : "Save Recipe"}
              </button>
            ) : (!isAuthenticated) ? (
              <button className="rd-save-btn disabled" title="Please log in to save recipes">
                <Bookmark className="rd-save-icon" />
                Save Recipe
              </button>
            ) : null}
          </div>

          <div className="rd-hero-content">
            <span className="rd-hero-origin">{recipe.category}</span>
            <h1 className="rd-hero-title">{recipe.title}</h1>
            <p className="rd-hero-desc">{recipe.description}</p>

            <div className="rd-hero-meta">
              <span className="rd-hero-meta-item">
                <Clock3 className="rd-hero-meta-icon" />
                {totalTime} min
              </span>
              <span className={`rd-hero-meta-item rd-hero-level ${levelClass}`}>
                <Flame className="rd-hero-meta-icon" />
                {recipe.level}
              </span>
              <span className="rd-hero-meta-item">
                <Users className="rd-hero-meta-icon" />
                {recipe.servings} servings
              </span>
              <span className="rd-hero-meta-item">
                <Star className="rd-hero-meta-star" />
                {avgRating || "New"}
                <span className="rd-hero-reviews">({recipe.reviews?.length || 0})</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Tabs Navigation                                             */}
      {/* ============================================================ */}
      <div className="rd-tabs-nav-container">
        <div className="rd-tabs-nav">
          <button className={`rd-tab-link ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>About</button>
          <button className={`rd-tab-link ${activeTab === 'ingredients' ? 'active' : ''}`} onClick={() => setActiveTab('ingredients')}>Ingredients</button>
          <button className={`rd-tab-link ${activeTab === 'instructions' ? 'active' : ''}`} onClick={() => setActiveTab('instructions')}>Instructions</button>
          {recipe.tips && recipe.tips.length > 0 && (
             <button className={`rd-tab-link ${activeTab === 'chef-tips' ? 'active' : ''}`} onClick={() => setActiveTab('chef-tips')}>Chef's Notes</button>
          )}
          <button className={`rd-tab-link ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            Comments <span className="rd-tab-badge">{recipe.reviews?.length || 0}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Content                                                     */}
      {/* ============================================================ */}
      <main className="rd-main">
        <div className="rd-container">
          <div className="rd-layout">
            {/* ---- Left column: recipe body ---- */}
            <div className="rd-body">
              {/* About */}
              {activeTab === 'about' && (
                <section id="about" className="rd-section">
                  <h2 className="rd-section-title">About this dish</h2>
                  <p className="rd-section-text">{recipe.longDescription || recipe.description}</p>
                </section>
              )}

              {/* Ingredients */}
              {activeTab === 'ingredients' && (
                <section id="ingredients" className="rd-section">
                  <h2 className="rd-section-title">Ingredients</h2>
                  <ul className="rd-ingredients">
                    {(recipe.ingredients || []).map((item, i) => (
                      <li key={i} className="rd-ingredient">
                        <span className="rd-ingredient-dot" />
                        {typeof item === "string" ? item : `${item.amount || ""} ${item.unit || ""} ${item.name || ""}`.trim()}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Steps */}
              {activeTab === 'instructions' && (
                <section id="instructions" className="rd-section">
                  <h2 className="rd-section-title">Instructions</h2>
                  <ol className="rd-steps">
                    {(recipe.instructions || []).map((step, i) => (
                      <li key={i} className="rd-step">
                        <span className="rd-step-num">{i + 1}</span>
                        <p className="rd-step-text">{typeof step === "string" ? step : step.text}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {/* Tips */}
              {activeTab === 'chef-tips' && recipe.tips && recipe.tips.length > 0 && (
                <section id="chef-tips" className="rd-section">
                  <div className="rd-chef-notes-card">
                    <div className="rd-chef-notes-header">
                      <div className="rd-chef-notes-avatar">{chefInitials}</div>
                      <div>
                        <p className="rd-chef-notes-name">{chefName}</p>
                        <p className="rd-chef-notes-label">CHEF'S TIPS</p>
                      </div>
                    </div>
                    <ul className="rd-chef-notes-list">
                      {recipe.tips.map((tip, i) => (
                        <li key={i} className="rd-chef-notes-item">{tip}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              {/* Comments */}
              {activeTab === 'reviews' && (
                <section id="reviews" className="rd-section">
                  <h2 className="rd-section-title">Comments ({recipe.reviews?.length || 0})</h2>
                
                {isAuthenticated && user?.role === "foodlover" ? (
                  <form className="rd-review-form" onSubmit={handleSubmitReview}>
                    <textarea 
                      className="rd-review-input" 
                      placeholder="What did you think of this recipe?" 
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                    />
                    <div className="rd-review-actions">
                      <button type="submit" className="rd-review-submit" disabled={submittingReview}>
                        {submittingReview ? "Posting..." : "Post Comment"}
                      </button>
                    </div>
                  </form>
                ) : (!isAuthenticated) ? (
                  <div className="rd-login-prompt">
                    <MessageSquare className="rd-login-icon" />
                    <p>Food lovers must be logged in to share their thoughts.</p>
                  </div>
                ) : null}
                
                <div className="rd-reviews-list">
                  {(recipe.reviews || []).map((review, idx) => (
                    <div key={review._id || idx} className="rd-review-item">
                      <div className="rd-review-header">
                        <span className="rd-review-user">{review.user?.name || "Anonymous"}</span>
                        <span className="rd-review-date">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="rd-review-text">{review.text}</p>
                    </div>
                  ))}
                </div>
              </section>
              )}
            </div>

            {/* ---- Right column: chef sidebar ---- */}
            <aside className="rd-sidebar">
              {/* Quick facts */}
              <div className="rd-sidebar-card">
                <p className="rd-sidebar-card-label">Quick Facts</p>
                <div className="rd-quick-facts">
                  <div className="rd-fact">
                    <Clock3 className="rd-fact-icon" />
                    <div>
                      <p className="rd-fact-value">{totalTime} min</p>
                      <p className="rd-fact-label">Cook time</p>
                    </div>
                  </div>
                  <div className="rd-fact">
                    <Users className="rd-fact-icon" />
                    <div>
                      <p className="rd-fact-value">{recipe.servings}</p>
                      <p className="rd-fact-label">Servings</p>
                    </div>
                  </div>
                  <div className="rd-fact">
                    <Flame className="rd-fact-icon" />
                    <div>
                      <p className="rd-fact-value">{recipe.calories || "N/A"}</p>
                      <p className="rd-fact-label">Calories</p>
                    </div>
                  </div>
                  <div className="rd-fact">
                    <UtensilsCrossed className="rd-fact-icon" />
                    <div>
                      <p className="rd-fact-value">{recipe.level}</p>
                      <p className="rd-fact-label">Difficulty</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chef card */}
              <div className="rd-sidebar-card rd-chef-card">
                <p className="rd-sidebar-card-label">Recipe by</p>
                <div className="rd-chef-top">
                  <div className="rd-chef-avatar-wrap">
                    <div className="rd-chef-avatar">{chefInitials}</div>
                    {chefVerified && (
                      <span className="rd-chef-badge">
                        <BadgeCheck className="rd-chef-badge-icon" />
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="rd-chef-name">{chefName}</p>
                    <p className="rd-chef-specialty">{chefSpecialty}</p>
                  </div>
                </div>
                <div className="rd-chef-actions">
                  <Link to={`/chefs/${recipe.chef?._id}`} className="rd-chef-link">
                    <BookOpen className="rd-chef-link-icon" />
                    View Profile
                  </Link>
                  {isAuthenticated && user?.role === "foodlover" ? (
                    <button 
                      className={`rd-chef-save-btn ${isChefSaved ? 'saved' : ''}`}
                      onClick={() => toggleSaveChef(chef._id)}
                    >
                      <BookmarkCheck className="rd-chef-link-icon" fill={isChefSaved ? "currentColor" : "none"} />
                      {isChefSaved ? "Saved" : "Save Chef"}
                    </button>
                  ) : (!isAuthenticated) ? (
                    <button className="rd-chef-save-btn disabled" title="Please log in to save chefs">
                      <Bookmark className="rd-chef-link-icon" />
                      Save Chef
                    </button>
                  ) : null}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="rd-footer">
        <div className="rd-footer-inner">
          <p className="rd-footer-brand">
            Recipe<span className="rd-footer-accent">Nest</span>
          </p>
          <p className="rd-footer-copy">RecipeNest&trade;</p>
        </div>
      </footer>
    </div>
  );
}
