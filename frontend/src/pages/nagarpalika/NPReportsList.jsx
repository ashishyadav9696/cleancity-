import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { StatusBadge, PriorityBadge, EmptyState, Spinner } from '../../components/common/UI';
import { reportsAPI, usersAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { Filter, RefreshCw, Eye, UserCheck } from 'lucide-react';

const STATUSES = ['', 'pending', 'assigned', 'in_progress', 'completed', 'rejected'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent'];

export default function NPReportsList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [workers, setWorkers] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', page: 1, limit: 20 });
  const [assignModal, setAssignModal] = useState({ open: false, reportId: null });
  const [assignData, setAssignData] = useState({ workerId: '', priority: 'medium' });

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await reportsAPI.getAll(filters);
      setReports(data.data);
      setMeta(data.meta);
    } catch { toast.error('Failed to load reports'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { loadReports(); }, [loadReports]);
  useEffect(() => { usersAPI.getWorkers().then(({ data }) => setWorkers(data.data)); }, []);

  const handleAssign = async () => {
    if (!assignData.workerId) return toast.error('Select a worker');
    try {
      await reportsAPI.assign(assignModal.reportId, assignData);
      toast.success('Report assigned!');
      setAssignModal({ open: false, reportId: null });
      loadReports();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign'); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">All Reports</div>
          <button onClick={loadReports} className="btn btn-secondary btn-sm"><RefreshCw size={14} /> Refresh</button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Filters */}
          <div className="card" style={{ marginBottom: 16, padding: 16 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ minWidth: 150 }}>
                <label className="form-label">Status</label>
                <select className="form-input" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ minWidth: 150 }}>
                <label className="form-label">Priority</label>
                <select className="form-input" value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value, page: 1 }))}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
                </select>
              </div>
              <button onClick={() => setFilters({ status: '', priority: '', page: 1, limit: 20 })} className="btn btn-ghost btn-sm">Clear</button>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Photo</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Reported</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><Spinner size={24} /></td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan={8}><EmptyState icon="📋" title="No reports found" /></td></tr>
                ) : reports.map(r => (
                  <tr key={r._id}>
                    <td><span style={{ fontFamily: 'monospace', color: '#22d3ee', fontWeight: 700, fontSize: 13 }}>{r.trackingId}</span></td>
                    <td>{r.photo && <img src={r.photo} alt="" style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6 }} />}</td>
                    <td style={{ fontSize: 13 }}>{r.category?.icon} {r.category?.name}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.location?.address || 'N/A'}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><PriorityBadge priority={r.priority} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-icon" onClick={() => navigate(`/np/reports/${r._id}`)} title="View"><Eye size={14} /></button>
                        {r.status === 'pending' && <button className="btn btn-icon" onClick={() => setAssignModal({ open: true, reportId: r._id })} title="Assign"><UserCheck size={14} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button className="btn btn-secondary btn-sm" disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>← Prev</button>
              <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>Page {meta.page} of {meta.pages}</span>
              <button className="btn btn-secondary btn-sm" disabled={filters.page >= meta.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>Next →</button>
            </div>
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal.open && (
        <div className="modal-overlay" onClick={() => setAssignModal({ open: false, reportId: null })}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Report</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setAssignModal({ open: false, reportId: null })}>✕</button>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Assign to Worker</label>
              <select className="form-input" value={assignData.workerId} onChange={e => setAssignData(d => ({ ...d, workerId: e.target.value }))}>
                <option value="">Select worker...</option>
                {workers.map(w => <option key={w._id} value={w._id}>{w.name} — {w.city}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Priority</label>
              <select className="form-input" value={assignData.priority} onChange={e => setAssignData(d => ({ ...d, priority: e.target.value }))}>
                {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleAssign} className="btn btn-primary" style={{ flex: 1 }}>Assign</button>
              <button onClick={() => setAssignModal({ open: false, reportId: null })} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
