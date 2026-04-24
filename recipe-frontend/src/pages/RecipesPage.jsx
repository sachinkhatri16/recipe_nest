import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock3, Search, Star, X, SlidersHorizontal, ChevronDown, Heart } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { recipeAPI } from "../services/api";
import "./RecipesPage.css";

const CATEGORIES = ["All", "Nepali", "Indian", "Chinese", "Thai", "Italian", "Mexican", "Japanese", "Korean", "French", "American", "Mediterranean", "Other"];
const LEVELS = ["All", "Easy", "Medium", "Hard"];
const TIMES = [
  { label: "Any", value: null },
  { label: "Under 30 min", value: 30 },
  { label: "Under 45 min", value: 45 },
  { label: "Under 60 min", value: 60 },
];
const SORTS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Most Reviewed", value: "most-reviewed" },
  { label: "Most Viewed", value: "most-viewed" },
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
  const isSaved = user?.savedRecipes?.some(r => (r._id || r) === recipe._id);

  const totalTime = parseInt(recipe.prepTime || 0) + parseInt(recipe.cookTime || 0);

  const levelClass =
    recipe.level === "Easy"
      ? "rp-level-easy"
      : recipe.level === "Medium"
        ? "rp-level-medium"
        : "rp-level-hard";

  const avgRating = recipe.reviews && recipe.reviews.length > 0
    ? (recipe.reviews.reduce((s, r) => s + r.rating, 0) / recipe.reviews.length).toFixed(1)
    : null;

  return (
    <article className="rp-card">
      <div className="rp-card-img-wrap">
        <Link to={`/recipes/${recipe._id}`} className="rp-card-img-link-full">
          <img
            src={recipe.coverImage || "/images/recipes/momo.png"}
            alt={recipe.title}
            className="rp-card-img"
            loading="lazy"
          />
        </Link>
        <span className="rp-card-origin">{recipe.category}</span>
        {user && (
          <button 
            className={`rp-card-save-btn ${isSaved ? 'is-saved' : ''}`}
            onClick={() => toggleSaveRecipe(recipe._id)}
            aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
          >
            <Heart className={`rp-card-save-icon ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      <div className="rp-card-body">
        <Link to={`/recipes/${recipe._id}`} className="rp-card-title-link">
          <h3 className="rp-card-title">{recipe.title}</h3>
        </Link>
        <p className="rp-card-desc">{recipe.description}</p>

        <div className="rp-card-footer">
          <div className="rp-card-meta">
            <span className="rp-card-time">
              <Clock3 className="rp-card-time-icon" />
              {totalTime}m
            </span>
            <span className={`rp-card-level ${levelClass}`}>{recipe.level}</span>
          </div>

          <div className="rp-card-rating">
            <Star className="rp-card-star" />
            <span className="rp-card-rating-num">{avgRating || "New"}</span>
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
  const [recipes, setRecipes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null);
  const [level, setLevel] = useState(null);
  const [maxTime, setMaxTime] = useState(null);
  const [sort, setSort] = useState("newest");
  const debounceRef = useRef(null);

  const fetchRecipes = useCallback(async ({ searchVal, categoryVal, levelVal, maxTimeVal, sortVal, page, append }) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);

    const params = { page, limit: 20 };
    if (searchVal) params.search = searchVal;
    if (categoryVal && categoryVal !== "All") params.category = categoryVal;
    if (levelVal && levelVal !== "All") params.level = levelVal;
    if (maxTimeVal) params.maxTime = maxTimeVal;
    if (sortVal && sortVal !== "newest") params.sort = sortVal;

    try {
      const data = await recipeAPI.getAll(params);
      const list = data.recipes || data;
      if (append) {
        setRecipes((prev) => [...prev, ...list]);
      } else {
        setRecipes(list);
      }
      if (data.pagination) setPagination(data.pagination);
    } catch (err) {
      console.error("Failed to load recipes:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchRecipes({ searchVal: "", categoryVal: null, levelVal: null, maxTimeVal: null, sortVal: "newest", page: 1, append: false });
  }, [fetchRecipes]);

  // Debounced re-fetch when any filter changes
  const triggerFetch = useCallback((overrides = {}) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchRecipes({
        searchVal: overrides.searchVal !== undefined ? overrides.searchVal : query,
        categoryVal: overrides.categoryVal !== undefined ? overrides.categoryVal : category,
        levelVal: overrides.levelVal !== undefined ? overrides.levelVal : level,
        maxTimeVal: overrides.maxTimeVal !== undefined ? overrides.maxTimeVal : maxTime,
        sortVal: overrides.sortVal !== undefined ? overrides.sortVal : sort,
        page: 1,
        append: false,
      });
    }, 400);
  }, [query, category, level, maxTime, sort, fetchRecipes]);

  const handleSearchChange = (val) => {
    setQuery(val);
    triggerFetch({ searchVal: val });
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
    triggerFetch({ categoryVal: val });
  };

  const handleLevelChange = (val) => {
    setLevel(val);
    triggerFetch({ levelVal: val });
  };

  const handleTimeChange = useCallback((val) => {
    if (!val || val === "Any") {
      setMaxTime(null);
      triggerFetch({ maxTimeVal: null });
      return;
    }
    const match = TIMES.find((t) => t.label === val);
    const timeVal = match ? match.value : null;
    setMaxTime(timeVal);
    triggerFetch({ maxTimeVal: timeVal });
  }, [triggerFetch]);

  const handleSortChange = (val) => {
    const sortVal = SORTS.find((s) => s.label === val)?.value || "newest";
    setSort(sortVal);
    triggerFetch({ sortVal });
  };

  const handleLoadMore = () => {
    const nextPage = pagination.page + 1;
    fetchRecipes({
      searchVal: query,
      categoryVal: category,
      levelVal: level,
      maxTimeVal: maxTime,
      sortVal: sort,
      page: nextPage,
      append: true,
    });
    setPagination((prev) => ({ ...prev, page: nextPage }));
  };

  const activeTimeLabel = maxTime ? TIMES.find((t) => t.value === maxTime)?.label || null : null;
  const activeSortLabel = SORTS.find((s) => s.value === sort)?.label || "Newest";
  const hasActiveFilters = (category && category !== "All") || (level && level !== "All") || maxTime;

  const clearAll = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery("");
    setCategory(null);
    setLevel(null);
    setMaxTime(null);
    setSort("newest");
    fetchRecipes({ searchVal: "", categoryVal: null, levelVal: null, maxTimeVal: null, sortVal: "newest", page: 1, append: false });
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
              placeholder="Search by name, ingredient, tag, or chef..."
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="rp-search-clear"
                onClick={() => handleSearchChange("")}
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
                options={CATEGORIES}
                value={category || "All"}
                onChange={handleCategoryChange}
              />
              <FilterDropdown
                label="Difficulty"
                options={LEVELS}
                value={level || "All"}
                onChange={handleLevelChange}
              />
              <FilterDropdown
                label="Cook Time"
                options={TIMES}
                value={activeTimeLabel || "Any"}
                onChange={handleTimeChange}
              />
              <FilterDropdown
                label="Sort"
                options={SORTS.map((s) => s.label)}
                value={activeSortLabel}
                onChange={handleSortChange}
              />
            </div>

            <div className="rp-filters-right">
              {hasActiveFilters && (
                <button type="button" className="rp-clear-all" onClick={clearAll}>
                  Clear all
                </button>
              )}
              <span className="rp-result-count">
                {pagination.total} {pagination.total === 1 ? "recipe" : "recipes"}
              </span>
            </div>
          </div>

          {/* ---- Grid ---- */}
          {loading ? (
            <div className="rp-empty">
              <p className="rp-empty-title">Loading recipes...</p>
            </div>
          ) : recipes.length === 0 ? (
            <div className="rp-empty">
              <p className="rp-empty-title">No recipes match your filters</p>
              <p className="rp-empty-sub">Try broadening your search or removing filters.</p>
              <button type="button" className="rp-empty-reset" onClick={clearAll}>
                Reset
              </button>
            </div>
          ) : (
            <>
              <div className="rp-grid">
                {recipes.map((r) => (
                  <RecipeCard key={r._id} recipe={r} />
                ))}
              </div>

              {pagination.page < pagination.pages && (
                <div className="rp-load-more-wrap">
                  <button
                    type="button"
                    className="rp-load-more-btn"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                </div>
              )}
            </>
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
