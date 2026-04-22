import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ChefHat,
  Search,
  Star,
  X,
  UserPlus,
  UserCheck,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./ChefsPage.css";

/* ------------------------------------------------------------------ */
/*  Data — Nepal & India only                                          */
/* ------------------------------------------------------------------ */
const CHEFS = [
  {
    id: "asha-tamang",
    name: "Asha Tamang",
    specialty: "Nepali Home Cooking",
    region: "Kathmandu, Nepal",
    bio: "Third-generation cook preserving the recipes her grandmother taught in a wood-fire kitchen in Patan. Specialises in traditional Newari feasts and everyday dal-bhat preparations.",
    recipeCount: 42,
    rating: 4.9,
    yearsExp: 18,
    initials: "AT",
    verified: true,
    image: "/images/recipes/momo.png",
    featured: [
      { name: "Momo", time: "40m", image: "/images/recipes/momo.png" },
      { name: "Sel Roti", time: "25m", image: "/images/recipes/sel-roti.png" },
      { name: "Dal Bhat", time: "35m", image: "/images/recipes/dal-bhat.png" },
    ],
  },
  {
    id: "priya-sharma",
    name: "Priya Sharma",
    specialty: "North Indian Classics",
    region: "Delhi, India",
    bio: "Trained at IHM Delhi and ran a home kitchen for ten years before sharing recipes online. Known for rich gravies, slow-cooked biryanis, and buttery naan traditions.",
    recipeCount: 67,
    rating: 5.0,
    yearsExp: 22,
    initials: "PS",
    verified: true,
    image: "/images/recipes/butter-chicken.png",
    featured: [
      { name: "Butter Chicken", time: "50m", image: "/images/recipes/butter-chicken.png" },
      { name: "Hyderabadi Biryani", time: "75m", image: "/images/recipes/biryani.png" },
    ],
  },
  {
    id: "arjun-nair",
    name: "Arjun Nair",
    specialty: "South Indian & Vegetarian",
    region: "Kochi, India",
    bio: "Plant-forward cooking rooted in Kerala tradition. Arjun believes every meal should start with freshly ground coconut and curry leaves from the backyard.",
    recipeCount: 38,
    rating: 4.8,
    yearsExp: 14,
    initials: "AN",
    verified: true,
    image: "/images/recipes/masala-dosa.png",
    featured: [
      { name: "Masala Dosa", time: "30m", image: "/images/recipes/masala-dosa.png" },
      { name: "Palak Paneer", time: "35m", image: "/images/recipes/palak-paneer.png" },
    ],
  },
  {
    id: "rajan-shrestha",
    name: "Rajan Shrestha",
    specialty: "Nepali Street & Comfort Food",
    region: "Pokhara, Nepal",
    bio: "From the lakeside stalls of Pokhara to your kitchen. Rajan documents the warming soups, thukpas, and snacks of highland Nepal with unfussy technique.",
    recipeCount: 31,
    rating: 4.7,
    yearsExp: 12,
    initials: "RS",
    verified: true,
    image: "/images/recipes/thukpa.png",
    featured: [
      { name: "Dal Bhat", time: "35m", image: "/images/recipes/dal-bhat.png" },
      { name: "Thukpa", time: "45m", image: "/images/recipes/thukpa.png" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function ChefsPage() {
  const [query, setQuery] = useState("");
  const { user, toggleSaveChef } = useAuth();

  const filtered = useMemo(() => {
    if (!query.trim()) return CHEFS;
    const q = query.toLowerCase();
    return CHEFS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.specialty.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
    );
  }, [query]);

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
          {filtered.length === 0 ? (
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
                const isFollowed = user?.savedChefs?.includes(chef.id);
                return (
                  <article key={chef.id} className="cp-card">
                  {/* Top band -- avatar / identity */}
                  <div className="cp-card-top">
                    <div className="cp-card-avatar-wrap">
                      <div className="cp-card-avatar">{chef.initials}</div>
                      {chef.verified && (
                        <span className="cp-card-badge">
                          <BadgeCheck className="cp-card-badge-icon" />
                        </span>
                      )}
                    </div>

                    <div className="cp-card-identity">
                      <h2 className="cp-card-name">{chef.name}</h2>
                      <p className="cp-card-specialty">{chef.specialty}</p>
                      <p className="cp-card-region">{chef.region}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="cp-card-bio">{chef.bio}</p>

                  {/* Stats */}
                  <div className="cp-card-stats">
                    <div className="cp-card-stat">
                      <BookOpen className="cp-card-stat-icon" />
                      <span className="cp-card-stat-num">{chef.recipeCount}</span>
                      <span className="cp-card-stat-label">Recipes</span>
                    </div>
                    <div className="cp-card-stat">
                      <ChefHat className="cp-card-stat-icon" />
                      <span className="cp-card-stat-num">{chef.yearsExp}</span>
                      <span className="cp-card-stat-label">Years</span>
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
                        className={`cp-card-follow-btn ${isFollowed ? 'is-followed' : ''}`}
                        onClick={() => toggleSaveChef(chef.id)}
                      >
                        {isFollowed ? (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Follow
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
