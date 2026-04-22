import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return {
          savedRecipes: [],
          savedChefs: [],
          ...parsed,
        };
      } catch (error) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = (profile = { name: "Guest User", role: "foodlover" }) => {
    setUser({
      savedRecipes: [],
      savedChefs: [],
      ...profile,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const toggleSaveRecipe = (recipeId) => {
    if (!user) return;
    setUser(prev => {
      const isSaved = prev.savedRecipes.includes(recipeId);
      const newSaved = isSaved 
        ? prev.savedRecipes.filter(id => id !== recipeId)
        : [...prev.savedRecipes, recipeId];
      return { ...prev, savedRecipes: newSaved };
    });
  };

  const toggleSaveChef = (chefId) => {
    if (!user) return;
    setUser(prev => {
      const isSaved = prev.savedChefs.includes(chefId);
      const newSaved = isSaved 
        ? prev.savedChefs.filter(id => id !== chefId)
        : [...prev.savedChefs, chefId];
      return { ...prev, savedChefs: newSaved };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
        toggleSaveRecipe,
        toggleSaveChef,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
