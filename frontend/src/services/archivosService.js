import api from './axiosConfig';

// Endpoint base para la gestión de archivos
const ENDPOINT = '/archivos';

/**
 * 1. SUBIR ARCHIVO (REGISTRO DE OFICIO)
 * @param {FormData} formData - Objeto FormData con el PDF y los metadatos
 */
const subirArchivo = async (formData) => {
  try {
    const response = await api.post(`${ENDPOINT}/subir`, formData);
    return response.data;
  } catch (error) {
    console.error("Error en subirArchivo service:", error);
    throw error;
  }
};


const getMisArchivos = async () => {
  const response = await api.get(`${ENDPOINT}/mis-archivos`);
  return response.data;
};


const getCompartidos = async () => {
  const response = await api.get(`${ENDPOINT}/compartidos`);
  return response.data;
};


const getArchivosBorrados = async () => {
  const response = await api.get(`${ENDPOINT}/papelera`);
  return response.data;
};

const actualizarArchivo = async (id, data) => {
  const response = await api.put(`${ENDPOINT}/${id}`, data);
  return response.data;
};

const eliminarArchivo = async (id) => {
  const response = await api.patch(`${ENDPOINT}/${id}/eliminar`);
  return response.data;
};

const actualizarPermisos = async (id, permisos) => {
  const response = await api.patch(`${ENDPOINT}/${id}/permisos`, { permisos });
  return response.data;
};

// Exportamos el objeto con todas las funciones para mantener la consistencia
export default {
  subirArchivo,
  getMisArchivos,
  getArchivosBorrados,
  getCompartidos,
  actualizarArchivo,
  eliminarArchivo,
  actualizarPermisos
};