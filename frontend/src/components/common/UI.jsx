export const StatusBadge = ({ status }) => (
  <span className={`badge badge-${status}`}>
    {{ pending: '⏳', assigned: '👷', in_progress: '🔧', completed: '✅', rejected: '❌' }[status] || '•'} {status?.replace('_', ' ')}
  </span>
);

export const PriorityBadge = ({ priority }) => (
  <span className={`badge badge-${priority}`}>
    {{ low: '🟢', medium: '🟡', high: '🟠', urgent: '🔴' }[priority] || '•'} {priority}
  </span>
);

export const Spinner = ({ size = 20, color = 'var(--color-primary)' }) => (
  <div className="spinner" style={{ width: size, height: size, border: `2px solid rgba(255,255,255,0.1)`, borderTopColor: color, borderRadius: '50%' }} />
);

export const LoadingPage = () => (
  <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: 16 }}>
    <Spinner size={40} />
    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
  </div>
);

export const EmptyState = ({ icon = '📭', title = 'Nothing here', message = '', action }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
    {message && <p style={{ marginBottom: 16 }}>{message}</p>}
    {action}
  </div>
);

export const StatCard = ({ icon, label, value, color = '#22d3ee', change }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: `${color}20` }}>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <div>
      <div className="stat-number" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
      {change !== undefined && (
        <div style={{ fontSize: 12, color: change >= 0 ? '#22c55e' : '#ef4444', marginTop: 2 }}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs yesterday
        </div>
      )}
    </div>
  </div>
);
