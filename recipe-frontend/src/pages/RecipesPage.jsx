import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock3, Search, Star, X, SlidersHorizontal, ChevronDown, Heart } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import "./RecipesPage.css";

/* ------------------------------------------------------------------ */
/*  Nepal & India recipes only                                         */
/* ------------------------------------------------------------------ */
const RECIPES = [
  {
    id: 1,
    name: "Momo",
    description: "Steamed dumplings filled with spiced meat, served with fiery tomato achar.",
    chef: "Asha Tamang",
    origin: "Nepali",
    time: 40,
    level: "Medium",
    rating: 4.9,
    reviews: 214,
    image: "/images/recipes/momo.png",
  },
  {
    id: 2,
    name: "Dal Bhat",
    description: "The daily staple -- lentils, rice, tarkari, and pickles on a brass thali.",
    chef: "Rajan Shrestha",
    origin: "Nepali",
    time: 35,
    level: "Easy",
    rating: 4.8,
    reviews: 189,
    image: "/images/recipes/dal-bhat.png",
  },
  {
    id: 3,
    name: "Sel Roti",
    description: "Crispy ring-shaped rice bread, deep-fried for festivals and mornings.",
    chef: "Asha Tamang",
    origin: "Nepali",
    time: 25,
    level: "Easy",
    rating: 4.6,
    reviews: 97,
    image: "/images/recipes/sel-roti.png",
  },
  {
    id: 4,
    name: "Thukpa",
    description: "Warming noodle soup with vegetables and tender meat, highland comfort food.",
    chef: "Rajan Shrestha",
    origin: "Nepali",
    time: 45,
    level: "Easy",
    rating: 4.7,
    reviews: 132,
    image: "/images/recipes/thukpa.png",
  },
  {
    id: 5,
    name: "Butter Chicken",
    description: "Tender chicken in a rich, creamy tomato-cashew gravy with warm spice.",
    chef: "Priya Sharma",
    origin: "Indian",
    time: 50,
    level: "Medium",
    rating: 4.9,
    reviews: 301,
    image: "/images/recipes/butter-chicken.png",
  },
  {
    id: 6,
    name: "Masala Dosa",
    description: "Crispy fermented crepe filled with spiced potato, served with sambar and chutney.",
    chef: "Arjun Nair",
    origin: "Indian",
    time: 30,
    level: "Medium",
    rating: 4.8,
    reviews: 178,
    image: "/images/recipes/masala-dosa.png",
  },
  {
    id: 7,
    name: "Hyderabadi Biryani",
    description: "Layered saffron rice and slow-cooked meat sealed in dum, fragrant and bold.",
    chef: "Priya Sharma",
    origin: "Indian",
    time: 75,
    level: "Hard",
    rating: 5.0,
    reviews: 256,
    image: "/images/recipes/biryani.png",
  },
  {
    id: 8,
    name: "Palak Paneer",
    description: "Soft paneer in a velvety spinach gravy, earthy and nourishing.",
    chef: "Arjun Nair",
    origin: "Indian",
    time: 35,
    level: "Easy",
    rating: 4.7,
    reviews: 144,
    image: "/images/recipes/palak-paneer.png",
  },
];

const ORIGINS = ["All", "Nepali", "Indian"];
const LEVELS = ["All", "Easy", "Medium", "Hard"];
const TIMES = [
  { label: "Any", value: null },
  { label: "Under 30 min", value: 30 },
  { label: "Under 45 min", value: 45 },
  { label: "Under 60 min", value: 60 },
];

