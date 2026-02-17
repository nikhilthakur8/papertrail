import axios from 'axios';

const API_URL = import.meta.env.VITE_SERVER_URL  || 'http://localhost:5100/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const path = window.location.pathname
      if(path !== '/login' && path !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  sendOtp: () => api.post('/auth/send-otp'),
  verifyOtp: (otp: string) => api.post('/auth/verify-otp', { otp }),
};

// Papers API
export const papersAPI = {
  create: (data: {
    title: string;
    firstAuthor: string;
    researchDomain: string;
    readingStage: string;
    citationCount: number;
    impactScore: string;
    dateAdded?: string;
  }) => api.post('/papers', data),
  
  getAll: (filters?: {
    readingStage?: string;
    researchDomain?: string;
    impactScore?: string;
    dateFilter?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.readingStage) params.append('readingStage', filters.readingStage);
    if (filters?.researchDomain) params.append('researchDomain', filters.researchDomain);
    if (filters?.impactScore) params.append('impactScore', filters.impactScore);
    if (filters?.dateFilter) params.append('dateFilter', filters.dateFilter);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    return api.get(`/papers?${params.toString()}`);
  },
  
  getFilters: () => api.get('/papers/filters'),
  
  getAnalytics: () => api.get('/papers/analytics'),
  
  update: (id: string, data: Partial<{
    title: string;
    firstAuthor: string;
    researchDomain: string;
    readingStage: string;
    citationCount: number;
    impactScore: string;
  }>) => api.patch(`/papers/${id}`, data),
  
  delete: (id: string) => api.delete(`/papers/${id}`),
  
  seedMockPapers: () => api.post('/papers/seed'),
};

export default api;
