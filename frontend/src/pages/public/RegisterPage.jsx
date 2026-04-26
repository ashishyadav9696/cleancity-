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
  name: yup.string().min(2, 'Min 2 characters').required('Name required'),
  email: yup.string().email('Invalid email').required('Email required'),
  phone: yup.string().matches(/^[0-9+\-\s]{10,15}$/, 'Invalid phone').optional(),
  city: yup.string().required('City required'),
  password: yup.string().min(6, 'Min 6 characters').required('Password required'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required(),
});

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async ({ confirmPassword, ...data }) => {
    setLoading(true);
    try {
      await authRegister(data);
      toast.success('Account created! Welcome to CleanCity 🌱');
      navigate('/my-complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', placeholder: 'Priya Desai', type: 'text' },
    { name: 'email', label: 'Email', placeholder: 'your@email.com', type: 'email' },
    { name: 'phone', label: 'Phone (optional)', placeholder: '+91 98765 43210', type: 'tel' },
    { name: 'city', label: 'City', placeholder: 'Mumbai', type: 'text' },
    { name: 'password', label: 'Password', placeholder: '••••••••', type: 'password' },
    { name: 'confirmPassword', label: 'Confirm Password', placeholder: '••••••••', type: 'password' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #22d3ee, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Leaf size={24} color="#fff" />
            </div>
            <h2>Create Account</h2>
            <p style={{ marginTop: 8 }}>Join the CleanCity community</p>
          </div>
          <div className="card">
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2" style={{ gap: 14 }}>
                {fields.slice(0, 2).map(f => (
                  <div key={f.name} className="form-group">
                    <label className="form-label">{f.label}</label>
                    <input {...register(f.name)} className={`form-input ${errors[f.name] ? 'error' : ''}`} type={f.type} placeholder={f.placeholder} />
                    {errors[f.name] && <span className="form-error">{errors[f.name].message}</span>}
                  </div>
                ))}
              </div>
              {fields.slice(2).map(f => (
                <div key={f.name} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input {...register(f.name)} className={`form-input ${errors[f.name] ? 'error' : ''}`} type={f.type} placeholder={f.placeholder} />
                  {errors[f.name] && <span className="form-error">{errors[f.name].message}</span>}
                </div>
              ))}
              <button type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', marginTop: 4 }}>
                {loading ? <Spinner size={16} color="#0f172a" /> : 'Create Account 🌱'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" style={{ color: '#22d3ee', fontWeight: 600 }}>Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
