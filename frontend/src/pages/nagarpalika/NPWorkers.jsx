import { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { analyticsAPI } from '../../api/axios';
import { Spinner } from '../../components/common/UI';

export default function NPWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getWorkerPerformance().then(({ data }) => { setWorkers(data.data); setLoading(false); });
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar"><div className="topbar-title">Worker Performance</div></div>
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
    </div>
  );
}
