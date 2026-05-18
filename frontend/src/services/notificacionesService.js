import axiosInstance from './axiosConfig';

export const getNotificacionesNoLeidas = async () => {
  const response = await axiosInstance.get('/notificaciones/no-leidas');
  return response.data;
};

export const marcarComoLeida = async (notificacionId) => {
  const response = await axiosInstance.patch(`/notificaciones/${notificacionId}/leer`);
  return response.data;
};