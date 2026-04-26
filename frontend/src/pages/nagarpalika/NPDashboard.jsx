import { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { StatCard } from '../../components/common/UI';
import { analyticsAPI } from '../../api/axios';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#22d3ee', '#6366f1', '#f59e0b', '#22c55e', '#ef4444'];

export default function NPDashboard() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    analyticsAPI.getOverview().then(({ data }) => setOverview(data.data));
    analyticsAPI.getTrend(14).then(({ data }) => setTrend(data.data));
    analyticsAPI.getCategoryBreakdown().then(({ data }) => setCategories(data.data.slice(0, 6)));
    analyticsAPI.getWorkerPerformance().then(({ data }) => setWorkers(data.data.slice(0, 5)));
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">Dashboard Overview</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Stats Grid */}
          <div className="stats-grid" style={{ marginBottom: 24 }}>
            <StatCard icon="📋" label="Total Reports" value={overview?.totalReports ?? '...'} color="#22d3ee" />
            <StatCard icon="⏳" label="Pending" value={overview?.pending ?? '...'} color="#f59e0b" />
            <StatCard icon="🔧" label="In Progress" value={overview?.inProgress ?? '...'} color="#3b82f6" />
            <StatCard icon="✅" label="Resolved" value={overview?.completed ?? '...'} color="#22c55e" />
            <StatCard icon="📅" label="Today" value={overview?.todayReports ?? '...'} color="#6366f1" />
            <StatCard icon="⚡" label="Avg Resolution" value={overview ? `${overview.avgResolutionHours}h` : '...'} color="#f97316" />
          </div>

          <div className="grid-2" style={{ gap: 20, marginBottom: 20 }}>
            {/* Area Chart: Trend */}
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>Report Trend (14 days)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#22d3ee" fill="url(#grad1)" name="Submitted" strokeWidth={2} />
                  <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="url(#grad2)" name="Completed" strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart: Category */}
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>Category Breakdown</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categories} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={40}>
                    {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} formatter={(v, n) => [v, n]} />
                  <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Worker Performance */}
          {workers.length > 0 && (
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>Worker Performance</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={workers}>
                  <XAxis dataKey="workerName" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="assigned" fill="#6366f1" name="Assigned" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#22c55e" name="Completed" radius={[4, 4, 0, 0]} />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
