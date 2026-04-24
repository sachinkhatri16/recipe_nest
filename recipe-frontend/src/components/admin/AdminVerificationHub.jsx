import { useState, useEffect } from "react";
import { Shield, CheckCircle2, XCircle, Clock, CreditCard, Image, Search, Mail, AlertTriangle, RefreshCw } from "lucide-react";
import { adminAPI } from "../../services/api";
import toast from "react-hot-toast";

export default function AdminVerificationHub() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChef, setSelectedChef] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [search, setSearch] = useState("");
  const [approvedMsg, setApprovedMsg] = useState("");

  const loadQueue = async (showToast = false) => {
    try {
      const data = await adminAPI.getPendingChefs();
      setQueue(Array.isArray(data) ? data : []);
      if (showToast) toast.success("Verification queue refreshed");
    } catch (err) {
      console.error("Failed to load pending chefs:", err);
      toast.error(err.message || "Failed to load pending verifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
    const intervalId = window.setInterval(() => loadQueue(), 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    loadQueue(true);
  };

  const filtered = queue.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.verificationData?.citizenNumber || "").includes(search)
  );

  const approveChef = async (id) => {
    const loadingToast = toast.loading("Approving chef...");
    try {
      await adminAPI.verifyChef(id, "approved");
      const chef = queue.find(c => c._id === id);
      setQueue(q => q.filter(c => c._id !== id));
      setSelectedChef(null);
      setApprovedMsg(`${chef?.name} has been verified and can now publish recipes.`);
      setTimeout(() => setApprovedMsg(""), 4000);
      toast.success("Chef approved successfully", { id: loadingToast });
    } catch (err) {
      console.error("Approve failed:", err);
      toast.error(err.message || "Failed to approve chef", { id: loadingToast });
    }
  };

  const rejectChef = async (id) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    const loadingToast = toast.loading("Rejecting chef...");
    try {
      await adminAPI.verifyChef(id, "rejected", rejectReason);
      setQueue(q => q.filter(c => c._id !== id));
      setSelectedChef(null);
      setShowRejectModal(false);
      setRejectReason("");
      toast.success("Chef application rejected", { id: loadingToast });
    } catch (err) {
      console.error("Reject failed:", err);
      toast.error(err.message || "Failed to reject chef", { id: loadingToast });
    }
  };

  const getInitials = (name) =>
    (name || "")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="ad-content ad-fade-in">
      <div className="ad-page-header">
        <div>
          <h1 className="ad-page-title">Verification Hub</h1>
          <p className="ad-page-sub">Manually review and approve chef identity documents</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <button className="ad-btn-outline" onClick={handleRefresh} type="button">
            <RefreshCw size={14}/> Refresh
          </button>
          <div className="ad-pill ad-pill-amber" style={{fontSize:"0.8125rem",padding:"6px 14px"}}>
            <Clock size={14}/> {queue.length} pending
          </div>
        </div>
      </div>

      {/* Approved confirmation banner */}
      {approvedMsg && (
        <div style={{marginBottom:20,padding:"14px 20px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,display:"flex",alignItems:"center",gap:10}}>
          <CheckCircle2 size={18} style={{color:"#059669",flexShrink:0}}/>
          <span style={{color:"#065f46",fontSize:"0.875rem",fontWeight:500}}>{approvedMsg}</span>
        </div>
      )}

      {/* Manual review notice */}
      <div style={{marginBottom:20,padding:"14px 20px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12,display:"flex",alignItems:"flex-start",gap:10}}>
        <Shield size={18} style={{color:"#2563eb",flexShrink:0,marginTop:2}}/>
        <div>
          <p style={{margin:"0 0 4px",fontWeight:600,fontSize:"0.875rem",color:"#1e3a5f"}}>Manual Verification Required</p>
          <p style={{margin:0,fontSize:"0.8125rem",color:"#1e40af"}}>
            Review each chef's email, citizen number, and uploaded ID photo before approving. There is no auto-verification.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="ad-search-bar" style={{marginBottom:20}}>
        <Search size={16} style={{color:"#94a3b8"}}/>
        <input
          className="ad-input"
          style={{border:"none",boxShadow:"none",flex:1,padding:"0 8px",fontSize:"0.875rem"}}
          placeholder="Search by name, email, or citizen number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="ad-card"><div className="ad-card-body"><p>Loading pending chefs...</p></div></div>
      ) : filtered.length === 0 ? (
        <div className="ad-card">
          <div className="ad-card-body" style={{textAlign:"center",padding:40}}>
            <CheckCircle2 size={36} style={{color:"#10b981",margin:"0 auto 12px"}}/>
            <p style={{fontSize:"1rem",fontWeight:600,color:"#1e293b",margin:"0 0 4px"}}>All clear</p>
            <p style={{fontSize:"0.875rem",color:"#64748b",margin:0}}>No chefs are waiting for verification right now.</p>
          </div>
        </div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {filtered.map(chef => (
            <div key={chef._id} className="ad-card" style={{cursor:"pointer",transition:"box-shadow .15s"}} onClick={() => setSelectedChef(selectedChef?._id === chef._id ? null : chef)}>
              <div className="ad-card-body" style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <div style={{width:48,height:48,borderRadius:12,background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.875rem"}}>
                  {getInitials(chef.name)}
                </div>
                <div style={{flex:1,minWidth:140}}>
                  <p style={{margin:"0 0 2px",fontWeight:700,fontSize:"0.9375rem",color:"#1e293b"}}>{chef.name}</p>
                  <p style={{margin:0,fontSize:"0.8125rem",color:"#64748b"}}>{chef.email}</p>
                </div>
                <div style={{fontSize:"0.8125rem",color:"#64748b"}}>{chef.profile?.specialty || "Chef"}</div>
                <div className="ad-pill ad-pill-amber" style={{fontSize:"0.75rem"}}><Clock size={12}/> Pending</div>
              </div>

              {/* Expanded details */}
              {selectedChef?._id === chef._id && (
                <div style={{borderTop:"1px solid #e2e8f0",padding:20}} onClick={(e) => e.stopPropagation()}>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:16,marginBottom:20}}>
                    <div style={{padding:14,background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <Mail size={14} style={{color:"#3b82f6"}}/>
                        <span style={{fontSize:"0.75rem",fontWeight:600,color:"#64748b",textTransform:"uppercase"}}>Email</span>
                      </div>
                      <p style={{margin:0,fontSize:"0.875rem",fontWeight:600,color:"#1e293b"}}>{chef.email}</p>
                    </div>
                    <div style={{padding:14,background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0"}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                        <CreditCard size={14} style={{color:"#8b5cf6"}}/>
                        <span style={{fontSize:"0.75rem",fontWeight:600,color:"#64748b",textTransform:"uppercase"}}>Citizen Number</span>
                      </div>
                      <p style={{margin:0,fontSize:"0.875rem",fontWeight:600,color:"#1e293b",fontFamily:"monospace"}}>{chef.verificationData?.citizenNumber || "Not provided"}</p>
                    </div>
                  </div>

                  {chef.verificationData?.idPhoto && (
                    <div style={{marginBottom:20}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        <Image size={14} style={{color:"#059669"}}/>
                        <span style={{fontSize:"0.75rem",fontWeight:600,color:"#64748b",textTransform:"uppercase"}}>ID Document Photo</span>
                      </div>
                      <div style={{borderRadius:12,border:"1px solid #e2e8f0",overflow:"hidden",maxWidth:400}}>
                        <img src={chef.verificationData.idPhoto} alt="ID Document" style={{width:"100%",display:"block"}}/>
                      </div>
                    </div>
                  )}

                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    <button className="ad-btn-primary" style={{background:"#059669"}} onClick={() => approveChef(chef._id)}>
                      <CheckCircle2 size={16}/> Approve Chef
                    </button>
                    <button className="ad-btn-outline" style={{borderColor:"#ef4444",color:"#ef4444"}} onClick={() => { setSelectedChef(chef); setShowRejectModal(true); }}>
                      <XCircle size={16}/> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedChef && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20}} onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>
          <div style={{background:"#fff",borderRadius:16,maxWidth:480,width:"100%",padding:24}} onClick={(e) => e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
              <AlertTriangle size={20} style={{color:"#ef4444"}}/>
              <h3 style={{margin:0,fontSize:"1.0625rem",color:"#1e293b"}}>Reject {selectedChef.name}</h3>
            </div>
            <p style={{fontSize:"0.875rem",color:"#64748b",margin:"0 0 12px"}}>Provide a reason for rejection. The chef will need to resubmit their documents.</p>
            <textarea
              style={{width:"100%",minHeight:100,padding:12,border:"1px solid #e2e8f0",borderRadius:10,fontSize:"0.875rem",resize:"vertical",boxSizing:"border-box"}}
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div style={{display:"flex",gap:10,marginTop:16,justifyContent:"flex-end"}}>
              <button className="ad-btn-outline" onClick={() => { setShowRejectModal(false); setRejectReason(""); }}>Cancel</button>
              <button className="ad-btn-primary" style={{background:"#ef4444"}} onClick={() => rejectChef(selectedChef._id)}>Reject Chef</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
