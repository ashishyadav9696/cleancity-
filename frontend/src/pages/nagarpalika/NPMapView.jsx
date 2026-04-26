import { useEffect, useState } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { EmptyState, Spinner } from '../../components/common/UI';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reportsAPI } from '../../api/axios';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png', iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png' });

const STATUS_COLORS = { pending: '#f59e0b', assigned: '#6366f1', in_progress: '#3b82f6', completed: '#22c55e', rejected: '#ef4444' };

export default function NPMapView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    reportsAPI.getAll({ limit: 200 }).then(({ data }) => {
      setReports(data.data.filter(r => r.location?.coordinates));
      setLoading(false);
    });
  }, []);

  const filtered = statusFilter ? reports.filter(r => r.status === statusFilter) : reports;
  const center = [19.0760, 72.8777]; // Mumbai default

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">Map View</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="form-input" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} markers</span>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: color }} />
                <span style={{ textTransform: 'capitalize' }}>{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex-center" style={{ height: 500 }}><Spinner size={32} /></div>
          ) : (
            <div style={{ height: '65vh', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                />
                {filtered.map(r => (
                  <CircleMarker
                    key={r._id}
                    center={[r.location.coordinates[1], r.location.coordinates[0]]}
                    radius={r.upvoteCount ? 8 + r.upvoteCount : 8}
                    fillColor={STATUS_COLORS[r.status] || '#94a3b8'}
                    color="#fff"
                    weight={2}
                    fillOpacity={0.85}
                    eventHandlers={{ click: () => setSelected(r) }}
                  >
                    <Popup>
                      <div style={{ minWidth: 200, fontFamily: "'Inter', sans-serif" }}>
                        {r.photo && <img src={r.photo} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />}
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>#{r.trackingId}</div>
                        <div style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>{r.category?.icon} {r.category?.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{r.location?.address}</div>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 9999, background: STATUS_COLORS[r.status] + '20', color: STATUS_COLORS[r.status], fontSize: 11, fontWeight: 700, textTransform: 'capitalize' }}>
                          {r.status.replace('_', ' ')}
                        </span>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
