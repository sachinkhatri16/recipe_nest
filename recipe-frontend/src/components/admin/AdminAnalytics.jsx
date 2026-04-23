import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, BookOpen, Eye, ArrowUpRight } from "lucide-react";
import { adminAPI } from "../../services/api";

function DonutChart({ data, size = 180 }) {
  if (!data || data.length === 0) return null;
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;
  const cx = size / 2, cy = size / 2, r = size * 0.35, strokeW = size * 0.12;
  let angle = -90;
  const colors = ["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#64748b"];
  const arcs = data.map((d, i) => {
    const sweep = (d.count / total) * 360;
    const startAngle = angle;
    angle += sweep;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + sweep) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad), y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad), y2 = cy + r * Math.sin(endRad);
    const large = sweep > 180 ? 1 : 0;
    const color = colors[i % colors.length];
    return (
      <path key={i} d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
        fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
    );
  });
  return (
    <div style={{display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
      <svg width={size} height={size}>{arcs}<text x={cx} y={cy-6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#1e293b">{total}</text><text x={cx} y={cy+14} textAnchor="middle" fontSize="10" fill="#94a3b8" fontWeight="500">RECIPES</text></svg>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {data.map((d, i) => (
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:10,height:10,borderRadius:3,background:colors[i % colors.length]}}/>
            <span style={{fontSize:"0.8125rem",color:"#334155",fontWeight:500}}>{d._id || d.name}: {d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getAnalytics()
      .then((data) => setAnalytics(data))
      .catch((err) => console.error("Failed to load analytics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !analytics) {
    return (
      <div className="ad-content ad-fade-in">
        <div className="ad-page-header"><div><h1 className="ad-page-title">Analytics</h1><p className="ad-page-sub">Loading analytics data...</p></div></div>
      </div>
    );
  }

  const ov = analytics.overview || analytics;

  const stats = [
    { icon: Users, label: "Total Users", value: ov.totalUsers || 0, color: "blue" },
    { icon: BookOpen, label: "Total Recipes", value: ov.totalRecipes || 0, color: "emerald" },
    { icon: Eye, label: "Total Views", value: ov.totalViews || 0, color: "violet" },
    { icon: TrendingUp, label: "Verified Chefs", value: ov.verifiedChefs || 0, color: "amber" },
  ];

  return (
    <div className="ad-content ad-fade-in">
      <div className="ad-page-header">
        <div><h1 className="ad-page-title">Analytics</h1><p className="ad-page-sub">Platform growth and performance metrics</p></div>
      </div>

      {/* Stats */}
      <div className="ad-stats-grid">
        {stats.map((s, i) => (
          <div key={i} className="ad-stat-card">
            <div className={`ad-stat-icon-wrap ad-stat-${s.color}`}><s.icon className="ad-stat-icon"/></div>
            <div className="ad-stat-data">
              <span className="ad-stat-num">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</span>
              <span className="ad-stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="ad-card" style={{marginTop:24}}>
        <div className="ad-card-body">
          <h3 style={{margin:"0 0 16px",fontSize:"0.9375rem",fontWeight:700,color:"#1e293b"}}>Recipe Categories</h3>
          <DonutChart data={analytics.categoryDistribution || []} />
        </div>
      </div>

      {/* Top Recipes */}
      {analytics.topRecipes && analytics.topRecipes.length > 0 && (
        <div className="ad-card" style={{marginTop:20}}>
          <div className="ad-card-body">
            <h3 style={{margin:"0 0 16px",fontSize:"0.9375rem",fontWeight:700,color:"#1e293b"}}>Top Recipes by Views</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {analytics.topRecipes.map((r, i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:i===0?"#f0fdf4":"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0"}}>
                  <span style={{width:28,height:28,borderRadius:8,background:i===0?"#10b981":"#e2e8f0",color:i===0?"#fff":"#64748b",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.75rem"}}>{i+1}</span>
                  <div style={{flex:1}}>
                    <p style={{margin:0,fontWeight:600,fontSize:"0.875rem",color:"#1e293b"}}>{r.title}</p>
                    <p style={{margin:0,fontSize:"0.75rem",color:"#64748b"}}>by {r.chef?.name || "Chef"}</p>
                  </div>
                  <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:"0.8125rem",fontWeight:600,color:"#334155"}}><Eye size={14} style={{color:"#94a3b8"}}/>{(r.views || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Chefs */}
      {analytics.topChefs && analytics.topChefs.length > 0 && (
        <div className="ad-card" style={{marginTop:20}}>
          <div className="ad-card-body">
            <h3 style={{margin:"0 0 16px",fontSize:"0.9375rem",fontWeight:700,color:"#1e293b"}}>Top Chefs by Recipes</h3>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {analytics.topChefs.map((c, i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0"}}>
                  <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.8rem"}}>
                    {(c.name || "C").charAt(0)}
                  </div>
                  <div style={{flex:1}}>
                    <p style={{margin:0,fontWeight:600,fontSize:"0.875rem",color:"#1e293b"}}>{c.name}</p>
                  </div>
                  <span style={{fontSize:"0.8125rem",color:"#64748b"}}>{c.recipeCount || 0} recipes</span>
                  <span style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:"0.8125rem",fontWeight:600,color:"#334155"}}><Eye size={14} style={{color:"#94a3b8"}}/>{(c.totalViews || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
