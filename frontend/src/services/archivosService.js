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

/**
 * 2. OBTENER ARCHIVOS POR PUESTO (Para el listado principal)
 * @param {string} puesto - El rol para filtrar los documentos
 */
// const getArchivosPorPuesto = async (puesto) => {
//   try {
//     const response = await api.get(ENDPOINT, {
//       params: { puesto }
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error en getArchivosPorPuesto:", error);
//     throw error;
//   }
// };

/**
 * 3. CAMBIAR ESTADO (Borrado lógico)
 * @param {string} id - ID del documento en Firestore
 * @param {string} nuevoEstado - 'activo' | 'inactivo' | 'eliminado'
 */
// const actualizarEstado = async (id, nuevoEstado) => {
//   try {
//     const response = await api.patch(`${ENDPOINT}/${id}/estado`, {
//       estado: nuevoEstado
//     });
//     return response.data;
//   } catch (error) {
//     console.error("Error en actualizarEstado de archivo:", error);
//     throw error;
//   }
// };

// Exportamos el objeto con todas las funciones para mantener la consistencia
export default {
  subirArchivo
  // ,
  // getArchivosPorPuesto,
  // actualizarEstado
  };