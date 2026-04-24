import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Heart, 
  ChevronRight,
  BookOpen,
  Users,
  Star,
  ArrowRight,
  BadgeCheck,
  UtensilsCrossed,
  MessageSquare,
  ChefHat
} from "lucide-react";
import { userAPI } from "../services/api";
import "./ProfilePage.css";

const TABS = [
  { id: "saved-recipes", label: "Saved Recipes", icon: Heart },
  { id: "saved-chefs", label: "Saved Chefs", icon: Users },
  { id: "reviews", label: "My Comments", icon: MessageSquare },
];

export default function ProfilePage() {
  const { user, isAuthenticated, toggleSaveRecipe, toggleSaveChef } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved-recipes");
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [savedChefs, setSavedChefs] = useState([]);
  const [myComments, setMyComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [becomingChef, setBecomingChef] = useState(false);

  const handleBecomeChef = async () => {
    if (!window.confirm("Are you sure you want to become a Chef? You will be redirected to the verification page.")) return;
    setBecomingChef(true);
    try {
      await userAPI.becomeChef();
      window.location.href = "/chef-verification";
    } catch (err) {
      console.error("Failed to become chef:", err);
      alert(err.message || "Failed to become chef");
    } finally {
      setBecomingChef(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const [recipes, chefs, comments] = await Promise.all([
          userAPI.getSavedRecipes(),
          userAPI.getSavedChefs(),
          userAPI.getMyComments(),
        ]);
        setSavedRecipes(recipes);
        setSavedChefs(chefs);
        setMyComments(comments);
      } catch (err) {
        console.error("Failed to load profile data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, user?.savedRecipes?.length, user?.savedChefs?.length]);

  if (!user) return null;

  const getInitials = (name) =>
    (name || "")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

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
            </div>

            {/* Stats strip */}
            <div className="prof-stats-row">
              <div className="prof-stat">
                <span className="prof-stat-num">{user.savedRecipes?.length || 0}</span>
                <span className="prof-stat-label">Saved Recipes</span>
              </div>
              <div className="prof-stat-sep"></div>
              <div className="prof-stat">
                <span className="prof-stat-num">{user.savedChefs?.length || 0}</span>
                <span className="prof-stat-label">Saved Chefs</span>
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

                {loading ? (
                  <div className="prof-empty">
                    <p className="prof-empty-title">Loading...</p>
                  </div>
                ) : savedRecipes.length > 0 ? (
                  <div className="prof-recipe-grid">
                    {savedRecipes.map(recipe => (
                      <div key={recipe._id} className="prof-recipe-card">
                        <Link to={`/recipes/${recipe._id}`} className="prof-recipe-img-link">
                          <img src={recipe.coverImage || "/images/recipes/momo.png"} alt={recipe.title} className="prof-recipe-img" />
                          <span className="prof-recipe-origin-badge">{recipe.category}</span>
                        </Link>
                        <div className="prof-recipe-body">
                          <Link to={`/recipes/${recipe._id}`}>
                            <h3 className="prof-recipe-name">{recipe.title}</h3>
                          </Link>
                          <p className="prof-recipe-chef">By {recipe.chef?.name || "Chef"}</p>
                          <div className="prof-recipe-foot">
                            <span className="prof-recipe-rating">
                              <Star className="prof-star-icon" />
                              {recipe.reviews?.length || 0} reviews
                            </span>
                            <button 
                              onClick={() => toggleSaveRecipe(recipe._id)}
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

                {loading ? (
                  <div className="prof-empty">
                    <p className="prof-empty-title">Loading...</p>
                  </div>
                ) : savedChefs.length > 0 ? (
                  <div className="prof-chef-grid">
                    {savedChefs.map(chef => (
                      <div key={chef._id} className="prof-chef-card">
                        <div className="prof-chef-top">
                          <div className="prof-chef-avatar">{getInitials(chef.name)}</div>
                          {chef.verificationStatus === "verified" && (
                            <BadgeCheck className="prof-chef-verified" />
                          )}
                        </div>
                        <h3 className="prof-chef-name">{chef.name}</h3>
                        <p className="prof-chef-specialty">{chef.profile?.specialty || "Home Chef"}</p>
                        <div className="prof-chef-meta">
                          <span className="prof-chef-recipe-count">
                            <BookOpen className="prof-chef-meta-icon" />
                            Chef
                          </span>
                        </div>
                        <div className="prof-chef-actions">
                          <button 
                            onClick={() => toggleSaveChef(chef._id)}
                            className="prof-btn-unfollow"
                          >
                            Unsave
                          </button>
                          <Link to="/chefs" className="prof-btn-recipes">
                            Profile
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

            {/* Comments Tab */}
            {activeTab === "reviews" && (
              <section className="prof-section prof-fade-in">
                <div className="prof-section-header">
                  <div>
                    <h2 className="prof-section-title">My Comments</h2>
                    <p className="prof-section-sub">Comments you've left on recipes</p>
                  </div>
                </div>
                {loading ? (
                  <div className="prof-empty">
                    <p className="prof-empty-title">Loading...</p>
                  </div>
                ) : myComments.length > 0 ? (
                  <div className="prof-comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
                    {myComments.map(comment => (
                      <div key={comment._id} className="prof-comment-card" style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', display: 'flex', gap: '1.5rem' }}>
                        <Link to={`/recipes/${comment.recipeId}`} style={{ flexShrink: 0 }}>
                          <img src={comment.recipeImage || "/images/recipes/momo.png"} alt={comment.recipeTitle} style={{ width: '80px', height: '80px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                        </Link>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Link to={`/recipes/${comment.recipeId}`} style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a', textDecoration: 'none' }}>
                              {comment.recipeTitle}
                            </Link>
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p style={{ color: '#475569', lineHeight: '1.5' }}>{comment.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prof-empty">
                    <MessageSquare className="prof-empty-icon" />
                    <h3 className="prof-empty-title">No comments yet</h3>
                    <p className="prof-empty-text">Visit a recipe to leave a comment and share your experience.</p>
                    <Link to="/recipes" className="prof-empty-cta">
                      Browse Recipes <ArrowRight className="prof-cta-arrow" />
                    </Link>
                  </div>
                )}
              </section>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
