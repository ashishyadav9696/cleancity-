import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, LayoutDashboard, MapPin, FileText, Users, BarChart3, Bell, LogOut, ClipboardList, Package } from 'lucide-react';

const NAV_ITEMS = {
  nagarpalika: [
    { to: '/np/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/np/map', icon: MapPin, label: 'Map View' },
    { to: '/np/reports', icon: FileText, label: 'Reports' },
    { to: '/np/workers', icon: Users, label: 'Workers' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/categories', icon: Package, label: 'Categories' },
    { to: '/admin/audit', icon: ClipboardList, label: 'Audit Logs' },
    { to: '/admin/export', icon: BarChart3, label: 'Export' },
  ],
  worker: [
    { to: '/np/reports', icon: FileText, label: 'My Tasks' },
    { to: '/np/map', icon: MapPin, label: 'Map View' },
  ],
  citizen: [
    { to: '/my-complaints', icon: FileText, label: 'My Complaints' },
  ],
};

const HOME_ROUTE = {
  admin: '/admin/dashboard',
  nagarpalika: '/np/dashboard',
  worker: '/np/reports',
  citizen: '/my-complaints',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = NAV_ITEMS[user?.role] || [];
  const homeRoute = HOME_ROUTE[user?.role] || '/';

  return (
    <aside className="sidebar">
      {/* Logo — clicking navigates to the role's own dashboard */}
      <div
        className="sidebar-logo"
        style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        onClick={() => navigate(homeRoute)}
        title="Go to Dashboard"
      >
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #22d3ee, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Leaf size={18} color="#fff" />
        </div>
        <span style={{ fontSize: 13, lineHeight: 1.2 }}>Smart Waste<br />Management</span>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">
          {user?.role === 'admin' ? 'Admin Panel'
            : user?.role === 'nagarpalika' ? 'NP Staff'
            : user?.role === 'worker' ? 'Worker'
            : 'Citizen'}
        </p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={16} /> {label}
          </NavLink>
        ))}
        <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
          <NavLink to="/report" className="nav-item">
            <Bell size={16} /> Report Issue
          </NavLink>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #22d3ee, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        {/* Logout → /login, not the public landing page */}
        <button
          onClick={async () => { await logout(); navigate('/login'); }}
          className="btn btn-ghost btn-sm w-full"
          style={{ width: '100%', justifyContent: 'center', gap: 6 }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}
