import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, Bell, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useSelector } from 'react-redux';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const unreadCount = useSelector(s => s.notifications.unreadCount);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'nagarpalika') return '/np/dashboard';
    if (user.role === 'worker') return '/np/reports';
    return '/my-complaints';
  };

  return (
    <nav style={{ background: 'rgba(8,13,26,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #22d3ee, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={18} color="#fff" />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, background: 'linear-gradient(135deg, #22d3ee, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CleanCity</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
          <Link to="/report" className="btn btn-primary btn-sm">📸 Report Issue</Link>
          <Link to="/track/DEMO123" className="btn btn-ghost btn-sm">Track Complaint</Link>

          {isAuthenticated ? (
            <>
              <div style={{ position: 'relative' }}>
                <button className="btn btn-icon" onClick={() => navigate(getDashboardPath())}>
                  <Bell size={16} />
                  {unreadCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>
              </div>
              <button onClick={() => navigate(getDashboardPath())} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} /> {user?.name?.split(' ')[0]}
              </button>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-secondary btn-sm">Register</Link>
            </>
          )}
        </div>

        <button className="btn btn-icon" onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none' }} id="mobile-menu-btn">
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
