import api from './axiosConfig'; // <--- Importamos la instancia segura

// Definimos el endpoint relativo (axiosConfig ya sabe que es .../api)
const ENDPOINT = '/solicitudes';

// 1. OBTENER LISTA (Con filtro de status)
const getPorStatus = async (status = 'pendiente') => {
  try {
    // Usamos 'params' de axios para que él construya la query string (?status=...)
    const response = await api.get(ENDPOINT, { 
      params: { status } 
    });
    return response.data;
  } catch (error) {
    console.error("Error en getPorStatus:", error);
    throw error;
  }
};

// 2. REGISTRAR LLAMADA (Seguimiento)
const registrarIntentoLlamada = async (id, status, notas, usuario) => {
  try {
    const response = await api.patch(`${ENDPOINT}/${id}/seguimiento`, {
      status_llamada: status,
      notas_nuevas: notas,
      usuario: usuario
    });
    return response.data;
  } catch (error) {
    console.error("Error en registrarIntentoLlamada:", error);
    throw error;
  }
};

// 3. AGENDAR CITA
const agendarCita = async (id, datosCita) => {
  try {
    // datosCita: { tipo_asignado, fecha_cita, instrucciones, datos_completos }
    const response = await api.post(`${ENDPOINT}/${id}/agendar`, datosCita);
    return response.data;
  } catch (error) {
    console.error("Error en agendarCita:", error);
    throw error;
  }
};

// 4. DESCARTAR SOLICITUD
const descartarSolicitud = async (id, motivo) => {
  try {
    const response = await api.patch(`${ENDPOINT}/${id}/descartar`, { motivo });
    return response.data;
  } catch (error) {
    console.error("Error en descartarSolicitud:", error);
    throw error;
  }
};

// 5. RECUPERAR SOLICITUD
const recuperarSolicitud = async (id) => {
  try {
    const response = await api.patch(`${ENDPOINT}/${id}/recuperar`);
    return response.data;
  } catch (error) {
    console.error("Error en recuperarSolicitud:", error);
    throw error;
  }
};

// Exportamos el objeto con todas las funciones
export default {
  getPorStatus,
  registrarIntentoLlamada,
  agendarCita,
  descartarSolicitud,
  recuperarSolicitud
};