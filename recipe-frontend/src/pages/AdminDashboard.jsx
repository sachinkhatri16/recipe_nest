import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Shield, Users, BookOpen, BarChart3, LogOut, ChefHat,
  Clock, MessageSquare, TrendingUp,
} from "lucide-react";
import AdminVerificationHub from "../components/admin/AdminVerificationHub";
import AdminUserManager from "../components/admin/AdminUserManager";
import AdminRecipes from "../components/admin/AdminRecipes";
import AdminAnalytics from "../components/admin/AdminAnalytics";
import { adminAPI } from "../services/api";
import "./AdminDashboard.css";

const NAV_ITEMS = [
  { key: "overview",     label: "Overview",          icon: BarChart3 },
  { key: "verification", label: "Verification Hub",  icon: Shield },
  { key: "users",        label: "User Manager",      icon: Users },
  { key: "recipes",      label: "All Recipes",       icon: BookOpen },
  { key: "analytics",    label: "Analytics",         icon: TrendingUp },
];

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) navigate("/auth");
    else if (user?.role !== "admin") navigate("/");
    else {
      // Fetch pending count for the sidebar badge
      adminAPI.getAnalytics()
        .then((data) => {
          setPendingCount(data.overview?.pendingVerifications || data.pendingVerifications || data.overview?.pendingChefs || data.pendingChefs || 0);
        })
        .catch(console.error);
    }
  }, [isAuthenticated, user, navigate, loading]);

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== "admin") return null;

  return (
    <div className="ad-root">
      {/* ─── SIDEBAR ─── */}
      <aside className="ad-sidebar">
        <div>
          <Link to="/" className="ad-brand">
            <span className="ad-brand-icon"><ChefHat size={20} color="#fff"/></span>
            <span className="ad-brand-text">Recipe<span className="ad-brand-accent">Nest</span></span>
          </Link>

          <div className="ad-admin-card">
            <div className="ad-admin-avatar">{user.name ? user.name.charAt(0).toUpperCase() : "A"}</div>
            <div>
              <p className="ad-admin-name">{user.name}</p>
              <p className="ad-admin-label">Administrator</p>
            </div>
          </div>

          <nav className="ad-nav">
            {NAV_ITEMS.map(item => (
              <button
                key={item.key}
                className={`ad-nav-item ${activeTab === item.key ? "active" : ""}`}
                onClick={() => setActiveTab(item.key)}
              >
                <item.icon className="ad-nav-icon"/>
                {item.label}
                {item.key === "verification" && pendingCount > 0 && <span className="ad-nav-badge">{pendingCount}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="ad-sidebar-bottom">
          <button className="ad-nav-item ad-nav-logout" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="ad-nav-icon"/> Sign Out
          </button>
        </div>
      </aside>

      {/* ─── MOBILE HEADER ─── */}
      <div className="ad-mobile-header">
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span className="ad-brand-icon" style={{width:32,height:32}}><ChefHat size={16} color="#fff"/></span>
          <span className="ad-brand-text" style={{fontSize:"1.1rem"}}>Recipe<span className="ad-brand-accent">Nest</span></span>
        </div>
        <div className="ad-mobile-tabs">
          {NAV_ITEMS.slice(0, 5).map(item => (
            <button key={item.key} className={`ad-mobile-tab ${activeTab === item.key ? "active" : ""}`} onClick={() => setActiveTab(item.key)}>
              <item.icon size={18}/>
            </button>
          ))}
        </div>
      </div>

      {/* ─── MAIN ─── */}
      <main className="ad-main">
        {activeTab === "overview" && <OverviewTab setActiveTab={setActiveTab}/>}
        {activeTab === "verification" && <AdminVerificationHub/>}
        {activeTab === "users" && <AdminUserManager/>}
        {activeTab === "recipes" && <AdminRecipes/>}
        {activeTab === "analytics" && <AdminAnalytics/>}
        {activeTab === "settings" && <SettingsTab/>}
      </main>
    </div>
  );
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ setActiveTab }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getAnalytics()
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <div className="ad-content ad-fade-in">
        <div className="ad-page-header"><div><h1 className="ad-page-title">Admin Overview</h1><p className="ad-page-sub">Loading platform data...</p></div></div>
      </div>
    );
  }

  const ov = analytics.overview || analytics;

  const stats = [
    { icon: Users, label: "Total Users", value: ov.totalUsers || 0, color: "blue" },
    { icon: BookOpen, label: "Total Recipes", value: ov.totalRecipes || 0, color: "emerald" },
    { icon: MessageSquare, label: "Total Reviews", value: ov.totalReviews || 0, color: "violet" },
  ];

  const pendingCount = ov.pendingVerifications || ov.pendingChefs || 0;

  const quickActions = [
    { label: "Review Pending Chefs", desc: `${pendingCount} chefs awaiting verification`, icon: Shield, tab: "verification", color: "#f59e0b" },
    { label: "Manage Users", desc: `${ov.totalUsers || 0} total platform users`, icon: Users, tab: "users", color: "#3b82f6" },
    { label: "Browse Recipes", desc: `${ov.totalRecipes || 0} recipes on platform`, icon: BookOpen, tab: "recipes", color: "#10b981" },
    { label: "View Analytics", desc: "Platform growth metrics", icon: TrendingUp, tab: "analytics", color: "#8b5cf6" },
  ];

  return (
    <div className="ad-content ad-fade-in">
      <div className="ad-page-header">
        <div><h1 className="ad-page-title">Admin Overview</h1><p className="ad-page-sub">Platform health at a glance</p></div>
      </div>

      <div className="ad-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="ad-stat-card">
            <div className={`ad-stat-icon-wrap ad-stat-${s.color}`}><s.icon className="ad-stat-icon"/></div>
            <div className="ad-stat-data">
              <span className="ad-stat-num">{s.value}</span>
              <span className="ad-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="ad-quick-grid">
        {quickActions.map((a, i) => (
          <button key={i} className="ad-quick-card" onClick={() => setActiveTab(a.tab)}>
            <div className="ad-quick-icon" style={{background:`${a.color}15`,color:a.color}}><a.icon size={22}/></div>
            <h3 className="ad-quick-title">{a.label}</h3>
            <p className="ad-quick-desc">{a.desc}</p>
          </button>
        ))}
      </div>

      {/* Pending Banner */}
      {pendingCount > 0 && (
        <div className="ad-card" style={{marginTop:20,border:"1px solid #fde68a",background:"linear-gradient(135deg,#fffbeb,#fef3c7)"}}>
          <div className="ad-card-body" style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <div style={{width:44,height:44,borderRadius:10,background:"#fef3c7",color:"#d97706",display:"flex",alignItems:"center",justifyContent:"center"}}><Clock size={22}/></div>
            <div style={{flex:1}}>
              <h4 style={{margin:"0 0 2px",color:"#92400e",fontSize:"0.9375rem"}}>{pendingCount} chef{pendingCount !== 1 ? "s" : ""} pending verification</h4>
              <p style={{margin:0,color:"#a16207",fontSize:"0.8125rem"}}>Identity documents are waiting for your review.</p>
            </div>
            <button className="ad-btn-outline" style={{borderColor:"#d97706",color:"#d97706"}} onClick={() => setActiveTab("verification")}>
              Review Now <Shield size={14}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SETTINGS TAB ─── */
function SettingsTab() {
  const { user } = useAuth();
  const [cleaning, setCleaning] = useState(false);

  const handleClearSampleData = async () => {
    if (!window.confirm("Remove the seeded sample chefs, users, and recipes from the database?")) {
      return;
    }

    setCleaning(true);
    const loadingToast = toast.loading("Removing sample data...");
    try {
      const result = await adminAPI.clearSampleData();
      toast.success(result.message || "Sample data removed", { id: loadingToast });
      window.location.reload();
    } catch (err) {
      console.error("Failed to remove sample data:", err);
      toast.error(err.message || "Failed to remove sample data", { id: loadingToast });
    } finally {
      setCleaning(false);
    }
  };

  return (
    <div className="ad-content ad-fade-in">
      <div className="ad-page-header"><div><h1 className="ad-page-title">Settings</h1><p className="ad-page-sub">Platform configuration</p></div></div>
      <div className="ad-card"><div className="ad-card-body">
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div><label style={{fontSize:"0.8125rem",fontWeight:600,color:"#334155",display:"block",marginBottom:6}}>Platform Name</label><input className="ad-input" defaultValue="RecipeNest"/></div>
          <div><label style={{fontSize:"0.8125rem",fontWeight:600,color:"#334155",display:"block",marginBottom:6}}>Admin Email</label><input className="ad-input" defaultValue={user?.email || ""} readOnly /></div>
          <div style={{padding:"14px 16px",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <Shield size={16} style={{color:"#059669"}}/>
              <span style={{fontSize:"0.8125rem",fontWeight:700,color:"#065f46"}}>Manual Verification Only</span>
            </div>
            <p style={{margin:0,fontSize:"0.8125rem",color:"#047857"}}>All chef verifications require admin review. You must personally inspect the submitted citizen number, email, and ID document photo before approving.</p>
          </div>
          <div style={{padding:"16px",background:"#fff7ed",borderRadius:10,border:"1px solid #fdba74"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}>
              <div>
                <p style={{margin:"0 0 4px",fontSize:"0.875rem",fontWeight:700,color:"#9a3412"}}>Sample Data Cleanup</p>
                <p style={{margin:0,fontSize:"0.8125rem",color:"#c2410c"}}>Use this once to remove the seeded demo chefs, recipes, and pending verifications from the admin panel.</p>
              </div>
              <button className="ad-btn-outline" onClick={handleClearSampleData} disabled={cleaning}>
                {cleaning ? "Removing..." : "Remove Sample Data"}
              </button>
            </div>
          </div>
        </div>
      </div></div>
    </div>
  );
}
