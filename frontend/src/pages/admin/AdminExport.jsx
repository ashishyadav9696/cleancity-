import { useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { reportsAPI } from '../../api/axios';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminExport() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleExport = async (format) => {
    setLoading(true);
    try {
      const { data } = await reportsAPI.getAll({ limit: 1000, ...dateRange.start && { startDate: dateRange.start }, ...dateRange.end && { endDate: dateRange.end } });
      const rows = data.data.map(r => ({
        'Tracking ID': r.trackingId, 'Category': r.category?.name, 'Status': r.status, 'Priority': r.priority,
        'Location': r.location?.address, 'Reporter': r.isAnonymous ? 'Anonymous' : r.reportedBy?.name,
        'Assigned To': r.assignedTo?.name || 'Unassigned', 'Submitted': new Date(r.createdAt).toLocaleString('en-IN'),
        'Completed': r.completedAt ? new Date(r.completedAt).toLocaleString('en-IN') : '',
        'Upvotes': r.upvoteCount,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reports');
      XLSX.writeFile(wb, `cleancity_reports_${new Date().toISOString().split('T')[0]}.${format}`);
      toast.success(`Exported ${rows.length} reports as ${format.toUpperCase()}`);
    } catch (err) { toast.error('Export failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar"><div className="topbar-title">Export Reports</div></div>
        <div style={{ padding: 24, maxWidth: 600 }}>
          <div className="card">
            <h4 style={{ marginBottom: 20 }}>📊 Export Complaint Data</h4>
            <div className="grid-2" style={{ gap: 14, marginBottom: 24 }}>
              <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" value={dateRange.start} onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" value={dateRange.end} onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => handleExport('xlsx')} className="btn btn-primary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                <Download size={16} /> Export Excel (.xlsx)
              </button>
              <button onClick={() => handleExport('csv')} className="btn btn-secondary" disabled={loading} style={{ flex: 1, justifyContent: 'center' }}>
                <Download size={16} /> Export CSV
              </button>
            </div>
            <div className="alert alert-info" style={{ marginTop: 16 }}>
              💡 Leave dates empty to export all complaints. Data includes tracking ID, category, status, location, and timestamps.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
