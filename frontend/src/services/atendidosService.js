import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/atendidos`;

export const AtendidosService = {
  // Obtener lista (Ahora soporta filtros y búsqueda por nombre en params)
  getAll: async (params = {}) => {
    try {
      // params puede ser { fechaInicio, fechaFin, tipo, nombre }
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error("Error en service getAll:", error);
      throw error;
    }
  },

  // NUEVO: Obtener un solo registro por su ID para los 35 campos
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data; // Retorna { ok: true, data: { ... } }
    } catch (error) {
      console.error("Error en service getById:", error);
      throw error;
    }
  },

  // Obtener el resumen estadístico
  getResumen: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/resumen`, { params });
      return response.data;
    } catch (error) {
      console.error("Error en service getResumen:", error);
      throw error;
    }
  }
};