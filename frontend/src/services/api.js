import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 120000,
  headers: {
    'Accept': 'application/json',
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error
      || error.response?.data?.detail
      || error.message
      || 'An unexpected error occurred';

    console.error('[API Error]', message);
    return Promise.reject(new Error(message));
  }
);

// ── Upload & Analysis ──
export const analyzeImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    }
  });
  return response.data;
};

// ── Reports ──
export const getReports = async (params = {}) => {
  const response = await api.get('/reports', { params });
  return response.data;
};

export const getReportById = async (id) => {
  const response = await api.get(`/report/${id}`);
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await api.delete(`/report/${id}`);
  return response.data;
};

// ── Dashboard ──
export const getDashboardStats = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

// ── Health ──
export const checkHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
