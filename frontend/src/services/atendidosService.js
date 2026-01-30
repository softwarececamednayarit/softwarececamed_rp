// src/services/atendidosService.js
import api from './axiosConfig'; // <--- CAMBIO IMPORTANTE

// Como axiosConfig ya tiene la baseURL '.../api', aquí solo definimos la ruta del recurso
const ENDPOINT = '/atendidos'; 

export const AtendidosService = {
  // 1. Obtener lista ligera (Tabla principal)
  getAll: async (params = {}) => {
    try {
      // Usamos api.get en lugar de axios.get
      const response = await api.get(ENDPOINT, { params });
      return response.data;
    } catch (error) {
      console.error("Error en service getAll:", error);
      throw error;
    }
  },

  // 2. Obtener registro básico (Modal de vista rápida)
  getById: async (id) => {
    try {
      const response = await api.get(`${ENDPOINT}/${id}`);
      return response.data; 
    } catch (error) {
      console.error("Error en service getById:", error);
      throw error;
    }
  },

  // 3. Obtener expediente COMPLETO (Base + Padrón)
  getCompleto: async (id) => {
    try {
      const response = await api.get(`${ENDPOINT}/${id}/completo`);
      return response.data; 
    } catch (error) {
      console.error("Error en service getCompleto:", error);
      throw error;
    }
  },

  // 4. Guardar datos del Padrón (Edición individual)
  updatePadron: async (id, datosPadron) => {
    try {
      const response = await api.put(`${ENDPOINT}/${id}/padron`, datosPadron);
      return response.data;
    } catch (error) {
      console.error("Error en service updatePadron:", error);
      throw error;
    }
  },

  // 5. Estadísticas
  getResumen: async (params = {}) => {
    try {
      const response = await api.get(`${ENDPOINT}/resumen`, { params });
      return response.data;
    } catch (error) {
      console.error("Error en service getResumen:", error);
      throw error;
    }
  },

  // 6. OBTENER VISTA PREVIA DEL PADRÓN (Solo lectura)
  getPadronReport: async (params = {}) => {
    try {
      const response = await api.get(`${ENDPOINT}/padron/completo`, { params });
      return response.data;
    } catch (error) {
      console.error("Error en getPadronReport:", error);
      throw error;
    }
  },

  // 7. EXPORTAR PADRÓN (Excel)
  generarReporte: async (params = {}) => {
    try {
      // Nota: Si el backend devuelve un archivo binario (blob) directamente, 
      // podrías necesitar agregar { responseType: 'blob', params }
      const response = await api.get(`${ENDPOINT}/padron/exportar`, { params });
      return response.data;
    } catch (error) {
      console.error("Error en generarReporte:", error);
      throw error;
    }
  },

  // 8. [NUEVO] EXPORTAR REGISTRO CLÁSICO
  generarReporteClasico: async (params = {}) => {
    try {
      const response = await api.get(`${ENDPOINT}/clasico/exportar`, { params });
      return response.data;
    } catch (error) {
      console.error("Error en generarReporteClasico:", error);
      throw error;
    }
  }

};