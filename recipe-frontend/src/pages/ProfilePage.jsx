import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Heart, 
  LogOut, 
  ChevronRight,
  BookOpen,
  Users,
  Star,
  ArrowRight,
  BadgeCheck,
  UtensilsCrossed,
  MessageSquare
} from "lucide-react";
import "./ProfilePage.css";

// In a real app this would come from an API
const RECIPES = [
  { id: 1, name: "Momo", image: "/images/recipes/momo.png", origin: "Nepali", chef: "Asha Tamang", rating: 4.8 },
  { id: 2, name: "Dal Bhat", image: "/images/recipes/dal-bhat.png", origin: "Nepali", chef: "Rajan Shrestha", rating: 4.9 },
  { id: 3, name: "Sel Roti", image: "/images/recipes/sel-roti.png", origin: "Nepali", chef: "Asha Tamang", rating: 4.7 },
  { id: 4, name: "Thukpa", image: "/images/recipes/thukpa.png", origin: "Nepali", chef: "Rajan Shrestha", rating: 4.6 },
  { id: 5, name: "Butter Chicken", image: "/images/recipes/butter-chicken.png", origin: "Indian", chef: "Priya Sharma", rating: 4.9 },
  { id: 6, name: "Masala Dosa", image: "/images/recipes/masala-dosa.png", origin: "Indian", chef: "Arjun Nair", rating: 4.5 },
  { id: 7, name: "Hyderabadi Biryani", image: "/images/recipes/biryani.png", origin: "Indian", chef: "Priya Sharma", rating: 4.8 },
  { id: 8, name: "Palak Paneer", image: "/images/recipes/palak-paneer.png", origin: "Indian", chef: "Arjun Nair", rating: 4.4 },
];

const CHEFS = [
  { id: "asha-tamang", name: "Asha Tamang", specialty: "Nepali Home Cooking", initials: "AT", recipes: 12, verified: true },
  { id: "priya-sharma", name: "Priya Sharma", specialty: "North Indian Classics", initials: "PS", recipes: 18, verified: true },
  { id: "arjun-nair", name: "Arjun Nair", specialty: "South Indian & Vegetarian", initials: "AN", recipes: 9, verified: true },
  { id: "rajan-shrestha", name: "Rajan Shrestha", specialty: "Nepali Street & Comfort Food", initials: "RS", recipes: 15, verified: true },
];

const TABS = [
  { id: "saved-recipes", label: "Saved Recipes", icon: Heart },
  { id: "saved-chefs", label: "Saved Chefs", icon: Users },
  { id: "reviews", label: "My Reviews", icon: MessageSquare },
  { id: "all-recipes", label: "All Recipes", icon: BookOpen },
];

