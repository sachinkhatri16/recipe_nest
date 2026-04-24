import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Homepage from "./pages/Homepage.jsx";
import RecipesPage from "./pages/RecipesPage.jsx";
import RecipeDetailPage from "./pages/RecipeDetailPage.jsx";
import ChefsPage from "./pages/ChefsPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import ChefDashboard from "./pages/ChefDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ChefVerification from "./pages/ChefVerification.jsx";

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/chefs" element={<ChefsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chef-dashboard" element={<ChefDashboard />} />
          <Route path="/chef-verification" element={<ChefVerification />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}
