import { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { categoriesAPI } from '../../api/axios';
import { Spinner } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { Plus, Edit3, X } from 'lucide-react';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, cat: null });
  const [form, setForm] = useState({ name: '', icon: '🗑️', description: '', color: '#22d3ee' });
  const [saving, setSaving] = useState(false);

  const load = () => categoriesAPI.getAll().then(({ data }) => { setCategories(data.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ name: '', icon: '🗑️', description: '', color: '#22d3ee' }); setModal({ open: true, cat: null }); };
  const openEdit = (c) => { setForm({ name: c.name, icon: c.icon, description: c.description || '', color: c.color }); setModal({ open: true, cat: c }); };
  const close = () => setModal({ open: false, cat: null });

  const handleSave = async () => {
    if (!form.name) return toast.error('Name required');
    setSaving(true);
    try {
      if (modal.cat) { await categoriesAPI.update(modal.cat._id, form); toast.success('Updated'); }
      else { await categoriesAPI.create(form); toast.success('Created'); }
      close(); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this category?')) return;
    try { await categoriesAPI.delete(id); toast.success('Deactivated'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">Categories</div>
          <button onClick={openCreate} className="btn btn-primary btn-sm"><Plus size={14} /> Add Category</button>
        </div>
        <div style={{ padding: 24 }}>
          {loading ? <div className="flex-center" style={{ height: 200 }}><Spinner size={28} /></div> : (
            <div className="grid-3" style={{ gap: 14 }}>
              {categories.map(c => (
                <div key={c._id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-start', borderLeft: `3px solid ${c.color || '#22d3ee'}` }}>
                  <span style={{ fontSize: 32 }}>{c.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.description || 'No description'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button className="btn btn-icon" onClick={() => openEdit(c)}><Edit3 size={13} /></button>
                    <button className="btn btn-icon" onClick={() => handleDelete(c._id)} style={{ color: '#ef4444' }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal.open && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{modal.cat ? 'Edit Category' : 'New Category'}</h3>
              <button className="btn btn-ghost btn-sm" onClick={close}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group"><label className="form-label">Name</label><input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="grid-2" style={{ gap: 14 }}>
                <div className="form-group"><label className="form-label">Icon (emoji)</label><input className="form-input" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} style={{ fontSize: 24 }} /></div>
                <div className="form-group"><label className="form-label">Color</label><input className="form-input" type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} style={{ padding: 4, height: 42 }} /></div>
              </div>
              <div className="form-group"><label className="form-label">Description</label><textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>{saving ? <Spinner size={14} color="#0f172a" /> : 'Save'}</button>
                <button onClick={close} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
