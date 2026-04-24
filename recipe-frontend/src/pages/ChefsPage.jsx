import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ChefHat,
  Search,
  X,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { chefAPI } from "../services/api";
import "./ChefsPage.css";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function ChefsPage() {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const { user, toggleSaveChef } = useAuth();

  useEffect(() => {
    chefAPI
      .getAll()
      .then((data) => setChefs(data))
      .catch((err) => console.error("Failed to load chefs:", err))
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const filtered = useMemo(() => {
    if (!query.trim()) return chefs;
    const q = query.toLowerCase();
    return chefs.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.profile?.specialty || "").toLowerCase().includes(q) ||
        (c.profile?.location || "").toLowerCase().includes(q)
    );
  }, [query, chefs]);

  return (
    <div className="cp-root">
      <Navbar activeItem="Chefs" />

      {/* ============================================================ */}
      {/*  Hero                                                        */}
      {/* ============================================================ */}
      <section className="cp-hero">
        <div className="cp-hero-bg">
          <img
            src="/images/chefs-hero.png"
            alt="A chef's workspace with spices and dough"
            className="cp-hero-bg-img"
          />
          <div className="cp-hero-overlay" />
        </div>

        <div className="cp-hero-inner">
          <p className="cp-hero-label">RecipeNest</p>
          <h1 className="cp-hero-title">
            The cooks behind every recipe
          </h1>
          <p className="cp-hero-sub">
            Home cooks and trained chefs from Nepal and India sharing
            traditions passed down through generations.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Search + Grid                                                */}
      {/* ============================================================ */}
      <main className="cp-main">
        <div className="cp-container">
          {/* Search */}
          <div className="cp-search-bar">
            <Search className="cp-search-icon" />
            <input
              type="text"
              className="cp-search-input"
              placeholder="Search chefs by name, specialty, or region..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="cp-search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X className="cp-search-clear-icon" />
              </button>
            )}
          </div>

          <div className="cp-meta-row">
            <span className="cp-result-count">
              {filtered.length} {filtered.length === 1 ? "chef" : "chefs"}
            </span>
          </div>

          {/* Chef cards */}
          {loading ? (
            <div className="cp-empty">
              <p className="cp-empty-title">Loading chefs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="cp-empty">
              <p className="cp-empty-title">No chefs match your search</p>
              <p className="cp-empty-sub">
                Try a different name or specialty.
              </p>
              <button
                type="button"
                className="cp-empty-reset"
                onClick={() => setQuery("")}
              >
                Reset
              </button>
            </div>
          ) : (
            <div className="cp-grid">
              {filtered.map((chef) => {
                const isSaved = user?.savedChefs?.includes(chef._id);
                return (
                  <article key={chef._id} className="cp-card">
                  {/* Top band -- avatar / identity */}
                  <div className="cp-card-top">
                    <div className="cp-card-avatar-wrap">
                      <div className="cp-card-avatar">{getInitials(chef.name)}</div>
                      {chef.verificationStatus === "verified" && (
                        <span className="cp-card-badge">
                          <BadgeCheck className="cp-card-badge-icon" />
                        </span>
                      )}
                    </div>

                    <div className="cp-card-identity">
                      <h2 className="cp-card-name">{chef.name}</h2>
                      <p className="cp-card-specialty">{chef.profile?.specialty || "Home Chef"}</p>
                      <p className="cp-card-region">{chef.profile?.location || ""}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="cp-card-bio">{chef.profile?.bio || ""}</p>

                  {/* Stats */}
                  <div className="cp-card-stats">
                    <div className="cp-card-stat">
                      <BookOpen className="cp-card-stat-icon" />
                      <span className="cp-card-stat-num">{chef.recipeCount || 0}</span>
                      <span className="cp-card-stat-label">Recipes</span>
                    </div>
                    <div className="cp-card-stat">
                      <ChefHat className="cp-card-stat-icon" />
                      <span className="cp-card-stat-num">{chef.totalReviews || 0}</span>
                      <span className="cp-card-stat-label">Reviews</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="cp-card-actions">
                    <Link to="/recipes" className="cp-card-cta">
                      View All Recipes
                      <ArrowRight className="cp-card-cta-icon" />
                    </Link>
                    {user && (
                      <button 
                        className={`cp-card-follow-btn ${isSaved ? 'is-followed' : ''}`}
                        onClick={() => toggleSaveChef(chef._id)}
                      >
                        {isSaved ? (
                          <>
                            <BookmarkCheck className="w-4 h-4" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-4 h-4" />
                            Save Chef
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>

      {/* Footer */}
      <footer className="cp-footer">
        <div className="cp-footer-inner">
          <p className="cp-footer-brand">
            Recipe<span className="cp-footer-accent">Nest</span>
          </p>
          <p className="cp-footer-copy">RecipeNest&trade;</p>
        </div>
      </footer>
    </div>
  );
}
