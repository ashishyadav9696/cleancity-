import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';
import { Spinner } from '../../components/common/UI';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { Leaf } from 'lucide-react';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password required'),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'nagarpalika') navigate('/np/dashboard');
      else if (user.role === 'worker') navigate('/np/reports');
      else navigate('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #22d3ee, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Leaf size={24} color="#fff" />
            </div>
            <h2>Welcome back</h2>
            <p style={{ marginTop: 8 }}>Sign in to your CleanCity account</p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input {...register('email')} className={`form-input ${errors.email ? 'error' : ''}`} type="email" placeholder="your@email.com" autoComplete="email" />
                {errors.email && <span className="form-error">{errors.email.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input {...register('password')} className={`form-input ${errors.password ? 'error' : ''}`} type="password" placeholder="••••••••" autoComplete="current-password" />
                {errors.password && <span className="form-error">{errors.password.message}</span>}
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', marginTop: 4 }}>
                {loading ? <Spinner size={16} color="#0f172a" /> : 'Sign In'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
              Don't have an account? <Link to="/register" style={{ color: '#22d3ee', fontWeight: 600 }}>Register</Link>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="card" style={{ marginTop: 16, padding: 16 }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Demo Credentials</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              {[['Admin', 'admin@cleancity.com', 'Admin@123'], ['NP Staff', 'np@cleancity.com', 'Staff@123'], ['Worker', 'worker1@cleancity.com', 'Worker@123'], ['Citizen', 'citizen@cleancity.com', 'Citizen@123']].map(([role, email, pass]) => (
                <div key={role} style={{ padding: '6px 10px', background: 'var(--color-bg-tertiary)', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'monospace' }}>
                  <span style={{ color: 'var(--text-muted)', minWidth: 56 }}>{role}</span>
                  <span style={{ color: '#22d3ee', flex: 1 }}>{email}</span>
                  <span style={{ color: '#f59e0b' }}>{pass}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
