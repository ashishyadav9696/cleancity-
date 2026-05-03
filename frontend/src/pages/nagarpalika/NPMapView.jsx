import { useEffect, useState, useRef } from 'react';
import Sidebar from '../../components/common/Sidebar';
import { EmptyState, Spinner } from '../../components/common/UI';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { reportsAPI } from '../../api/axios';
import { useNavigate } from 'react-router-dom';

/* ── Status config ─────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending:     { color: '#f59e0b', glow: 'rgba(245,158,11,0.4)',  emoji: '⏳', label: 'Pending' },
  assigned:    { color: '#6366f1', glow: 'rgba(99,102,241,0.4)',  emoji: '👷', label: 'Assigned' },
  in_progress: { color: '#3b82f6', glow: 'rgba(59,130,246,0.4)', emoji: '🔧', label: 'In Progress' },
  in_review:   { color: '#a78bfa', glow: 'rgba(167,139,250,0.4)','emoji': '🔍', label: 'In Review' },
  completed:   { color: '#22c55e', glow: 'rgba(34,197,94,0.4)',  emoji: '✅', label: 'Completed' },
  rejected:    { color: '#ef4444', glow: 'rgba(239,68,68,0.4)',  emoji: '❌', label: 'Rejected' },
};

/* ── Inject pulsing CSS once ───────────────────────────────────── */
const PULSE_CSS = `
@keyframes _cc_pulse {
  0%   { transform: scale(1);   opacity: 0.9; box-shadow: 0 0 0 0 var(--pc); }
  70%  { transform: scale(1.08); opacity: 1;  box-shadow: 0 0 0 10px transparent; }
  100% { transform: scale(1);   opacity: 0.9; box-shadow: 0 0 0 0 var(--pc); }
}
@keyframes _cc_ring {
  0%   { transform: translate(-50%,-50%) scale(1);   opacity: 0.6; }
  100% { transform: translate(-50%,-50%) scale(2.4); opacity: 0; }
}
._cc_marker { animation: _cc_pulse 2.2s ease-in-out infinite; }
._cc_ring   { animation: _cc_ring  2.2s ease-out  infinite; }
.leaflet-popup-content-wrapper {
  background: #ffffff !important;
  border: 1px solid rgba(0,0,0,0.1) !important;
  border-radius: 14px !important;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15) !important;
  color: #1e293b !important;
  padding: 0 !important;
  overflow: hidden;
}
.leaflet-popup-tip { background: #ffffff !important; }
.leaflet-popup-content { margin: 0 !important; width: auto !important; }
`;

function injectPulseCSS() {
  if (document.getElementById('_cc_map_css')) return;
  const s = document.createElement('style');
  s.id = '_cc_map_css';
  s.textContent = PULSE_CSS;
  document.head.appendChild(s);
}

/* ── Custom pulsing DivIcon ────────────────────────────────────── */
function makeIcon(status, upvotes = 0) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const size = Math.min(28 + (upvotes || 0) * 1.5, 44);
  return L.divIcon({
    className: '',
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 6)],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div class="_cc_ring" style="
          position:absolute;top:50%;left:50%;
          width:${size}px;height:${size}px;
          border-radius:50%;
          background:${cfg.color}33;
          border:2px solid ${cfg.color};
          pointer-events:none;
        "></div>
        <div class="_cc_marker" style="
          --pc:${cfg.glow};
          width:${size}px;height:${size}px;
          border-radius:50%;
          background:radial-gradient(circle at 35% 35%,${cfg.color}ee,${cfg.color}88);
          border:2.5px solid ${cfg.color};
          display:flex;align-items:center;justify-content:center;
          font-size:${Math.round(size * 0.45)}px;
          cursor:pointer;
          box-shadow:0 4px 14px ${cfg.glow};
        ">${cfg.emoji}</div>
      </div>`,
  });
}

/* ── Auto-fit bounds ───────────────────────────────────────────── */
function FitBounds({ reports }) {
  const map = useMap();
  useEffect(() => {
    if (!reports.length) return;
    if (reports.length === 1) {
      map.flyTo([reports[0].location.coordinates[1], reports[0].location.coordinates[0]], 15, { animate: true, duration: 1.4 });
    } else {
      const bounds = L.latLngBounds(reports.map(r => [r.location.coordinates[1], r.location.coordinates[0]]));
      map.flyToBounds(bounds.pad(0.15), { animate: true, duration: 1.4 });
    }
  }, [reports, map]);
  return null;
}

/* ── Tile config ───────────────────────────────────────────────── */
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const tileConfig = MAPBOX_TOKEN
  ? {
    url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`,
    attribution: '© <a href="https://mapbox.com">Mapbox</a> © <a href="https://openstreetmap.org">OSM</a>',
    tileSize: 512, zoomOffset: -1,
  }
  : {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://carto.com">CARTO</a> © <a href="https://openstreetmap.org">OSM</a>',
  };

