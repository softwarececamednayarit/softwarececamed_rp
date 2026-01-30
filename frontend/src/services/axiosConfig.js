// src/services/axiosConfig.js
import axios from 'axios';

// Creamos una instancia única de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

// INTERCEPTOR DE SOLICITUD (REQUEST)
// Antes de que salga la petición, hacemos esto:
api.interceptors.request.use(
  (config) => {
    // 1. Buscamos el token en localStorage
    const token = localStorage.getItem('token');
    
    // 2. Si existe, lo pegamos en el header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// (Opcional) INTERCEPTOR DE RESPUESTA
// Si el token expiró (Error 401), podemos cerrar sesión automáticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // El token venció o es falso
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/'; // Redirigir al login a la fuerza
    }
    return Promise.reject(error);
  }
);

export default api;