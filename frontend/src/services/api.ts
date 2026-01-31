import axios from 'axios';
import type {
  Symptom,
  Rule,
  Article,
  DiagnosisRequest,
  DiagnosisResponse,
  Diagnosis,
  AuthResponse,
  Statistics,
  User,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get<User>('/api/auth/me');
    return response.data;
  },
};

// Symptoms APIs
export const symptomsAPI = {
  getAll: async () => {
    const response = await api.get<{ symptoms: Symptom[] }>('/api/symptoms');
    return response.data.symptoms;
  },

  getAllAdmin: async () => {
    const response = await api.get<{ symptoms: Symptom[] }>('/api/symptoms/all');
    return response.data.symptoms;
  },

  create: async (data: Partial<Symptom>) => {
    const response = await api.post('/api/symptoms', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Symptom>) => {
    const response = await api.put(`/api/symptoms/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/symptoms/${id}`);
    return response.data;
  },
};

// Rules APIs
export const rulesAPI = {
  getAll: async () => {
    const response = await api.get<{ rules: Rule[] }>('/api/rules');
    return response.data.rules;
  },

  getById: async (id: number) => {
    const response = await api.get<Rule>(`/api/rules/${id}`);
    return response.data;
  },

  create: async (data: Partial<Rule>) => {
    const response = await api.post('/api/rules', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Rule>) => {
    const response = await api.put(`/api/rules/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/rules/${id}`);
    return response.data;
  },
};

// Articles APIs
export const articlesAPI = {
  getAll: async () => {
    const response = await api.get<{ articles: Article[] }>('/api/articles');
    return response.data.articles;
  },

  getAllAdmin: async () => {
    const response = await api.get<{ articles: Article[] }>('/api/articles/all');
    return response.data.articles;
  },

  getBySlug: async (slug: string) => {
    const response = await api.get<Article>(`/api/articles/${slug}`);
    return response.data;
  },

  create: async (data: Partial<Article>) => {
    const response = await api.post('/api/articles', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Article>) => {
    const response = await api.put(`/api/articles/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/api/articles/${id}`);
    return response.data;
  },
};

// Diagnosis APIs
export const diagnosisAPI = {
  create: async (data: DiagnosisRequest) => {
    const response = await api.post<DiagnosisResponse>('/api/diagnose', data);
    return response.data;
  },

  getHistory: async (limit?: number) => {
    const response = await api.get<{ history: Diagnosis[] }>('/api/diagnose/history', {
      params: { limit },
    });
    return response.data.history;
  },

  getById: async (id: number) => {
    const response = await api.get<Diagnosis>(`/api/diagnose/${id}`);
    return response.data;
  },
};

// About APIs
export interface AboutContent {
  id?: number;
  title: string;
  description: string;
  vision: string;
  mission: string;
  developer_name: string;
  developer_info: string;
  contact_email: string;
  contact_phone: string;
  address: string;
}

export const aboutAPI = {
  get: async () => {
    const response = await api.get<AboutContent>('/api/about');
    return response.data;
  },

  update: async (data: AboutContent) => {
    const response = await api.put('/api/about', data);
    return response.data;
  },
};

// Admin APIs
export const adminAPI = {
  getStatistics: async () => {
    const response = await api.get<Statistics>('/api/admin/statistics');
    return response.data;
  },

  getAllDiagnoses: async (page = 1, limit = 20) => {
    const response = await api.get('/api/admin/diagnoses', {
      params: { page, limit },
    });
    return response.data;
  },

  getAllUsers: async () => {
    const response = await api.get<{ users: User[] }>('/api/admin/users');
    return response.data.users;
  },

  createUser: async (data: { name: string; email: string; password: string; role: 'user' | 'admin' }) => {
    const response = await api.post('/api/admin/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: { name?: string; email?: string; password?: string; role?: 'user' | 'admin' }) => {
    const response = await api.put(`/api/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/api/admin/users/${id}`);
    return response.data;
  },
};

export default api;
