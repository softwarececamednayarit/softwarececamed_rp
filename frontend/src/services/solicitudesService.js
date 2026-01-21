import axios from 'axios';

// Ajusta esto a la URL de tu backend
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/solicitudes`;

// 1. OBTENER LISTA (Ahora acepta un filtro de status)
const getPorStatus = async (status = 'pendiente') => {
  // Petición GET /api/solicitudes?status=pendiente
  const response = await axios.get(`${API_URL}?status=${status}`);
  return response.data;
};

// 2. REGISTRAR LLAMADA
const registrarIntentoLlamada = async (id, status, notas, usuario) => {
  const response = await axios.patch(`${API_URL}/${id}/seguimiento`, {
    status_llamada: status,
    notas_nuevas: notas,
    usuario: usuario
  });
  return response.data;
};

// ... exportarlo ...

// 3. AGENDAR (Ahora enviamos datos_completos para Excel)
const agendarCita = async (id, datosCita) => {
  // datosCita: { tipo_asignado, fecha_cita, instrucciones, datos_completos }
  const response = await axios.post(`${API_URL}/${id}/agendar`, datosCita);
  return response.data;
};

// 4. DESCARTAR (Ahora es PATCH con motivo)
const descartarSolicitud = async (id, motivo) => {
  const response = await axios.patch(`${API_URL}/${id}/descartar`, { motivo });
  return response.data;
};

// 5. RECUPERAR (Nueva función)
const recuperarSolicitud = async (id) => {
  const response = await axios.patch(`${API_URL}/${id}/recuperar`);
  return response.data;
};

export default {
  getPorStatus,
  registrarIntentoLlamada,
  agendarCita,
  descartarSolicitud,
  recuperarSolicitud
};