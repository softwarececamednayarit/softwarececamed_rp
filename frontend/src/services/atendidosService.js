import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/atendidos`;

export const AtendidosService = {
  // 1. Obtener lista ligera (Tabla principal)
  getAll: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error("Error en service getAll:", error);
      throw error;
    }
  },

  // 2. Obtener registro básico (Modal de vista rápida)
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data; 
    } catch (error) {
      console.error("Error en service getById:", error);
      throw error;
    }
  },

  // 3. NUEVO: Obtener expediente COMPLETO (Base + Padrón)
  // Úsalo cuando vayas a editar los datos del padrón o ver historial
  getCompleto: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/completo`);
      return response.data; // Retorna { ok: true, data: { ...campos_base, ...campos_detalle } }
    } catch (error) {
      console.error("Error en service getCompleto:", error);
      throw error;
    }
  },

  // 4. NUEVO: Guardar datos del Padrón
  // Envía los campos extra (municipio, tipo apoyo, etc.)
  updatePadron: async (id, datosPadron) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/padron`, datosPadron);
      return response.data;
    } catch (error) {
      console.error("Error en service updatePadron:", error);
      throw error;
    }
  },

  // 5. Estadísticas
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