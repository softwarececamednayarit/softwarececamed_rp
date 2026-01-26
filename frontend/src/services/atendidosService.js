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

  // 3. Obtener expediente COMPLETO (Base + Padrón)
  getCompleto: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/completo`);
      return response.data; 
    } catch (error) {
      console.error("Error en service getCompleto:", error);
      throw error;
    }
  },

  // 4. Guardar datos del Padrón (Edición individual)
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

  // 6. OBTENER VISTA PREVIA DEL PADRÓN (Solo lectura, para mostrar tabla antes de subir)
  getPadronReport: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/padron/completo`, { params });
      return response.data;
    } catch (error) {
      console.error("Error en getPadronReport:", error);
      throw error;
    }
  },

  // 7. [NUEVO] EXPORTAR A SHEETS (Dispara la subida y cambio de estatus)
  exportarPadron: async (params = {}) => {
    try {
      // Usamos POST porque esto modifica la BD (cambia estatus a ENVIADO)
      // params sirve por si quieres filtrar qué exportar (ej. solo fechas de enero)
      const response = await axios.post(`${API_URL}/padron/exportar`, null, { params });
      return response.data;
    } catch (error) {
      console.error("Error en exportarPadron:", error);
      throw error;
    }
  }

};