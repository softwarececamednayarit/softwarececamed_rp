import axios from 'axios';

const API_URL = 'http://localhost:3000/api/atendidos';

export const AtendidosService = {
  // Obtener todos con filtros opcionales
  getAll: async (params = {}) => {
    try {
      // params puede ser { fechaInicio, fechaFin, tipo }
      const response = await axios.get(API_URL, { params });
      return response.data; // Retorna { ok: true, count: X, data: [...] }
    } catch (error) {
      console.error("Error en service getAll:", error);
      throw error;
    }
  },

  // Obtener el resumen estadístico para las StatCards
  getResumen: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/resumen`, { params });
      return response.data; // Retorna { ok: true, resumen: { ... } }
    } catch (error) {
      console.error("Error en service getResumen:", error);
      throw error;
    }
  }
};