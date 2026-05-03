import { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { StatCard } from '../../components/common/UI';
import { analyticsAPI } from '../../api/axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  CartesianGrid, Cell,
} from 'recharts';

/* gradient defs injected once */
const GradientDefs = () => (
  <defs>
    <linearGradient id="gradSubmitted" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#6366f1" />
      <stop offset="100%" stopColor="#4f46e5" />
    </linearGradient>
    <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#22c55e" />
      <stop offset="100%" stopColor="#16a34a" />
    </linearGradient>
  </defs>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <div style={{ color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ color: '#cbd5e1' }}>{p.name}:</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    analyticsAPI.getOverview().then(({ data }) => setOverview(data.data));
    analyticsAPI.getTrend(30).then(({ data }) => setTrend(data.data));
    analyticsAPI.getCategoryBreakdown().then(({ data }) => setCategories(data.data));
  }, []);

  /* shorten date labels: "2026-05-03" → "May 3" */
  const trendFormatted = trend.map((d) => ({
    ...d,
    day: new Date(d._id).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  }));

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">Admin Dashboard</div>
          <div style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9999, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚡ Super Admin</div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Stats */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <StatCard icon="📋" label="Total Reports"  value={overview?.totalReports ?? '...'} color="#22d3ee" />
            <StatCard icon="👥" label="Total Citizens" value={overview?.totalUsers ?? '...'} color="#6366f1" />
            <StatCard icon="⏳" label="Pending"        value={overview?.pending ?? '...'}     color="#f59e0b" />
            <StatCard icon="✅" label="Resolved"       value={overview?.completed ?? '...'}   color="#22c55e" />
            <StatCard icon="📅" label="This Month"     value={overview?.monthReports ?? '...'} color="#f97316" />
            <StatCard icon="⚡" label="Avg Resolution" value={overview ? `${overview.avgResolutionHours}h` : '...'} color="#a78bfa" />
          </div>

          <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
            {/* ── Enhanced Trend Bar Chart ── */}
            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(34,197,94,0.04) 100%)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h4 style={{ margin: 0 }}>📊 Activity Trend</h4>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Last 30 days — submitted vs resolved</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ color: '#6366f1', label: 'Submitted' }, { color: '#22c55e', label: 'Completed' }].map(({ color, label }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />{label}
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={trendFormatted} barGap={3} barCategoryGap="30%">
                  <GradientDefs />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" name="Submitted" fill="url(#gradSubmitted)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  <Bar dataKey="completed" name="Completed" fill="url(#gradCompleted)" radius={[4, 4, 0, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Volume */}
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>Category Volume</h4>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categories.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Reports" maxBarSize={18}>
                    {categories.slice(0, 6).map((_, i) => {
                      const colors = ['#22d3ee', '#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#a78bfa'];
                      return <Cell key={i} fill={colors[i % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid-4" style={{ gap: 12 }}>
            {[
              { icon: '👥', title: 'Manage Users',  path: '/admin/users',      color: '#6366f1' },
              { icon: '🏷️', title: 'Categories',    path: '/admin/categories', color: '#22d3ee' },
              { icon: '📋', title: 'Audit Logs',    path: '/admin/audit',      color: '#f59e0b' },
              { icon: '📊', title: 'Export Data',   path: '/admin/export',     color: '#22c55e' },
            ].map(({ icon, title, path, color }) => (
              <a key={path} href={path} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ textAlign: 'center', cursor: 'pointer', borderColor: `${color}20`, transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}20`; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{title}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
