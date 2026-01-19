
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/auth`;

export const loginRequest = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al iniciar sesión');
    }

    return data; // Retorna el objeto { message, token, user }
  } catch (error) {
    throw error;
  }
};

export const changePasswordRequest = async (email, currentPassword, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        currentPassword,
        newPassword
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Lanzamos el error con el mensaje que viene del backend
      throw new Error(data.message || 'Error al cambiar la contraseña');
    }

    return data;
  } catch (error) {
    throw error; // Re-lanzamos para que el componente lo capture
  }
};