import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { StatusBadge, PriorityBadge, Spinner } from '../../components/common/UI';
import { reportsAPI, usersAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, MapPin, Camera, CheckCircle, Clock, Upload, Eye, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* ── tiny image preview helper ─────────────────────────────────── */
function PhotoPreview({ file, url, label }) {
  const [src, setSrc] = useState(url || null);
  useEffect(() => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (e) => setSrc(e.target.result);
    r.readAsDataURL(file);
  }, [file]);
  if (!src) return null;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <img src={src} alt={label} style={{ width: '100%', borderRadius: 12, maxHeight: 180, objectFit: 'cover', border: '1px solid var(--color-border)' }} />
    </div>
  );
}

/* ── Worker action section ──────────────────────────────────────── */
function WorkerActions({ report, onRefresh }) {
  const [saving, setSaving] = useState(false);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const beforeRef = useRef();
  const afterRef = useRef();

  const status = report.status;

  const handleBeforeUpload = async () => {
    if (!beforeFile) return toast.error('Select a before-cleaning photo first');
    setSaving(true);
    try {
      await reportsAPI.uploadBeforePhoto(report._id, beforeFile);
      toast.success('📸 Before photo uploaded — status set to In Progress');
      setBeforeFile(null);
      onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setSaving(false); }
  };

  const handleSubmitReview = async () => {
    if (!afterFile) return toast.error('Please attach an after-cleaning photo');
    setSaving(true);
    try {
      await reportsAPI.submitForReview(report._id, afterFile);
      toast.success('✅ Submitted for staff review!');
      setAfterFile(null);
      onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Step 1 — Assigned: upload before photo */}
      {status === 'assigned' && (
        <div className="card" style={{ border: '1px solid rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Camera size={16} color="#fbbf24" />
            <h4 style={{ margin: 0, color: '#fbbf24' }}>Step 1 — Upload Before Photo</h4>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Take a photo of the site before you start cleaning and upload it to confirm you've arrived.
          </p>
          <input ref={beforeRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => setBeforeFile(e.target.files[0])} />
          {beforeFile
            ? <PhotoPreview file={beforeFile} label="Before (preview)" />
            : (
              <button className="btn btn-secondary w-full" style={{ justifyContent: 'center', marginBottom: 8 }}
                onClick={() => beforeRef.current.click()}>
                <Upload size={14} style={{ marginRight: 6 }} /> Choose Before Photo
              </button>
            )}
          {beforeFile && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setBeforeFile(null)}>Change</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleBeforeUpload} disabled={saving}>
                {saving ? <Spinner size={14} color="#0f172a" /> : '📸 Upload & Start Cleaning'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2 — In Progress: upload after photo */}
      {status === 'in_progress' && (
        <div className="card" style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <CheckCircle size={16} color="#22c55e" />
            <h4 style={{ margin: 0, color: '#22c55e' }}>Step 2 — Submit After Photo</h4>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
            Once the area is clean, take a photo and submit it for staff review.
          </p>
          <input ref={afterRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => setAfterFile(e.target.files[0])} />
          {afterFile
            ? <PhotoPreview file={afterFile} label="After (preview)" />
            : (
              <button className="btn btn-secondary w-full" style={{ justifyContent: 'center', marginBottom: 8 }}
                onClick={() => afterRef.current.click()}>
                <Upload size={14} style={{ marginRight: 6 }} /> Choose After Photo
              </button>
            )}
          {afterFile && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setAfterFile(null)}>Change</button>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                onClick={handleSubmitReview} disabled={saving}>
                {saving ? <Spinner size={14} color="#0f172a" /> : '✅ Submit for Review'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* In Review — waiting for staff */}
      {status === 'in_review' && (
        <div className="card" style={{ border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.06)', textAlign: 'center', padding: '24px 16px' }}>
          <Eye size={28} color="#6366f1" style={{ marginBottom: 8 }} />
          <div style={{ fontWeight: 700, color: '#6366f1', marginBottom: 4 }}>Waiting for Staff Review</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your photos have been submitted. Staff will verify and mark this as completed.</div>
        </div>
      )}

      {status === 'completed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card" style={{ border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.08)', textAlign: 'center', padding: '24px 16px' }}>
            <CheckCircle size={28} color="#22c55e" style={{ marginBottom: 8 }} />
            <div style={{ fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>Task Completed!</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Great work! This complaint has been resolved.</div>
          </div>
          {/* Show staff notes to worker on completion */}
          {report.internalNotes?.length > 0 && (
            <div className="card">
              <h4 style={{ marginBottom: 12, fontSize: 14 }}>💬 Messages from Staff</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.internalNotes.map((n, i) => (
                  <div key={i} style={{ padding: '10px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10, borderLeft: '3px solid var(--color-primary)' }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {n.addedBy?.name || 'Staff'} · {new Date(n.timestamp).toLocaleString('en-IN')}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Staff action section ───────────────────────────────────────── */
function StaffActions({ report, workers, onRefresh }) {
  const [saving, setSaving] = useState(false);
  const [assignData, setAssignData] = useState({ workerId: '', priority: report.priority || 'medium' });
  const [statusUpdate, setStatusUpdate] = useState('');
  const [note, setNote] = useState('');
  const [afterFile, setAfterFile] = useState(null);
  const afterRef = useRef();

  const statusOptions = ['pending', 'assigned', 'in_progress', 'in_review', 'completed', 'rejected'];

  const handleAssign = async () => {
    if (!assignData.workerId) return toast.error('Select a worker');
    setSaving(true);
    try {
      const { data } = await reportsAPI.assign(report._id, assignData);
      toast.success('Worker assigned!');
      onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleMarkCompleted = async () => {
    setSaving(true);
    try {
      await reportsAPI.markCompleted(report._id);
      toast.success('✅ Marked as Completed — citizen notified!');
      onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdate) return toast.error('Select status');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('status', statusUpdate);
      if (afterFile) fd.append('afterPhoto', afterFile);
      await reportsAPI.updateStatus(report._id, fd);
      toast.success('Status updated');
      setStatusUpdate('');
      setAfterFile(null);
      onRefresh();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return toast.error('Enter note text');
    setSaving(true);
    try {
      await reportsAPI.addNote(report._id, note.trim());
      setNote('');
      toast.success('Note added');
      onRefresh();
    } catch (err) { toast.error('Failed to add note'); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── In-Review banner: quick approve ── */}
      {report.status === 'in_review' && (
        <div className="card" style={{ border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <AlertTriangle size={16} color="#6366f1" />
            <h4 style={{ margin: 0, color: '#6366f1' }}>🔍 Worker Review Pending</h4>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
            The worker has uploaded an after-cleaning photo. Please verify the work below and approve.
          </p>
          <button className="btn btn-primary w-full" style={{ justifyContent: 'center', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff' }}
            onClick={handleMarkCompleted} disabled={saving}>
            {saving ? <Spinner size={14} color="#fff" /> : '✅ Approve & Mark Completed'}
          </button>
        </div>
      )}

      {/* Assign Card */}
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
          {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
        {(statusUpdate === 'in_review' || statusUpdate === 'completed') && (
          <>
            <input ref={afterRef} type="file" style={{ display: 'none' }} accept="image/*" onChange={e => setAfterFile(e.target.files[0])} />
            {afterFile
              ? <div style={{ marginBottom: 8 }}><PhotoPreview file={afterFile} label="After photo" /></div>
              : <button className="btn btn-secondary w-full" style={{ marginBottom: 8, justifyContent: 'center' }}
                  onClick={() => afterRef.current.click()}>
                  <Upload size={14} style={{ marginRight: 6 }} /> Attach After Photo
                </button>}
          </>
        )}
        <button onClick={handleStatusUpdate} className="btn btn-primary w-full" disabled={saving} style={{ justifyContent: 'center' }}>
          {saving ? <Spinner size={14} color="#0f172a" /> : 'Update Status'}
        </button>
      </div>

      {/* Add Note / Staff Message to Citizen */}
      <div className="card">
        <h4 style={{ marginBottom: 4 }}>💬 Staff Notes</h4>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
          Notes added here are visible to the assigned worker (after completion) and to the citizen on their complaint page.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for worker or citizen..." rows={2} style={{ flex: 1 }} />
          <button onClick={handleAddNote} className="btn btn-secondary btn-sm" disabled={saving} style={{ alignSelf: 'flex-end' }}>Add</button>
        </div>
        {/* Show existing notes */}
        {report.internalNotes?.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.internalNotes.map((n, i) => (
              <div key={i} style={{ padding: '8px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 8, borderLeft: '3px solid var(--color-primary)' }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>{n.text}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {n.addedBy?.name || 'Staff'} · {new Date(n.timestamp).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────── */
export default function NPReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const isWorker = user?.role === 'worker';

  const refresh = () => {
    reportsAPI.getById(id).then(({ data }) => setReport(data.data));
  };

  useEffect(() => {
    reportsAPI.getById(id).then(({ data }) => { setReport(data.data); setLoading(false); });
    if (!isWorker) usersAPI.getWorkers().then(({ data }) => setWorkers(data.data));
  }, [id]);

  if (loading) return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content flex-center" style={{ height: '100vh' }}><Spinner size={32} /></div>
    </div>
  );
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
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Main complaint photo */}
            {report.photo && (
              <div style={{ position: 'relative' }}>
                <img src={report.photo} alt="Issue" style={{ width: '100%', borderRadius: 16, maxHeight: 360, objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#fff', fontWeight: 600 }}>
                  📸 Citizen Photo
                </div>
              </div>
            )}

            {/* Before / After Photos from worker */}
            {(report.beforePhoto || report.afterPhoto) && (
              <div className="card">
                <h4 style={{ marginBottom: 16 }}>🧹 Cleaning Evidence</h4>
                <div style={{ display: 'flex', gap: 14 }}>
                  {report.beforePhoto && <PhotoPreview url={report.beforePhoto} label="Before Cleaning" />}
                  {report.afterPhoto && <PhotoPreview url={report.afterPhoto} label="After Cleaning ✅" />}
                </div>
              </div>
            )}

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

            {/* Staff Notes — visible to all roles */}
            {report.internalNotes?.length > 0 && (
              <div className="card">
                <h4 style={{ marginBottom: 16 }}>💬 Staff Notes ({report.internalNotes.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {report.internalNotes.map((n, i) => (
                    <div key={i} style={{ padding: '10px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10, borderLeft: '3px solid var(--color-primary)' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {n.addedBy?.name || 'Staff'} · {new Date(n.timestamp).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Status History */}
            <div className="card">
              <h4 style={{ marginBottom: 12 }}>📜 Status History</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[...(report.statusHistory || [])].reverse().map((h, i) => (
                  <div key={i} style={{ padding: '8px 12px', background: 'var(--color-bg-tertiary)', borderRadius: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <Clock size={12} style={{ color: 'var(--text-muted)', marginTop: 3, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-primary)' }}>{h.status.replace('_', ' ')}</div>
                      {h.note && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.note}</div>}
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(h.timestamp).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — role-based actions */}
          <div>
            {isWorker
              ? <WorkerActions report={report} onRefresh={refresh} />
              : <StaffActions report={report} workers={workers} onRefresh={refresh} />}
          </div>
        </div>
      </div>
    </div>
  );
}
