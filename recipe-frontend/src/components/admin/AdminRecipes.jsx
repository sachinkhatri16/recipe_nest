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
          <div className="ad-modal" onClick={e => e.stopPropagation()} style={{maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: 24}}>
            <h3 style={{margin:"0 0 20px", fontSize: "1.5rem", fontWeight: 700, color: "#1e293b"}}>Recipe Details</h3>
            
            <div style={{display: "flex", gap: 24, marginBottom: 24}}>
              <div style={{flex: "0 0 200px"}}>
                <img 
                  src={viewRecipe.coverImage || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&q=80"} 
                  alt={viewRecipe.title}
                  style={{width: "200px", height: "200px", objectFit: "cover", borderRadius: 12, boxShadow: "0 4px 6px rgba(0,0,0,0.05)"}}
                />
              </div>
              <div style={{flex: 1}}>
                <h4 style={{margin: "0 0 12px", fontSize: "1.5rem", color: "#0f172a"}}>{viewRecipe.title}</h4>
                <div style={{display: "flex", gap: 8, marginBottom: 16}}>
                  <span className="ad-pill ad-pill-slate" style={{fontSize: "0.875rem"}}>{viewRecipe.category || "Uncategorized"}</span>
                  <span className={`ad-pill ${viewRecipe.status==="Published"?"ad-pill-green":"ad-pill-amber"}`} style={{fontSize: "0.875rem"}}>{viewRecipe.status || "Draft"}</span>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: "0.95rem", marginBottom: 16}}>
                  <div className="ad-user-avatar chef" style={{width: 28, height: 28, fontSize: "0.8rem"}}>
                    {(viewRecipe.chef?.name || "C").charAt(0)}
                  </div>
                  <span style={{fontWeight: 500}}>By {viewRecipe.chef?.name || "Unknown Chef"}</span>
                  <span>•</span>
                  <span>{new Date(viewRecipe.createdAt).toLocaleDateString()}</span>
                </div>
                <p style={{margin: 0, fontSize: "0.95rem", color: "#475569", lineHeight: 1.6}}>
                  {viewRecipe.description || "No description provided."}
                </p>
              </div>
            </div>

            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24}}>
              <div style={{background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0"}}>
                <span style={{fontWeight: 600, color: "#334155", display: "block", marginBottom: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 8}}>Cooking Info</span>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.95rem", color: "#475569"}}>
                  <div><strong style={{color:"#1e293b"}}>Prep:</strong> {viewRecipe.prepTime || 0} mins</div>
                  <div><strong style={{color:"#1e293b"}}>Cook:</strong> {viewRecipe.cookTime || 0} mins</div>
                  <div><strong style={{color:"#1e293b"}}>Servings:</strong> {viewRecipe.servings || 0}</div>
                  <div><strong style={{color:"#1e293b"}}>Level:</strong> {viewRecipe.level || "Not set"}</div>
                </div>
              </div>
              <div style={{background: "#f8fafc", padding: 16, borderRadius: 12, border: "1px solid #e2e8f0"}}>
                <span style={{fontWeight: 600, color: "#334155", display: "block", marginBottom: 12, borderBottom: "1px solid #e2e8f0", paddingBottom: 8}}>Content Stats</span>
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.95rem", color: "#475569"}}>
                  <div><strong style={{color:"#1e293b"}}>Ingredients:</strong> {viewRecipe.ingredients?.length || 0} items</div>
                  <div><strong style={{color:"#1e293b"}}>Instructions:</strong> {viewRecipe.instructions?.length || 0} steps</div>
                  <div><strong style={{color:"#1e293b"}}>Tags:</strong> {viewRecipe.tags?.length || 0}</div>
                  <div><strong style={{color:"#1e293b"}}>Reviews:</strong> {viewRecipe.reviews?.length || 0}</div>
                </div>
              </div>
            </div>

            {viewRecipe.ingredients && viewRecipe.ingredients.length > 0 && (
              <div style={{marginBottom: 24}}>
                <h5 style={{fontSize: "1.1rem", color: "#1e293b", margin: "0 0 12px"}}>Ingredients</h5>
                <ul style={{margin: 0, paddingLeft: 20, color: "#475569", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: 6}}>
                  {viewRecipe.ingredients.map((ing, idx) => (
                    <li key={idx}><strong>{ing.quantity} {ing.unit}</strong> {ing.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {viewRecipe.instructions && viewRecipe.instructions.length > 0 && (
              <div style={{marginBottom: 24}}>
                <h5 style={{fontSize: "1.1rem", color: "#1e293b", margin: "0 0 12px"}}>Instructions</h5>
                <ol style={{margin: 0, paddingLeft: 20, color: "#475569", fontSize: "0.95rem", display: "flex", flexDirection: "column", gap: 10}}>
                  {viewRecipe.instructions.map((inst, idx) => (
                    <li key={idx} style={{lineHeight: 1.5}}>{inst.step}</li>
                  ))}
                </ol>
              </div>
            )}

            {viewRecipe.tags && viewRecipe.tags.length > 0 && (
              <div style={{marginBottom: 24}}>
                <h5 style={{fontSize: "1.1rem", color: "#1e293b", margin: "0 0 12px"}}>Tags</h5>
                <div style={{display: "flex", flexWrap: "wrap", gap: 8}}>
                  {viewRecipe.tags.map((tag, idx) => (
                    <span key={idx} style={{background: "#f1f5f9", border: "1px solid #cbd5e1", color: "#475569", padding: "4px 12px", borderRadius: 16, fontSize: "0.85rem", fontWeight: 500}}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{display:"flex",justifyContent:"flex-end", gap: 12, marginTop: 32, paddingTop: 20, borderTop: "1px solid #e2e8f0"}}>
              <button 
                style={{padding: "10px 20px", background: "#fee2e2", color: "#b91c1c", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 600}} 
                onClick={() => { setDeleteConfirm(viewRecipe); setViewRecipe(null); }}
              >
                <Trash2 size={16}/> Delete Recipe
              </button>
              <button 
                style={{padding: "10px 24px", background: "#f8fafc", color: "#334155", border: "1px solid #cbd5e1", borderRadius: 8, cursor: "pointer", fontWeight: 600}} 
                onClick={() => setViewRecipe(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
