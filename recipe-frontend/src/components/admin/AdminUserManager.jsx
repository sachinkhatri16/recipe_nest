import { useState, useEffect } from "react";
import { Users, Search, CheckCircle2, AlertTriangle, UserCheck, Ban, ChefHat, Utensils, Shield, Mail } from "lucide-react";
import { adminAPI } from "../../services/api";

export default function AdminUserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    adminAPI
      .getAllUsers()
      .then((data) => setUsers(data))
      .catch((err) => console.error("Failed to load users:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const statusLabel = u.status === "banned" ? "banned" : "active";
    const matchFilter = filter === "all" || u.role === filter || statusLabel === filter;
    return matchSearch && matchFilter;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status !== "banned").length;
  const chefs = users.filter(u => u.role === "chef").length;
  const banned = users.filter(u => u.status === "banned").length;

  const handleBan = async (id) => {
    if (!banReason.trim()) return;
    try {
      await adminAPI.banUser(id, banReason);
      setUsers(users.map(u => u._id === id ? { ...u, status: "banned", banReason } : u));
      setBanModal(null);
      setBanReason("");
    } catch (err) {
      console.error("Ban failed:", err);
    }
  };

  const handleUnban = async (id) => {
    try {
      await adminAPI.unbanUser(id);
      setUsers(users.map(u => u._id === id ? { ...u, status: "active", banReason: "" } : u));
    } catch (err) {
      console.error("Unban failed:", err);
    }
  };

  return (
    <div className="ad-content ad-fade-in">
      <div className="ad-page-header">
        <div><h1 className="ad-page-title">Global User Manager</h1><p className="ad-page-sub">Search, manage, and moderate all platform accounts</p></div>
      </div>

      <div className="ad-stats-grid">
        <div className="ad-stat-card"><div className="ad-stat-icon-wrap ad-stat-blue"><Users className="ad-stat-icon"/></div><div className="ad-stat-data"><span className="ad-stat-num">{totalUsers}</span><span className="ad-stat-label">Total Users</span></div></div>
        <div className="ad-stat-card"><div className="ad-stat-icon-wrap ad-stat-emerald"><CheckCircle2 className="ad-stat-icon"/></div><div className="ad-stat-data"><span className="ad-stat-num">{activeUsers}</span><span className="ad-stat-label">Active</span></div></div>
        <div className="ad-stat-card"><div className="ad-stat-icon-wrap ad-stat-violet"><ChefHat className="ad-stat-icon"/></div><div className="ad-stat-data"><span className="ad-stat-num">{chefs}</span><span className="ad-stat-label">Chefs</span></div></div>
        <div className="ad-stat-card"><div className="ad-stat-icon-wrap ad-stat-rose"><Ban className="ad-stat-icon"/></div><div className="ad-stat-data"><span className="ad-stat-num">{banned}</span><span className="ad-stat-label">Banned</span></div></div>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search-wrap"><Search className="ad-search-icon"/><input className="ad-search-input" placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <select className="ad-filter-select" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="all">All Users</option><option value="chef">Chefs</option><option value="foodlover">Food Lovers</option><option value="active">Active</option><option value="banned">Banned</option>
        </select>
      </div>

      {loading ? (
        <div className="ad-card"><div className="ad-card-body"><p>Loading users...</p></div></div>
      ) : (
        <div className="ad-card"><div className="ad-card-body-flush"><div className="ad-table-wrap">
          <table className="ad-table"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>{filtered.map(u => {
            const status = u.status === "banned" ? "Banned" : "Active";
            return (
              <tr key={u._id}>
                <td><div className="ad-user-cell"><div className={`ad-user-avatar ${u.role}`}>{u.name.charAt(0)}</div><div><div className="ad-table-name">{u.name}</div><div className="ad-table-sub">{u.email}</div></div></div></td>
                <td><span className={`ad-pill ${u.role==="chef"?"ad-pill-blue":"ad-pill-slate"}`}>{u.role === "chef" ? <><ChefHat size={11}/> Chef</> : <><Utensils size={11}/> Food Lover</>}</span></td>
                <td><span className={`ad-pill ${status==="Active"?"ad-pill-green":"ad-pill-red"}`}><span className="ad-pill-icon">{status==="Active"?<CheckCircle2 size={12}/>:<Ban size={12}/>}</span>{status}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</td>
                <td><div className="ad-table-actions">
                  {u.status !== "banned" ? (
                    <button className="ad-btn-sm ad-btn-sm-reject" onClick={() => setBanModal(u)}><Ban size={14}/> Ban</button>
                  ) : (
                    <button className="ad-btn-sm ad-btn-sm-approve" onClick={() => handleUnban(u._id)}><UserCheck size={14}/> Unban</button>
                  )}
                </div></td>
              </tr>
            );
          })}</tbody></table>
        </div></div></div>
      )}

      {banModal && (
        <div className="ad-modal-overlay" onClick={() => setBanModal(null)}>
          <div className="ad-modal" onClick={e => e.stopPropagation()}>
            <h3 style={{margin:"0 0 4px"}}>Ban {banModal.name}</h3>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16}}>
              <Mail size={14} style={{color:"#64748b"}}/>
              <span style={{color:"#64748b",fontSize:"0.875rem"}}>{banModal.email}</span>
              <span className={`ad-pill ${banModal.role==="chef"?"ad-pill-blue":"ad-pill-slate"}`} style={{marginLeft:4}}>{banModal.role === "chef" ? "Chef" : "Food Lover"}</span>
            </div>
            <p style={{color:"#64748b",fontSize:"0.875rem",margin:"0 0 20px"}}>This will restrict the user from accessing platform features.</p>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:"0.8125rem",fontWeight:600,color:"#334155",display:"block",marginBottom:6}}>Reason</label>
              <textarea className="ad-input" rows={3} value={banReason} onChange={e=>setBanReason(e.target.value)} placeholder="Reason for ban..." style={{resize:"vertical"}}/>
            </div>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="ad-btn-outline" onClick={() => setBanModal(null)}>Cancel</button>
              <button className="ad-btn-sm ad-btn-sm-reject" style={{padding:"10px 20px"}} disabled={!banReason.trim()} onClick={() => handleBan(banModal._id)}><Ban size={14}/> Confirm Ban</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
