import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { StatusBadge, PriorityBadge, EmptyState, Spinner } from '../../components/common/UI';
import { reportsAPI } from '../../api/axios';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function MyComplaints() {
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    reportsAPI.getMy({ page, limit: 10 }).then(({ data }) => {
      setReports(data.data);
      setMeta(data.meta);
      setLoading(false);
    });
  }, [page]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">My Complaints</div>
          <Link to="/report" className="btn btn-primary btn-sm"><Plus size={14} /> New Complaint</Link>
        </div>
        <div style={{ padding: 24 }}>
          {loading ? (
            <div className="flex-center" style={{ height: 200 }}><Spinner size={28} /></div>
          ) : reports.length === 0 ? (
            <div className="card"><EmptyState icon="📭" title="No complaints yet" message="Submit your first complaint to help improve your city." action={<Link to="/report" className="btn btn-primary">Submit Complaint</Link>} /></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {reports.map(r => (
                <Link key={r._id} to={`/complaints/${r._id}`} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}>
                    {r.photo && <img src={r.photo} alt="" style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'monospace', color: '#22d3ee', fontWeight: 700, fontSize: 13 }}>#{r.trackingId}</span>
                        <StatusBadge status={r.status} />
                        <PriorityBadge priority={r.priority} />
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{r.category?.icon} {r.category?.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {r.location?.address || 'Location not available'}</div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </Link>
              ))}
              {meta.pages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span style={{ padding: '6px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>Page {page} of {meta.pages}</span>
                  <button className="btn btn-secondary btn-sm" disabled={page >= meta.pages} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
