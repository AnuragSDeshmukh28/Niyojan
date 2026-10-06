import axios, { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Bearer token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAuthRequest = config.url?.includes('/auth/login') || config.url?.includes('/auth/register');
    const token = localStorage.getItem('niyojan_access_token');
    if (token && config.headers && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 & automatic refresh token retry
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') ||
                           originalRequest.url?.includes('/auth/register') ||
                           originalRequest.url?.includes('/auth/refresh') ||
                           originalRequest.url?.includes('/auth/logout');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('niyojan_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          if (res.data.access_token) {
            localStorage.setItem('niyojan_access_token', res.data.access_token);
            if (res.data.refresh_token) {
              localStorage.setItem('niyojan_refresh_token', res.data.refresh_token);
            }
            originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('niyojan_access_token');
          localStorage.removeItem('niyojan_refresh_token');
          localStorage.removeItem('niyojan_user');
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Seed user credentials map for one-click persona switcher buttons
export const SEED_CREDENTIALS: Record<string, { email: string; pass: string }> = {
  admin: { email: 'admin@institution.edu.in', pass: 'Admin@Niyojan2026' },
  principal: { email: 'principal@institution.edu.in', pass: 'Principal@Niyojan2026' },
  mediator: { email: 'mediator@institution.edu.in', pass: 'Mediator@Niyojan2026' },
  faculty: { email: 'faculty@institution.edu.in', pass: 'Faculty@Niyojan2026' },
  student: { email: 'student@institution.edu.in', pass: 'Student@Niyojan2026' },
  parent: { email: 'parent@institution.edu.in', pass: 'Parent@Niyojan2026' },
};
