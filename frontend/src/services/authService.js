// src/services/authService.js
import api from './axiosConfig';

// ==========================================================
// 1. FUNCIONES GENERALES (Para todos)
// ==========================================================

export const loginRequest = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
  }
};

// Usuario cambia SU PROPIA contraseña
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

// ==========================================================
// 2. FUNCIONES DE ADMINISTRADOR (Solo para el Panel)
// ==========================================================

// A. Obtener la lista de usuarios para la tabla
export const getAllUsersRequest = async () => {
  try {
    const response = await api.get('/auth/users');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al obtener usuarios');
  }
};

// B. Crear nuevo usuario (Registrar)
export const registerUserRequest = async (userData) => {
  try {
    // userData debe incluir: { email, password, nombre, role }
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al registrar usuario');
  }
};

// C. Banear o Activar (El interruptor)
export const toggleUserStatusRequest = async (userId, nuevoEstado) => {
  try {
    // nuevoEstado es un boolean (true/false)
    const response = await api.patch(`/auth/users/${userId}/status`, { 
      activo: nuevoEstado 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al cambiar estatus');
  }
};

// D. Admin resetea la contraseña de otro
export const adminResetPasswordRequest = async (userId, newPassword, requireChange) => {
  try {
    const response = await api.patch(`/auth/users/${userId}/reset-password`, {
      newPassword,
      requireChange // Boolean: ¿Lo obligamos a cambiarla al entrar?
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al resetear contraseña');
  }
};

// E. Actualizar usuario
export const updateUserRequest = async (id, userData) => {
  try {
    // userData trae { nombre, email, role }
    const response = await api.put(`/auth/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al actualizar usuario');
  }
};