import { useState, useEffect } from "react";
import { Search, Trash2, Eye } from "lucide-react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function AdminRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewRecipe, setViewRecipe] = useState(null);
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
                <button className="ad-btn-sm ad-btn-outline" onClick={() => setViewRecipe(r)} style={{marginRight: 8}}><Eye size={14}/> View</button>
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

      {/* View Recipe Modal */}
      {viewRecipe && (
        <div className="ad-modal-overlay" onClick={() => setViewRecipe(null)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()} style={{maxWidth: 600, maxHeight: '90vh', overflowY: 'auto'}}>
            <h3 style={{margin:"0 0 16px"}}>Recipe Details</h3>
            
            <div style={{display: "flex", gap: 20, marginBottom: 20}}>
              <div style={{flex: "0 0 150px"}}>
                <img 
                  src={viewRecipe.coverImage || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80"} 
                  alt={viewRecipe.title}
                  style={{width: "100%", height: 150, objectFit: "cover", borderRadius: 8}}
                />
              </div>
              <div style={{flex: 1}}>
                <h4 style={{margin: "0 0 8px", fontSize: "1.2rem"}}>{viewRecipe.title}</h4>
                <div style={{display: "flex", gap: 8, marginBottom: 12}}>
                  <span className="ad-pill ad-pill-slate">{viewRecipe.category || "Uncategorized"}</span>
                  <span className={`ad-pill ${viewRecipe.status==="Published"?"ad-pill-green":"ad-pill-amber"}`}>{viewRecipe.status || "Draft"}</span>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: "0.875rem", marginBottom: 12}}>
                  <div className="ad-user-avatar chef" style={{width: 24, height: 24, fontSize: "0.7rem"}}>
                    {(viewRecipe.chef?.name || "C").charAt(0)}
                  </div>
                  <span>By {viewRecipe.chef?.name || "Unknown Chef"}</span>
                  <span>•</span>
                  <span>{new Date(viewRecipe.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{margin: 0, fontSize: "0.875rem", color: "#475569", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden"}}>
                  {viewRecipe.description || "No description provided."}
                </p>
              </div>
            </div>

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20}}>
              <div style={{background: "#f8fafc", padding: 12, borderRadius: 8}}>
                <span style={{fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: 4}}>Cooking Info</span>
                <div style={{display: "flex", flexDirection: "column", gap: 4, fontSize: "0.875rem", color: "#334155"}}>
                  <div><strong>Prep:</strong> {viewRecipe.prepTime || 0} mins</div>
                  <div><strong>Cook:</strong> {viewRecipe.cookTime || 0} mins</div>
                  <div><strong>Servings:</strong> {viewRecipe.servings || 0}</div>
                  <div><strong>Level:</strong> {viewRecipe.level || "Not set"}</div>
                </div>
              </div>
              <div style={{background: "#f8fafc", padding: 12, borderRadius: 8}}>
                <span style={{fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: 4}}>Content Stats</span>
                <div style={{display: "flex", flexDirection: "column", gap: 4, fontSize: "0.875rem", color: "#334155"}}>
                  <div><strong>Ingredients:</strong> {viewRecipe.ingredients?.length || 0} items</div>
                  <div><strong>Instructions:</strong> {viewRecipe.instructions?.length || 0} steps</div>
                  <div><strong>Tags:</strong> {viewRecipe.tags?.length || 0}</div>
                  <div><strong>Reviews:</strong> {viewRecipe.reviews?.length || 0}</div>
                </div>
              </div>
            </div>

            {viewRecipe.tags && viewRecipe.tags.length > 0 && (
              <div style={{marginBottom: 20}}>
                <span style={{fontSize: "0.75rem", color: "#64748b", display: "block", marginBottom: 8}}>Tags</span>
                <div style={{display: "flex", flexWrap: "wrap", gap: 6}}>
                  {viewRecipe.tags.map((tag, idx) => (
                    <span key={idx} style={{background: "#e2e8f0", color: "#475569", padding: "2px 8px", borderRadius: 12, fontSize: "0.75rem"}}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{display:"flex",justifyContent:"flex-end", gap: 10}}>
              <button className="ad-btn-sm ad-btn-sm-reject" onClick={() => { setDeleteConfirm(viewRecipe); setViewRecipe(null); }}><Trash2 size={14}/> Delete</button>
              <button className="ad-btn-outline" onClick={() => setViewRecipe(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
