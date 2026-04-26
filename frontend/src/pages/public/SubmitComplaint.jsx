import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import { reportsAPI, categoriesAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common/UI';
import toast from 'react-hot-toast';
import imageCompression from 'browser-image-compression';
import { Camera, MapPin, Tag, CheckCircle, ChevronRight, ChevronLeft, Upload, X } from 'lucide-react';

const STEPS = ['📸 Photo', '📍 Location', '🏷️ Category', '✅ Review'];

export default function SubmitComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [trackingId, setTrackingId] = useState(null);
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    photo: null, photoPreview: null,
    latitude: '', longitude: '', address: '', landmark: '',
    categoryId: '', description: '',
    isAnonymous: !user, anonymousContact: '',
  });

  useEffect(() => {
    categoriesAPI.getAll().then(({ data }) => setCategories(data.data));
  }, []);

  const handlePhoto = async (file) => {
    if (!file) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 2, maxWidthOrHeight: 1200, useWebWorker: true });
      const preview = URL.createObjectURL(compressed);
      setForm(f => ({ ...f, photo: compressed, photoPreview: preview }));
    } catch {
      toast.error('Failed to process image');
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      setForm(f => ({ ...f, latitude, longitude }));
      // Reverse geocode with Nominatim (free)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        setForm(f => ({ ...f, address: data.display_name?.split(',').slice(0, 4).join(', ') || '' }));
      } catch {}
      setLoading(false);
      toast.success('Location detected!');
    }, () => { setLoading(false); toast.error('Could not get location'); });
  };

  const validate = () => {
    if (step === 0 && !form.photo) { toast.error('Please upload a photo'); return false; }
    if (step === 1 && (!form.latitude || !form.longitude)) { toast.error('Please detect or enter your location'); return false; }
    if (step === 2 && !form.categoryId) { toast.error('Please select a category'); return false; }
    return true;
  };

  const next = () => { if (validate()) setStep(s => Math.min(s + 1, 3)); };
  const back = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('photo', form.photo);
      fd.append('latitude', form.latitude);
      fd.append('longitude', form.longitude);
      fd.append('address', form.address);
      fd.append('landmark', form.landmark);
      fd.append('categoryId', form.categoryId);
      fd.append('description', form.description);
      fd.append('isAnonymous', form.isAnonymous);
      if (form.anonymousContact) fd.append('anonymousContact', form.anonymousContact);

      const { data } = await reportsAPI.create(fd);
      setTrackingId(data.data.trackingId);
      toast.success('Complaint submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (trackingId) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div className="flex-center" style={{ minHeight: 'calc(100vh - 70px)', padding: 24 }}>
          <div className="card" style={{ maxWidth: 480, width: '100%', textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Complaint Submitted!</h2>
            <p style={{ marginBottom: 24 }}>Your complaint has been received. Use your tracking ID to follow up.</p>
            <div style={{ background: 'var(--color-bg-tertiary)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>TRACKING ID</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#22d3ee', letterSpacing: 4, fontFamily: "'Space Grotesk',sans-serif" }}>{trackingId}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate(`/track/${trackingId}`)} className="btn btn-primary">Track Status</button>
              <button onClick={() => { setTrackingId(null); setStep(0); setForm(f => ({ ...f, photo: null, photoPreview: null })); }} className="btn btn-secondary">Submit Another</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h2>Submit a <span className="gradient-text">Complaint</span></h2>
          <p style={{ marginTop: 8 }}>Help keep your city clean — it takes less than 2 minutes</p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
          {STEPS.map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 9999, background: i === step ? 'rgba(34,211,238,0.15)' : i < step ? 'rgba(34,197,94,0.1)' : 'var(--color-bg-tertiary)', border: `1px solid ${i === step ? '#22d3ee' : i < step ? '#22c55e' : 'rgba(255,255,255,0.06)'}`, fontSize: 13, color: i === step ? '#22d3ee' : i < step ? '#22c55e' : 'var(--text-muted)', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {i < step ? '✓' : label}
              </div>
              {i < STEPS.length - 1 && <div style={{ width: 16, height: 1, background: i < step ? '#22c55e' : 'rgba(255,255,255,0.06)' }} />}
            </div>
          ))}
        </div>

        <div className="card animate-fade-in" style={{ marginBottom: 20 }}>
          {/* Step 0: Photo */}
          {step === 0 && (
            <div>
              <h3 style={{ marginBottom: 20 }}>📸 Upload Photo</h3>
              {!form.photoPreview ? (
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ border: '2px dashed rgba(34,211,238,0.3)', borderRadius: 16, padding: 48, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(34,211,238,0.03)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.6)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(34,211,238,0.3)'}
                >
                  <Camera size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Click to upload photo</p>
                  <p style={{ fontSize: 13 }}>JPEG, PNG or WebP · Max 10MB</p>
                  <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => handlePhoto(e.target.files[0])} />
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={form.photoPreview} alt="Preview" style={{ width: '100%', borderRadius: 12, maxHeight: 320, objectFit: 'cover' }} />
                  <button onClick={() => setForm(f => ({ ...f, photo: null, photoPreview: null }))} className="btn btn-icon" style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.7)' }}>
                    <X size={14} />
                  </button>
                </div>
              )}
              {!user && (
                <div className="alert alert-info" style={{ marginTop: 16 }}>
                  💡 You're submitting anonymously. <a href="/login" style={{ color: '#22d3ee' }}>Login</a> to track your complaint history.
                </div>
              )}
            </div>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: 20 }}>📍 Location</h3>
              <button onClick={detectLocation} className="btn btn-primary w-full" style={{ marginBottom: 16 }} disabled={loading}>
                {loading ? <Spinner size={16} color="#0f172a" /> : <MapPin size={16} />} Auto-Detect My Location
              </button>
              {form.latitude && (
                <div className="alert alert-success" style={{ marginBottom: 12 }}>
                  ✅ Location detected: {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                </div>
              )}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label className="form-label">Address <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(auto-filled or type manually)</span></label>
                <textarea className="form-input" rows={3} value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Enter full address..." />
              </div>
              <div className="form-group">
                <label className="form-label">Landmark (optional)</label>
                <input className="form-input" value={form.landmark} onChange={e => setForm(f => ({ ...f, landmark: e.target.value }))} placeholder="Near water tank, opposite school..." />
              </div>
              {!form.latitude && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Latitude</label>
                    <input className="form-input" type="number" step="any" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} placeholder="19.0760" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Longitude</label>
                    <input className="form-input" type="number" step="any" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} placeholder="72.8777" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Category */}
          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: 20 }}>🏷️ Category & Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 20 }}>
                {categories.map(cat => (
                  <div key={cat._id} onClick={() => setForm(f => ({ ...f, categoryId: cat._id }))}
                    style={{ padding: 14, borderRadius: 12, border: `2px solid ${form.categoryId === cat._id ? '#22d3ee' : 'rgba(255,255,255,0.06)'}`, background: form.categoryId === cat._id ? 'rgba(34,211,238,0.08)' : 'var(--color-bg-tertiary)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 24 }}>{cat.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: form.categoryId === cat._id ? '#22d3ee' : 'var(--text-primary)', lineHeight: 1.3 }}>{cat.name}</span>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea className="form-input" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the issue in detail..." />
              </div>
              {!user && (
                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Email/Phone for updates (optional)</label>
                  <input className="form-input" value={form.anonymousContact} onChange={e => setForm(f => ({ ...f, anonymousContact: e.target.value }))} placeholder="your@email.com or phone number" />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div>
              <h3 style={{ marginBottom: 20 }}>✅ Review & Submit</h3>
              {form.photoPreview && <img src={form.photoPreview} alt="Issue" style={{ width: '100%', borderRadius: 12, maxHeight: 200, objectFit: 'cover', marginBottom: 16 }} />}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['📍 Location', form.address || `${form.latitude}, ${form.longitude}`],
                  ['🏷️ Category', categories.find(c => c._id === form.categoryId)?.name || 'N/A'],
                  ['📝 Description', form.description || 'None'],
                  ['🔒 Submission', form.isAnonymous ? 'Anonymous' : `As ${user?.name}`],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', gap: 8, padding: '10px 14px', background: 'var(--color-bg-tertiary)', borderRadius: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 120, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {step > 0 && <button onClick={back} className="btn btn-secondary" style={{ flex: 1 }}><ChevronLeft size={16} /> Back</button>}
          {step < 3 ? (
            <button onClick={next} className="btn btn-primary" style={{ flex: 2 }}>Next <ChevronRight size={16} /></button>
          ) : (
            <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? <><Spinner size={16} color="#0f172a" /> Submitting...</> : <><Upload size={16} /> Submit Complaint</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
