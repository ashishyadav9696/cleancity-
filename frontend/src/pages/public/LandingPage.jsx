import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { ArrowRight, Camera, MapPin, Bell, BarChart3, Shield, Users } from 'lucide-react';

const FEATURES = [
  { icon: '📸', title: 'Photo Reporting', desc: 'Snap a photo of any waste issue and submit instantly — no app needed.' },
  { icon: '📍', title: 'Auto Location', desc: 'GPS auto-detects your location. Manual address override available.' },
  { icon: '🔒', title: 'Anonymous Mode', desc: 'Submit complaints without creating an account. Your privacy matters.' },
  { icon: '📊', title: 'Real-time Tracking', desc: 'Get a unique tracking ID and follow your complaint from submission to resolution.' },
  { icon: '⚡', title: 'Live Notifications', desc: 'Get email and push notifications at every status change.' },
  { icon: '🗺️', title: 'Map View', desc: 'See all active complaints on an interactive map in your area.' },
];

const STEPS = [
  { num: '01', title: 'Snap & Submit', desc: 'Take a photo of the issue, pick a category, and hit submit. Done in 60 seconds.' },
  { num: '02', title: 'Get Tracking ID', desc: 'Receive a unique ID instantly. Share it or use it to track your complaint.' },
  { num: '03', title: 'Staff Takes Action', desc: 'Nagar Palika staff reviews, assigns to a worker, and sets priority.' },
  { num: '04', title: 'Issue Resolved', desc: "Worker completes the task with before/after photos. You're notified." },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Glow effects */}
        <div style={{ position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse at center, rgba(34,211,238,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 200, left: '10%', width: 300, height: 300, background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', borderRadius: 9999, fontSize: 13, color: '#22d3ee', marginBottom: 24, fontWeight: 500 }}>
            🌱 Smart Waste Management for Modern Cities
          </div>
          <h1 style={{ marginBottom: 20 }}>
            <span className="gradient-text">CleanCity</span> — Report Waste,<br />Reclaim Your Streets
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
            A civic platform where citizens, municipal staff, and workers collaborate to keep cities clean. One photo. One complaint. Real action.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/report" className="btn btn-primary btn-lg">
              <Camera size={18} /> Report an Issue <ArrowRight size={16} />
            </Link>
            <Link to="/track/DEMO123" className="btn btn-secondary btn-lg">
              <MapPin size={16} /> Track Complaint
            </Link>
          </div>

          {/* Stats bar */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 60, flexWrap: 'wrap' }}>
            {[['2,400+', 'Complaints Resolved'], ['98%', 'Resolution Rate'], ['< 24h', 'Avg Response Time'], ['15+', 'Cities Covered']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#22d3ee', fontFamily: "'Space Grotesk', sans-serif" }}>{val}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: '80px 24px', background: 'var(--color-bg-secondary)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2>How It <span className="gradient-text">Works</span></h2>
            <p style={{ marginTop: 12 }}>From photo to resolution in 4 simple steps</p>
          </div>
          <div className="grid-4" style={{ gap: 24 }}>
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="card" style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: 'rgba(34,211,238,0.15)', fontFamily: "'Space Grotesk', sans-serif", marginBottom: 12 }}>{num}</div>
                <h4 style={{ marginBottom: 8, color: '#f1f5f9' }}>{title}</h4>
                <p style={{ fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2>Everything You <span className="gradient-text">Need</span></h2>
            <p style={{ marginTop: 12 }}>Built for citizens, optimized for municipal efficiency</p>
          </div>
          <div className="grid-3" style={{ gap: 20 }}>
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="card" style={{ display: 'flex', gap: 16 }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>{icon}</div>
                <div>
                  <h4 style={{ marginBottom: 6, color: '#f1f5f9', fontSize: 16 }}>{title}</h4>
                  <p style={{ fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: 'var(--color-bg-secondary)', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌿</div>
          <h2>Ready to Make a Difference?</h2>
          <p style={{ marginTop: 12, marginBottom: 32 }}>Join thousands of citizens already keeping their cities clean</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
            <Link to="/report" className="btn btn-secondary btn-lg">Report Anonymously</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>© 2024 CleanCity · Built for civic good 🌱</p>
      </footer>
    </div>
  );
}
