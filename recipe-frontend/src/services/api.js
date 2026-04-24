const API_BASE = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

/* --- Token helpers ------------------------------------ */
export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);
export const clearToken = () => localStorage.removeItem("token");

const headers = (isJson = true) => {
  const h = {};
  const token = getToken();
  if (token) h["Authorization"] = `Bearer ${token}`;
  if (isJson) h["Content-Type"] = "application/json";
  return h;
};

async function request(url, opts = {}) {
  try {
    const res = await fetch(`${API_BASE}${url}`, {
      ...opts,
      headers: opts.headers || headers(!opts.body || !(opts.body instanceof FormData)),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw { status: res.status, message: data.message || "Request failed", data };
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw {
        status: 0,
        message: "Unable to reach the API. Make sure the backend is running and the frontend API URL is correct.",
        cause: error,
      };
    }

    throw error;
  }
}

/* --- Auth --------------------------------------------- */
export const authAPI = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => request("/auth/me"),
};

/* --- Users -------------------------------------------- */
export const userAPI = {
  updateProfile: (body) => request("/users/profile", { method: "PUT", body: JSON.stringify(body) }),
  updateAvatar: (formData) => request("/users/avatar", { method: "PUT", body: formData, headers: { Authorization: `Bearer ${getToken()}` } }),
  toggleSaveRecipe: (id) => request(`/users/save-recipe/${id}`, { method: "POST" }),
  toggleSaveChef: (id) => request(`/users/save-chef/${id}`, { method: "POST" }),
  getSavedRecipes: () => request("/users/saved-recipes"),
  getSavedChefs: () => request("/users/saved-chefs"),
  getMyComments: () => request("/users/my-comments"),
  becomeChef: () => request("/users/become-chef", { method: "PUT" }),
};

/* --- Recipes ------------------------------------------ */
export const recipeAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/recipes${q ? `?${q}` : ""}`);
  },
  getOne: (id) => request(`/recipes/${id}`),
  create: (body) => request("/recipes", { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body) }),
  update: (id, body) => request(`/recipes/${id}`, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (id) => request(`/recipes/${id}`, { method: "DELETE" }),
  getMyRecipes: () => request("/recipes/chef/my-recipes"),
  addReview: (id, text) => request(`/recipes/${id}/review`, { method: "POST", body: JSON.stringify({ text }) }),
};

/* --- Chefs -------------------------------------------- */
export const chefAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/chefs${q ? `?${q}` : ""}`);
  },
  getOne: (id) => request(`/chefs/${id}`),
  submitVerification: (formData) => request("/chefs/verify", { method: "POST", body: formData, headers: { Authorization: `Bearer ${getToken()}` } }),
  getVerificationStatus: () => request("/chefs/verification-status"),
};

/* --- Admin -------------------------------------------- */
export const adminAPI = {
  // Users
  getAllUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/users${q ? `?${q}` : ""}`);
  },
  banUser: (id, reason) => request(`/admin/ban/${id}`, { method: "POST", body: JSON.stringify({ reason }) }),
  unbanUser: (id) => request(`/admin/unban/${id}`, { method: "POST" }),

  // Verification
  getPendingChefs: () => request("/admin/pending-verifications"),
  verifyChef: (id, decision, reason) => {
    const endpoint = decision === "approved"
      ? `/admin/verify/${id}/approve`
      : `/admin/verify/${id}/reject`;
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(reason ? { reason } : {}),
    });
  },

  // Recipes
  getAllRecipes: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/admin/recipes${q ? `?${q}` : ""}`);
  },
  deleteRecipe: (id) => request(`/admin/recipes/${id}`, { method: "DELETE" }),

  // Analytics
  getAnalytics: () => request("/admin/analytics"),
};
