import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, userAPI, setToken, clearToken, getToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: check for existing token and fetch user
  useEffect(() => {
    const token = getToken();
    if (token) {
      authAPI
        .getMe()
        .then((data) => setUser(data))
        .catch(() => {
          clearToken();
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authAPI.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async ({ name, email, password, role }) => {
    const data = await authAPI.register({ name, email, password, role });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authAPI.getMe();
      setUser(data);
      return data;
    } catch {
      return null;
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const toggleSaveRecipe = useCallback(
    async (recipeId) => {
      if (!user) return;
      try {
        const data = await userAPI.toggleSaveRecipe(recipeId);
        setUser((prev) => (prev ? { ...prev, savedRecipes: data.savedRecipes } : null));
      } catch (err) {
        console.error("Save recipe failed:", err);
      }
    },
    [user]
  );

  const toggleSaveChef = useCallback(
    async (chefId) => {
      if (!user) return;
      try {
        const data = await userAPI.toggleSaveChef(chefId);
        setUser((prev) => (prev ? { ...prev, savedChefs: data.savedChefs } : null));
      } catch (err) {
        console.error("Save chef failed:", err);
      }
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout,
        refreshUser,
        updateUser,
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
