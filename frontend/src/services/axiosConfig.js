// src/services/axiosConfig.js
import axios from 'axios';

/**
 * Instancia central de Axios para la app.
 * - `VITE_API_URL` se utiliza en build/entorno; por defecto apunta al backend local.
 * - Exportar una instancia facilita testing y configuración centralizada de headers/interceptors.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// INTERCEPTOR DE REQUEST
// Añade automáticamente el `Authorization: Bearer <token>` si existe token en localStorage.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      // Mantener header en mayúsculas estándar
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// INTERCEPTOR DE RESPONSE
// Manejo simple de 401: limpiar sesión local y forzar redirección al login.
// Nota: esta lógica es intencionalmente directa; si usas `useAuth()` podrías preferir
// disparar `logout()` desde el contexto en lugar de manipular `localStorage` aquí.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirigir al login para que la UI resetee su estado
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;