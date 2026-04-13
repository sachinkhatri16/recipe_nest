import { Link } from "react-router-dom";
import { ArrowRight, Globe, Heart, ShieldCheck } from "lucide-react";
import Navbar from "../components/Navbar";
import "./AboutPage.css";

export default function AboutPage() {
  return (
    <div className="about-root">
      <Navbar activeItem="About" />

      {/* ============================================================ */}
      {/*  Hero                                                        */}
      {/* ============================================================ */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <img
            src="/images/about-hero.png"
            alt="A beautifully set rustic dining table with Indian and Nepali cuisine"
            className="about-hero-bg-img"
          />
          <div className="about-hero-overlay" />
        </div>

        <div className="about-hero-inner">
          <p className="about-hero-label">Our Story</p>
          <h1 className="about-hero-title">More than just recipes</h1>
          <p className="about-hero-sub">
            We are on a mission to preserve and share the rich culinary heritage
            of Nepal and India, connecting people over the dinner table.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Main Content                                                */}
      {/* ============================================================ */}
      <main className="about-main">
        <div className="about-container">
          {/* Story Section */}
          <section className="about-story">
            <h2 className="about-section-subtitle">A celebration of flavor</h2>
            <p className="about-text">
              RecipeNest was born out of a simple desire: to document the meals
              that bring us comfort. For generations, the techniques behind a
              perfect Dal Bhat or a rich Butter Chicken have been passed down
              orally, often measured by intuition rather than spoons.
            </p>
            <p className="about-text">
              We collaborate closely with home cooks, regional chefs, and
              grandmothers to standardize these cherished recipes. Our platform
              ensures that anyone, regardless of their culinary background, can
              successfully recreate these dishes and experience the warmth of
              South Asian hospitality in their own homes.
            </p>
          </section>

          {/* Values Section */}
          <section className="about-values-wrapper">
            <h2 className="about-section-subtitle" style={{ textAlign: "center" }}>
              Our Core Values
            </h2>
            <div className="about-values">
              <div className="about-value-card">
                <div className="about-value-icon-wrap">
                  <ShieldCheck className="about-value-icon" />
                </div>
                <h3 className="about-value-title">Authenticity First</h3>
                <p className="about-value-desc">
                  We verify every recipe's origin and technique to ensure you are
                  experiencing the true flavor profiles of the region.
                </p>
              </div>

              <div className="about-value-card">
                <div className="about-value-icon-wrap">
                  <Globe className="about-value-icon" />
                </div>
                <h3 className="about-value-title">Cultural Heritage</h3>
                <p className="about-value-desc">
                  We believe food is the best way to understand a culture. We share
                  the history and stories behind every dish we publish.
                </p>
              </div>

              <div className="about-value-card">
                <div className="about-value-icon-wrap">
                  <Heart className="about-value-icon" />
                </div>
                <h3 className="about-value-title">Community Driven</h3>
                <p className="about-value-desc">
                  Food brings people together. Our platform amplifies the voices
                  of independent cooks and chefs in their culinary journeys.
                </p>
              </div>
            </div>
          </section>

          {/* Mission CTA */}
          <section className="about-mission">
            <h2 className="about-mission-title">Ready to start cooking?</h2>
            <p className="about-mission-sub">
              Explore our curated collection of authentic recipes and discover your
              next favorite meal today.
            </p>
            <Link to="/recipes" className="about-mission-cta">
              Explore Recipes
              <ArrowRight className="about-mission-cta-icon" />
            </Link>
          </section>
        </div>
      </main>

      {/* ============================================================ */}
      {/*  Footer                                                      */}
      {/* ============================================================ */}
      <footer className="about-footer">
        <div className="about-footer-inner">
          <p className="about-footer-brand">
            Recipe<span className="about-footer-accent">Nest</span>
          </p>
          <p className="about-footer-copy">RecipeNest&trade;</p>
        </div>
      </footer>
    </div>
  );
}
