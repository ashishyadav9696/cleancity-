import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common/UI';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, Leaf, ArrowRight, Zap } from 'lucide-react';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password required'),
});

/* ── Demo credential quick-fill ────────────────────── */
const DEMO_ROLES = [
  { role: 'Admin',    icon: '⚡', email: 'admin@cleancity.com',   pass: 'Admin@123',   color: '#ef4444' },
  { role: 'NP Staff', icon: '🏛️', email: 'np@cleancity.com',      pass: 'Staff@123',   color: '#6366f1' },
  { role: 'Worker',   icon: '👷', email: 'worker1@cleancity.com', pass: 'Worker@123',  color: '#f59e0b' },
  { role: 'Citizen',  icon: '👤', email: 'citizen@cleancity.com', pass: 'Citizen@123', color: '#22c55e' },
];

/* ── Floating orb component ────────────────────────── */
function Orb({ style }) {
  return (
    <div style={{
      position: 'absolute', borderRadius: '50%',
      filter: 'blur(80px)', pointerEvents: 'none',
      ...style,
    }} />
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const cleanedData = {
        email: data.email.trim().toLowerCase(),
        password: data.password.trim(),
      };
      const user = await login(cleanedData);
      toast.success(`Welcome back, ${user?.name?.split(' ')[0] || 'User'}! 👋`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'nagarpalika') navigate('/np/dashboard');
      else if (user.role === 'worker') navigate('/np/reports');
      else navigate('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email, pass) => {
    setValue('email', email);
    setValue('password', pass);
    toast('Credentials filled! Click Sign In ✨', { icon: '🔑', style: { fontSize: 13 } });
  };

  const inputStyle = (field) => ({
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${focusedField === field ? 'rgba(34,211,238,0.6)' : errors[field] ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 12,
    padding: '13px 16px 13px 44px',
    color: '#f1f5f9',
    fontSize: 14,
    width: '100%',
    outline: 'none',
    transition: 'all 0.2s',
    boxShadow: focusedField === field ? '0 0 0 3px rgba(34,211,238,0.12)' : 'none',
    fontFamily: 'Inter, sans-serif',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#080d1a', position: 'relative', overflow: 'hidden',
    }}>
      {/* ── Animated background orbs ── */}
      <Orb style={{ width: 600, height: 600, top: -200, left: -200, background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 70%)' }} />
      <Orb style={{ width: 500, height: 500, bottom: -150, right: -100, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }} />
      <Orb style={{ width: 300, height: 300, top: '40%', left: '35%', background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)' }} />

      {/* ── Left panel — branding ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', position: 'relative',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }} className="login-left-panel">
        {/* Logo — click to go home */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64, textDecoration: 'none', cursor: 'pointer' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'linear-gradient(135deg, #22d3ee, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(34,211,238,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(34,211,238,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(34,211,238,0.3)'; }}
          >
            <Leaf size={22} color="#fff" />
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', background: 'linear-gradient(135deg,#22d3ee,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Smart Waste Management System
          </span>
        </Link>

        {/* Headline */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: 16, fontFamily: 'Space Grotesk, sans-serif' }}>
            Smart Waste<br />
            <span style={{ background: 'linear-gradient(135deg,#22d3ee,#6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Management System
            </span>
          </h1>
          <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.7, maxWidth: 380 }}>
            The smart civic platform connecting citizens, workers, and municipal staff to resolve waste complaints faster.
          </p>
        </div>

        {/* Feature pills */}
        {[
          { icon: '📍', text: 'Geo-tagged complaint filing' },
          { icon: '🔔', text: 'Real-time status notifications' },
          { icon: '📊', text: 'Municipal analytics dashboard' },
          { icon: '👷', text: 'Automated worker assignment' },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {icon}
            </div>
            <span style={{ fontSize: 14, color: '#94a3b8' }}>{text}</span>
          </div>
        ))}

        {/* Stats strip */}
        <div style={{ display: 'flex', gap: 32, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[['12K+', 'Complaints resolved'], ['98%', 'Satisfaction rate'], ['4.8h', 'Avg response time']].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#22d3ee', fontFamily: 'Space Grotesk, sans-serif' }}>{val}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div style={{
        width: '100%', maxWidth: 520,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 56px', position: 'relative', zIndex: 1,
      }} className="login-right-panel">
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 9999, padding: '4px 12px', fontSize: 12, color: '#22d3ee', fontWeight: 600, marginBottom: 20 }}>
            <Zap size={12} /> Secure Login
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'Space Grotesk, sans-serif' }}>
            Welcome back 👋
          </h2>
          <p style={{ fontSize: 14, color: '#475569' }}>
            Sign in to your SWMS account to continue
          </p>
        </div>

        {/* Form card */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: 0.3 }}>
              EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'email' ? '#22d3ee' : '#475569', transition: 'color 0.2s' }} />
              <input
                {...register('email')}
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                style={inputStyle('email')}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
            {errors.email && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>⚠ {errors.email.message}</div>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8, letterSpacing: 0.3 }}>
              PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: focusedField === 'password' ? '#22d3ee' : '#475569', transition: 'color 0.2s' }} />
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ ...inputStyle('password'), paddingRight: 44 }}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 5 }}>⚠ {errors.password.message}</div>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px 24px',
              background: loading ? 'rgba(34,211,238,0.4)' : 'linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)',
              border: 'none', borderRadius: 12,
              color: loading ? 'rgba(255,255,255,0.6)' : '#fff',
              fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(34,211,238,0.25)',
              letterSpacing: 0.3,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? <><Spinner size={16} color="#fff" /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#475569' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#22d3ee', fontWeight: 700 }}>Create one free</Link>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 11, color: '#334155', fontWeight: 600, letterSpacing: 1 }}>DEMO ACCESS</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Demo credentials grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {DEMO_ROLES.map(({ role, icon, email, pass, color }) => (
            <button
              key={role}
              type="button"
              onClick={() => fillDemo(email, pass)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${color}22`,
                borderRadius: 10, padding: '10px 12px',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.18s',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}0d`; e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = `${color}22`; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color }}>{role}</span>
              </div>
              <div style={{ fontSize: 10, color: '#334155', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email}
              </div>
              <div style={{ fontSize: 10, color: '#475569', fontFamily: 'monospace', marginTop: 1 }}>{pass}</div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#1e293b', marginTop: 24 }}>
          🔒 Protected by JWT · All data encrypted
        </p>
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 900px) {
          .login-left-panel { display: none !important; }
          .login-right-panel { max-width: 100% !important; padding: 40px 28px !important; margin: 0 auto; }
        }
      `}</style>
    </div>
  );
}
