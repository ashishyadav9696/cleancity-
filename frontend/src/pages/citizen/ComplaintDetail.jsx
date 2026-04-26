import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { StatusBadge, PriorityBadge, Spinner } from '../../components/common/UI';
import { reportsAPI } from '../../api/axios';
import { ArrowLeft, ThumbsUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'assigned', 'in_progress', 'completed'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);

  useEffect(() => {
    reportsAPI.getById(id).then(({ data }) => { setReport(data.data); setLoading(false); });
  }, [id]);

  const handleUpvote = async () => {
    setUpvoting(true);
    try {
      const { data } = await reportsAPI.upvote(id);
      setReport(r => ({ ...r, upvoteCount: data.data.upvoteCount }));
      toast.success(data.data.upvoted ? 'Upvoted!' : 'Upvote removed');
    } catch { toast.error('Failed to upvote'); }
    finally { setUpvoting(false); }
  };

  if (loading) return <div className="dashboard-layout"><Sidebar /><div className="main-content flex-center" style={{ height: '100vh' }}><Spinner size={32} /></div></div>;
  if (!report) return null;

  const currentStep = STATUS_STEPS.indexOf(report.status);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => navigate(-1)} className="btn btn-icon"><ArrowLeft size={16} /></button>
            <div className="topbar-title">Complaint #{report.trackingId}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <StatusBadge status={report.status} />
            <PriorityBadge priority={report.priority} />
          </div>
        </div>

        <div style={{ padding: 24, maxWidth: 720 }}>
          {report.photo && <img src={report.photo} alt="" style={{ width: '100%', borderRadius: 16, maxHeight: 300, objectFit: 'cover', marginBottom: 20 }} />}

          {/* Progress */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h4 style={{ marginBottom: 16 }}>📊 Progress</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {STATUS_STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STATUS_STEPS.length - 1 ? 1 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: i <= currentStep ? 'rgba(34,211,238,0.15)' : 'var(--color-bg-tertiary)', border: `2px solid ${i <= currentStep ? '#22d3ee' : 'rgba(255,255,255,0.1)'}`, color: i <= currentStep ? '#22d3ee' : 'var(--text-muted)', fontSize: 13, fontWeight: 700 }}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>
                    <span style={{ fontSize: 11, textTransform: 'capitalize', color: i <= currentStep ? '#22d3ee' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s.replace('_', ' ')}</span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < currentStep ? '#22d3ee' : 'rgba(255,255,255,0.06)', margin: '0 4px 20px' }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="card" style={{ marginBottom: 16 }}>
            <h4 style={{ marginBottom: 12 }}>📋 Details</h4>
            <div className="grid-2" style={{ gap: 10 }}>
              {[
                ['Category', `${report.category?.icon || '🗑️'} ${report.category?.name}`],
                ['Submitted', new Date(report.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                ['Location', report.location?.address || 'N/A'],
                ['Assigned To', report.assignedTo?.name || 'Awaiting assignment'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '10px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{k.toUpperCase()}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{v}</div>
                </div>
              ))}
            </div>
            {report.description && <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10 }}><div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>DESCRIPTION</div><p style={{ fontSize: 14, color: 'var(--text-primary)', margin: 0 }}>{report.description}</p></div>}
          </div>

          {/* After photo */}
          {report.afterPhoto && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h4 style={{ marginBottom: 12 }}>✅ Resolution Photo</h4>
              <img src={report.afterPhoto} alt="After" style={{ width: '100%', borderRadius: 12, maxHeight: 250, objectFit: 'cover' }} />
            </div>
          )}

          {/* Upvote */}
          <button onClick={handleUpvote} className="btn btn-secondary" disabled={upvoting} style={{ width: '100%', justifyContent: 'center', gap: 8 }}>
            <ThumbsUp size={16} /> Upvote ({report.upvoteCount || 0}) — Signal urgency to municipal staff
          </button>
        </div>
      </div>
    </div>
  );
}
