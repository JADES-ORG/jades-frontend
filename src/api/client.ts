import axios from 'axios';

export const SESSION_EXPIRED_EVENT = 'jades:session-expired';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
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
    const token = localStorage.getItem('token');
    // No cerrar una sesión nueva por una respuesta tardía ni tratar un login fallido como expiración.
    if (error.response?.status === 401 && token &&
        error.config?.headers?.Authorization === `Bearer ${token}` &&
        error.config?.url !== '/autenticacion/iniciar-sesion') {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);
