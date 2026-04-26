import { useEffect, useState, useCallback } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { Spinner, EmptyState } from '../../components/common/UI';
import { usersAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit3, X } from 'lucide-react';

const ROLES = ['citizen', 'nagarpalika', 'worker', 'admin'];
const ROLE_COLORS = { admin: '#ef4444', nagarpalika: '#6366f1', worker: '#f59e0b', citizen: '#22d3ee' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', page: 1, limit: 20 });
  const [modal, setModal] = useState({ open: false, mode: 'create', user: null });
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'worker', city: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await usersAPI.getAll(filters);
      setUsers(data.data); setMeta(data.meta);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({ name: '', email: '', password: '', role: 'worker', city: '', phone: '' }); setModal({ open: true, mode: 'create', user: null }); };
  const openEdit = (u) => { setForm({ name: u.name, email: u.email, password: '', role: u.role, city: u.city || '', phone: u.phone || '' }); setModal({ open: true, mode: 'edit', user: u }); };
  const closeModal = () => setModal({ open: false, mode: 'create', user: null });

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        if (!form.password) return toast.error('Password required');
        await usersAPI.create(form);
        toast.success('User created');
      } else {
        const { password, email, ...updates } = form;
        await usersAPI.update(modal.user._id, updates);
        toast.success('User updated');
      }
      closeModal(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!confirm('Deactivate this user?')) return;
    try { await usersAPI.delete(id); toast.success('User deactivated'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">User Management</div>
          <button onClick={openCreate} className="btn btn-primary btn-sm"><Plus size={14} /> Add User</button>
        </div>
        <div style={{ padding: 24 }}>
          {/* Filters */}
          <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <select className="form-input" style={{ width: 160 }} value={filters.role} onChange={e => setFilters(f => ({ ...f, role: e.target.value, page: 1 }))}>
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{meta.total ?? 0} users</span>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>City</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><Spinner size={24} /></td></tr>
                : users.length === 0 ? <tr><td colSpan={7}><EmptyState icon="👤" title="No users found" /></td></tr>
                : users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${ROLE_COLORS[u.role] || '#22d3ee'}, #6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0f172a', flexShrink: 0 }}>{u.name?.charAt(0)}</div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td><span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: `${ROLE_COLORS[u.role]}20`, color: ROLE_COLORS[u.role] || '#94a3b8', textTransform: 'capitalize' }}>{u.role}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{u.city || '—'}</td>
                    <td><span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: u.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: u.isActive ? '#22c55e' : '#ef4444' }}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-icon" onClick={() => openEdit(u)} title="Edit"><Edit3 size={13} /></button>
                        {u.isActive && <button className="btn btn-icon" onClick={() => handleDeactivate(u._id)} title="Deactivate" style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}><Trash2 size={13} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button className="btn btn-secondary btn-sm" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
              <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>Page {meta.page} of {meta.pages}</span>
              <button className="btn btn-secondary btn-sm" disabled={filters.page >= meta.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal.mode === 'create' ? 'Add New User' : 'Edit User'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={closeModal}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[['name', 'Full Name', 'text'], ['email', 'Email', 'email'], ...(modal.mode === 'create' ? [['password', 'Password', 'password']] : []), ['phone', 'Phone', 'tel'], ['city', 'City', 'text']].map(([k, l, t]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" type={t} value={form[k] || ''} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <Spinner size={14} color="#0f172a" /> : modal.mode === 'create' ? 'Create User' : 'Save Changes'}
                </button>
                <button onClick={closeModal} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
