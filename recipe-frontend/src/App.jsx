import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import Homepage from "./pages/Homepage.jsx";
import RecipesPage from "./pages/RecipesPage.jsx";
import RecipeDetailPage from "./pages/RecipeDetailPage.jsx";
import ChefsPage from "./pages/ChefsPage.jsx";
import ChefProfilePage from "./pages/ChefProfilePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ChefDashboard from "./pages/ChefDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ChefVerification from "./pages/ChefVerification.jsx";

const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated && (user?.role === "admin" || user?.role === "chef")) {
    return <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/chef-dashboard"} replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/" element={<PublicRoute><Homepage /></PublicRoute>} />
          <Route path="/recipes" element={<PublicRoute><RecipesPage /></PublicRoute>} />
          <Route path="/recipes/:id" element={<PublicRoute><RecipeDetailPage /></PublicRoute>} />
          <Route path="/chefs" element={<PublicRoute><ChefsPage /></PublicRoute>} />
          <Route path="/chefs/:id" element={<PublicRoute><ChefProfilePage /></PublicRoute>} />
          <Route path="/about" element={<PublicRoute><AboutPage /></PublicRoute>} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<PublicRoute><ProfilePage /></PublicRoute>} />
          <Route path="/chef-dashboard" element={<ChefDashboard />} />
          <Route path="/chef-verification" element={<ChefVerification />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