/* ------------------------------------------------------------------ */
/*  Dropdown                                                           */
/* ------------------------------------------------------------------ */
function FilterDropdown({ label, options, value, onChange, icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="rp-dropdown" ref={ref}>
      <button
        type="button"
        className={`rp-dropdown-trigger ${value && value !== "All" && value !== "Any" ? "rp-dropdown-active" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {icon}
        <span>{value && value !== "All" && value !== "Any" ? value : label}</span>
        <ChevronDown className={`rp-dropdown-chevron ${open ? "rp-dropdown-chevron-open" : ""}`} />
      </button>

      {open && (
        <ul className="rp-dropdown-menu" role="listbox">
          {options.map((opt) => {
            const optLabel = typeof opt === "string" ? opt : opt.label;
            const optValue = typeof opt === "string" ? opt : opt.label;
            const isSelected = value === optValue || (!value && (optValue === "All" || optValue === "Any"));
            return (
              <li key={optLabel}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`rp-dropdown-option ${isSelected ? "rp-dropdown-option-selected" : ""}`}
                  onClick={() => {
                    onChange(optValue === "All" || optValue === "Any" ? null : optValue);
                    setOpen(false);
                  }}
                >
                  {optLabel}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card                                                               */
/* ------------------------------------------------------------------ */
function RecipeCard({ recipe }) {
  const { user, toggleSaveRecipe } = useAuth();
  const isSaved = user?.savedRecipes?.includes(recipe.id);

  const levelClass =
    recipe.level === "Easy"
      ? "rp-level-easy"
      : recipe.level === "Medium"
        ? "rp-level-medium"
        : "rp-level-hard";

  return (
    <article className="rp-card">
      <div className="rp-card-img-wrap">
        <Link to={`/recipes/${recipe.id}`} className="rp-card-img-link-full">
          <img
            src={recipe.image}
            alt={recipe.name}
            className="rp-card-img"
            loading="lazy"
          />
        </Link>
        <span className="rp-card-origin">{recipe.origin}</span>
        {user && (
          <button 
            className={`rp-card-save-btn ${isSaved ? 'is-saved' : ''}`}
            onClick={() => toggleSaveRecipe(recipe.id)}
            aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
          >
            <Heart className={`rp-card-save-icon ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="rp-card-body">
        <Link to={`/recipes/${recipe.id}`} className="rp-card-title-link">
          <h3 className="rp-card-title">{recipe.name}</h3>
        </Link>
        <p className="rp-card-desc">{recipe.description}</p>

        <div className="rp-card-footer">
          <div className="rp-card-meta">
            <span className="rp-card-time">
              <Clock3 className="rp-card-time-icon" />
              {recipe.time}m
            </span>
            <span className={`rp-card-level ${levelClass}`}>{recipe.level}</span>
          </div>

          <div className="rp-card-rating">
            <Star className="rp-card-star" />
            <span className="rp-card-rating-num">{recipe.rating}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function RecipesPage() {
  const [query, setQuery] = useState("");
  const [origin, setOrigin] = useState(null);
  const [level, setLevel] = useState(null);
  const [maxTime, setMaxTime] = useState(null);

  const handleTimeChange = useCallback((val) => {
    if (!val) {
      setMaxTime(null);
      return;
    }
    const match = TIMES.find((t) => t.label === val);
    setMaxTime(match ? match.value : null);
  }, []);

  const activeTimeLabel = useMemo(() => {
    if (!maxTime) return null;
    const match = TIMES.find((t) => t.value === maxTime);
    return match ? match.label : null;
  }, [maxTime]);

  const filtered = useMemo(() => {
    let out = RECIPES;
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.chef.toLowerCase().includes(q)
      );
    }
    if (origin) out = out.filter((r) => r.origin === origin);
    if (level) out = out.filter((r) => r.level === level);
    if (maxTime) out = out.filter((r) => r.time <= maxTime);
    return out;
  }, [query, origin, level, maxTime]);

  const hasActiveFilters = origin || level || maxTime;

  const clearAll = () => {
    setQuery("");
    setOrigin(null);
    setLevel(null);
    setMaxTime(null);
  };

  return (
    <div className="rp-root">
      <Navbar activeItem="Recipes" />

      <main className="rp-main">
        <div className="rp-container">
          {/* ---- Header ---- */}
          <div className="rp-header">
            <nav className="rp-breadcrumb" aria-label="Breadcrumb">
              <Link to="/" className="rp-breadcrumb-link">Home</Link>
              <span className="rp-breadcrumb-sep">/</span>
              <span className="rp-breadcrumb-current">Recipes</span>
            </nav>
            <h1 className="rp-title">Recipes</h1>
            <p className="rp-subtitle">
              Authentic dishes from Nepal and India, made for your kitchen.
            </p>
          </div>

          {/* ---- Search ---- */}
          <div className="rp-search-bar">
            <Search className="rp-search-icon" />
            <input
              type="text"
              className="rp-search-input"
              placeholder="Search by name, ingredient, or chef..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="rp-search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X className="rp-search-clear-icon" />
              </button>
            )}
          </div>

          {/* ---- Filters row ---- */}
          <div className="rp-filters">
            <div className="rp-filters-left">
              <SlidersHorizontal className="rp-filters-icon" />

              <FilterDropdown
                label="Cuisine"
                options={ORIGINS}
                value={origin || "All"}
                onChange={setOrigin}
              />
              <FilterDropdown
                label="Difficulty"
                options={LEVELS}
                value={level || "All"}
                onChange={setLevel}
              />
              <FilterDropdown
                label="Cook Time"
                options={TIMES}
                value={activeTimeLabel || "Any"}
                onChange={handleTimeChange}
              />
            </div>

            <div className="rp-filters-right">
              {hasActiveFilters && (
                <button type="button" className="rp-clear-all" onClick={clearAll}>
                  Clear all
                </button>
              )}
              <span className="rp-result-count">
                {filtered.length} {filtered.length === 1 ? "recipe" : "recipes"}
              </span>
            </div>
          </div>

          {/* ---- Grid ---- */}
          {filtered.length === 0 ? (
            <div className="rp-empty">
              <p className="rp-empty-title">No recipes match your filters</p>
              <p className="rp-empty-sub">Try broadening your search or removing filters.</p>
              <button type="button" className="rp-empty-reset" onClick={clearAll}>
                Reset
              </button>
            </div>
          ) : (
            <div className="rp-grid">
              {filtered.map((r) => (
                <RecipeCard key={r.id} recipe={r} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="rp-footer">
        <div className="rp-footer-inner">
          <p className="rp-footer-brand">
            Recipe<span className="rp-footer-accent">Nest</span>
          </p>
          <p className="rp-footer-copy">RecipeNest&trade;</p>
        </div>
      </footer>
    </div>
  );
}
