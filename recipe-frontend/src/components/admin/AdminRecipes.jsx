import { useState, useEffect } from "react";
import { Search, Trash2 } from "lucide-react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    adminAPI
      .getAllRecipes()
      .then((data) => setRecipes(Array.isArray(data) ? data : data.recipes || []))
      .catch((err) => {
        console.error("Failed to load recipes:", err);
        toast.error(err.message || "Failed to load recipes");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = recipes.filter(r => {
    const matchSearch = (r.title || "").toLowerCase().includes(search.toLowerCase()) || (r.chef?.name || "").toLowerCase().includes(search.toLowerCase());
    const statusLabel = (r.status || "").toLowerCase();
    const matchFilter = filter === "all" || statusLabel === filter || (r.category || "").toLowerCase() === filter;
    return matchSearch && matchFilter;
  });

  const handleDelete = async (id) => {
    const loadingToast = toast.loading("Deleting recipe...");
    try {
      await adminAPI.deleteRecipe(id);
      setRecipes(recipes.filter(r => r._id !== id));
      setDeleteConfirm(null);
      toast.success("Recipe deleted successfully", { id: loadingToast });
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error(err.message || "Failed to delete recipe", { id: loadingToast });
    }
  };

  const categories = [...new Set(recipes.map(r => r.category).filter(Boolean))];

  return (
    <div className="ad-content ad-fade-in">
      <div className="ad-page-header">
        <div><h1 className="ad-page-title">All Recipes</h1><p className="ad-page-sub">Browse and moderate all recipe content on the platform</p></div>
        <span style={{fontSize:"0.875rem",color:"#64748b",fontWeight:500}}>{recipes.length} total recipes</span>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search-wrap"><Search className="ad-search-icon"/><input className="ad-search-input" placeholder="Search recipes or chef names..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <select className="ad-filter-select" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">All</option><option value="published">Published</option><option value="draft">Draft</option>
          {categories.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="ad-card"><div className="ad-card-body"><p>Loading recipes...</p></div></div>
      ) : (
        <div className="ad-card"><div className="ad-card-body-flush"><div className="ad-table-wrap">
          <table className="ad-table"><thead><tr><th>Recipe</th><th>Chef</th><th>Category</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(r => (
            <tr key={r._id}>
              <td className="ad-table-name">{r.title}</td>
              <td><div className="ad-user-cell"><div className="ad-user-avatar chef" style={{width:28,height:28,fontSize:"0.7rem"}}>{(r.chef?.name || "C").charAt(0)}</div><span>{r.chef?.name || "Unknown"}</span></div></td>
              <td><span className="ad-pill ad-pill-slate">{r.category}</span></td>
              <td><span className={`ad-pill ${r.status==="Published"?"ad-pill-green":"ad-pill-amber"}`}>{r.status}</span></td>
              <td style={{color:"#64748b",fontSize:"0.8125rem"}}>{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
              <td><div className="ad-table-actions">
                <button className="ad-btn-sm ad-btn-sm-reject" onClick={() => setDeleteConfirm(r)}><Trash2 size={14}/> Delete</button>
              </div></td>
            </tr>
          ))}</tbody></table>
        </div></div></div>
      )}

      {deleteConfirm && (
        <div className="ad-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{margin:"0 0 8px",color:"#dc2626"}}>Delete Recipe</h3>
            <p style={{color:"#64748b",fontSize:"0.875rem",margin:"0 0 8px"}}>Are you sure you want to permanently delete <strong>{deleteConfirm.title}</strong> by {deleteConfirm.chef?.name || "Unknown"}?</p>
            <p style={{color:"#94a3b8",fontSize:"0.8125rem",margin:"0 0 20px"}}>This action cannot be undone.</p>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="ad-btn-outline" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="ad-btn-sm ad-btn-sm-reject" style={{padding:"10px 20px"}} onClick={() => handleDelete(deleteConfirm._id)}><Trash2 size={14}/> Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
