import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    // Skip refresh for auth endpoints themselves to avoid loops
    const isAuthEndpoint = original?.url?.includes('/auth/');
    if (error.response?.status === 401 && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ---- API endpoint functions ----
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

export const reportsAPI = {
  create: (formData) => api.post('/reports', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  track: (trackingId) => api.get(`/reports/track/${trackingId}`),
  getAll: (params) => api.get('/reports', { params }),
  getMy: (params) => api.get('/reports/my', { params }),
  getNearby: (params) => api.get('/reports/nearby', { params }),
  getById: (id) => api.get(`/reports/${id}`),
  assign: (id, data) => api.patch(`/reports/${id}/assign`, data),
  updateStatus: (id, formData) => api.patch(`/reports/${id}/status`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadBeforePhoto: (id, file) => {
    const fd = new FormData();
    fd.append('status', 'in_progress');
    fd.append('beforePhoto', file);
    return api.patch(`/reports/${id}/status`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  submitForReview: (id, file) => {
    const fd = new FormData();
    fd.append('status', 'in_review');
    if (file) fd.append('afterPhoto', file);
    return api.patch(`/reports/${id}/status`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  markCompleted: (id) => {
    const fd = new FormData();
    fd.append('status', 'completed');
    return api.patch(`/reports/${id}/status`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  setPriority: (id, priority) => api.patch(`/reports/${id}/priority`, { priority }),
  addNote: (id, text) => api.post(`/reports/${id}/notes`, { text }),
  upvote: (id) => api.post(`/reports/${id}/upvote`),
};

export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.patch(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getWorkers: () => api.get('/users/workers'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (data) => api.patch('/users/me', data),
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getTrend: (days) => api.get('/analytics/trend', { params: { days } }),
  getCategoryBreakdown: () => api.get('/analytics/category-breakdown'),
  getWorkerPerformance: () => api.get('/analytics/worker-performance'),
  getHeatmap: () => api.get('/analytics/heatmap'),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
