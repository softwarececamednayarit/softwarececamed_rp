import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        // Verificamos que existan AMBOS datos
        if (storedToken && storedUser) {
          // Intentamos parsear el usuario
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Error al restaurar sesión:", error);
        // Si hay error (datos corruptos), limpiamos todo por seguridad
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        // Siempre quitamos el loading, haya éxito o error
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Opcional: Redirigir si no estás usando un Router Wrapper
    // window.location.href = '/'; 
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    // Si pasas un string único, lo convierte en array para comparar
    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return rolesArray.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};