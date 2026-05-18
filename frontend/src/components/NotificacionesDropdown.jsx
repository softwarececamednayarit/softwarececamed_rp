import { useState, useEffect } from 'react';
import { getNotificacionesNoLeidas, marcarComoLeida } from '../services/notificacionesService';

export default function NotificacionesDropdown() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    cargarNotificaciones();
  }, []);

  const cargarNotificaciones = async () => {
    try {
      const res = await getNotificacionesNoLeidas();
      if (res.success) {
        setNotificaciones(res.data);
      }
    } catch (error) {
      console.error("Error al cargar notificaciones:", error);
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await marcarComoLeida(id);
      // Quitar la notificación de la vista sin recargar
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error al marcar notificación:", error);
    }
  };

  return (
    <div className="relative">
      {/* Botón de la campana */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-gray-600 hover:text-blue-600 focus:outline-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {/* Badge del contador */}
        {notificaciones.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {notificaciones.length}
          </span>
        )}
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 w-80 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-gray-100 font-bold text-gray-700">
            Notificaciones
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">No tienes notificaciones nuevas.</p>
            ) : (
              notificaciones.map(notif => (
                <div key={notif.id} className="p-3 border-b border-gray-100 hover:bg-gray-50 flex justify-between items-start">
                  <div className="text-sm text-gray-700">
                    {notif.mensaje}
                  </div>
                  <button 
                    onClick={() => handleMarcarLeida(notif.id)}
                    className="ml-2 text-xs text-blue-500 hover:text-blue-700 whitespace-nowrap"
                  >
                    Marcar leída
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}