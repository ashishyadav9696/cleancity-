import { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { StatCard } from '../../components/common/UI';
import { analyticsAPI } from '../../api/axios';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    analyticsAPI.getOverview().then(({ data }) => setOverview(data.data));
    analyticsAPI.getTrend(30).then(({ data }) => setTrend(data.data));
    analyticsAPI.getCategoryBreakdown().then(({ data }) => setCategories(data.data));
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">Admin Dashboard</div>
          <div style={{ display: 'inline-flex', padding: '4px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 9999, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>⚡ Super Admin</div>
        </div>

        <div style={{ padding: 24 }}>
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <StatCard icon="📋" label="Total Reports" value={overview?.totalReports ?? '...'} color="#22d3ee" />
            <StatCard icon="👥" label="Total Citizens" value={overview?.totalUsers ?? '...'} color="#6366f1" />
            <StatCard icon="⏳" label="Pending" value={overview?.pending ?? '...'} color="#f59e0b" />
            <StatCard icon="✅" label="Resolved" value={overview?.completed ?? '...'} color="#22c55e" />
            <StatCard icon="📅" label="This Month" value={overview?.monthReports ?? '...'} color="#f97316" />
            <StatCard icon="⚡" label="Avg Resolution" value={overview ? `${overview.avgResolutionHours}h` : '...'} color="#a78bfa" />
          </div>

          <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>System-Wide Trend (30 days)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="adminGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#adminGrad)" name="Reports" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h4 style={{ marginBottom: 16 }}>Category Volume</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categories.slice(0, 6)} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} width={130} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} name="Reports" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid-4" style={{ gap: 12 }}>
            {[
              { icon: '👥', title: 'Manage Users', path: '/admin/users', color: '#6366f1' },
              { icon: '🏷️', title: 'Categories', path: '/admin/categories', color: '#22d3ee' },
              { icon: '📋', title: 'Audit Logs', path: '/admin/audit', color: '#f59e0b' },
              { icon: '📊', title: 'Export Data', path: '/admin/export', color: '#22c55e' },
            ].map(({ icon, title, path, color }) => (
              <a key={path} href={path} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ textAlign: 'center', cursor: 'pointer', borderColor: `${color}20` }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = `${color}20`}>
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
