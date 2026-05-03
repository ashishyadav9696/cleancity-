import { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { analyticsAPI, usersAPI } from '../../api/axios';
import { Spinner } from '../../components/common/UI';
import toast from 'react-hot-toast';

export default function NPWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', password: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    analyticsAPI.getWorkerPerformance().then(({ data }) => { setWorkers(data.data); setLoading(false); });
  }, []);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersAPI.create({ ...newWorker, role: 'worker', city: 'Mumbai' });
      toast.success('Worker added successfully');
      setShowAdd(false);
      setNewWorker({ name: '', email: '', password: '', phone: '' });
      // Reload performance data just in case, though new worker won't have performance yet
      const { data } = await analyticsAPI.getWorkerPerformance();
      setWorkers(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add worker');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">Worker Performance</div>
          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => setShowAdd(true)}>+ Add Worker</button>
        </div>
        <div style={{ padding: 24 }}>
          {loading ? <div className="flex-center" style={{ height: 200 }}><Spinner size={28} /></div> : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Email</th>
                    <th>Assigned</th>
                    <th>Completed</th>
                    <th>Completion Rate</th>
                    <th>Avg Resolution</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #22d3ee, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{w.workerName?.charAt(0)}</div>
                          {w.workerName || 'Unknown'}
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{w.workerEmail}</td>
                      <td><span style={{ fontSize: 16, fontWeight: 700, color: '#6366f1' }}>{w.assigned}</span></td>
                      <td><span style={{ fontSize: 16, fontWeight: 700, color: '#22c55e' }}>{w.completed}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--color-bg-tertiary)', borderRadius: 3, overflow: 'hidden', maxWidth: 80 }}>
                            <div style={{ height: '100%', width: `${w.completionRate}%`, background: w.completionRate >= 80 ? '#22c55e' : w.completionRate >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{w.completionRate}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{w.avgResolutionHours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: 400, background: '#1e293b' }}>
            <h3 style={{ marginBottom: 16 }}>Add New Worker</h3>
            <form onSubmit={handleAddWorker} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input required className="form-input" placeholder="Full Name" value={newWorker.name} onChange={e => setNewWorker(w => ({ ...w, name: e.target.value }))} />
              <input required className="form-input" type="email" placeholder="Email Address" value={newWorker.email} onChange={e => setNewWorker(w => ({ ...w, email: e.target.value }))} />
              <input required className="form-input" type="password" placeholder="Password" value={newWorker.password} onChange={e => setNewWorker(w => ({ ...w, password: e.target.value }))} />
              <input className="form-input" placeholder="Phone Number (Optional)" value={newWorker.phone} onChange={e => setNewWorker(w => ({ ...w, phone: e.target.value }))} />
              
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
                  {saving ? <Spinner size={14} color="#0f172a" /> : 'Create Worker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
