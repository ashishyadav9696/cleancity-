import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { reportsAPI } from '../../api/axios';
import { StatusBadge, PriorityBadge, Spinner } from '../../components/common/UI';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

const STATUS_STEPS = ['pending', 'assigned', 'in_progress', 'completed'];

export default function TrackComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState(id === 'DEMO123' ? '' : id || '');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTrack = async (e) => {
    e?.preventDefault();
    if (!trackingId.trim()) return toast.error('Enter tracking ID');
    setLoading(true); setError(null);
    try {
      const { data } = await reportsAPI.track(trackingId.trim().toUpperCase());
      setReport(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Complaint not found');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const currentStep = STATUS_STEPS.indexOf(report?.status === 'rejected' ? 'pending' : report?.status);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2>Track Your <span className="gradient-text">Complaint</span></h2>
          <p style={{ marginTop: 8 }}>Enter your tracking ID to see the current status</p>
        </div>

        <form onSubmit={handleTrack} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
          <input
            className="form-input"
            value={trackingId}
            onChange={e => setTrackingId(e.target.value.toUpperCase())}
            placeholder="Enter Tracking ID (e.g. A3F7K2BC)"
            style={{ flex: 1, fontSize: 16, letterSpacing: 2, fontWeight: 600, textTransform: 'uppercase' }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Spinner size={16} color="#0f172a" /> : <Search size={16} />} Track
          </button>
        </form>

        {error && <div className="alert alert-error">{error}</div>}

        {report && (
          <div className="animate-fade-in">
            {/* Header Card */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>TRACKING ID</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#22d3ee', letterSpacing: 2 }}>{report.trackingId}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <StatusBadge status={report.status} />
                  <PriorityBadge priority={report.priority} />
                </div>
              </div>
              {report.photo && <img src={report.photo} alt="Issue" style={{ width: '100%', borderRadius: 12, maxHeight: 250, objectFit: 'cover', marginBottom: 12 }} />}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['Category', `${report.category?.icon || '🗑️'} ${report.category?.name || 'N/A'}`],
                  ['Reported', new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
                  ['Location', report.location?.address || 'N/A'],
                  ['Assigned To', report.assignedTo?.name || 'Not yet assigned'],
                ].map(([key, val]) => (
                  <div key={key} style={{ padding: '10px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>{key}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="card" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 20 }}>Progress Timeline</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                {STATUS_STEPS.map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s !== 'completed' ? 1 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i <= currentStep ? 'rgba(34,211,238,0.15)' : 'var(--color-bg-tertiary)', border: `2px solid ${i <= currentStep ? '#22d3ee' : 'rgba(255,255,255,0.1)'}`, color: i <= currentStep ? '#22d3ee' : 'var(--text-muted)', fontSize: 14, fontWeight: 700 }}>
                        {i < currentStep ? '✓' : i + 1}
                      </div>
                      <div style={{ fontSize: 11, color: i <= currentStep ? '#22d3ee' : 'var(--text-muted)', textTransform: 'capitalize', textAlign: 'center', lineHeight: 1.3 }}>
                        {s.replace('_', ' ')}
                      </div>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: i < currentStep ? '#22d3ee' : 'rgba(255,255,255,0.06)', margin: '0 4px 20px', borderRadius: 1 }} />
                    )}
                  </div>
                ))}
              </div>

              {/* Status History */}
              {report.statusHistory?.length > 0 && (
                <div>
                  <h5 style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Activity Log</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...report.statusHistory].reverse().map((h, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22d3ee', marginTop: 5, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{h.status.replace('_', ' ')}</div>
                          {h.note && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{h.note}</div>}
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(h.timestamp).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* After photo if completed */}
            {report.afterPhoto && (
              <div className="card">
                <h4 style={{ marginBottom: 12 }}>✅ After Resolution Photo</h4>
                <img src={report.afterPhoto} alt="After" style={{ width: '100%', borderRadius: 12, maxHeight: 250, objectFit: 'cover' }} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
