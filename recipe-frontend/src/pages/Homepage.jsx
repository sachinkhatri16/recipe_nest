import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Star,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { recipeAPI, chefAPI } from "../services/api";
import "./Homepage.css";

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Homepage() {
  const [recipes, setRecipes] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [recipeData, chefData] = await Promise.all([
          recipeAPI.getAll(),
          chefAPI.getAll(),
        ]);
        const recipeList = recipeData.recipes || recipeData;
        setRecipes((Array.isArray(recipeList) ? recipeList : []).slice(0, 4));
        setChefs((Array.isArray(chefData) ? chefData : []).slice(0, 3));
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvgRating = (recipe) => {
    if (!recipe.reviews || recipe.reviews.length === 0) return "New";
    const avg = recipe.reviews.reduce((s, r) => s + r.rating, 0) / recipe.reviews.length;
    return avg.toFixed(1);
  };

  return (
    <div className="hp-root">
      <Navbar activeItem="Home" />

      <main>
        {/* ============================================================ */}
        {/*  Hero                                                        */}
        {/* ============================================================ */}
        <section className="hp-hero">
          <div className="hp-hero-bg">
            <img
              src="/images/hero.png"
              alt="A spread of Nepali and Indian dishes"
              className="hp-hero-bg-img"
            />
            <div className="hp-hero-overlay" />
          </div>

          <div className="hp-hero-inner">
            <p className="hp-hero-label">RecipeNest</p>
            <h1 className="hp-hero-title">
              Authentic recipes from Nepal &amp; India
            </h1>
            <p className="hp-hero-sub">
              Simple, real dishes from home kitchens -- made for yours.
            </p>
            <Link to="/recipes" className="hp-hero-cta">
              Browse Recipes
              <ArrowRight className="hp-hero-cta-icon" />
            </Link>
          </div>
        </section>

        {/* ============================================================ */}
        {/*  Featured recipes                                            */}
        {/* ============================================================ */}
        <section id="recipes" className="hp-recipes">
          <div className="hp-section-wrap">
            <div className="hp-section-header">
              <div>
                <p className="hp-section-label">Recipes</p>
                <h2 className="hp-section-title">A few to start with</h2>
              </div>
              <Link to="/recipes" className="hp-section-link">
                View All
                <ArrowRight className="hp-section-link-icon" />
              </Link>
            </div>

            {loading ? (
              <div className="hp-loading">Loading recipes...</div>
            ) : (
              <div className="hp-recipe-grid">
                {recipes.map((r) => (
                  <Link to={`/recipes/${r._id}`} key={r._id} className="hp-recipe-card-link">
                    <article className="hp-recipe-card">
                      <div className="hp-recipe-img-wrap">
                        <img
                          src={r.coverImage || "/images/recipes/momo.png"}
                          alt={r.title}
                          className="hp-recipe-img"
                          loading="lazy"
                        />
                        <span className="hp-recipe-origin">{r.category}</span>
                      </div>

                      <div className="hp-recipe-body">
                        <p className="hp-recipe-chef">{r.chef?.name || "Chef"}</p>
                        <h3 className="hp-recipe-name">{r.title}</h3>
                        <p className="hp-recipe-blurb">{r.description}</p>

                        <div className="hp-recipe-foot">
                          <span className="hp-recipe-rating">
                            <Star className="hp-recipe-star" />
                            {getAvgRating(r)}
                          </span>
                          <span className="hp-recipe-time">
                            <Clock3 className="hp-recipe-clock" />
                            {(parseInt(r.prepTime || 0) + parseInt(r.cookTime || 0))}m
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ============================================================ */}
        {/*  Chefs                                                       */}
        {/* ============================================================ */}
        <section id="chefs" className="hp-chefs">
          <div className="hp-section-wrap">
            <div className="hp-section-header hp-section-header-light">
              <div>
                <p className="hp-section-label hp-section-label-light">Chefs</p>
                <h2 className="hp-section-title hp-section-title-light">
                  Meet Our Chefs
                </h2>
              </div>
            </div>

            {loading ? (
              <div className="hp-loading hp-loading-light">Loading chefs...</div>
            ) : (
              <div className="hp-chef-grid">
                {chefs.map((c) => (
                  <article key={c._id} className="hp-chef-card">
                    <div className="hp-chef-avatar-wrap">
                      <div className="hp-chef-avatar">{getInitials(c.name)}</div>
                      {c.verificationStatus === "verified" && (
                        <span className="hp-chef-badge">
                          <BadgeCheck className="hp-chef-badge-icon" />
                        </span>
                      )}
                    </div>

                    <h3 className="hp-chef-name">{c.name}</h3>
                    <p className="hp-chef-specialty">{c.profile?.specialty || "Home Chef"}</p>

                    <div className="hp-chef-stat">
                      <p className="hp-chef-count">{c.recipeCount || 0}</p>
                      <p className="hp-chef-count-label">Recipes</p>
                    </div>

                    <Link to={`/chefs`} className="hp-chef-link">
                      View Profile
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ============================================================ */}
      {/*  Footer                                                      */}
      {/* ============================================================ */}
      <footer id="about" className="hp-footer">
        <div className="hp-section-wrap">
          <div className="hp-footer-top">
            <p className="hp-footer-brand">
              Recipe<span className="hp-footer-accent">Nest</span>
            </p>

            <div className="hp-footer-links">
              <div>
                <p className="hp-footer-col-title">Company</p>
                <Link to="/about" className="hp-footer-link">About Us</Link>
              </div>
              <div>
                <p className="hp-footer-col-title">Resources</p>
                <Link to="/recipes" className="hp-footer-link">Recipes</Link>
                <Link to="/chefs" className="hp-footer-link">Chefs</Link>
              </div>
            </div>
          </div>

          <div className="hp-footer-bottom">RecipeNest&trade;</div>
        </div>
      </footer>
    </div>
  );
}
