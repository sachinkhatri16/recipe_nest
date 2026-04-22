import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { 
  ChefHat, 
  Utensils, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const activeTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const setActiveTab = (tab) => {
    setSearchParams({ tab });
  };
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState("foodlover");
  const [showLoginPass, setShowLoginPass] = useState(false);
  
  // Signup State
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [role, setRole] = useState("foodlover");
  const [showSignupPass, setShowSignupPass] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      alert("Please fill in all fields.");
      return;
    }
    const extractName = loginEmail.split('@')[0];
    login({ name: extractName || "User", role: loginRole });
    if (loginRole === 'chef') {
      navigate("/chef-dashboard");
    } else {
      navigate("/");
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      alert("Please fill in all fields.");
      return;
    }
    login({ name: signupName, role });
    if (role === 'chef') {
      navigate("/chef-dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="auth-root">
      {/* Left Visual Panel */}
      <div className="auth-visual">
        <div className="auth-visual-bg">
          <img src="/images/hero.png" alt="" className="auth-visual-img" />
          <div className="auth-visual-overlay"></div>
        </div>

        <div className="auth-visual-content">
          <Link to="/" className="auth-brand">
            <span className="auth-brand-icon">
              <ChefHat className="auth-brand-hat" />
            </span>
            <span className="auth-brand-text">Recipe<span className="auth-brand-accent">Nest</span></span>
          </Link>

          <div className="auth-visual-copy">
            <p className="auth-visual-label">Discover authentic flavors</p>
            <h1 className="auth-visual-title">
              Where every recipe tells a story
            </h1>
            <p className="auth-visual-sub">
              Join thousands of food lovers exploring traditional recipes from Nepal, India, and beyond.
            </p>
          </div>

          <div className="auth-visual-stats">
            <div className="auth-visual-stat">
              <span className="auth-visual-stat-num">200+</span>
              <span className="auth-visual-stat-label">Recipes</span>
            </div>
            <div className="auth-visual-stat-divider"></div>
            <div className="auth-visual-stat">
              <span className="auth-visual-stat-num">50+</span>
              <span className="auth-visual-stat-label">Chefs</span>
            </div>
            <div className="auth-visual-stat-divider"></div>
            <div className="auth-visual-stat">
              <span className="auth-visual-stat-num">10k+</span>
              <span className="auth-visual-stat-label">Members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-panel-inner">
          {/* Mobile brand (visible only on small screens) */}
          <Link to="/" className="auth-mobile-brand">
            <span className="auth-brand-icon">
              <ChefHat className="auth-brand-hat" />
            </span>
            <span className="auth-brand-text">Recipe<span className="auth-brand-accent">Nest</span></span>
          </Link>

          <Link to="/" className="auth-back-link">
            <ArrowLeft className="auth-back-icon" />
            Back to home
          </Link>

          <div className="auth-form-header">
            <h2 className="auth-form-title">
              {activeTab === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="auth-form-sub">
              {activeTab === 'login' 
                ? 'Sign in to access your saved recipes and followed chefs.' 
                : 'Start your culinary journey with RecipeNest today.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="auth-tabs">
            <button 
              type="button"
              className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`} 
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
            <button 
              type="button"
              className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`} 
              onClick={() => setActiveTab('signup')}
            >
              Join Free
            </button>
            <div className={`auth-tab-slider ${activeTab === 'signup' ? 'right' : 'left'}`}></div>
          </div>

          {/* Forms */}
          <div className="auth-forms-container">
            {/* LOGIN FORM */}
            <form 
              className={`auth-form-wrapper ${activeTab === 'login' ? 'active' : ''}`}
              onSubmit={handleLogin}
            >
              <div className="auth-roles">
                <button 
                  type="button"
                  className={`auth-role-btn ${loginRole === 'foodlover' ? 'active' : ''}`}
                  onClick={() => setLoginRole('foodlover')}
                >
                  <Utensils className="auth-role-icon" />
                  <div className="auth-role-text">
                    <span className="auth-role-title">Food Lover</span>
                    <span className="auth-role-desc">Save and explore recipes</span>
                  </div>
                </button>
                <button 
                  type="button"
                  className={`auth-role-btn ${loginRole === 'chef' ? 'active' : ''}`}
                  onClick={() => setLoginRole('chef')}
                >
                  <ChefHat className="auth-role-icon" />
                  <div className="auth-role-text">
                    <span className="auth-role-title">Home Chef</span>
                    <span className="auth-role-desc">Share your recipes</span>
                  </div>
                </button>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <input 
                    type="email" 
                    className="auth-input" 
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="auth-input-group">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input 
                    type={showLoginPass ? "text" : "password"}
                    className="auth-input" 
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="auth-pass-toggle"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    tabIndex={-1}
                  >
                    {showLoginPass ? <EyeOff className="auth-pass-toggle-icon" /> : <Eye className="auth-pass-toggle-icon" />}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="auth-submit">
                Sign In
                <ArrowRight className="auth-submit-arrow" />
              </button>

              <p className="auth-switch-text">
                Don't have an account?{' '}
                <button type="button" className="auth-switch-link" onClick={() => setActiveTab('signup')}>
                  Create one free
                </button>
              </p>
            </form>

            {/* SIGNUP FORM */}
            <form 
              className={`auth-form-wrapper ${activeTab === 'signup' ? 'active' : ''}`}
              onSubmit={handleSignup}
            >
              <div className="auth-roles">
                <button 
                  type="button"
                  className={`auth-role-btn ${role === 'foodlover' ? 'active' : ''}`}
                  onClick={() => setRole('foodlover')}
                >
                  <Utensils className="auth-role-icon" />
                  <div className="auth-role-text">
                    <span className="auth-role-title">Food Lover</span>
                    <span className="auth-role-desc">Save and explore recipes</span>
                  </div>
                </button>
                <button 
                  type="button"
                  className={`auth-role-btn ${role === 'chef' ? 'active' : ''}`}
                  onClick={() => setRole('chef')}
                >
                  <ChefHat className="auth-role-icon" />
                  <div className="auth-role-text">
                    <span className="auth-role-title">Home Chef</span>
                    <span className="auth-role-desc">Share your recipes</span>
                  </div>
                </button>
              </div>
              
              <div className="auth-input-group">
                <label className="auth-label">Full Name</label>
                <div className="auth-input-wrapper">
                  <User className="auth-input-icon" />
                  <input 
                    type="text" 
                    className="auth-input" 
                    placeholder="Asha Tamang"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="auth-input-group">
                <label className="auth-label">Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
                  <input 
                    type="email" 
                    className="auth-input" 
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="auth-input-group">
                <label className="auth-label">Create Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" />
                  <input 
                    type={showSignupPass ? "text" : "password"}
                    className="auth-input" 
                    placeholder="Min. 8 characters"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    className="auth-pass-toggle"
                    onClick={() => setShowSignupPass(!showSignupPass)}
                    tabIndex={-1}
                  >
                    {showSignupPass ? <EyeOff className="auth-pass-toggle-icon" /> : <Eye className="auth-pass-toggle-icon" />}
                  </button>
                </div>
              </div>
              
              <button type="submit" className="auth-submit">
                Create Account
                <ArrowRight className="auth-submit-arrow" />
              </button>

              <p className="auth-switch-text">
                Already have an account?{' '}
                <button type="button" className="auth-switch-link" onClick={() => setActiveTab('login')}>
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
