// src/services/authService.js
import api from './axiosConfig'; // <--- Importamos tu instancia configurada

export const loginRequest = async (email, password) => {
  try {
    // Usamos api.post. Nota que ya no ponemos toda la URL, 
    // porque axiosConfig ya tiene la baseURL '/api'
    const response = await api.post('/auth/login', { 
      email, 
      password 
    });

    // Axios ya devuelve la respuesta en .data
    return response.data; 

  } catch (error) {
    // Axios lanza error si el status no es 2xx.
    // Accedemos al mensaje que mandó el backend (error.response.data.message)
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
  }
};

export const changePasswordRequest = async (email, currentPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', {
      email,
      currentPassword,
      newPassword
    });

    return response.data;

  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al cambiar la contraseña');
  }
};