export default function ProfilePage() {
  const { user, isAuthenticated, logout, toggleSaveRecipe, toggleSaveChef } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved-recipes");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  const savedRecipes = RECIPES.filter(r => user.savedRecipes.includes(r.id));
  const savedChefs = CHEFS.filter(c => user.savedChefs.includes(c.id));
  const verifiedChefs = CHEFS.filter(c => c.verified);

  return (
    <div className="prof-root">
      <Navbar activeItem="Profile" />
      
      <main className="prof-main">
        {/* Profile Header */}
        <section className="prof-hero">
          <div className="prof-hero-bg"></div>
          <div className="prof-hero-inner">
            <div className="prof-hero-row">
              <div className="prof-hero-left">
                <div className="prof-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="prof-identity">
                  <h1 className="prof-name">{user.name || 'User'}</h1>
                  <span className="prof-role-badge">
                    <UtensilsCrossed className="prof-role-icon" />
                    {user.role === 'chef' ? 'Home Chef' : 'Food Lover'}
                  </span>
                </div>
              </div>
              <button onClick={logout} className="prof-logout-btn">
                <LogOut className="prof-logout-icon" />
                <span className="prof-logout-text">Sign out</span>
              </button>
            </div>

            {/* Stats strip */}
            <div className="prof-stats-row">
              <div className="prof-stat">
                <span className="prof-stat-num">{user.savedRecipes.length}</span>
                <span className="prof-stat-label">Saved Recipes</span>
              </div>
              <div className="prof-stat-sep"></div>
              <div className="prof-stat">
                <span className="prof-stat-num">{user.savedChefs.length}</span>
                <span className="prof-stat-label">Saved Chefs</span>
              </div>
              <div className="prof-stat-sep"></div>
              <div className="prof-stat">
                <span className="prof-stat-num">0</span>
                <span className="prof-stat-label">Reviews</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="prof-tabs-wrap">
          <div className="prof-tabs-inner">
            <nav className="prof-tabs">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    className={`prof-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="prof-tab-icon" />
                    <span className="prof-tab-label">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="prof-content-wrap">
          <div className="prof-content-inner">
            
            {/* Saved Recipes Tab */}
            {activeTab === "saved-recipes" && (
              <section className="prof-section prof-fade-in">
                <div className="prof-section-header">
                  <div>
                    <h2 className="prof-section-title">Saved Recipes</h2>
                    <p className="prof-section-sub">Recipes you've bookmarked for later</p>
                  </div>
                  <Link to="/recipes" className="prof-section-link">
                    Browse all <ChevronRight className="prof-link-chevron" />
                  </Link>
                </div>

                {savedRecipes.length > 0 ? (
                  <div className="prof-recipe-grid">
                    {savedRecipes.map(recipe => (
                      <div key={recipe.id} className="prof-recipe-card">
                        <Link to={`/recipes/${recipe.id}`} className="prof-recipe-img-link">
                          <img src={recipe.image} alt={recipe.name} className="prof-recipe-img" />
                          <span className="prof-recipe-origin-badge">{recipe.origin}</span>
                        </Link>
                        <div className="prof-recipe-body">
                          <Link to={`/recipes/${recipe.id}`}>
                            <h3 className="prof-recipe-name">{recipe.name}</h3>
                          </Link>
                          <p className="prof-recipe-chef">By {recipe.chef}</p>
                          <div className="prof-recipe-foot">
                            <span className="prof-recipe-rating">
                              <Star className="prof-star-icon" />
                              {recipe.rating}
                            </span>
                            <button 
                              onClick={() => toggleSaveRecipe(recipe.id)}
                              className="prof-recipe-unsave"
                              title="Remove from saved"
                            >
                              <Heart className="prof-heart-filled" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prof-empty">
                    <Heart className="prof-empty-icon" />
                    <h3 className="prof-empty-title">No saved recipes yet</h3>
                    <p className="prof-empty-text">Recipes you save will appear here for easy access.</p>
                    <Link to="/recipes" className="prof-empty-cta">
                      Explore Recipes <ArrowRight className="prof-cta-arrow" />
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* Saved Chefs Tab */}
            {activeTab === "saved-chefs" && (
              <section className="prof-section prof-fade-in">
                <div className="prof-section-header">
                  <div>
                    <h2 className="prof-section-title">Saved Chefs</h2>
                    <p className="prof-section-sub">Chefs you've saved to your collection</p>
                  </div>
                  <Link to="/chefs" className="prof-section-link">
                    Discover chefs <ChevronRight className="prof-link-chevron" />
                  </Link>
                </div>

                {savedChefs.length > 0 ? (
                  <div className="prof-chef-grid">
                    {savedChefs.map(chef => (
                      <div key={chef.id} className="prof-chef-card">
                        <div className="prof-chef-top">
                          <div className="prof-chef-avatar">{chef.initials}</div>
                          {chef.verified && (
                            <BadgeCheck className="prof-chef-verified" />
                          )}
                        </div>
                        <h3 className="prof-chef-name">{chef.name}</h3>
                        <p className="prof-chef-specialty">{chef.specialty}</p>
                        <div className="prof-chef-meta">
                          <span className="prof-chef-recipe-count">
                            <BookOpen className="prof-chef-meta-icon" />
                            {chef.recipes} recipes
                          </span>
                        </div>
                        <div className="prof-chef-actions">
                          <button 
                            onClick={() => toggleSaveChef(chef.id)}
                            className="prof-btn-unfollow"
                          >
                            Unsave
                          </button>
                          <Link to="/recipes" className="prof-btn-recipes">
                            Recipes
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prof-empty">
                    <Users className="prof-empty-icon" />
                    <h3 className="prof-empty-title">No saved chefs yet</h3>
                    <p className="prof-empty-text">Save chefs to keep track of their latest recipes.</p>
                    <Link to="/chefs" className="prof-empty-cta">
                      Browse Chefs <ArrowRight className="prof-cta-arrow" />
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <section className="prof-section prof-fade-in">
                <div className="prof-section-header">
                  <div>
                    <h2 className="prof-section-title">My Reviews</h2>
                    <p className="prof-section-sub">Reviews you've left on chef profiles</p>
                  </div>
                </div>
                <div className="prof-empty">
                  <MessageSquare className="prof-empty-icon" />
                  <h3 className="prof-empty-title">No reviews yet</h3>
                  <p className="prof-empty-text">Visit a chef's profile to leave a review and share your experience.</p>
                  <Link to="/chefs" className="prof-empty-cta">
                    Review a Chef <ArrowRight className="prof-cta-arrow" />
                  </Link>
                </div>
              </section>
            )}

            {/* All Recipes Tab */}
            {activeTab === "all-recipes" && (
              <section className="prof-section prof-fade-in">
                <div className="prof-section-header">
                  <div>
                    <h2 className="prof-section-title">All Recipes</h2>
                    <p className="prof-section-sub">Browse the full recipe collection</p>
                  </div>
                  <Link to="/recipes" className="prof-section-link">
                    View full page <ChevronRight className="prof-link-chevron" />
                  </Link>
                </div>
                <div className="prof-recipe-grid">
                  {RECIPES.map(recipe => (
                    <div key={recipe.id} className="prof-recipe-card">
                      <Link to={`/recipes/${recipe.id}`} className="prof-recipe-img-link">
                        <img src={recipe.image} alt={recipe.name} className="prof-recipe-img" />
                        <span className="prof-recipe-origin-badge">{recipe.origin}</span>
                      </Link>
                      <div className="prof-recipe-body">
                        <Link to={`/recipes/${recipe.id}`}>
                          <h3 className="prof-recipe-name">{recipe.name}</h3>
                        </Link>
                        <p className="prof-recipe-chef">By {recipe.chef}</p>
                        <div className="prof-recipe-foot">
                          <span className="prof-recipe-rating">
                            <Star className="prof-star-icon" />
                            {recipe.rating}
                          </span>
                          <button 
                            onClick={() => toggleSaveRecipe(recipe.id)}
                            className={`prof-recipe-save-btn ${user.savedRecipes.includes(recipe.id) ? 'saved' : ''}`}
                            title={user.savedRecipes.includes(recipe.id) ? "Remove from saved" : "Save recipe"}
                          >
                            <Heart className={`prof-heart-icon ${user.savedRecipes.includes(recipe.id) ? 'filled' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}



          </div>
        </div>
      </main>
    </div>
  );
}
