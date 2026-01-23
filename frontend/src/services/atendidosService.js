import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
// API_URL ya incluye '/api/atendidos'
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
  getCompleto: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/completo`);
      return response.data; 
    } catch (error) {
      console.error("Error en service getCompleto:", error);
      throw error;
    }
  },

  // 4. NUEVO: Guardar datos del Padrón
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
  },

  // 6. OBTENER REPORTE PADRÓN (Lista Pesada)
  // CORREGIDO AQUÍ: Usamos API_URL en lugar de BASE_URL
  getPadronReport: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/padron/completo`, { params });
      return response.data;
    } catch (error) {
      console.error("Error en getPadronReport:", error);
      throw error;
    }
  }

};