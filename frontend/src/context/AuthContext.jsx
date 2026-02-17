import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext
 * Contexto central para manejar autenticación y autorización en el frontend.
 * - `user`: objeto público con información del usuario autenticado.
 * - `login(token, userData)`: guarda `token` + `user` en `localStorage` y actualiza el contexto.
 * - `logout()`: limpia sesión local y restablece el estado.
 * - `loading`: indicador usado mientras se restaura sesión desde `localStorage`.
 * - Helpers: `hasRole`, `hasPermission` para checks UI/server.
 */
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Efecto de inicialización: intenta restaurar sesión desde localStorage.
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        // Restauramos sólo si existe token + user (evita estados parciales)
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        // Datos corruptos o JSON inválido: limpiar por seguridad
        console.error('Error al restaurar sesión:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        // Ocultar spinner/placeholder en UI aunque fallo o éxito
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // login: persistir token + user en localStorage y actualizar contexto
  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  // logout: limpiar persistencia local y estado de usuario
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Nota: si quieres forzar redirección, hazlo desde quien llama o descomenta la línea siguiente
    // window.location.href = '/';
  };

  // hasRole: chequeo simple de roles (acepta string o array)
  const hasRole = (allowedRoles) => {
    if (!user) return false;
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return rolesArray.includes(user.role);
  };

  // hasPermission: verifica permisos en el perfil de usuario.
  // Nota: la propiedad `permises` parece un typo común; confirmar el nombre real (`permisos`/`permissions`).
  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'admin') return true; // admin tiene acceso global

    return user.permises?.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole, hasPermission }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};