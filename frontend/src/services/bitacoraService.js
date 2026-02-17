// src/services/bitacoraService.js
import api from './axiosConfig';

// Obtener el historial completo para la tabla
export const getBitacoraRequest = async () => {
  try {
    const response = await api.get('/bitacora');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener la bitácora');
  }
};