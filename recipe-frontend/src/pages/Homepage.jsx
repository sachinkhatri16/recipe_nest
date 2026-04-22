import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Star,
} from "lucide-react";
import Navbar from "../components/Navbar";
import "./Homepage.css";

/* ------------------------------------------------------------------ */
/*  Data — Nepal & India only                                          */
/* ------------------------------------------------------------------ */
const RECIPES = [
  {
    name: "Momo",
    chef: "Asha Tamang",
    origin: "Nepali",
    time: "40m",
    level: "Medium",
    rating: "4.9",
    image: "/images/recipes/momo.png",
    blurb: "Steamed dumplings filled with spiced meat, served with fiery tomato achar.",
  },
  {
    name: "Butter Chicken",
    chef: "Priya Sharma",
    origin: "Indian",
    time: "50m",
    level: "Medium",
    rating: "4.9",
    image: "/images/recipes/butter-chicken.png",
    blurb: "Tender chicken in a rich, creamy tomato-cashew gravy with warm spice.",
  },
  {
    name: "Dal Bhat",
    chef: "Rajan Shrestha",
    origin: "Nepali",
    time: "35m",
    level: "Easy",
    rating: "4.8",
    image: "/images/recipes/dal-bhat.png",
    blurb: "The daily staple -- lentils, rice, tarkari, and pickles on a brass thali.",
  },
  {
    name: "Masala Dosa",
    chef: "Arjun Nair",
    origin: "Indian",
    time: "30m",
    level: "Medium",
    rating: "4.8",
    image: "/images/recipes/masala-dosa.png",
    blurb: "Crispy fermented crepe filled with spiced potato, served with sambar.",
  },
];

const CHEFS = [
  {
    name: "Asha Tamang",
    specialty: "Nepali Home Cooking",
    recipeCount: 42,
    initials: "AT",
    verified: true,
  },
  {
    name: "Priya Sharma",
    specialty: "North Indian Classics",
    recipeCount: 67,
    initials: "PS",
    verified: true,
  },
  {
    name: "Arjun Nair",
    specialty: "South Indian & Vegetarian",
    recipeCount: 38,
    initials: "AN",
    verified: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function Homepage() {
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

            <div className="hp-recipe-grid">
              {RECIPES.map((r) => (
                <article key={r.name} className="hp-recipe-card">
                  <div className="hp-recipe-img-wrap">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="hp-recipe-img"
                      loading="lazy"
                    />
                    <span className="hp-recipe-origin">{r.origin}</span>
                  </div>

                  <div className="hp-recipe-body">
                    <p className="hp-recipe-chef">{r.chef}</p>
                    <h3 className="hp-recipe-name">{r.name}</h3>
                    <p className="hp-recipe-blurb">{r.blurb}</p>

                    <div className="hp-recipe-foot">
                      <span className="hp-recipe-rating">
                        <Star className="hp-recipe-star" />
                        {r.rating}
                      </span>
                      <span className="hp-recipe-time">
                        <Clock3 className="hp-recipe-clock" />
                        {r.time}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
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

            <div className="hp-chef-grid">
              {CHEFS.map((c) => (
                <article key={c.name} className="hp-chef-card">
                  <div className="hp-chef-avatar-wrap">
                    <div className="hp-chef-avatar">{c.initials}</div>
                    {c.verified && (
                      <span className="hp-chef-badge">
                        <BadgeCheck className="hp-chef-badge-icon" />
                      </span>
                    )}
                  </div>

                  <h3 className="hp-chef-name">{c.name}</h3>
                  <p className="hp-chef-specialty">{c.specialty}</p>

                  <div className="hp-chef-stat">
                    <p className="hp-chef-count">{c.recipeCount}</p>
                    <p className="hp-chef-count-label">Recipes</p>
                  </div>

                  <Link to="/recipes" className="hp-chef-link">
                    View Profile
                  </Link>
                </article>
              ))}
            </div>
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
