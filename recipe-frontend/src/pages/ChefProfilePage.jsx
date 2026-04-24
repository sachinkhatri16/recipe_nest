import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BadgeCheck,
  MapPin,
  UtensilsCrossed,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Star,
  Mail,
  Globe,
  Link as LinkIcon,
  Briefcase
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { chefAPI } from "../services/api";
import "./ChefProfilePage.css";

export default function ChefProfilePage() {
  const { id } = useParams();
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, toggleSaveChef, isAuthenticated } = useAuth();

  useEffect(() => {
    setLoading(true);
    chefAPI
      .getOne(id)
      .then((data) => {
        setChef(data);
      })
      .catch((err) => {
        console.error("Failed to load chef:", err);
        setError("Failed to load chef profile");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="cpp-root">
        <Navbar activeItem="Chefs" />
        <div className="cpp-loading">Loading chef profile...</div>
      </div>
    );
  }

  if (error || !chef) {
    return (
      <div className="cpp-root">
        <Navbar activeItem="Chefs" />
        <div className="cpp-error">{error || "Chef not found"}</div>
      </div>
    );
  }

  const getInitials = (name) =>
    (name || "")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const isSaved = user?.savedChefs?.some((c) => (c._id || c) === chef._id);

  return (
    <div className="cpp-root">
      <Navbar activeItem="Chefs" />

      <main className="cpp-main">
        <section className="cpp-header">
          <div className="cpp-avatar">
            {chef.profile?.avatar ? (
              <img src={chef.profile.avatar} alt={chef.name} className="cpp-avatar-img" />
            ) : (
              getInitials(chef.name)
            )}
          </div>
          <div className="cpp-info">
            <h1 className="cpp-name">
              {chef.name}
              {chef.verificationStatus === "verified" && (
                <BadgeCheck className="cpp-verified-badge" />
              )}
            </h1>
            <div className="cpp-role">
              {chef.profile?.specialty && (
                <span className="cpp-specialty">
                  <UtensilsCrossed size={16} />
                  {chef.profile.specialty}
                </span>
              )}
              {chef.profile?.location && (
                <span className="cpp-location">
                  <MapPin size={16} />
                  {chef.profile.location}
                </span>
              )}
            </div>

            <div className="cpp-personal">
              {chef.email && (
                <a href={`mailto:${chef.email}`} className="cpp-personal-item">
                  <Mail size={16} /> {chef.email}
                </a>
              )}
              {chef.profile?.experience && (
                <span className="cpp-personal-item">
                  <Briefcase size={16} /> {chef.profile.experience}
                </span>
              )}
              {chef.profile?.website && (
                <a href={chef.profile.website} target="_blank" rel="noreferrer" className="cpp-personal-item">
                  <Globe size={16} /> Website
                </a>
              )}
              {chef.profile?.instagram && (
                <a href={chef.profile.instagram} target="_blank" rel="noreferrer" className="cpp-personal-item">
                  <LinkIcon size={16} /> Instagram
                </a>
              )}
              {chef.profile?.twitter && (
                <a href={chef.profile.twitter} target="_blank" rel="noreferrer" className="cpp-personal-item">
                  <LinkIcon size={16} /> Twitter
                </a>
              )}
            </div>
          </div>

          {chef.profile?.bio && <p className="cpp-bio">{chef.profile.bio}</p>}

          <div className="cpp-actions">
            {isAuthenticated && user?.role === "foodlover" && (
              <button
                className={`cpp-save-btn ${isSaved ? "saved" : ""}`}
                onClick={() => toggleSaveChef(chef._id)}
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck size={20} /> Saved
                  </>
                ) : (
                  <>
                    <Bookmark size={20} /> Save Chef
                  </>
                )}
              </button>
            )}
          </div>

          <div className="cpp-stats">
            <div className="cpp-stat">
              <span className="cpp-stat-value">{chef.recipeCount || 0}</span>
              <span className="cpp-stat-label">Recipes</span>
            </div>
            <div className="cpp-stat">
              <span className="cpp-stat-value">{chef.totalReviews || 0}</span>
              <span className="cpp-stat-label">Reviews</span>
            </div>
          </div>
        </section>

        <section className="cpp-recipes">
          <h2 className="cpp-section-title">
            <BookOpen size={24} />
            Recipes by {chef.name}
          </h2>

          {chef.recipes && chef.recipes.length > 0 ? (
            <div className="cpp-grid">
              {chef.recipes.map((recipe) => (
                <div key={recipe._id} className="prof-recipe-card">
                  <Link to={`/recipes/${recipe._id}`} className="prof-recipe-img-link">
                    <img
                      src={recipe.coverImage || "/images/recipes/momo.png"}
                      alt={recipe.title}
                      className="prof-recipe-img"
                    />
                    <span className="prof-recipe-origin-badge">{recipe.category}</span>
                  </Link>
                  <div className="prof-recipe-body">
                    <Link to={`/recipes/${recipe._id}`}>
                      <h3 className="prof-recipe-name">{recipe.title}</h3>
                    </Link>
                    <div className="prof-recipe-foot" style={{ marginTop: '0.5rem' }}>
                      <span className="prof-recipe-rating">
                        <Star className="prof-star-icon" />
                        {recipe.reviews?.length || 0} reviews
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cpp-empty">This chef hasn't published any recipes yet.</div>
          )}
        </section>
      </main>
    </div>
  );
}
