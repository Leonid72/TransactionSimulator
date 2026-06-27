import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes('/auth/');
    // Only force-logout on 401 for authenticated routes, not login/register
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('accessToken');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export default client;