const INDIA_CENTER = [20.5937, 78.9629];
const INDIA_ZOOM = 5;

/* ── Popup card ────────────────────────────────────────────────── */
function ReportPopup({ r, onView }) {
  const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
  return (
    <div style={{ width: 220, fontFamily: "'Inter',sans-serif" }}>
      {r.photo && (
        <div style={{ position: 'relative' }}>
          <img src={r.photo} alt="" style={{ width: '100%', height: 110, objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, transparent 60%)' }} />
          <span style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 11, fontWeight: 700, color: '#1e293b' }}>
            #{r.trackingId}
          </span>
          <span style={{ position: 'absolute', top: 8, right: 8, background: cfg.color + '22', border: `1px solid ${cfg.color}`, color: cfg.color, fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 8px', textTransform: 'capitalize' }}>
            {cfg.emoji} {r.status.replace('_', ' ')}
          </span>
        </div>
      )}
      {!r.photo && (
        <div style={{ padding: '12px 14px 4px', fontSize: 12, fontWeight: 700, color: '#475569' }}>#{r.trackingId}</div>
      )}
      <div style={{ padding: '10px 14px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
          {r.category?.icon} {r.category?.name}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10, lineHeight: 1.4 }}>
          {r.location?.address || 'Location on map'}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#64748b' }}>{'\u{1F44D}'} {r.upvoteCount || 0} upvotes</span>
          <button
            onClick={() => onView(r._id)}
            style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, padding: '5px 12px', cursor: 'pointer' }}>
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main ──────────────────────────────────────────────────────── */
export default function NPMapView() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    injectPulseCSS();
    reportsAPI.getAll({ limit: 500 }).then(({ data }) => {
      setReports(data.data.filter(r => r.location?.coordinates?.length === 2));
      setLoading(false);
    });
  }, []);

  const filtered = statusFilter ? reports.filter(r => r.status === statusFilter) : reports;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">🗺️ Map View{MAPBOX_TOKEN ? ' · Mapbox' : ' · Light'}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="form-input" style={{ width: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([s, c]) => (
                <option key={s} value={s}>{c.emoji} {c.label}</option>
              ))}
            </select>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>{filtered.length} pins</span>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          {/* Glassmorphism legend */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(s => s === status ? '' : status)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${statusFilter === status ? cfg.color : cfg.color + '44'}`,
                  background: statusFilter === status ? cfg.color + '22' : 'rgba(255,255,255,0.03)',
                  color: statusFilter === status ? cfg.color : 'var(--text-muted)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                }}>
                <span>{cfg.emoji}</span>
                <span style={{ textTransform: 'capitalize' }}>{cfg.label}</span>
                <span style={{ background: cfg.color + '33', color: cfg.color, borderRadius: 9999, padding: '0 6px', fontSize: 10 }}>
                  {reports.filter(r => r.status === status).length}
                </span>
              </button>
            ))}
          </div>

          {/* Map container with styled border */}
          {loading ? (
            <div className="flex-center" style={{ height: 520 }}><Spinner size={32} /></div>
          ) : (
            <div style={{
              height: '65vh', borderRadius: 18, overflow: 'hidden',
              border: '1px solid rgba(99,102,241,0.3)',
              boxShadow: '0 0 0 1px rgba(99,102,241,0.06), 0 8px 32px rgba(0,0,0,0.18)',
            }}>
              <MapContainer center={INDIA_CENTER} zoom={INDIA_ZOOM} style={{ height: '100%', width: '100%' }}
                zoomControl={true} attributionControl={false}>
                <TileLayer
                  url={tileConfig.url}
                  attribution={tileConfig.attribution}
                  tileSize={tileConfig.tileSize}
                  zoomOffset={tileConfig.zoomOffset}
                />
                {filtered.length > 0 && <FitBounds reports={filtered} />}
                {filtered.map(r => (
                  <Marker
                    key={r._id}
                    position={[r.location.coordinates[1], r.location.coordinates[0]]}
                    icon={makeIcon(r.status, r.upvoteCount)}
                  >
                    <Popup maxWidth={240} minWidth={220}>
                      <ReportPopup r={r} onView={(id) => navigate(`/nagarpalika/reports/${id}`)} />
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* Attribution */}
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
            {MAPBOX_TOKEN ? '© Mapbox Streets · © OpenStreetMap' : '© CartoDB Voyager · © OpenStreetMap'}
          </div>
        </div>
      </div>
    </div>
  );
}
