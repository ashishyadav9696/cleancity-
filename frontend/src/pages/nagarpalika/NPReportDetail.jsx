import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { StatusBadge, PriorityBadge, Spinner } from '../../components/common/UI';
import { reportsAPI, usersAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Clock, User, MessageSquare } from 'lucide-react';

export default function NPReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [assignData, setAssignData] = useState({ workerId: '', priority: '' });

  useEffect(() => {
    reportsAPI.getById(id).then(({ data }) => { setReport(data.data); setLoading(false); });
    usersAPI.getWorkers().then(({ data }) => setWorkers(data.data));
  }, [id]);

  const handleAssign = async () => {
    if (!assignData.workerId) return toast.error('Select a worker');
    setSaving(true);
    try {
      const { data } = await reportsAPI.assign(id, assignData);
      setReport(data.data);
      toast.success('Assigned successfully');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate) return toast.error('Select status');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('status', statusUpdate);
      const { data } = await reportsAPI.updateStatus(id, fd);
      setReport(data.data);
      toast.success('Status updated');
      setStatusUpdate('');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return toast.error('Enter note text');
    setSaving(true);
    try {
      await reportsAPI.addNote(id, note.trim());
      const { data } = await reportsAPI.getById(id);
      setReport(data.data);
      setNote('');
      toast.success('Note added');
    } catch (err) { toast.error('Failed to add note'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="dashboard-layout"><Sidebar /><div className="main-content flex-center" style={{ height: '100vh' }}><Spinner size={32} /></div></div>;
  if (!report) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate(-1)} className="btn btn-icon"><ArrowLeft size={16} /></button>
            <div className="topbar-title">Report #{report.trackingId}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <StatusBadge status={report.status} />
            <PriorityBadge priority={report.priority} />
          </div>
        </div>

        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Left: Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Main Photo */}
            {report.photo && <img src={report.photo} alt="Issue" style={{ width: '100%', borderRadius: 16, maxHeight: 360, objectFit: 'cover' }} />}

            {/* Info Card */}
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>Complaint Details</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['Category', `${report.category?.icon || '🗑️'} ${report.category?.name}`],
                  ['Reporter', report.isAnonymous ? '🔒 Anonymous' : report.reportedBy?.name || 'N/A'],
                  ['Phone', report.isAnonymous ? 'N/A' : report.reportedBy?.phone || 'N/A'],
                  ['Email', report.isAnonymous ? 'N/A' : report.reportedBy?.email || 'N/A'],
                  ['Submitted', new Date(report.createdAt).toLocaleString('en-IN')],
                  ['Upvotes', `👍 ${report.upvoteCount}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: '10px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k.toUpperCase()}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
                  </div>
                ))}
              </div>
              {report.description && (
                <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>DESCRIPTION</div>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{report.description}</p>
                </div>
              )}
              <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <MapPin size={14} style={{ color: 'var(--color-primary)', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>LOCATION</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{report.location?.address || `${report.location?.coordinates?.[1]?.toFixed(4)}, ${report.location?.coordinates?.[0]?.toFixed(4)}`}</div>
                  {report.location?.landmark && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>📌 {report.location.landmark}</div>}
                </div>
              </div>
            </div>

            {/* Before/After Photos */}
            {(report.beforePhoto || report.afterPhoto) && (
              <div className="card">
                <h4 style={{ marginBottom: 16 }}>Before / After Photos</h4>
                <div className="grid-2">
                  {report.beforePhoto && <div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>BEFORE</div><img src={report.beforePhoto} alt="Before" style={{ width: '100%', borderRadius: 10, maxHeight: 150, objectFit: 'cover' }} /></div>}
                  {report.afterPhoto && <div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>AFTER</div><img src={report.afterPhoto} alt="After" style={{ width: '100%', borderRadius: 10, maxHeight: 150, objectFit: 'cover' }} /></div>}
                </div>
              </div>
            )}

            {/* Internal Notes */}
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>Internal Notes ({report.internalNotes?.length || 0})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {report.internalNotes?.length === 0 && <p style={{ fontSize: 13 }}>No notes yet.</p>}
                {report.internalNotes?.map((n, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {n.addedBy?.name || 'Staff'} · {new Date(n.timestamp).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <textarea className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Add internal note..." rows={2} style={{ flex: 1 }} />
                <button onClick={handleAddNote} className="btn btn-secondary btn-sm" disabled={saving} style={{ alignSelf: 'flex-end' }}>Add</button>
              </div>
            </div>
          </div>

          {/* Right: Actions Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Assign */}
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>🔧 Assignment</h4>
              {report.assignedTo ? (
                <div style={{ padding: '12px 14px', background: 'rgba(34,197,94,0.08)', borderRadius: 10, border: '1px solid rgba(34,197,94,0.2)' }}>
                  <div style={{ fontSize: 12, color: '#22c55e', marginBottom: 4 }}>✅ Assigned To</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{report.assignedTo.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{report.assignedTo.email}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <select className="form-input" value={assignData.workerId} onChange={e => setAssignData(d => ({ ...d, workerId: e.target.value }))}>
                    <option value="">Select worker...</option>
                    {workers.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                  </select>
                  <select className="form-input" value={assignData.priority} onChange={e => setAssignData(d => ({ ...d, priority: e.target.value }))}>
                    {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button onClick={handleAssign} className="btn btn-primary w-full" disabled={saving} style={{ justifyContent: 'center' }}>
                    {saving ? <Spinner size={14} color="#0f172a" /> : 'Assign Worker'}
                  </button>
                </div>
              )}
            </div>

            {/* Status Update */}
            <div className="card">
              <h4 style={{ marginBottom: 16 }}>📊 Update Status</h4>
              <select className="form-input" value={statusUpdate} onChange={e => setStatusUpdate(e.target.value)} style={{ marginBottom: 10 }}>
                <option value="">Select status...</option>
                {['pending', 'assigned', 'in_progress', 'completed', 'rejected'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
              <button onClick={handleStatusUpdate} className="btn btn-primary w-full" disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? <Spinner size={14} color="#0f172a" /> : 'Update Status'}
              </button>
            </div>

            {/* Status History */}
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>📜 History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...( report.statusHistory || [])].reverse().map((h, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{h.status.replace('_', ' ')}</div>
                    {h.note && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.note}</div>}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(h.timestamp).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
